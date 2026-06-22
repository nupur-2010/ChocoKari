// @ts-nocheck
import { useState } from "react";
import { Truck, X, CheckCircle2 } from "lucide-react";
import { api } from "../lib/api";

export default function ShipOrderModal({ order, onClose, onSuccess }) {
    const [trackingId, setTrackingId] = useState("");
    const [trackingLink, setTrackingLink] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(null);

    const validateUrl = (url) => {
        try {
            const u = new URL(url);
            return u.protocol === "http:" || u.protocol === "https:";
        } catch {
            return false;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        const tid = trackingId.trim();
        const tlink = trackingLink.trim();

        if (tid.length < 3 || tid.length > 50) {
            setError("Tracking ID must be between 3 and 50 characters");
            return;
        }
        if (!validateUrl(tlink)) {
            setError("Tracking link must be a valid http or https URL");
            return;
        }

        setLoading(true);
        try {
            const res = await api.patch(`/order/admin/${order._id}/status`, {
                orderStatus: "shipped",
                trackingId: tid,
                trackingLink: tlink,
            });
            setSuccess({
                order: res?.data?.data?.order,
                emailSent: res?.data?.data?.emailSent,
                emailError: res?.data?.data?.emailError,
            });
            if (onSuccess) onSuccess(res?.data?.data?.order);
        } catch (err) {
            setError(err?.response?.data?.message || "Failed to update order status");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-cream/85 backdrop-blur-md flex items-center justify-center p-3 md:p-4 fade-in" onClick={onClose}>
            <div className="chocolate-gradient rounded-2xl p-5 md:p-8 w-full max-w-md luxury-shadow-lg text-cream" onClick={(e) => e.stopPropagation()}>
                <div className="mb-5 pb-4 border-b border-cream/15">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-cream/10 flex items-center justify-center">
                                <Truck size={20} className="text-gold-light" />
                            </div>
                            <h3 className="font-serif text-2xl font-semibold uppercase">Ship Order</h3>
                        </div>
                        <button type="button" onClick={onClose} className="w-9 h-9 rounded-full bg-cream/10 hover:bg-cream/20 flex items-center justify-center text-cream transition">
                            <X size={18} />
                        </button>
                    </div>
                    <p className="text-xs text-cream/70">
                        Order <span className="text-gold-light font-semibold">#{order?._id?.slice(-8).toUpperCase()}</span> · {order?.user?.fullname}
                    </p>
                </div>

                {success ? (
                    <div className="text-center py-4">
                        <CheckCircle2 size={48} className="mx-auto text-gold-light mb-4" />
                        <h2 className="font-serif text-2xl font-semibold mb-2">Order Shipped!</h2>
                        <p className="text-sm text-cream/80 mb-6">
                            {success.emailSent
                                ? "Shipping confirmation email has been sent to the customer."
                                : success.emailError || "Status updated. Email could not be sent."}
                        </p>
                        <button type="button" onClick={onClose} className="w-full px-6 py-3 rounded-full bg-gold text-chocolate-dark font-semibold tracking-wider uppercase text-xs hover:bg-gold-light transition">
                            Done
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-[12px] tracking-widest uppercase font-bold text-gold-light mb-2 block">Tracking ID</label>
                            <input
                                type="text"
                                value={trackingId}
                                onChange={(e) => { setTrackingId(e.target.value); setError(""); }}
                                placeholder="e.g. AWB123456789"
                                autoFocus
                                maxLength={50}
                                className="w-full bg-cream/10 border border-cream/20 rounded-lg px-4 py-2.5 text-sm text-cream placeholder:text-cream/40 focus:border-gold focus:bg-cream/15 outline-none transition"
                            />
                        </div>
                        <div>
                            <label className="text-[12px] tracking-widest uppercase font-bold text-gold-light mb-2 block">Tracking Link</label>
                            <input
                                type="url"
                                value={trackingLink}
                                onChange={(e) => { setTrackingLink(e.target.value); setError(""); }}
                                placeholder="https://www.carrier.com/track?id=..."
                                className="w-full bg-cream/10 border border-cream/20 rounded-lg px-4 py-2.5 text-sm text-cream placeholder:text-cream/40 focus:border-gold focus:bg-cream/15 outline-none transition"
                            />
                        </div>
                        {error && <p className="text-sm text-red-200 bg-red-900/30 border border-red-400/30 px-3 py-2 rounded-lg">{error}</p>}
                        <div className="flex gap-2 pt-2">
                            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 rounded-full border border-cream/30 text-cream text-xs font-semibold tracking-wider uppercase hover:bg-cream/10 transition">
                                Cancel
                            </button>
                            <button type="submit" disabled={loading} className="flex-1 px-4 py-2.5 rounded-full bg-gold text-chocolate-dark font-semibold tracking-wider uppercase text-xs hover:bg-gold-light transition disabled:opacity-50">
                                {loading ? "Sending..." : "Send Shipping Email"}
                            </button>
                        </div>
                        <p className="text-[10px] text-cream/50 text-center pt-1">
                            The customer will receive an email with the tracking details.
                        </p>
                    </form>
                )}
            </div>
        </div>
    );
}
