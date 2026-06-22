// @ts-nocheck
import { useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Lock, Eye, EyeOff, Check, X, CheckCircle2, AlertTriangle } from "lucide-react";

const validatePassword = (pwd) => {
    return [
        { label: "At least 8 characters", valid: pwd.length >= 8 },
        { label: "At most 20 characters", valid: pwd.length > 0 && pwd.length <= 20 },
        { label: "One uppercase letter (A-Z)", valid: /[A-Z]/.test(pwd) },
        { label: "One lowercase letter (a-z)", valid: /[a-z]/.test(pwd) },
        { label: "One number (0-9)", valid: /[0-9]/.test(pwd) },
        { label: "One special character (@$!%*?&)", valid: /[@$!%*?&]/.test(pwd) },
    ];
};

export default function ResetPassword() {
    const { unhashedToken } = useParams();
    const navigate = useNavigate();
    const { resetPassword } = useAuth();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPwd, setShowPwd] = useState(false);
    const [showConfirmPwd, setShowConfirmPwd] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [tokenInvalid, setTokenInvalid] = useState(false);

    const passwordChecks = useMemo(() => validatePassword(password), [password]);
    const allPasswordValid = useMemo(() => passwordChecks.every((c) => c.valid), [passwordChecks]);
    const showPwdHints = password.length > 0 && !allPasswordValid;
    const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!allPasswordValid) {
            setError("Password does not meet all requirements");
            return;
        }
        if (!passwordsMatch) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);
        try {
            await resetPassword(unhashedToken, password);
            setSuccess(true);
        } catch (err) {
            const msg = err?.response?.data?.message || "Failed to reset password";
            if (/invalid|expired|already/i.test(msg)) {
                setTokenInvalid(true);
            } else {
                setError(msg);
            }
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center px-6 py-12">
                <div className="w-full max-w-md text-center">
                    <CheckCircle2 size={48} className="mx-auto text-gold mb-4" />
                    <h1 className="font-serif text-4xl text-chocolate font-semibold mb-2">Password Reset!</h1>
                    <p className="text-chocolate/70 mb-6 text-sm">Your password has been successfully reset. You can now sign in with your new password.</p>
                    <button onClick={() => navigate("/login")} className="btn-primary w-full">
                        Go to Sign In
                    </button>
                </div>
            </div>
        );
    }

    if (tokenInvalid) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center px-6 py-12">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <img src="/navbar_logo.png" alt="ChocoKari" className="w-60 h-auto mx-auto mb-3" />
                    </div>
                    <div className="card-luxury p-6 luxury-shadow text-center space-y-5">
                        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto">
                            <AlertTriangle size={28} className="text-red-600" />
                        </div>
                        <div>
                            <h1 className="font-serif text-2xl text-chocolate font-semibold mb-2">Reset Link No Longer Valid</h1>
                            <p className="text-sm text-chocolate/70">
                                This password reset link has already been used or has expired. Reset links can only be used once.
                            </p>
                        </div>
                        <Link to="/login" className="btn-primary w-full inline-block">
                            Request a New Reset Link
                        </Link>
                        <Link to="/login" className="text-sm text-chocolate/70 hover:text-chocolate hover:underline block">
                            Back to Sign In
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-6 py-12">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <img src="/navbar_logo.png" alt="ChocoKari" className="w-60 h-auto mx-auto mb-3" />
                </div>
                <form onSubmit={handleSubmit} className="card-luxury p-8 luxury-shadow space-y-4">
                    <div>
                        <label className="text-xs tracking-widest uppercase text-chocolate/70 block mb-2">New Password</label>
                        <div className="relative">
                            <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-chocolate/50 pointer-events-none" />
                            <input
                                type={showPwd ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                                autoFocus
                                style={{ paddingLeft: "3rem", paddingRight: "3rem" }}
                                className="input-luxury"
                            />
                            <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-4 top-1/2 -translate-y-1/2 text-chocolate/50 hover:text-chocolate">
                                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        {showPwdHints && (
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
                    <div>
                        <label className="text-xs tracking-widest uppercase text-chocolate/70 block mb-2">Confirm Password</label>
                        <div className="relative">
                            <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-chocolate/50 pointer-events-none" />
                            <input
                                type={showConfirmPwd ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                                style={{ paddingLeft: "3rem", paddingRight: "3rem" }}
                                className="input-luxury"
                            />
                            <button type="button" onClick={() => setShowConfirmPwd(!showConfirmPwd)} className="absolute right-4 top-1/2 -translate-y-1/2 text-chocolate/50 hover:text-chocolate">
                                {showConfirmPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        {confirmPassword.length > 0 && (
                            <div className="flex items-center gap-2 mt-1 text-xs">
                                {passwordsMatch ? (
                                    <>
                                        <Check size={12} className="text-emerald-600" />
                                        <span className="text-emerald-700">Passwords match</span>
                                    </>
                                ) : (
                                    <>
                                        <X size={12} className="text-red-600" />
                                        <span className="text-red-700">Passwords do not match</span>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                    {error && <p className="text-sm text-red-700 bg-red-100 px-3 py-2 rounded-lg">{error}</p>}
                    <button type="submit" disabled={loading || !allPasswordValid || !passwordsMatch} className="btn-primary w-full disabled:opacity-50">
                        {loading ? "Resetting..." : "Reset Password"}
                    </button>
                    <p className="text-center text-sm text-chocolate/70">
                        <Link to="/login" className="text-chocolate font-semibold hover:underline">Back to Sign In</Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
