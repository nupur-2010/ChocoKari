// @ts-nocheck
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check, Search } from "lucide-react";

export default function Select({
    value,
    onChange,
    options = [],
    placeholder = "Select an option",
    className = "",
    dark = false,
    searchable = false,
    multiple = false,
}) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
    const containerRef = useRef(null);
    const dropdownRef = useRef(null);
    const buttonRef = useRef(null);

    useEffect(() => {
        if (!open) return;
        const handler = (e) => {
            const target = e.target;
            if (containerRef.current && containerRef.current.contains(target)) return;
            if (dropdownRef.current && dropdownRef.current.contains(target)) return;
            setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        document.addEventListener("touchstart", handler);
        return () => {
            document.removeEventListener("mousedown", handler);
            document.removeEventListener("touchstart", handler);
        };
    }, [open]);

    useEffect(() => {
        if (open && buttonRef.current) {
            const updatePos = () => {
                const rect = buttonRef.current.getBoundingClientRect();
                setPosition({
                    top: rect.bottom + 8,
                    left: rect.left,
                    width: rect.width,
                });
            };
            updatePos();
            window.addEventListener("scroll", updatePos, true);
            window.addEventListener("resize", updatePos);
            return () => {
                window.removeEventListener("scroll", updatePos, true);
                window.removeEventListener("resize", updatePos);
            };
        }
    }, [open]);

    const selected = multiple
        ? options.filter((o) => Array.isArray(value) && value.includes(o.value))
        : options.find((o) => o.value === value);
    const filtered = searchable && query
        ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
        : options;

    const handleSelect = (val) => {
        if (multiple) {
            const current = Array.isArray(value) ? value : [];
            const next = current.includes(val)
                ? current.filter((v) => v !== val)
                : [...current, val];
            onChange(next);
        } else {
            onChange(val);
            setOpen(false);
        }
    };

    const triggerClass = dark
        ? "bg-cream/10 border-cream/20 text-cream hover:border-gold/50 hover:bg-cream/15"
        : "bg-cream border-chocolate/20 text-chocolate hover:border-chocolate/40";

    const dropdownBg = dark ? "bg-chocolate-dark" : "bg-cream";
    const dropdownBorder = dark ? "border-gold/20" : "border-chocolate/15";

    const dropdownContent = (
        <div
            ref={dropdownRef}
            className={`fixed z-9999 rounded-2xl border luxury-shadow-lg overflow-hidden fade-in ${dropdownBg} ${dropdownBorder}`}
            style={{
                top: position.top,
                left: position.left,
                width: position.width,
            }}
            onMouseDown={(e) => e.stopPropagation()}
        >
            {searchable && (
                <div className={`px-3 py-2 border-b ${dark ? "border-cream/10" : "border-chocolate/10"}`}>
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${dark ? "bg-cream/10" : "bg-chocolate/5"}`}>
                        <Search size={14} className={dark ? "text-cream/50" : "text-chocolate/50"} />
                        <input
                            autoFocus
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search..."
                            className={`bg-transparent outline-none text-sm flex-1 ${dark ? "text-cream placeholder:text-cream/40" : "text-chocolate placeholder:text-chocolate/40"}`}
                        />
                    </div>
                </div>
            )}
            <div className="max-h-45 overflow-y-auto py-1.5">
                {filtered.length === 0 ? (
                    <p className={`px-4 py-3 text-sm text-center ${dark ? "text-cream/50" : "text-chocolate/50"}`}>No options</p>
                ) : (
                    filtered.map((opt) => {
                        const isSelected = multiple
                            ? Array.isArray(value) && value.includes(opt.value)
                            : opt.value === value;
                        return (
                            <div
                                key={opt.value}
                                onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); handleSelect(opt.value); if (!multiple) setQuery(""); }}
                                onClick={(e) => { e.stopPropagation(); if (!multiple) setQuery(""); }}
                                className={`flex items-center justify-between gap-3 px-4 py-2.5 text-sm cursor-pointer transition-colors duration-100 ${
                                    isSelected
                                        ? dark ? "bg-gold text-chocolate-dark" : "bg-chocolate text-cream"
                                        : dark ? "text-cream/85 hover:bg-cream/10" : "text-chocolate hover:bg-chocolate/10"
                                }`}
                            >
                                <span className="font-medium tracking-wide">{opt.label}</span>
                                {isSelected && (
                                    <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${dark ? "bg-chocolate-dark text-gold" : "bg-cream text-chocolate-dark"}`}>
                                        <Check size={12} strokeWidth={3} />
                                    </span>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
            <div className={`px-3 py-2 border-t ${dark ? "border-cream/10" : "border-chocolate/10"} ${!multiple ? "hidden" : ""}`}>
                <button
                    type="button"
                    onClick={() => { setOpen(false); setQuery(""); }}
                    className={`w-full py-2 rounded-lg text-xs font-semibold tracking-wider uppercase transition ${dark ? "bg-gold text-chocolate-dark hover:bg-gold-light" : "bg-chocolate text-cream hover:bg-chocolate-dark"}`}
                >
                    Done
                </button>
            </div>
        </div>
    );

    return (
        <>
            <div ref={containerRef} className={`relative ${className}`} style={{ zIndex: open ? 50 : "auto" }}>
                <button
                    ref={buttonRef}
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
                    className={`w-full flex items-center justify-between gap-2 border rounded-xl px-4 py-2.5 text-sm transition-all duration-200 outline-none ${triggerClass} ${open ? (dark ? "border-gold bg-cream/15 ring-2 ring-gold/20" : "border-chocolate ring-2 ring-chocolate/10") : ""}`}
                >
                    <span className={`flex-1 text-left truncate ${selected && (!Array.isArray(selected) || selected.length > 0) ? "" : dark ? "text-cream/50" : "text-chocolate/50"}`}>
                        {multiple
                            ? (Array.isArray(selected) && selected.length > 0
                                ? selected.length === 1
                                    ? selected[0].label
                                    : `${selected.length} selected`
                                : placeholder)
                            : (selected ? selected.label : placeholder)}
                    </span>
                    <ChevronDown size={16} className={`transition-transform duration-300 shrink-0 ${open ? "rotate-180" : ""} ${dark ? "text-cream/60" : "text-chocolate/60"}`} />
                </button>
            </div>

            {open && createPortal(dropdownContent, document.body)}
        </>
    );
}
