// @ts-nocheck
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import GoogleSignInButton from "../components/GoogleSignInButton";
import ForgotPasswordModal from "../components/ForgotPasswordModal";

export default function Login() {
    const { login, googleAuth } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPwd, setShowPwd] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [showForgotModal, setShowForgotModal] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            await login(email, password);
            navigate("/");
        } catch (err) {
            setError(err?.response?.data?.message || "Login failed");
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

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-6 py-8">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <img src="/navbar_logo.png" alt="ChocoKari" className="w-60 h-auto mx-auto mb-3" />
                </div>
                <form onSubmit={handleSubmit} className="card-luxury p-6 luxury-shadow space-y-4">
                    <div>
                        <label className="text-xs tracking-widest uppercase text-chocolate/70 block mb-2">Email</label>
                        <div className="relative">
                            <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-chocolate/50 pointer-events-none" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="you@example.com"
                                style={{ paddingLeft: "3rem" }}
                                className="input-luxury"
                            />
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-xs tracking-widest uppercase text-chocolate/70">Password</label>
                            <button
                                type="button"
                                onClick={() => setShowForgotModal(true)}
                                className="text-xs text-chocolate/70 hover:text-chocolate hover:underline"
                            >
                                Forgot password?
                            </button>
                        </div>
                        <div className="relative">
                            <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-chocolate/50 pointer-events-none" />
                            <input
                                type={showPwd ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                                style={{ paddingLeft: "3rem", paddingRight: "3rem" }}
                                className="input-luxury"
                            />
                            <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-4 top-1/2 -translate-y-1/2 text-chocolate/50 hover:text-chocolate">
                                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>
                    {error && <p className="text-sm text-red-700 bg-red-100 px-3 py-2 rounded-lg">{error}</p>}
                    <button type="submit" disabled={loading || googleLoading} className="btn-primary w-full disabled:opacity-50">
                        {loading ? "Signing in..." : "Sign In"}
                    </button>
                    <div className="flex items-center gap-3 my-2">
                        <div className="flex-1 h-px bg-chocolate/15" />
                        <span className="text-xs uppercase tracking-widest text-chocolate/50">or</span>
                        <div className="flex-1 h-px bg-chocolate/15" />
                    </div>
                    {googleLoading ? (
                        <div className="w-full py-2 text-center text-sm text-chocolate/70">Signing in with Google...</div>
                    ) : (
                        <GoogleSignInButton onCredential={handleGoogle} text="Sign in using Google" disabled={loading} />
                    )}
                    <p className="text-center text-sm text-chocolate/70">
                        New to ChocoKari? <Link to="/register" className="text-chocolate font-semibold hover:underline">Create an account</Link>
                    </p>
                </form>
            </div>
            <ForgotPasswordModal open={showForgotModal} onClose={() => setShowForgotModal(false)} />
        </div>
    );
}
