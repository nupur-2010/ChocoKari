import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LayoutDashboard, Package, ShoppingBag, Building2, Plus, Edit2, Trash2, Eye, X, Star, Power, CheckCircle2, Wallet, PackageOpen, Sparkles, Box, Upload, Filter, Check, ChevronDown } from "lucide-react";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { formatPrice } from "../lib/constants";
import ArrangementGrid from "../components/ArrangementGrid";
import Select from "../components/Select";
import ShipOrderModal from "../components/ShipOrderModal";
import TrackingInfo from "../components/TrackingInfo";

const TABS = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "products", label: "Products", icon: Package },
    { id: "orders", label: "Orders", icon: ShoppingBag },
    { id: "corporate", label: "Corporate Orders", icon: Building2 },
];

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// ─── StatCard ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color }) {
    return (
        <div className="card-admin p-4 luxury-shadow">
            <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] tracking-widest uppercase text-chocolate-dark font-bold leading-tight pr-2 min-w-0 flex-1">
                    {label}
                </p>
                <div className={`w-10 h-10 rounded-full bg-linear-to-br ${color} flex items-center justify-center shrink-0`}>
                    <Icon size={22} className="text-chocolate-dark" />
                </div>
            </div>
            <p className="text-xl font-serif font-bold text-chocolate truncate">{value}</p>
        </div>
    );
}

// ─── StatusFilter ──────────────────────────────────────────────────────────────
// FIXED: dropdown uses right-0 so it never clips off the right edge of the screen
function StatusFilter({ selected, setSelected, options }) {
    const [open, setOpen] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        if (!open) return;
        const handler = (e) => {
            if (containerRef.current?.contains(e.target)) return;
            setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [open]);

    const toggle = (val) => {
        setSelected(selected.includes(val) ? selected.filter((s) => s !== val) : [...selected, val]);
    };

    const labelMap = {
        placed: "Placed",
        processing: "Processing",
        packed: "Packed",
        shipped: "Shipped",
        delivered: "Delivered",
        cancelled: "Cancelled",
    };

    const buttonLabel = selected.length === 0
        ? "Filter by status"
        : selected.length === 1
            ? labelMap[selected[0]]
            : `${selected.length} statuses`;

    return (
        <div ref={containerRef} className="relative inline-block" style={{ zIndex: open ? 50 : "auto" }}>
            <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
                className={`flex items-center gap-2 border rounded-2xl px-3 sm:px-4 py-2 sm:py-2.5 text-xs transition-all duration-200 outline-none bg-cream whitespace-nowrap ${selected.length > 0 ? "border-chocolate text-chocolate font-semibold" : "border-chocolate/20 text-chocolate"} ${open ? "ring-2 ring-chocolate/10" : "hover:border-chocolate/40"}`}
            >
                <Filter size={14} className="text-chocolate/70 shrink-0" />
                <span className="hidden sm:inline">Filter your orders</span>
                <span className="sm:hidden">Filter</span>
                {selected.length > 0 && (
                    <span className="bg-chocolate text-cream text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shrink-0">
                        {selected.length}
                    </span>
                )}
                <ChevronDown size={14} className={`transition-transform duration-300 ${open ? "rotate-180" : ""} text-chocolate/60 shrink-0`} />
            </button>

            {/* FIXED: right-0 so the dropdown aligns to the right edge of the button,
                never overflows off the right side of the screen */}
            {open && (
                <div
                    className="absolute top-full right-0 mt-2 z-50 w-44 rounded-2xl border border-chocolate/15 bg-cream luxury-shadow-lg overflow-hidden fade-in"
                    onMouseDown={(e) => e.stopPropagation()}
                >
                    <div className="px-4 py-2 border-b border-chocolate/10 flex items-center justify-between">
                        <p className="text-[10px] tracking-widest uppercase font-bold text-chocolate/60">Filter by Status</p>
                        {selected.length > 0 && (
                            <button
                                type="button"
                                onClick={() => setSelected([])}
                                className="text-[10px] tracking-widest uppercase font-bold text-chocolate hover:text-chocolate-dark"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                    <div className="max-h-60 overflow-y-auto py-1.5">
                        {options.map((opt) => {
                            const isChecked = selected.includes(opt);
                            return (
                                <label
                                    key={opt}
                                    className="flex items-center gap-3 px-4 py-2.5 text-sm cursor-pointer hover:bg-chocolate/10 transition-colors duration-100"
                                >
                                    <span className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${isChecked ? "bg-chocolate border-chocolate" : "bg-cream border-chocolate/40"}`}>
                                        {isChecked && <Check size={11} strokeWidth={3} className="text-cream" />}
                                    </span>
                                    <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={() => toggle(opt)}
                                        className="sr-only"
                                    />
                                    <span className="font-medium text-chocolate">{labelMap[opt]}</span>
                                </label>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
function Dashboard() {
    const [stats, setStats] = useState(null);
    useEffect(() => {
        const stats = api.get("/admin/dashboard").then((r) => setStats(r?.data?.data)).catch(() => {});
    }, []);

    if (!stats) return <p className="text-chocolate/60">Loading dashboard...</p>;

    const monthData = (stats.salesByMonth || []).map((s) => ({
        label: `${MONTH_NAMES[(s._id?.month || 1) - 1]} ${String(s._id?.year || "").slice(-2)}`,
        sales: s.sales || 0,
        count: s.count || 0,
    }));
    const maxSales = Math.max(...monthData.map((x) => x.sales), 1);

    return (
        <div className="space-y-4 md:space-y-6">
            {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                <StatCard label="Delivered Orders" value={stats.deliveredOrders || 0} icon={CheckCircle2} color="from-emerald-200 to-emerald-400" />
                <StatCard label="Pending Orders" value={stats.pendingOrders || 0} icon={PackageOpen} color="from-orange-200 to-orange-400" />
                <StatCard label="Total Revenue" value={formatPrice(stats.totalRevenue)} icon={Wallet} color="from-gold to-gold-light" />
                <StatCard label="Products Ordered" value={stats.productCount || 0} icon={Package} color="from-amber-200 to-amber-400" />
                <StatCard label="Custom Boxes Ordered" value={stats.customCount || 0} icon={Sparkles} color="from-pink-200 to-pink-400" />
                <StatCard label="Corporate Orders" value={stats.totalCorporateOrders || 0} icon={Building2} color="from-purple-200 to-purple-400" />
                <StatCard label="Revenue from Products" value={formatPrice(stats.productRevenue)} icon={Box} color="from-rose-200 to-rose-400" />
                <StatCard label="Revenue from Custom Boxes" value={formatPrice(stats.customRevenue)} icon={Sparkles} color="from-fuchsia-200 to-fuchsia-400" />
                <StatCard label="Revenue from Corporate" value={formatPrice(stats.corporateRevenue)} icon={Building2} color="from-indigo-200 to-indigo-400" />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Sales by month bar chart */}
                <div className="card-admin p-4 md:p-6 luxury-shadow lg:col-span-3">
                    <h3 className="font-serif text-xl md:text-2xl text-chocolate-dark font-bold mb-5">Sales by Month</h3>
                    {monthData.length > 0 ? (
                        <div className="space-y-3">
                            {monthData.map((s, i) => {
                                const pct = (s.sales / maxSales) * 100;
                                return (
                                    <div key={i} className="flex items-center gap-2 sm:gap-3">
                                        <span className="w-12 sm:w-16 text-xs text-chocolate font-semibold shrink-0">{s.label}</span>
                                        <div className="flex-1 h-9 rounded-md bg-chocolate/5 overflow-hidden relative min-w-0">
                                            <div
                                                className="h-full chocolate-gradient flex items-center justify-end px-2 sm:px-3 transition-all duration-500 overflow-hidden"
                                                style={{ width: `${Math.max(pct, 8)}%` }}
                                            >
                                                {/* Price text clips inside the bar, never overflows */}
                                                <span className="text-xs font-semibold text-cream whitespace-nowrap overflow-hidden text-ellipsis max-w-full">
                                                    {formatPrice(s.sales)}
                                                </span>
                                            </div>
                                        </div>
                                        <span className="w-14 sm:w-16 text-xs text-chocolate/70 text-right shrink-0 font-medium">
                                            {s.count} orders
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    ) : <p className="text-chocolate/60 text-sm">No sales data yet</p>}
                </div>

                {/* Right column: top products + popular flavours */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="card-admin p-4 md:p-6 luxury-shadow">
                        <h3 className="font-serif text-xl md:text-2xl text-chocolate-dark font-bold mb-4">Top Selling Products</h3>
                        {stats.topProducts?.length > 0 ? (
                            <ol className="space-y-2">
                                {stats.topProducts.map((p, i) => (
                                    <li key={i} className="flex items-center justify-between gap-2 text-sm min-w-0">
                                        {/* FIXED: min-w-0 + truncate on name so long names don't push count off screen */}
                                        <span className="text-chocolate flex items-center gap-2 min-w-0 flex-1">
                                            <span className="w-6 h-6 rounded-full chocolate-gradient text-cream text-xs flex items-center justify-center shrink-0">
                                                {i + 1}
                                            </span>
                                            <span className="truncate min-w-0">{p._id || "Unknown"}</span>
                                        </span>
                                        <span className="text-chocolate/70 shrink-0 whitespace-nowrap">{p.count} sold</span>
                                    </li>
                                ))}
                            </ol>
                        ) : <p className="text-chocolate/60 text-sm">No data yet</p>}
                    </div>

                    <div className="card-admin p-4 md:p-6 luxury-shadow">
                        <h3 className="font-serif text-xl md:text-2xl text-chocolate-dark font-bold mb-4">Popular Flavours</h3>
                        {stats.popularFlavours?.filter((f) => f._id).length > 0 ? (
                            <div className="space-y-2">
                                {stats.popularFlavours
                                    .filter((f) => f._id)
                                    .map((f, i) => (
                                        <div key={i} className="flex items-center justify-between gap-2 text-sm p-2 rounded bg-cream-light min-w-0">
                                            <span className="text-chocolate font-medium truncate min-w-0 flex-1">{f._id}</span>
                                            <span className="text-chocolate/70 shrink-0 whitespace-nowrap">{f.count} sold</span>
                                        </div>
                                    ))}
                            </div>
                        ) : (
                            <p className="text-chocolate/60 text-sm italic">No flavour data yet. Flavours will appear here once products are sold.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Products ─────────────────────────────────────────────────────────────────
function Products() {
    const [products, setProducts] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [reviewsFor, setReviewsFor] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [confirmDelete, setConfirmDelete] = useState(null);
    const empty = { name: "", description: "", images: [""], price: 0, collection: "", attributes: { flavour: [], intensity: [], occasions: [] }, customQuestions: [] };
    const [form, setForm] = useState(empty);

    const load = () => api.get("/product/admin/all").then((r) => setProducts(r?.data?.data?.products || []));
    useEffect(() => { load(); }, []);

    const save = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!form.name || !form.description || !form.price) {
            alert("Please fill in Name, Description and Price");
            return;
        }
        const payload = { ...form, images: form.images.filter((i) => i && i.trim() !== "") };
        if (editing) await api.put(`/product/admin/${editing}`, payload);
        else await api.post("/product/admin", payload);
        setShowForm(false); setEditing(null); setForm(empty);
        load();
    };

    const del = async (id) => {
        await api.delete(`/product/admin/${id}`);
        load();
    };

    const askDelete = (p) => setConfirmDelete(p);
    const cancelDelete = () => setConfirmDelete(null);
    const confirmDeleteNow = async () => {
        if (!confirmDelete) return;
        await del(confirmDelete._id);
        setConfirmDelete(null);
    };

    const toggle = async (id) => {
        await api.patch(`/product/admin/${id}/toggle`);
        load();
    };

    const viewReviews = async (id) => {
        setReviewsFor(id);
        const r = await api.get(`/product/${id}/reviews`);
        setReviews(r?.data?.data?.reviews || []);
    };

    return (
        <div>
            <div className="flex items-center justify-end mb-5">
                <button onClick={() => { setShowForm(true); setEditing(null); setForm(empty); }} className="btn-primary flex items-center gap-2">
                    <Plus size={14} /> Add Product
                </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 items-stretch">
                {products.map((p) => (
                    <div key={p._id} className="card-admin overflow-hidden luxury-shadow flex flex-col h-full">
                        <div className="relative w-full h-48 sm:h-56 bg-cream-light shrink-0">
                            {p.images?.[0] ? (
                                <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full chocolate-gradient flex items-center justify-center">
                                    <span className="font-serif text-cream/40 text-5xl">C</span>
                                </div>
                            )}
                            <span className={`absolute top-2 left-2 text-[10px] px-2 py-0.5 rounded-full font-semibold ${p.isActive === false ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`}>
                                {p.isActive === false ? "Inactive" : "Active"}
                            </span>
                        </div>
                        <div className="p-2 flex flex-col h-33 shrink-0">
                            <p className="font-serif text-chocolate text-md font-semibold leading-tight line-clamp-2 min-h-[2.5em]">{p.name}</p>
                            <p className="text-chocolate text-lg font-extrabold leading-tight min-h-[2em] mt-2">{formatPrice(p.price)}</p>
                            <div className="flex items-center justify-center gap-1 border-t border-chocolate/30">
                                <button onClick={() => viewReviews(p._id)} className="w-8 h-8 rounded-lg hover:bg-chocolate/10 text-chocolate flex items-center justify-center transition"><Eye size={14} /></button>
                                <button onClick={() => { setEditing(p._id); setForm({ ...p, images: p.images?.length ? p.images : [""] }); setShowForm(true); }} className="w-8 h-8 rounded-lg hover:bg-chocolate/10 text-chocolate flex items-center justify-center transition"><Edit2 size={14} /></button>
                                <button onClick={() => toggle(p._id)} className="w-8 h-8 rounded-lg hover:bg-chocolate/10 text-chocolate flex items-center justify-center transition"><Power size={14} /></button>
                                <button onClick={() => askDelete(p)} className="w-8 h-8 rounded-lg hover:bg-chocolate/10 text-chocolate flex items-center justify-center transition"><Trash2 size={14} /></button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add / Edit product modal */}
            {showForm && (
                <div className="fixed inset-0 z-50 bg-cream/85 backdrop-blur-md overflow-y-auto fade-in" onClick={() => setShowForm(false)}>
                    <div className="chocolate-gradient rounded-2xl p-4 sm:p-5 md:p-8 w-full max-w-2xl mt-8 mb-20 mx-auto luxury-shadow-lg text-cream" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-cream/15">
                            <h3 className="font-serif text-xl sm:text-2xl font-semibold uppercase">{editing ? "Edit Product" : "Add New Product"}</h3>
                            <button type="button" onClick={() => setShowForm(false)} className="w-9 h-9 rounded-full bg-cream/10 hover:bg-cream/20 flex items-center justify-center text-cream transition shrink-0">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="space-y-5">
                            <div>
                                <label className="text-[12px] tracking-widest uppercase font-bold text-gold-light mb-2 block">Name</label>
                                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Enter product name" className="w-full bg-cream/10 border border-cream/20 rounded-lg px-4 py-2.5 text-sm text-cream placeholder:text-cream/40 focus:border-gold focus:bg-cream/15 outline-none transition" />
                            </div>

                            <div>
                                <label className="text-[12px] tracking-widest uppercase font-bold text-gold-light mb-2 block">Description</label>
                                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Tell customers about this chocolate..." rows={3} className="w-full bg-cream/10 border border-cream/20 rounded-lg px-4 py-2.5 text-sm text-cream placeholder:text-cream/40 focus:border-gold focus:bg-cream/15 outline-none transition resize-none" />
                            </div>

                            <div>
                                <label className="text-[12px] tracking-widest uppercase font-bold text-gold-light mb-2 block">Image</label>
                                <div className="flex items-center gap-4">
                                    {form.images[0] && (
                                        <img src={form.images[0]} alt="Preview" className="h-20 w-20 object-cover rounded-lg border border-cream/20 shrink-0" />
                                    )}
                                    <label className="flex-1 flex items-center justify-center gap-2 bg-cream/10 border-2 border-dashed border-cream/30 rounded-lg px-4 py-3 text-sm text-cream/80 cursor-pointer hover:bg-cream/15 hover:border-gold transition min-w-0">
                                        <Upload size={16} className="shrink-0" />
                                        <span className="truncate">{form.images[0] ? "Change image" : "Click to upload image"}</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => {
                                                const f = e.target.files?.[0];
                                                if (!f) return;
                                                const reader = new FileReader();
                                                reader.onload = () => setForm({ ...form, images: [reader.result, ...form.images.slice(1)] });
                                                reader.readAsDataURL(f);
                                            }}
                                        />
                                    </label>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[12px] tracking-widest uppercase font-bold text-gold-light mb-2 block">Price (₹)</label>
                                    <input type="number" value={form.price || ""} onChange={(e) => setForm({ ...form, price: e.target.value === "" ? 0 : Number(e.target.value) })} placeholder="0" className="w-full bg-cream/10 border border-cream/20 rounded-lg px-4 py-2.5 text-sm text-cream placeholder:text-cream/40 focus:border-gold focus:bg-cream/15 outline-none transition" />
                                </div>
                                <div>
                                    <label className="text-[12px] tracking-widest uppercase font-bold text-gold-light mb-2 block">Collection</label>
                                    <div className="[&_button]:bg-cream/10! [&_button]:border-cream/20! [&_button]:text-cream! [&_button]:hover:bg-cream/15! [&_button]:focus:border-gold! [&_button]:rounded-lg! [&_button]:py-2.5! [&_span]:text-cream/50!">
                                        <Select
                                            value={form.collection}
                                            onChange={(v) => setForm({ ...form, collection: v })}
                                            options={[
                                                { value: "Classic", label: "Classic" },
                                                { value: "Signature", label: "Signature" },
                                                { value: "Royale", label: "Royale" },
                                                { value: "None", label: "None" },
                                            ]}
                                            placeholder="Select collection"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="text-[12px] tracking-widest uppercase font-bold text-gold-light mb-2 block">Attributes</label>
                                {/* FIXED: grid-cols-1 on mobile, 3 cols on sm+ — 3 selects at mobile width is too squished */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 [&_button]:bg-cream/10! [&_button]:border-cream/20! [&_button]:text-cream! [&_button]:hover:bg-cream/15! [&_button]:focus:border-gold! [&_button]:rounded-lg! [&_button]:py-2! [&_span]:text-cream/50!">
                                    <div>
                                        <p className="text-[11px] text-cream/60 mb-1">Flavour</p>
                                        <Select
                                            multiple
                                            value={form.attributes?.flavour || []}
                                            onChange={(v) => setForm({ ...form, attributes: { ...form.attributes, flavour: v } })}
                                            options={[
                                                { value: "Sweet & Creamy", label: "Sweet & Creamy" },
                                                { value: "Nutty & Crunchy", label: "Nutty & Crunchy" },
                                                { value: "Fruity & Refreshing", label: "Fruity & Refreshing" },
                                                { value: "Intensely Rich & Chocolately", label: "Intensely Rich & Chocolately" },
                                            ]}
                                            placeholder="Select flavours"
                                        />
                                    </div>
                                    <div>
                                        <p className="text-[11px] text-cream/60 mb-1">Intensity</p>
                                        <Select
                                            multiple
                                            value={form.attributes?.intensity || []}
                                            onChange={(v) => setForm({ ...form, attributes: { ...form.attributes, intensity: v } })}
                                            options={[
                                                { value: "Mild & Sweet", label: "Mild & Sweet" },
                                                { value: "Balanced Dark", label: "Balanced Dark" },
                                                { value: "Deep & Bold", label: "Deep & Bold" },
                                                { value: "Ultra Intense", label: "Ultra Intense" },
                                            ]}
                                            placeholder="Select intensities"
                                        />
                                    </div>
                                    <div>
                                        <p className="text-[11px] text-cream/60 mb-1">Occasion</p>
                                        <Select
                                            multiple
                                            value={form.attributes?.occasions || []}
                                            onChange={(v) => setForm({ ...form, attributes: { ...form.attributes, occasions: v } })}
                                            options={[
                                                { value: "Personal Use", label: "Personal Use" },
                                                { value: "Gifting", label: "Gifting" },
                                                { value: "Birthday", label: "Birthday" },
                                                { value: "Anniversary", label: "Anniversary" },
                                                { value: "Valentine's Day", label: "Valentine's Day" },
                                                { value: "Raksha Bandhan", label: "Raksha Bandhan" },
                                                { value: "Diwali", label: "Diwali" },
                                                { value: "Christmas", label: "Christmas" },
                                                { value: "New Year", label: "New Year" },
                                            ]}
                                            placeholder="Select occasions"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <label className="text-[12px] tracking-widest uppercase font-bold text-gold-light">Custom Questions</label>
                                    <button type="button" onClick={() => setForm({ ...form, customQuestions: [...(form.customQuestions || []), { label: "", required: true, options: [{ optionNumber: 1, optionText: "" }] }] })} className="text-[10px] tracking-widest uppercase font-bold text-gold-light hover:text-cream transition flex items-center gap-1">
                                        <Plus size={12} /> Add Question
                                    </button>
                                </div>
                                {(form.customQuestions || []).map((q, i) => (
                                    <div key={i} className="bg-cream/10 border border-cream/20 rounded-lg p-4 mb-3 space-y-2">
                                        <div className="flex justify-end">
                                            <button type="button" onClick={() => setForm({ ...form, customQuestions: form.customQuestions.filter((_, x) => x !== i) })} className="text-[10px] tracking-widest uppercase font-bold text-red-300 hover:text-red-200">Remove</button>
                                        </div>
                                        <input value={q.label} onChange={(e) => { const next = [...form.customQuestions]; next[i].label = e.target.value; setForm({ ...form, customQuestions: next }); }} placeholder="Question text" className="w-full bg-cream/5 border border-cream/15 rounded-md px-3 py-2 text-sm text-cream placeholder:text-cream/40 focus:border-gold outline-none" />
                                        <label className="flex items-center gap-2 text-[11px] text-cream/80">
                                            <input type="checkbox" checked={q.required || false} onChange={(e) => { const next = [...form.customQuestions]; next[i].required = e.target.checked; setForm({ ...form, customQuestions: next }); }} className="accent-gold" /> Required question
                                        </label>
                                        {q.options?.map((opt, j) => (
                                            <div key={j} className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => { const next = [...form.customQuestions]; next[i].options = next[i].options.filter((_, x) => x !== j); setForm({ ...form, customQuestions: next }); }}
                                                    className="w-6 h-6 shrink-0 rounded-full bg-cream/5 hover:bg-red-500/30 text-cream/60 hover:text-red-300 flex items-center justify-center transition"
                                                >
                                                    <X size={12} />
                                                </button>
                                                <input
                                                    value={opt.optionText}
                                                    onChange={(e) => { const next = [...form.customQuestions]; next[i].options[j].optionText = e.target.value; setForm({ ...form, customQuestions: next }); }}
                                                    placeholder={`Option ${j + 1}`}
                                                    className="flex-1 bg-cream/5 border border-cream/15 rounded-md px-3 py-2 text-sm text-cream placeholder:text-cream/40 focus:border-gold outline-none min-w-0"
                                                />
                                            </div>
                                        ))}
                                        <div className="flex gap-3 pt-1">
                                            <button type="button" onClick={() => { const next = [...form.customQuestions]; next[i].options = [...(next[i].options || []), { optionNumber: (next[i].options?.length || 0) + 1, optionText: "" }]; setForm({ ...form, customQuestions: next }); }} className="text-[10px] tracking-widest uppercase font-bold text-gold-light hover:text-cream">+ Add option</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 mt-10 pt-4 border-t border-cream/15">
                            <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); save(e); }} className="flex-1 bg-gold text-chocolate-dark font-semibold tracking-wider uppercase text-xs px-6 py-3 rounded-full hover:bg-gold-light transition">
                                {editing ? "Save Changes" : "Add Product"}
                            </button>
                            <button type="button" onClick={(e) => { e.stopPropagation(); setShowForm(false); }} className="px-6 py-3 rounded-full border border-cream/30 text-cream text-xs font-semibold tracking-wider uppercase hover:bg-cream/10 transition">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reviews modal */}
            {reviewsFor && (
                <div className="fixed inset-0 z-50 bg-cream/85 backdrop-blur-md flex items-center justify-center p-3 md:p-4 fade-in" onClick={() => setReviewsFor(null)}>
                    <div className="chocolate-gradient rounded-2xl p-4 sm:p-5 md:p-8 w-full max-w-2xl my-8 mx-auto luxury-shadow-lg text-cream" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-cream/15">
                            <h3 className="font-serif text-xl sm:text-2xl font-semibold uppercase">Product Reviews</h3>
                            <button onClick={() => setReviewsFor(null)} className="w-9 h-9 rounded-full bg-cream/10 hover:bg-cream/20 flex items-center justify-center text-cream transition shrink-0">
                                <X size={18} />
                            </button>
                        </div>
                        {reviews.length === 0 ? <p className="text-cream/70 text-sm">No reviews yet for this product.</p> : (
                            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                                {reviews.map((r) => (
                                    <div key={r._id} className="bg-cream/10 border border-cream/20 rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-2 gap-2">
                                            <p className="font-medium text-cream text-sm truncate min-w-0 flex-1">{r.user?.fullname}</p>
                                            <div className="flex gap-0.5 shrink-0">
                                                {[1,2,3,4,5].map((n) => <Star key={n} size={13} className={n <= r.rating ? "text-gold" : "text-cream/30"} fill={n <= r.rating ? "currentColor" : "none"} />)}
                                            </div>
                                        </div>
                                        <p className="text-sm text-cream/85 leading-relaxed wrap-break-word">{r.comment}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Delete confirmation modal */}
            {confirmDelete && (
                <div className="fixed inset-0 z-50 bg-cream/85 backdrop-blur-md flex items-center justify-center p-3 md:p-4 fade-in" onClick={cancelDelete}>
                    <div className="chocolate-gradient rounded-2xl p-4 sm:p-5 md:p-8 w-full max-w-md mx-auto luxury-shadow-lg text-cream" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-cream/15">
                            <h3 className="font-serif text-xl sm:text-2xl font-semibold uppercase">Delete Product</h3>
                            <button onClick={cancelDelete} className="w-9 h-9 rounded-full bg-cream/10 hover:bg-cream/20 flex items-center justify-center text-cream transition shrink-0">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="flex items-center gap-4 mb-5">
                            {confirmDelete.images?.[0] ? (
                                <img src={confirmDelete.images[0]} alt="" className="w-16 h-16 rounded-xl object-cover border border-cream/20 shrink-0" />
                            ) : (
                                <div className="w-16 h-16 rounded-xl bg-cream/15 flex items-center justify-center text-cream/50 font-serif text-2xl shrink-0">C</div>
                            )}
                            <div className="min-w-0 flex-1">
                                <p className="font-serif text-lg font-semibold wrap-break-word">{confirmDelete.name}</p>
                            </div>
                        </div>
                        <div className="bg-cream/10 border border-cream/20 rounded-lg p-4 mb-6">
                            <p className="text-sm text-cream/85 leading-relaxed">
                                Are you sure you want to delete this product? This action <span className="font-bold text-gold-light">cannot be undone</span>. The product will be permanently removed from your catalogue.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={cancelDelete} className="flex-1 px-6 py-3 rounded-full border border-cream/30 text-cream text-xs font-semibold tracking-wider uppercase hover:bg-cream/10 transition">
                                Cancel
                            </button>
                            <button onClick={confirmDeleteNow} className="flex-1 px-6 py-3 rounded-full bg-red-500 text-white text-xs font-semibold tracking-wider uppercase hover:bg-red-400 transition">
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Orders ───────────────────────────────────────────────────────────────────
function Orders({ statusFilters = [] }) {
    const [orders, setOrders] = useState([]);
    const [expandedItem, setExpandedItem] = useState(null);
    const [shippingOrder, setShippingOrder] = useState(null);
    useEffect(() => { api.get("/order/admin/all").then((r) => setOrders(r?.data?.data?.orders || [])).catch(() => {}); }, []);

    const updateStatus = async (id, status) => {
        try {
            await api.patch(`/order/admin/${id}/status`, { orderStatus: status });
        } catch (e) {}
        const r = await api.get("/order/admin/all");
        setOrders(r?.data?.data?.orders || []);
    };

    const handleStatusChange = (order, newStatus) => {
        if (newStatus === "shipped" && !order.trackingId) {
            setShippingOrder(order);
            return;
        }
        updateStatus(order._id, newStatus);
    };

    const handleShipSuccess = (updatedOrder) => {
        setOrders((prev) => prev.map((o) => (o._id === updatedOrder._id ? updatedOrder : o)));
    };

    const filteredOrders = useMemo(() => {
        if (statusFilters.length === 0) return orders;
        return orders.filter((o) => statusFilters.includes(o.orderStatus));
    }, [orders, statusFilters]);

    const itemName = (it) => {
        if (it.itemType === "product") return it.productSnapshot?.name || "Product";
        const c = it.customizationSnapshot;
        return c ? `${c.box || "Classic"} Box (${c.size || "?"} pcs)` : "Custom Box";
    };

    const itemUnitPrice = (it) => (it.itemTotal && it.quantity ? it.itemTotal / it.quantity : 0);

    return (
        <div>
            {statusFilters.length > 0 && (
                <p className="text-chocolate/70 text-xs mb-3">{filteredOrders.length} of {orders.length} order{orders.length === 1 ? "" : "s"}</p>
            )}
            {orders.length === 0 ? <p className="text-chocolate/60">No orders yet</p> : filteredOrders.length === 0 ? (
                <p className="text-chocolate/60">No orders match the selected status filters.</p>
            ) : (
                <div className="space-y-3">
                    {filteredOrders.map((o) => (
                        <div key={o._id} className="card-admin p-4 md:p-5 overflow-hidden">
                            {/* Order header */}
                            <div className="flex items-start justify-between flex-wrap gap-3 mb-3">
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-semibold text-chocolate break-all">#{o._id.slice(-8).toUpperCase()}</p>
                                    <p className="text-xs text-chocolate/60 break-all">{o.user?.fullname}</p>
                                    <p className="text-xs text-chocolate/60 break-all">{o.user?.email}</p>
                                </div>
                                <div className="flex items-center gap-2 flex-wrap shrink-0">
                                    {/* FIXED: narrower select on mobile */}
                                    <div className="w-28 sm:w-44">
                                        <Select
                                            value={o.orderStatus}
                                            onChange={(v) => handleStatusChange(o, v)}
                                            options={[
                                                { value: "placed", label: "Placed" },
                                                { value: "processing", label: "Processing" },
                                                { value: "packed", label: "Packed" },
                                                { value: "shipped", label: "Shipped" },
                                                { value: "delivered", label: "Delivered" },
                                                { value: "cancelled", label: "Cancelled" },
                                            ]}
                                        />
                                    </div>
                                    <span className="text-sm font-semibold text-chocolate whitespace-nowrap">{formatPrice(o.totalAmount)}</span>
                                </div>
                            </div>

                            {o.orderStatus === "shipped" && o.trackingId && (
                                <TrackingInfo
                                    trackingId={o.trackingId}
                                    trackingLink={o.trackingLink}
                                    shippedAt={o.shippedAt}
                                    variant="admin"
                                />
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 text-xs">
                                <div className="card-admin-soft p-3">
                                    <p className="text-[10px] tracking-widest uppercase font-bold text-chocolate/60 mb-1">Order Placed On</p>
                                    <p className="text-chocolate font-medium wrap-break-word">{new Date(o.createdAt).toLocaleString()}</p>
                                </div>
                                <div className="card-admin-soft p-3 overflow-hidden">
                                    <p className="text-[10px] tracking-widest uppercase font-bold text-chocolate/60 mb-1">Shipping Address</p>
                                    {o.shippingAddress ? (
                                        <div className="text-chocolate/90 leading-snug space-y-0.5">
                                            <p className="font-medium wrap-break-word">{o.shippingAddress.name} · {o.shippingAddress.phone}</p>
                                            <p className="wrap-break-word">{o.shippingAddress.line}</p>
                                            <p className="wrap-break-wordword">{o.shippingAddress.city}, {o.shippingAddress.state} — {o.shippingAddress.pincode}</p>
                                        </div>
                                    ) : (
                                        <p className="text-chocolate/50 italic">No address on file</p>
                                    )}
                                </div>
                            </div>

                            {/* Order items */}
                            <div className="space-y-2 text-sm text-chocolate/80">
                                {o.items?.map((it, i) => {
                                    const key = `${o._id}-${i}`;
                                    const isOpen = expandedItem === key;
                                    return (
                                        <div key={i} className="border border-chocolate/15 rounded-xl overflow-hidden">
                                            <button
                                                type="button"
                                                onClick={() => setExpandedItem(isOpen ? null : key)}
                                                className="w-full flex items-center justify-between gap-3 p-3 hover:bg-cream-dark/40 transition text-left min-w-0"
                                            >
                                                <p className="text-chocolate font-medium min-w-0 flex-1 wrap-break-word pr-1">
                                                    {itemName(it)} <span className="text-chocolate/60 text-xs">× {it.quantity}</span>
                                                </p>
                                                <span className="w-7 h-7 rounded-full bg-chocolate/10 hover:bg-chocolate/20 text-chocolate flex items-center justify-center text-base font-bold shrink-0">
                                                    {isOpen ? "−" : "+"}
                                                </span>
                                            </button>

                                            {isOpen && (
                                                <div className="border-t border-chocolate/15 card-admin-soft p-3 overflow-hidden">
                                                    <p className="text-[10px] tracking-widest uppercase font-bold text-chocolate/60 mb-2">
                                                        {it.itemType === "product" ? "Product" : "Custom Box"}
                                                    </p>
                                                    {it.itemType === "product" ? (
                                                        /* FIXED: flex-col on mobile, row on sm+ */
                                                        <div className="flex flex-col sm:flex-row items-start gap-4 w-full">
                                                            {it.productSnapshot?.images?.[0] ? (
                                                                <img src={it.productSnapshot.images[0]} alt="" className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl object-cover border border-chocolate/10 shrink-0 mx-auto sm:mx-0" />
                                                            ) : (
                                                                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl chocolate-gradient flex items-center justify-center text-cream/40 font-serif text-2xl sm:text-4xl shrink-0 mx-auto sm:mx-0">C</div>
                                                            )}
                                                            <div className="flex-1 min-w-0 space-y-2 w-full">
                                                                <DetailField label="Name" value={it.productSnapshot?.name} />
                                                                <DetailField label="Price" value={formatPrice(itemUnitPrice(it))} />
                                                                {it.productSnapshot?.customQuestionAnswer?.length > 0 && (
                                                                    <div className="w-full overflow-hidden">
                                                                        <p className="text-[10px] tracking-widest uppercase font-bold text-chocolate/60 mb-1">Custom Questions</p>
                                                                        <div className="space-y-1 w-full">
                                                                            {it.productSnapshot.customQuestionAnswer.map((qa, j) => (
                                                                                <p key={j} className="text-xs text-chocolate/80 wrap-break-word">
                                                                                    <span className="font-semibold">Q:</span> {qa.question} <span className="text-chocolate/50">→</span> <span className="font-semibold">A:</span> {qa.answer || <em className="text-chocolate/40">no answer</em>}
                                                                                </p>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                {it.productSnapshot?.giftPackaging && (
                                                                    <p className="text-[10px] tracking-widest uppercase font-bold text-chocolate/60">Premium Gift Packaging</p>
                                                                )}
                                                                {it.productSnapshot?.message && (
                                                                    <p className="text-xs text-chocolate/80 italic wrap-break-word">"{it.productSnapshot.message}"</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        /* FIXED: flex-col on mobile, row on sm+ */
                                                        <div className="flex flex-col sm:flex-row items-start gap-4 w-full">
                                                            {it.customizationSnapshot ? (
                                                                <div className={`shrink-0 card-admin-soft p-1 overflow-hidden max-w-full mx-auto sm:mx-0 ${
                                                                    it.customizationSnapshot.size === 6  ? "w-40"  :
                                                                    it.customizationSnapshot.size === 9  ? "w-32"  :
                                                                    it.customizationSnapshot.size === 12 ? "w-52"  :
                                                                    it.customizationSnapshot.size === 16 ? "w-40"  : "w-60"
                                                                }`}>
                                                                    <ArrangementGrid custom={it.customizationSnapshot} showNames={true} />
                                                                </div>
                                                            ) : (
                                                                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl chocolate-gradient flex items-center justify-center text-cream/40 font-serif text-2xl sm:text-4xl shrink-0 mx-auto sm:mx-0">C</div>
                                                            )}
                                                            <div className="flex-1 min-w-0 space-y-2 w-full">
                                                                <DetailField label="Name" value={itemName(it)} />
                                                                <DetailField label="Price" value={formatPrice(itemUnitPrice(it))} />
                                                                {it.customizationSnapshot && (
                                                                    <>
                                                                        <DetailField label="Intensity" value={it.customizationSnapshot.preferredIntensity} />
                                                                        <DetailField label="Stickers" value={it.customizationSnapshot.stickers} />
                                                                    </>
                                                                )}
                                                                {it.customizationSnapshot?.giftPackaging && (
                                                                    <p className="text-[10px] tracking-widest uppercase font-bold text-chocolate/60">Premium Gift Packaging</p>
                                                                )}
                                                                {it.customizationSnapshot?.message && (
                                                                    <p className="text-xs text-chocolate/80 italic wrap-break-word">"{it.customizationSnapshot.message}"</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {shippingOrder && (
                <ShipOrderModal
                    order={shippingOrder}
                    onClose={() => setShippingOrder(null)}
                    onSuccess={(updated) => { handleShipSuccess(updated); setShippingOrder(null); }}
                />
            )}
        </div>
    );
}

// ─── CorporateOrders ──────────────────────────────────────────────────────────
function CorporateOrders({ statusFilters = [] }) {
    const [orders, setOrders] = useState([]);
    const [expanded, setExpanded] = useState(null);
    useEffect(() => { api.get("/corporate").then((r) => setOrders(r?.data?.data?.orders || [])).catch(() => {}); }, []);

    const updateStatus = async (id, status) => {
        await api.patch(`/corporate/${id}/status`, { orderStatus: status });
        const r = await api.get("/corporate");
        setOrders(r?.data?.data?.orders || []);
    };

    const filteredOrders = useMemo(() => {
        if (statusFilters.length === 0) return orders;
        return orders.filter((o) => statusFilters.includes(o.orderStatus));
    }, [orders, statusFilters]);

    const downloadFile = (dataUrl, filename) => {
        if (!dataUrl) return;
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div>
            {statusFilters.length > 0 && (
                <p className="text-chocolate/70 text-xs mb-3">{filteredOrders.length} of {orders.length} order{orders.length === 1 ? "" : "s"}</p>
            )}
            {orders.length === 0 ? <p className="text-chocolate/60">No corporate orders</p> : filteredOrders.length === 0 ? (
                <p className="text-chocolate/60">No corporate orders match the selected status filters.</p>
            ) : (
                <div className="space-y-3">
                    {filteredOrders.map((o) => {
                        const isOpen = expanded === o._id;
                        const productName = o.orderType === "product"
                            ? o.productId?.name || "Product"
                            : `${o.customizationId?.box || "Classic"} Box (${o.customizationId?.size || "?"} pcs)`;
                        return (
                            <div key={o._id} className="card-admin overflow-hidden">
                                <div className="p-4">
                                    <div className="flex items-start justify-between flex-wrap gap-3 w-full">
                                        {/* Left: icon + info */}
                                        <div className="flex items-start gap-3 min-w-0 flex-1">
                                            <div className="w-12 h-12 rounded-lg chocolate-gradient flex items-center justify-center text-cream shrink-0">
                                                <Building2 size={24} />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="font-serif text-base sm:text-lg font-extrabold text-chocolate wrap-break-word w-full">{productName}</p>
                                                <p className="text-sm text-chocolate/80 wrap-break-word">{o.quantity} boxes</p>
                                                <p className="text-xs text-chocolate/60 break-all">{o.user?.fullname || "—"}</p>
                                                <p className="text-xs text-chocolate/60 break-all">{o.user?.email || "—"}</p>
                                            </div>
                                        </div>
                                        {/* Right: select + expand */}
                                        <div className="flex items-center gap-2 shrink-0 flex-wrap">
                                            {/* FIXED: narrower select on mobile */}
                                            <div className="w-28 sm:w-44">
                                                <Select
                                                    value={o.orderStatus}
                                                    onChange={(v) => updateStatus(o._id, v)}
                                                    options={[
                                                        { value: "placed", label: "Placed" },
                                                        { value: "processing", label: "Processing" },
                                                        { value: "packed", label: "Packed" },
                                                        { value: "shipped", label: "Shipped" },
                                                        { value: "delivered", label: "Delivered" },
                                                        { value: "cancelled", label: "Cancelled" },
                                                    ]}
                                                />
                                            </div>
                                            <button
                                                onClick={() => setExpanded(isOpen ? null : o._id)}
                                                className="w-9 h-9 rounded-full bg-chocolate/10 hover:bg-chocolate/20 text-chocolate flex items-center justify-center text-sm font-bold shrink-0"
                                            >
                                                {isOpen ? "−" : "+"}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {isOpen && (
                                    <div className="border-t border-chocolate/10 card-admin-soft divide-y divide-chocolate/10 overflow-hidden">
                                        {/* Product details */}
                                        <div className="p-4 sm:p-5 overflow-hidden">
                                            <p className="text-[12px] tracking-widest uppercase font-bold text-chocolate-dark mb-3">Product Details</p>
                                            {/* FIXED: flex-col on mobile, row on sm+ */}
                                            <div className="flex flex-col sm:flex-row items-start gap-4 w-full">
                                                {o.orderType === "product" ? (
                                                    <img src={o.productId?.images?.[0]} alt="" className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl object-cover border border-chocolate/10 shrink-0 mx-auto sm:mx-0" />
                                                ) : (
                                                    <div className={`shrink-0 card-admin-soft p-1 overflow-hidden max-w-full mx-auto sm:mx-0 ${
                                                        o.customizationId?.size === 6  ? "w-24 sm:w-32" :
                                                        o.customizationId?.size === 9  ? "w-28 sm:w-36" :
                                                        o.customizationId?.size === 12 ? "w-32 sm:w-40" :
                                                        o.customizationId?.size === 16 ? "w-36 sm:w-44" : "w-40 sm:w-56"
                                                    }`}>
                                                        <ArrangementGrid custom={o.customizationId} showNames={true} />
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0 space-y-2 w-full">
                                                    <DetailField label="Name" value={productName} />
                                                    {o.orderType === "customization" && (
                                                        <DetailField label="Intensity" value={o.customizationId?.preferredIntensity} />
                                                    )}
                                                    <DetailField label="Price" value={formatPrice(o.totalAmount / o.quantity)} />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Quantity */}
                                        <div className="p-4 sm:p-5">
                                            <p className="text-[12px] tracking-widest uppercase font-bold text-chocolate-dark mb-3">Quantity</p>
                                            <div className="space-y-2">
                                                <DetailField label="Boxes Ordered" value={`${o.quantity}`} />
                                                <DetailField label="Total Amount" value={formatPrice(o.totalAmount)} />
                                            </div>
                                        </div>

                                        {/* Company details */}
                                        <div className="p-4 sm:p-5 overflow-hidden">
                                            <p className="text-[12px] tracking-widest uppercase font-bold text-chocolate-dark mb-3">Company Details</p>
                                            <div className="space-y-3 w-full">
                                                <DetailField label="Company Name" value={o.companyName} />
                                                {o.companyLogo && (
                                                    /* FIXED: min-w-[7.5rem] for label, consistent with DetailField */
                                                    <div className="flex items-start gap-3 w-full overflow-hidden">
                                                        <p className="text-[10px] tracking-widest uppercase font-bold text-chocolate/60 w-30 shrink-0 pt-0.5">
                                                            Company Logo
                                                        </p>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="relative inline-block">
                                                                <img src={o.companyLogo} alt={o.companyName} className="w-20 h-20 object-contain rounded-lg bg-white border border-chocolate/10 p-1" />
                                                                <button
                                                                    onClick={() => downloadFile(o.companyLogo, `${o.companyName}-logo`)}
                                                                    className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-chocolate text-cream flex items-center justify-center text-[10px] hover:scale-110 transition"
                                                                >
                                                                    ⬇
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                                <DetailField label="Corporate Message" value={o.corporateMessage} italic />
                                            </div>
                                        </div>

                                        {/* Delivery */}
                                        <div className="p-4 sm:p-5 overflow-hidden">
                                            <p className="text-[12px] tracking-widest uppercase font-bold text-chocolate-dark mb-3">
                                                {o.deliveryMode === "single_address" ? "Delivery — Single Address" : "Delivery — Multiple Recipients"}
                                            </p>
                                            {o.deliveryMode === "single_address" && o.address?.name ? (
                                                <div className="bg-white/60 rounded-xl p-3 sm:p-4 border border-chocolate/10 space-y-2 w-full overflow-hidden">
                                                    <DetailField label="Name" value={o.address.name} />
                                                    <DetailField label="Phone" value={o.address.phone} />
                                                    <DetailField label="Address Line" value={o.address.line} />
                                                    {/* FIXED: grid-cols-1 on mobile, 3 on sm+ */}
                                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full">
                                                        <DetailField label="City" value={o.address.city} />
                                                        <DetailField label="State" value={o.address.state} />
                                                        <DetailField label="Pincode" value={o.address.pincode} />
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="bg-white/60 rounded-xl p-3 sm:p-4 border border-chocolate/10 space-y-3 w-full overflow-hidden">
                                                    <DetailField label="Recipients File" value={o.recipientsList || "Uploaded file"} />
                                                    {o.recipientsList && (
                                                        <button
                                                            onClick={() => downloadFile(o.recipientsList, `recipients-${o._id}`)}
                                                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-chocolate text-cream text-xs font-semibold tracking-wider uppercase hover:bg-chocolate-dark transition"
                                                        >
                                                            ⬇ Download File
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Timestamp */}
                                        <div className="px-4 sm:px-5 py-3 text-xs text-chocolate/50 wrap-break-word w-full overflow-hidden">
                                            Order placed on {new Date(o.createdAt).toLocaleString()}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

// ─── DetailField ──────────────────────────────────────────────────────────────
// FIXED: min-w-30 was invalid Tailwind — replaced with w-[7.5rem]
// FIXED: value <p> gets flex-1 min-w-0 break-words so long values wrap properly
function DetailField({ label, value, italic }) {
    return (
        <div className="flex items-start gap-3 w-full overflow-hidden">
            <p className="text-[10px] tracking-widest uppercase font-bold text-chocolate/60 w-30 shrink-0 pt-0.5">
                {label}
            </p>
            <p className={`text-sm text-chocolate font-medium flex-1 min-w-0 wrap-break-word ${italic ? "italic" : ""}`}>
                {value || "—"}
            </p>
        </div>
    );
}

// ─── Admin (root) ─────────────────────────────────────────────────────────────
export default function Admin() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [tab, setTab] = useState("dashboard");
    const [statusFilters, setStatusFilters] = useState([]);

    const STATUS_OPTIONS = ["placed", "processing", "packed", "shipped", "delivered", "cancelled"];

    useEffect(() => {
        if (!user) navigate("/login");
    }, [user]);

    useEffect(() => {
        setStatusFilters([]);
    }, [tab]);

    const showFilter = tab === "orders" || tab === "corporate";

    return (
        <div className="min-h-screen bg-chocolate-dark py-6 md:py-8">
            <div className="max-w-7xl mx-auto px-4 md:px-6">

                {/* ── Header: title + filter ──
                    FIXED: replaced absolute-positioned filter button with a proper flex row.
                    On mobile: title above, filter below (flex-col).
                    On sm+: title left, filter right (flex-row).
                    This eliminates the overlap between h1 and the absolutely positioned filter. */}
                <div className="relative flex mb-6 md:mb-8 items-center justify-center min-h-12 md:min-h-14">
    <h1 className="font-serif text-4xl md:text-5xl text-cream font-extrabold uppercase tracking-wider text-center">
        Admin Panel
    </h1>
    {showFilter && (
        <div className="absolute right-0 flex">
            <StatusFilter selected={statusFilters} setSelected={setStatusFilters} options={STATUS_OPTIONS} />
        </div>
    )}
</div>

                {/* ── Nav tabs ── */}
                <div className="flex justify-center mb-8 md:mb-12">
                    <nav className="flex items-center gap-1 card-admin p-1.5 luxury-shadow overflow-x-auto no-scrollbar">
                        {TABS.map((t) => (
                            <button
                                key={t.id}
                                onClick={() => setTab(t.id)}
                                className={`flex items-center gap-1.5 px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium whitespace-nowrap transition ${
                                    tab === t.id ? "bg-chocolate text-cream" : "text-chocolate hover:bg-chocolate/5"
                                }`}
                            >
                                <t.icon size={15} className="shrink-0" /> {t.label}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* ── Tab content ── */}
                <div>
                    {tab === "dashboard" && <Dashboard />}
                    {tab === "products" && <Products />}
                    {tab === "orders" && <Orders statusFilters={statusFilters} />}
                    {tab === "corporate" && <CorporateOrders statusFilters={statusFilters} />}
                </div>
            </div>
            <div className="h-25 md:h-50 bg-chocolate-dark"></div>
        </div>
    );
}