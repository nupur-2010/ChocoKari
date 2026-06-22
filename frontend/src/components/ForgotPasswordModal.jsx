// @ts-nocheck
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Mail, X, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordModal({ open, onClose }) {
    const { forgotPassword } = useAuth();
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [info, setInfo] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    if (!open) return null;

    const validateEmail = (em) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setInfo("");
        if (!validateEmail(email)) {
            setError("Please enter a valid email address");
            return;
        }
        setLoading(true);
        try {
            await forgotPassword(email);
            setSuccess(true);
            setInfo("If an account exists for this email, a reset link has been sent.");
        } catch (err) {
            setError(err?.response?.data?.message || "Failed to send reset email");
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setEmail("");
        setError("");
        setInfo("");
        setSuccess(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-md card-luxury p-8 luxury-shadow relative">
                <button
                    type="button"
                    onClick={handleClose}
                    className="absolute top-4 right-4 w-8 h-8 rounded-full hover:bg-chocolate/10 flex items-center justify-center text-chocolate/60 hover:text-chocolate transition"
                >
                    <X size={16} />
                </button>

                {success ? (
                    <div className="text-center">
                        <CheckCircle2 size={48} className="mx-auto text-gold mb-4" />
                        <h2 className="font-serif text-2xl text-chocolate font-semibold mb-2">Check Your Email</h2>
                        <p className="text-sm text-chocolate/70 mb-6">
                            We've sent a password reset link to <b>{email}</b>. Please check your inbox.
                        </p>
                        <button type="button" onClick={handleClose} className="btn-primary w-full">
                            Back to Sign In
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="text-center mb-6">
                            <h2 className="font-serif text-3xl text-chocolate font-semibold mb-1">Forgot Password?</h2>
                            <p className="text-sm text-chocolate/70">Enter your email and we'll send you a reset link.</p>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="text-xs tracking-widest uppercase text-chocolate/70 block mb-2">Email</label>
                                <div className="relative">
                                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-chocolate/50 pointer-events-none" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => { setEmail(e.target.value); setError(""); }}
                                        required
                                        placeholder="you@example.com"
                                        autoFocus
                                        style={{ paddingLeft: "3rem" }}
                                        className="input-luxury"
                                    />
                                </div>
                            </div>
                            {error && <p className="text-sm text-red-700 bg-red-100 px-3 py-2 rounded-lg">{error}</p>}
                            {info && <p className="text-sm text-emerald-700 bg-emerald-100 px-3 py-2 rounded-lg">{info}</p>}
                            <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
                                {loading ? "Sending..." : "Send Reset Link"}
                            </button>
                            <button
                                type="button"
                                onClick={handleClose}
                                className="w-full text-sm text-chocolate/70 hover:text-chocolate flex items-center justify-center gap-1"
                            >
                                <ArrowLeft size={14} /> Back to Sign In
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}
