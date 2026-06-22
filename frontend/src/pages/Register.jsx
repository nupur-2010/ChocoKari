// @ts-nocheck
import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Mail, Lock, User, Eye, EyeOff, CheckCircle2, Check, X } from "lucide-react";
import GoogleSignInButton from "../components/GoogleSignInButton";
import OtpInput from "../components/OtpInput";

const validatePassword = (pwd) => {
    const checks = [
        { label: "At least 8 characters", valid: pwd.length >= 8 },
        { label: "At most 20 characters", valid: pwd.length > 0 && pwd.length <= 20 },
        { label: "One uppercase letter (A-Z)", valid: /[A-Z]/.test(pwd) },
        { label: "One lowercase letter (a-z)", valid: /[a-z]/.test(pwd) },
        { label: "One number (0-9)", valid: /[0-9]/.test(pwd) },
        { label: "One special character (@$!%*?&)", valid: /[@$!%*?&]/.test(pwd) },
    ];
    return checks;
};

const validateEmail = (em) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em);
};

const validateName = (nm) => {
    return nm.trim().length >= 3 && nm.trim().length <= 50 && /^[A-Za-z\s]+$/.test(nm.trim());
};

export default function Register() {
    const { register, googleAuth, verifyOtp, resendOtp } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState("register");
    const [fullname, setFullname] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPwd, setShowPwd] = useState(false);
    const [otp, setOtp] = useState("");
    const [error, setError] = useState("");
    const [info, setInfo] = useState("");
    const [fieldErrors, setFieldErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);

    const passwordChecks = useMemo(() => validatePassword(password), [password]);
    const allPasswordValid = useMemo(() => passwordChecks.every((c) => c.valid), [passwordChecks]);
    const showPwdHints = password.length > 0 && !allPasswordValid;

    const handleRegister = async (e) => {
        e.preventDefault();
        setError("");
        setFieldErrors({});

        const newFieldErrors = {};
        if (!validateName(fullname)) {
            newFieldErrors.fullname = "Full name must be 3-50 letters only";
        }
        if (!validateEmail(email)) {
            newFieldErrors.email = "Please enter a valid email address";
        }
        if (!allPasswordValid) {
            newFieldErrors.password = "Password does not meet all requirements";
        }
        if (Object.keys(newFieldErrors).length > 0) {
            setFieldErrors(newFieldErrors);
            return;
        }

        setLoading(true);
        try {
            await register(fullname, email, password);
            setStep("verify");
        } catch (err) {
            const data = err?.response?.data;
            if (data?.code === "EMAIL_NOT_VERIFIED") {
                try {
                    await resendOtp(email);
                } catch (e) {}
                setInfo("Your account exists but is not verified. We've sent a fresh OTP to your email.");
                setStep("verify");
            } else if (Array.isArray(data?.errors) && data.errors.length > 0) {
                const fe = {};
                data.errors.forEach((e) => {
                    if (e.param) fe[e.param] = e.msg;
                });
                setFieldErrors(fe);
                setError(data?.message || "Please fix the errors below");
            } else {
                setError(data?.message || "Registration failed");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (resendCooldown > 0) return;
        setError("");
        setInfo("");
        try {
            await resendOtp(email);
            setInfo("A new OTP has been sent to your email.");
            setResendCooldown(30);
            const interval = setInterval(() => {
                setResendCooldown((c) => {
                    if (c <= 1) {
                        clearInterval(interval);
                        return 0;
                    }
                    return c - 1;
                });
            }, 1000);
        } catch (e) {
            setError(e?.response?.data?.message || "Failed to resend OTP");
        }
    };

    const handleOtpChange = (newOtp) => {
        setOtp(newOtp);
        setError("");
        if (newOtp.length === 6) {
            setTimeout(() => {
                handleVerify(null, newOtp);
            }, 100);
        }
    };

    const handleVerify = async (e, overrideOtp) => {
        if (e && e.preventDefault) e.preventDefault();
        const code = overrideOtp || otp;
        if (code.length !== 6) {
            setError("Please enter the complete 6-digit OTP");
            return;
        }
        setError("");
        setInfo("");
        setLoading(true);
        try {
            await verifyOtp(email, code);
            navigate("/login");
        } catch (err) {
            setError(err?.response?.data?.message || "Invalid OTP");
            setOtp("");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogle = async (credential) => {
        setError("");
        setGoogleLoading(true);
        try {
            await googleAuth(credential);
            navigate("/");
        } catch (err) {
            setError(err?.response?.data?.message || "Google sign-in failed");
        } finally {
            setGoogleLoading(false);
        }
    };

    if (step === "verify") {
        return (
            <div className="min-h-[80vh] flex items-center justify-center px-6 py-12">
                <div className="w-full max-w-md text-center">
                    <CheckCircle2 size={48} className="mx-auto text-gold mb-4" />
                    <h1 className="font-serif text-4xl text-chocolate font-semibold">Verify Your Email</h1>
                    <p className="text-chocolate/70 mt-2 text-sm">We've sent a 6-digit OTP to <b>{email}</b></p>
                    <form onSubmit={handleVerify} className="card-luxury p-8 luxury-shadow mt-6 space-y-4">
                        <OtpInput value={otp} onChange={handleOtpChange} disabled={loading} />
                        {info && <p className="text-sm text-emerald-700 bg-emerald-100 px-3 py-2 rounded-lg">{info}</p>}
                        {error && <p className="text-sm text-red-700 bg-red-100 px-3 py-2 rounded-lg">{error}</p>}
                        <button type="submit" disabled={loading || otp.length !== 6} className="btn-primary w-full disabled:opacity-50">
                            {loading ? "Verifying..." : "Verify Email"}
                        </button>
                        <button
                            type="button"
                            onClick={handleResend}
                            disabled={resendCooldown > 0}
                            className="text-sm text-chocolate/70 hover:text-chocolate disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : "Resend OTP"}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-6 py-2">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <img src="/navbar_logo.png" alt="ChocoKari" className="w-60 h-auto mx-auto mb-3" />
                </div>
                <form onSubmit={handleRegister} className="card-luxury p-6 luxury-shadow space-y-3">
                    <div>
                        <label className="text-xs tracking-widest uppercase text-chocolate/70 block mb-2">Full Name</label>
                        <div className="relative">
                            <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-chocolate/50 pointer-events-none" />
                            <input
                                value={fullname}
                                onChange={(e) => { setFullname(e.target.value); setFieldErrors((f) => ({ ...f, fullname: "" })); }}
                                required
                                placeholder="John Doe"
                                style={{ paddingLeft: "3rem" }}
                                className="input-luxury"
                            />
                        </div>
                        {fieldErrors.fullname && <p className="text-xs text-red-700 mt-1">{fieldErrors.fullname}</p>}
                    </div>
                    <div>
                        <label className="text-xs tracking-widest uppercase text-chocolate/70 block mb-2">Email</label>
                        <div className="relative">
                            <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-chocolate/50 pointer-events-none" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => { setEmail(e.target.value); setFieldErrors((f) => ({ ...f, email: "" })); }}
                                required
                                placeholder="you@example.com"
                                style={{ paddingLeft: "3rem" }}
                                className="input-luxury"
                            />
                        </div>
                        {fieldErrors.email && <p className="text-xs text-red-700 mt-1">{fieldErrors.email}</p>}
                    </div>
                    <div>
                        <label className="text-xs tracking-widest uppercase text-chocolate/70 block mb-2">Password</label>
                        <div className="relative">
                            <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-chocolate/50 pointer-events-none" />
                            <input
                                type={showPwd ? "text" : "password"}
                                value={password}
                                onChange={(e) => { setPassword(e.target.value); setFieldErrors((f) => ({ ...f, password: "" })); }}
                                required
                                placeholder="••••••••"
                                style={{ paddingLeft: "3rem", paddingRight: "3rem" }}
                                className="input-luxury"
                            />
                            <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-4 top-1/2 -translate-y-1/2 text-chocolate/50 hover:text-chocolate">
                                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        {fieldErrors.password && <p className="text-xs text-red-700 mt-1">{fieldErrors.password}</p>}
                        {(showPwdHints || password.length > 0) && (
                            <div className="mt-2 p-3 rounded-lg bg-chocolate/5 border border-chocolate/10 space-y-1">
                                {passwordChecks.map((check, i) => (
                                    <div key={i} className="flex items-center gap-2 text-xs">
                                        {check.valid ? (
                                            <Check size={12} className="text-emerald-600 shrink-0" />
                                        ) : (
                                            <X size={12} className="text-red-600 shrink-0" />
                                        )}
                                        <span className={check.valid ? "text-emerald-700" : "text-chocolate/60"}>
                                            {check.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    {error && <p className="text-sm text-red-700 bg-red-100 px-3 py-2 rounded-lg">{error}</p>}
                    <button type="submit" disabled={loading || googleLoading} className="btn-primary w-full disabled:opacity-50">
                        {loading ? "Creating..." : "Create Account"}
                    </button>
                    <div className="flex items-center gap-3 my-2">
                        <div className="flex-1 h-px bg-chocolate/15" />
                        <span className="text-xs uppercase tracking-widest text-chocolate/50">or</span>
                        <div className="flex-1 h-px bg-chocolate/15" />
                    </div>
                    {googleLoading ? (
                        <div className="w-full py-2 text-center text-sm text-chocolate/70">Signing in with Google...</div>
                    ) : (
                        <GoogleSignInButton onCredential={handleGoogle} text="Sign up using Google" disabled={loading} />
                    )}
                    <p className="text-center text-sm text-chocolate/70">
                        Already have an account? <Link to="/login" className="text-chocolate font-semibold hover:underline">Sign in</Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
