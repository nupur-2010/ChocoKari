// @ts-nocheck
import { useState } from "react";
import { Truck, Copy, Check, ExternalLink } from "lucide-react";

export default function TrackingInfo({ trackingId, trackingLink, shippedAt, variant = "admin" }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(trackingId);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch (e) {}
    };

    const isAdmin = variant === "admin";
    const containerClass = isAdmin
        ? "mt-2 mb-2 p-3 rounded-lg bg-gold/15 border border-gold/40"
        : "mt-2 mb-2 p-3 rounded-lg bg-gold/10 border border-gold/40";
    const labelClass = "text-[10px] tracking-widest uppercase font-bold text-chocolate";
    const valueClass = "text-sm font-mono text-chocolate-dark font-semibold";
    const iconClass = "text-chocolate";
    const timestampClass = "text-[10px] text-chocolate/60";
    const copyBtnClass = "w-6 h-6 rounded hover:bg-gold/30 flex items-center justify-center text-chocolate transition";
    const linkClass = "inline-flex items-center gap-1 text-xs text-chocolate hover:text-chocolate-dark font-semibold underline";

    return (
        <div className={containerClass}>
            <div className="flex items-center gap-2 mb-2">
                <Truck size={14} className={iconClass} />
                <span className={labelClass}>Shipped</span>
                {shippedAt && (
                    <span className={timestampClass}>on {new Date(shippedAt).toLocaleString()}</span>
                )}
            </div>
            <div className="flex items-center gap-0.5 flex-wrap">
                <a
                    href={trackingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={linkClass}
                >
                    Track Package <ExternalLink size={11} />
                </a>
                <span className={`${valueClass} ml-20`}>ID: {trackingId}</span>
                <button
                    type="button"
                    onClick={handleCopy}
                    className={copyBtnClass}
                >
                    {copied ? <Check size={12} /> : <Copy size={12} />}
                </button>
            </div>
        </div>
    );
}
