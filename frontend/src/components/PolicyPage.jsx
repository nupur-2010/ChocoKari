// @ts-nocheck
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Menu, X, Printer } from "lucide-react";

const Section = ({ id, title, children, subtitle }) => (
    <section id={id} className="mb-10 scroll-mt-24">
        <h2 className="font-serif text-2xl md:text-3xl text-chocolate font-semibold mb-2">{title}</h2>
        {subtitle && <p className="text-sm text-chocolate/60 italic mb-3">{subtitle}</p>}
        <div className="text-chocolate/85 leading-relaxed space-y-3 text-[15px]">{children}</div>
    </section>
);

const SubSection = ({ title, children }) => (
    <div className="mb-5">
        <h3 className="font-serif text-lg md:text-xl text-chocolate font-semibold mb-2">{title}</h3>
        <div className="text-chocolate/85 leading-relaxed space-y-2 text-[15px]">{children}</div>
    </div>
);

const List = ({ items, ordered = false }) => {
    const Tag = ordered ? "ol" : "ul";
    return (
        <Tag className={`pl-5 space-y-1.5 ${ordered ? "list-decimal" : "list-disc"} marker:text-chocolate/50`}>
            {items.map((item, i) => (
                <li key={i} className="leading-relaxed">{item}</li>
            ))}
        </Tag>
    );
};

const Callout = ({ type = "info", children }) => {
    const styles = {
        info: "bg-blue-50/60 border-blue-200 text-chocolate",
        warn: "bg-amber-50/60 border-amber-200 text-chocolate",
        success: "bg-emerald-50/60 border-emerald-200 text-chocolate",
    };
    return (
        <div className={`my-4 p-4 rounded-lg border ${styles[type] || styles.info} text-sm`}>
            {children}
        </div>
    );
};

export default function PolicyPage({ title, subtitle, heroTagline, lastUpdated = "January 2025", sections = [], tocItems = [], children }) {
    const [mobileNavOpen, setMobileNavOpen] = useState(false);
    const [activeId, setActiveId] = useState("");

    useEffect(() => {
        const handleScroll = () => {
            const offsets = (tocItems.length ? tocItems : sections.filter((s) => s.id).map((s) => s.id))
                .map((id) => {
                    const el = document.getElementById(id);
                    if (!el) return { id, top: Infinity };
                    const rect = el.getBoundingClientRect();
                    return { id, top: rect.top };
                });
            const active = offsets.filter((o) => o.top < 160).pop();
            if (active) setActiveId(active.id);
        };
        handleScroll();
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, [tocItems, sections]);

    const handlePrint = () => window.print();

    const scrollTo = (id) => {
        const el = document.getElementById(id);
        if (el) {
            const top = el.getBoundingClientRect().top + window.scrollY - 100;
            window.scrollTo({ top, behavior: "smooth" });
            setMobileNavOpen(false);
        }
    };

    const renderTOC = (isMobile = false) => {
        const items = tocItems.length ? tocItems : sections.filter((s) => s.id);
        if (!items.length) return null;
        return (
            <nav className={`${isMobile ? "block" : "hidden lg:block"} sticky top-24`}>
                <h3 className="text-[10px] tracking-widest uppercase font-bold text-chocolate/60 mb-3 px-3">On This Page</h3>
                <ul className="space-y-1 border-l-2 border-chocolate/10">
                    {items.map((item) => {
                        const id = typeof item === "string" ? item : item.id;
                        const label = typeof item === "string" ? item : item.label;
                        const isActive = activeId === id;
                        return (
                            <li key={id}>
                                <button
                                    onClick={() => scrollTo(id)}
                                    className={`text-left w-full px-3 py-1.5 text-sm transition-all border-l-2 -ml-0.5 ${
                                        isActive
                                            ? "border-chocolate text-chocolate font-semibold bg-chocolate/5"
                                            : "border-transparent text-chocolate/70 hover:text-chocolate hover:border-chocolate/30"
                                    }`}
                                >
                                    {label}
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </nav>
        );
    };

    return (
        <div className="bg-cream min-h-screen">
            <div className="chocolate-gradient text-cream py-10 md:py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="flex items-center gap-2 text-xs text-cream/60 mb-4">
                        <Link to="/" className="hover:text-cream transition">Home</Link>
                        <ChevronRight size={12} />
                        <span className="text-cream/80">{title}</span>
                    </div>
                    <p className="text-[11px] sm:text-xs tracking-[0.3em] uppercase text-gold-light mb-2 sm:mb-3">
                        {heroTagline || "Information"}
                    </p>
                    <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-semibold leading-tight">
                        {title}
                    </h1>
                    {subtitle && (
                        <p className="mt-3 text-sm md:text-base text-cream/80 max-w-2xl leading-relaxed">
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12">
                <div className="lg:flex lg:gap-10">
                    <aside className="hidden lg:block lg:w-64 shrink-0">
                        {renderTOC()}
                    </aside>

                    <div className="lg:flex-1 lg:max-w-3xl">
                        <div className="lg:hidden mb-6">
                            <button
                                onClick={() => setMobileNavOpen(true)}
                                className="flex items-center gap-2 text-sm text-chocolate/70 hover:text-chocolate"
                            >
                                <Menu size={16} /> View sections
                            </button>
                        </div>

                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-chocolate/10">
                            <p className="text-xs text-chocolate/60">
                                <span className="font-semibold text-chocolate">Last updated:</span> {lastUpdated}
                            </p>
                            <button
                                onClick={handlePrint}
                                className="flex items-center gap-1.5 text-xs text-chocolate/70 hover:text-chocolate transition print:hidden"
                            >
                                <Printer size={14} /> Print
                            </button>
                        </div>

                        <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-chocolate/10 p-6 md:p-10 luxury-shadow print:shadow-none print:border-none print:p-0">
                            {children || sections.map((s, i) => (
                                <Section key={i} {...s} />
                            ))}
                        </div>

                        <div className="mt-8 p-6 rounded-2xl chocolate-gradient text-cream text-center">
                            <p className="font-serif text-xl mb-2">Still have questions?</p>
                            <p className="text-sm text-cream/80 mb-4">Our team is happy to help with anything else.</p>
                            <a
                                href="mailto:hello.chocokari@gmail.com"
                                className="inline-block px-6 py-2.5 rounded-full bg-gold text-chocolate-dark text-xs font-semibold tracking-wider uppercase hover:bg-gold-light transition"
                            >
                                Contact Us
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {mobileNavOpen && (
                <div className="fixed inset-0 z-50 lg:hidden" onClick={() => setMobileNavOpen(false)}>
                    <div className="absolute inset-0 bg-black/50" />
                    <div className="absolute right-0 top-0 bottom-0 w-72 bg-cream p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-serif text-lg text-chocolate">Sections</h3>
                            <button onClick={() => setMobileNavOpen(false)} className="w-8 h-8 rounded-full hover:bg-chocolate/10 flex items-center justify-center text-chocolate">
                                <X size={18} />
                            </button>
                        </div>
                        {renderTOC(true)}
                    </div>
                </div>
            )}

            <style>{`
                @media print {
                    body { background: white !important; }
                    .chocolate-gradient { background: white !important; color: #572b10 !important; }
                    header, footer, .no-print { display: none !important; }
                }
            `}</style>
        </div>
    );
}

export { Section, SubSection, List, Callout };
