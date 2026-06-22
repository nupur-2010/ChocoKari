// @ts-nocheck
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { User, MapPin, Package, LogOut, Plus, Edit2, Trash2, Truck, Building2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import { formatPrice, validatePhone } from "../lib/constants";
import ArrangementGrid from "../components/ArrangementGrid";
import GoogleSignInButton from "../components/GoogleSignInButton";
import TrackingInfo from "../components/TrackingInfo";

const STATUS_COLOR = {
    placed: "bg-amber-100 text-amber-800",
    processing: "bg-blue-100 text-blue-800",
    packed: "bg-purple-100 text-purple-800",
    shipped: "bg-indigo-100 text-indigo-800",
    delivered: "bg-emerald-100 text-emerald-800",
    cancelled: "bg-red-100 text-red-800",
};

export default function Profile() {
    const { user, logout, linkGoogle } = useAuth();
    const [params, setParams] = useSearchParams();
    const tab = params.get("tab") || "profile";
    const navigate = useNavigate();
    const [addresses, setAddresses] = useState([]);
    const [orders, setOrders] = useState([]);
    const [expandedItem, setExpandedItem] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [addrForm, setAddrForm] = useState({ label: "", name: "", phone: "", line: "", city: "", state: "", pincode: "", isDefault: false });
    const [phoneError, setPhoneError] = useState("");

    useEffect(() => {
        if (!user) { navigate("/login"); return; }
        if (tab === "addresses") loadAddresses();
        if (tab === "orders") loadOrders();
    }, [tab, user]);

    const loadAddresses = async () => {
        setLoading(true);
        try {
            const r = await api.get("/address");
            setAddresses(r?.data?.data?.addresses || []);
        } finally { setLoading(false); }
    };

    const loadOrders = async () => {
        setLoading(true);
        try {
            const [regular, corporate] = await Promise.all([
                api.get("/order/my"),
                api.get("/corporate/my"),
            ]);
            const regulars = (regular?.data?.data?.orders || []).map((o) => ({ ...o, _orderKind: "regular" }));
            const corporates = (corporate?.data?.data?.orders || []).map((o) => ({ ...o, _orderKind: "corporate" }));
            setOrders([...regulars, ...corporates].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        } finally { setLoading(false); }
    };

    const saveAddress = async (e) => {
        e.preventDefault();
        if (!validatePhone(addrForm.phone)) {
            setPhoneError("Enter a valid 10-digit phone number");
            return;
        }
        try {
            if (editingId) {
                await api.put(`/address/${editingId}`, addrForm);
            } else {
                await api.post("/address", addrForm);
            }
            setShowAddressForm(false);
            setEditingId(null);
            setPhoneError("");
            setAddrForm({ label: "", name: "", phone: "", line: "", city: "", state: "", pincode: "", isDefault: false });
            loadAddresses();
        } catch (e) {
            alert("Failed to save address");
        }
    };

    const deleteAddress = async (id) => {
        if (!confirm("Delete this address?")) return;
        await api.delete(`/address/${id}`);
        loadAddresses();
    };

    const editAddress = (a) => {
        setEditingId(a._id);
        setAddrForm({ ...a });
        setShowAddressForm(true);
    };

    const orderItemName = (it) => {
        if (it.itemType === "product") return it.productSnapshot?.name || "Product";
        const c = it.customizationSnapshot;
        if (!c) return "Custom Box";
        return `${c.box || "Classic"} Box (${c.size || "?"} pcs)`;
    };

    const orderItemUnitPrice = (it) => (it.itemTotal && it.quantity ? it.itemTotal / it.quantity : 0);

    const canCancelOrder = (createdAt) => {
        const hoursSinceOrder = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60);
        return hoursSinceOrder <= 24;
    };

    const [cancellingId, setCancellingId] = useState(null);

    const cancelOrder = async (o) => {
        if (!confirm("Are you sure you want to cancel this order?")) return;
        setCancellingId(o._id);
        try {
            const endpoint = o._orderKind === "corporate"
                ? `/corporate/${o._id}/cancel`
                : `/order/${o._id}/cancel`;
            await api.patch(endpoint);
            loadOrders();
        } catch (e) {
            alert(e?.response?.data?.message || "Failed to cancel order");
        } finally {
            setCancellingId(null);
        }
    };

    if (!user) return null;

    const tabs = [
        { id: "profile", label: "Profile", icon: User },
        { id: "orders", label: "Orders", icon: Package },
        { id: "addresses", label: "Addresses", icon: MapPin },
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-12 w-full block overflow-hidden">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 w-full">
        {/* Left Sidebar Tabs Panel */}
        <div className="md:col-span-1 w-full min-w-0">
            <div className="card-luxury p-4 sm:p-6 luxury-shadow w-full overflow-hidden">
                <div className="text-center pb-4 border-b border-chocolate/10 w-full">
                    <div className="w-16 h-16 rounded-full chocolate-gradient flex items-center justify-center text-cream mx-auto text-2xl font-serif font-bold shrink-0">
                        {user.fullname?.[0]}
                    </div>
                    <p className="font-semibold text-chocolate mt-3 wrap-break-wordword whitespace-normal w-full">{user.fullname}</p>
                    <p className="text-xs text-chocolate/60 break-all whitespace-normal w-full mt-1">{user.email}</p>
                </div>
                <nav className="mt-4 space-y-1 w-full">
                    {tabs.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => setParams({ tab: t.id })}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition min-w-0 ${
                                tab === t.id ? "bg-chocolate text-cream" : "text-chocolate hover:bg-chocolate/5"
                            }`}
                        >
                            <t.icon size={16} className="shrink-0" /> 
                            <span className="truncate flex-1 text-left min-w-0">{t.label}</span>
                        </button>
                    ))}
                    <button 
                        onClick={async () => { await logout(); navigate("/"); }} 
                        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-red-600 hover:bg-red-50 min-w-0"
                    >
                        <LogOut size={16} className="shrink-0" /> 
                        <span className="truncate flex-1 text-left min-w-0">Logout</span>
                    </button>
                </nav>
            </div>
        </div>
                {/* ── Right Content ── */}
                <div className="md:col-span-3 w-full min-w-0 overflow-hidden">

                    {/* ───── PROFILE TAB ───── */}
                    {tab === "profile" && (
                        <div className="card-luxury p-5 sm:p-8 luxury-shadow w-full overflow-hidden">
                            <h2 className="font-serif text-2xl sm:text-3xl text-chocolate font-extrabold mb-6 uppercase wrap-break-word w-full">
                                My Profile
                            </h2>
                            <div className="space-y-4 w-full">
                                <ProfileField label="Full Name" value={user.fullname} />
                                <ProfileField label="Email" value={user.email} breakAll />
                                <ProfileField label="Role" value={user.role} capitalize />
                                <ProfileField
                                    label="Sign-in Method"
                                    value={user.authProvider === "google" ? "Google" : "Email & Password"}
                                />
                            </div>
                            {/* Google link section */}
                            <div className="mt-6 p-4 rounded-xl bg-cream/40 border border-chocolate/10 w-full overflow-hidden">
                                <p className="text-sm font-semibold text-chocolate mb-2">Google Account</p>
                                {user.authProvider === "google" ? (
                                    <p className="text-sm text-chocolate/70 wrap-break-wordword whitespace-normal w-full">
                                        Your account is linked to Google. You can sign in with Google anytime.
                                    </p>
                                ) : (
                                    <div className="w-full overflow-hidden">
                                        <p className="text-sm text-chocolate/70 mb-3 wrap-break-word whitespace-normal w-full">
                                            Link your Google account for faster sign-in.
                                        </p>
                                        <div className="max-w-full overflow-hidden">
                                            <GoogleSignInButton
                                                onCredential={async (credential) => {
                                                    try {
                                                        await linkGoogle(credential);
                                                        alert("Google account linked successfully");
                                                    } catch (e) {
                                                        alert(e?.response?.data?.message || "Failed to link Google account");
                                                    }
                                                }}
                                                text="Link Google Account"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ───── ADDRESSES TAB ───── */}
                    {tab === "addresses" && (
                        <div className="w-full min-w-0">
                            {/* Header row */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 w-full">
                                <h2 className="font-serif text-2xl sm:text-3xl text-chocolate font-extrabold uppercase wrap-break-word flex-1 min-w-0">
                                    Saved Addresses
                                </h2>
                                <button
                                    onClick={() => {
                                        setShowAddressForm(!showAddressForm);
                                        setEditingId(null);
                                        setAddrForm({ label: "", name: "", phone: "", line: "", city: "", state: "", pincode: "", isDefault: false });
                                    }}
                                    className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto shrink-0"
                                >
                                    <Plus size={14} /> Add Address
                                </button>
                            </div>

                            {/* Address form */}
                            {showAddressForm && (
                                <form onSubmit={saveAddress} className="card-luxury p-4 sm:p-6 luxury-shadow mb-5 w-full overflow-hidden">
                                    <h3 className="font-semibold text-chocolate mb-4">
                                        {editingId ? "Edit" : "New"} Address
                                    </h3>
                                    <div className="space-y-3 w-full">
                                        <div>
                                            <label className="text-[10px] tracking-widest uppercase font-bold text-chocolate/60 mb-1 block">Label</label>
                                            <input
                                                value={addrForm.label}
                                                onChange={(e) => setAddrForm({ ...addrForm, label: e.target.value })}
                                                placeholder="e.g. Home, Office, Mom's place"
                                                className="input-luxury w-full"
                                                required
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <div>
                                                <label className="text-[10px] tracking-widest uppercase font-bold text-chocolate/60 mb-1 block">Full Name</label>
                                                <input
                                                    value={addrForm.name}
                                                    onChange={(e) => setAddrForm({ ...addrForm, name: e.target.value })}
                                                    className="input-luxury w-full"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] tracking-widest uppercase font-bold text-chocolate/60 mb-1 block">Phone</label>
                                                <input
                                                    value={addrForm.phone}
                                                    onChange={(e) => { setAddrForm({ ...addrForm, phone: e.target.value }); setPhoneError(""); }}
                                                    className={`input-luxury w-full ${phoneError ? "border-red-500" : ""}`}
                                                    required
                                                />
                                                {phoneError && (
                                                    <p className="text-[10px] text-red-600 mt-1 wrap-break-wordword">{phoneError}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[10px] tracking-widest uppercase font-bold text-chocolate/60 mb-1 block">Address Line</label>
                                            <input
                                                value={addrForm.line}
                                                onChange={(e) => setAddrForm({ ...addrForm, line: e.target.value })}
                                                className="input-luxury w-full"
                                                required
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                            <div>
                                                <label className="text-[10px] tracking-widest uppercase font-bold text-chocolate/60 mb-1 block">City</label>
                                                <input
                                                    value={addrForm.city}
                                                    onChange={(e) => setAddrForm({ ...addrForm, city: e.target.value })}
                                                    className="input-luxury w-full"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] tracking-widest uppercase font-bold text-chocolate/60 mb-1 block">State</label>
                                                <input
                                                    value={addrForm.state}
                                                    onChange={(e) => setAddrForm({ ...addrForm, state: e.target.value })}
                                                    className="input-luxury w-full"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] tracking-widest uppercase font-bold text-chocolate/60 mb-1 block">Pincode</label>
                                                <input
                                                    value={addrForm.pincode}
                                                    onChange={(e) => setAddrForm({ ...addrForm, pincode: e.target.value })}
                                                    className="input-luxury w-full"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <label className="flex items-center gap-2 mt-3 text-sm text-chocolate cursor-pointer select-none">
                                        <input
                                            type="checkbox"
                                            checked={addrForm.isDefault}
                                            onChange={(e) => setAddrForm({ ...addrForm, isDefault: e.target.checked })}
                                            className="accent-chocolate shrink-0"
                                        />
                                        <span>Set as default</span>
                                    </label>
                                    <div className="flex gap-2 mt-4">
                                        <button type="submit" className="btn-primary px-4 py-2 text-sm shrink-0">Save</button>
                                        <button
                                            type="button"
                                            onClick={() => { setShowAddressForm(false); setEditingId(null); }}
                                            className="btn-outline px-4 py-2 text-sm shrink-0"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            )}

                            {/* Address list */}
                            {loading ? (
                                <p className="text-chocolate/60">Loading...</p>
                            ) : addresses.filter((a) => a._id !== editingId).length === 0 ? (
                                <div className="card-luxury p-8 text-center text-chocolate/60 w-full wrap-break-word">
                                    {editingId ? "Editing address above." : "No saved addresses."}
                                </div>
                            ) : (
                                <div className="space-y-3 w-full">
                                    {addresses.filter((a) => a._id !== editingId).map((a) => (
                                        <div
                                            key={a._id}
                                            className="card-luxury p-4 sm:p-5 flex flex-col sm:flex-row items-start justify-between gap-3 w-full overflow-hidden"
                                        >
                                            {/* Address info */}
                                            <div className="min-w-0 flex-1 space-y-1 w-full">
                                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                                    <p className="font-semibold text-chocolate wrap-break-word flex-1 min-w-0">{a.label}</p>
                                                    {a.isDefault && (
                                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold/20 text-chocolate-dark shrink-0">
                                                            Default
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-chocolate/80 wrap-break-word w-full">
                                                    {a.name} · {a.phone}
                                                </p>
                                                <p className="text-sm text-chocolate/70 wrap-break-word w-full">
                                                    {a.line}, {a.city}, {a.state} - {a.pincode}
                                                </p>
                                            </div>
                                            {/* Action buttons */}
                                            <div className="flex gap-1 self-end sm:self-start shrink-0">
                                                <button
                                                    onClick={() => editAddress(a)}
                                                    className="w-8 h-8 rounded-full hover:bg-chocolate/10 text-chocolate flex items-center justify-center shrink-0"
                                                >
                                                    <Edit2 size={14} />
                                                </button>
                                                <button
                                                    onClick={() => deleteAddress(a._id)}
                                                    className="w-8 h-8 rounded-full hover:bg-red-100 text-red-600 flex items-center justify-center shrink-0"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ───── ORDERS TAB ───── */}
                    {tab === "orders" && (
                        <div className="w-full min-w-0">
                            <h2 className="font-serif text-2xl sm:text-3xl text-chocolate font-extrabold uppercase mb-5 wrap-break-word w-full">
                                My Orders
                            </h2>
                            {loading ? (
                                <p className="text-chocolate/60">Loading...</p>
                            ) : orders.length === 0 ? (
                                <div className="card-luxury p-8 text-center text-chocolate/60 w-full">No orders yet.</div>
                            ) : (
                                <div className="space-y-4 w-full">
                                    {orders.map((o) =>
                                        o._orderKind === "corporate" ? (
                                            <CorporateOrderCard
                                                key={o._id}
                                                order={o}
                                                expandedItem={expandedItem}
                                                setExpandedItem={setExpandedItem}
                                                canCancelOrder={canCancelOrder}
                                                cancelOrder={cancelOrder}
                                                cancellingId={cancellingId}
                                            />
                                        ) : (
                                            <div key={o._id} className="card-luxury p-4 sm:p-5 w-full overflow-hidden">
                                                {/* Order header */}
                                                <div className="flex items-start justify-between mb-3 gap-2 w-full flex-wrap">
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-sm text-chocolate font-extrabold break-all">
                                                            Order #{o._id.slice(-8).toUpperCase()}
                                                        </p>
                                                        <p className="text-xs text-chocolate/80 wrap-break-word">
                                                            Placed on {new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                                                        </p>
                                                    </div>
                                                    <span className={`text-xs px-3 py-1 rounded-full capitalize shrink-0 ${STATUS_COLOR[o.orderStatus] || "bg-chocolate/10 text-chocolate"}`}>
                                                        {o.orderStatus}
                                                    </span>
                                                </div>

                                                {/* Tracking */}
                                                {o.orderStatus === "shipped" && o.trackingId && (
                                                    <div className="overflow-x-auto w-full mb-3">
                                                        <TrackingInfo
                                                            trackingId={o.trackingId}
                                                            trackingLink={o.trackingLink}
                                                            shippedAt={o.shippedAt}
                                                            variant="profile"
                                                        />
                                                    </div>
                                                )}

                                                {/* Order items */}
                                                <div className="space-y-2 text-sm text-chocolate/80 w-full">
                                                    {o.items?.map((it, i) => {
                                                        const key = `${o._id}-${i}`;
                                                        const isOpen = expandedItem === key;
                                                        return (
                                                            <div key={i} className="border border-chocolate/15 rounded-xl overflow-hidden w-full">
                                                                {/* Accordion trigger */}
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setExpandedItem(isOpen ? null : key)}
                                                                    className="w-full flex items-center justify-between gap-3 p-3 hover:bg-cream-dark/40 transition text-left min-w-0"
                                                                >
                                                                    <p className="text-chocolate font-medium min-w-0 flex-1 wrap-break-word pr-1">
                                                                        {orderItemName(it)}{" "}
                                                                        <span className="text-chocolate/60 text-xs">× {it.quantity}</span>
                                                                    </p>
                                                                    <span className="w-7 h-7 rounded-full bg-chocolate/10 hover:bg-chocolate/20 text-chocolate flex items-center justify-center text-base font-bold shrink-0">
                                                                        {isOpen ? "−" : "+"}
                                                                    </span>
                                                                </button>

                                                                {/* Accordion body */}
                                                                {isOpen && (
                                                                    <div className="border-t border-chocolate/15 card-admin-soft p-3 w-full overflow-hidden">
                                                                        <p className="text-[10px] tracking-widest uppercase font-bold text-chocolate/60 mb-2 wrap-break-word w-full">
                                                                            {it.itemType === "product" ? "Product" : "Custom Box"}
                                                                        </p>

                                                                        {it.itemType === "product" ? (
                                                                            <div className="flex flex-col sm:flex-row items-start gap-4 w-full">
                                                                                {/* Product image */}
                                                                                {it.productSnapshot?.images?.[0] ? (
                                                                                    <img
                                                                                        src={it.productSnapshot.images[0]}
                                                                                        alt=""
                                                                                        className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl object-cover border border-chocolate/10 shrink-0 mx-auto sm:mx-0"
                                                                                    />
                                                                                ) : (
                                                                                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl chocolate-gradient flex items-center justify-center text-cream/40 font-serif text-4xl shrink-0 mx-auto sm:mx-0">
                                                                                        C
                                                                                    </div>
                                                                                )}
                                                                                {/* Product details */}
                                                                                <div className="flex-1 min-w-0 space-y-2 w-full">
                                                                                    <DetailField label="Name" value={it.productSnapshot?.name} />
                                                                                    <DetailField label="Price" value={formatPrice(orderItemUnitPrice(it))} />
                                                                                    {it.productSnapshot?.customQuestionAnswer?.length > 0 && (
                                                                                        <div className="w-full overflow-hidden pt-1">
                                                                                            <p className="text-[10px] tracking-widest uppercase font-bold text-chocolate/60 mb-1">
                                                                                                Custom Questions
                                                                                            </p>
                                                                                            <div className="space-y-1 w-full">
                                                                                                {it.productSnapshot.customQuestionAnswer.map((qa, j) => (
                                                                                                    <p key={j} className="text-xs text-chocolate/80 wrap-break-word w-full">
                                                                                                        <span className="font-semibold">Q:</span> {qa.question}{" "}
                                                                                                        <span className="text-chocolate/50">→</span>{" "}
                                                                                                        <span className="font-semibold">A:</span>{" "}
                                                                                                        {qa.answer || <em className="text-chocolate/40">no answer</em>}
                                                                                                    </p>
                                                                                                ))}
                                                                                            </div>
                                                                                        </div>
                                                                                    )}
                                                                                    {it.productSnapshot?.giftPackaging && (
                                                                                        <p className="text-[10px] tracking-widest uppercase font-bold text-chocolate/60 wrap-break-word w-full">
                                                                                            Premium Gift Packaging
                                                                                        </p>
                                                                                    )}
                                                                                    {it.productSnapshot?.message && (
                                                                                        <p className="text-xs text-chocolate/80 italic wrap-break-word w-full">
                                                                                            "{it.productSnapshot.message}"
                                                                                        </p>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        ) : (
                                                                            <div className="flex flex-col sm:flex-row items-start gap-4 w-full">
                                                                                {/* ArrangementGrid */}
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
                                                                                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl chocolate-gradient flex items-center justify-center text-cream/40 font-serif text-4xl shrink-0 mx-auto sm:mx-0">
                                                                                        C
                                                                                    </div>
                                                                                )}
                                                                                {/* Custom box details */}
                                                                                <div className="flex-1 min-w-0 space-y-2 w-full">
                                                                                    <DetailField label="Name" value={orderItemName(it)} />
                                                                                    <DetailField label="Price" value={formatPrice(orderItemUnitPrice(it))} />
                                                                                    {it.customizationSnapshot && (
                                                                                        <>
                                                                                            <DetailField label="Intensity" value={it.customizationSnapshot.preferredIntensity} />
                                                                                            <DetailField label="Stickers" value={it.customizationSnapshot.stickers} />
                                                                                        </>
                                                                                    )}
                                                                                    {it.customizationSnapshot?.giftPackaging && (
                                                                                        <p className="text-[10px] tracking-widest uppercase font-bold text-chocolate/60 wrap-break-word w-full">
                                                                                            Premium Gift Packaging
                                                                                        </p>
                                                                                    )}
                                                                                    {it.customizationSnapshot?.message && (
                                                                                        <p className="text-xs text-chocolate/80 italic wrap-break-word w-full">
                                                                                            "{it.customizationSnapshot.message}"
                                                                                        </p>
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

                                                {/* Order footer: delivery address + price + cancel */}
                                                <div className="border-t border-chocolate/10 pt-3 mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full overflow-hidden">
                                                    <div className="flex items-start gap-2 text-xs text-chocolate/70 min-w-0 flex-1 w-full">
                                                        <Truck size={14} className="shrink-0 mt-0.5" />
                                                        <span className="wrap-break-word whitespace-normal min-w-0 flex-1">
                                                            Delivering to {o.shippingAddress.line}, {o.shippingAddress.city}, {o.shippingAddress.state}, {o.shippingAddress.pincode}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 w-full sm:w-auto">
                                                        {o.orderStatus !== "cancelled" && o.orderStatus !== "delivered" && canCancelOrder(o.createdAt) && (
                                                            <button
                                                                type="button"
                                                                onClick={() => cancelOrder(o)}
                                                                disabled={cancellingId === o._id}
                                                                className="text-xs px-3 py-1.5 rounded-full border border-red-300 text-red-700 hover:bg-red-50 disabled:opacity-50 transition whitespace-nowrap shrink-0"
                                                            >
                                                                {cancellingId === o._id ? "Cancelling..." : "Cancel Order"}
                                                            </button>
                                                        )}
                                                        <p className="text-chocolate font-semibold whitespace-nowrap ml-auto sm:ml-0 shrink-0">
                                                            {formatPrice(o.totalAmount)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── ProfileField — used only in the Profile tab ─────────────────────────────
function ProfileField({ label, value, breakAll, capitalize }) {
    return (
        <div className="w-full overflow-hidden">
            <label className="text-xs tracking-widest uppercase text-chocolate/60 block mb-1">{label}</label>
            <p className={`text-chocolate font-medium ${breakAll ? "break-all" : "wrap-break-word"} ${capitalize ? "capitalize" : ""} w-full`}>
                {value}
            </p>
        </div>
    );
}

// ─── DetailField — used inside order/corporate expanded views ─────────────────
function DetailField({ label, value, italic }) {
    return (
        <div className="flex items-start gap-3 w-full overflow-hidden">
            {/* Fixed-width label column — uses arbitrary value so it's valid Tailwind */}
            <p className="text-[10px] tracking-widest uppercase font-bold text-chocolate/60 w-30 shrink-0 pt-0.5">
                {label}
            </p>
            {/* Value — takes remaining width, wraps cleanly */}
            <p className={`text-sm text-chocolate font-medium flex-1 min-w-0 wrap-break-word ${italic ? "italic" : ""}`}>
                {value || "—"}
            </p>
        </div>
    );
}

// ─── CorporateOrderCard ───────────────────────────────────────────────────────
function CorporateOrderCard({ order: o, expandedItem, setExpandedItem, canCancelOrder, cancelOrder, cancellingId }) {
    const isOpen = expandedItem === o._id;
    const productName = o.orderType === "product"
        ? o.productId?.name || "Product"
        : `${o.customizationId?.box || "Classic"} Box (${o.customizationId?.size || "?"} pcs)`;

    return (
        <div className="card-luxury overflow-hidden w-full">
            {/* Card header */}
            <div className="p-4 sm:p-5">
                <div className="flex items-start justify-between flex-wrap gap-3 w-full">
                    {/* Left: icon + name */}
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg chocolate-gradient flex items-center justify-center text-cream shrink-0">
                            <Building2 size={24} />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="font-serif text-base sm:text-lg font-extrabold text-chocolate wrap-break-word w-full">
                                {productName}
                            </p>
                            <p className="text-sm text-chocolate/80 wrap-break-word w-full">{o.quantity} boxes</p>
                            <p className="text-xs text-chocolate/60">Corporate Order</p>
                        </div>
                    </div>
                    {/* Right: status + cancel + expand */}
                    <div className="flex items-center gap-2 flex-wrap shrink-0">
                        <span className={`text-xs px-2 py-0.5 rounded-full capitalize whitespace-nowrap ${STATUS_COLOR[o.orderStatus] || "bg-chocolate/10 text-chocolate"}`}>
                            {o.orderStatus}
                        </span>
                        {o.orderStatus !== "cancelled" && o.orderStatus !== "delivered" && canCancelOrder(o.createdAt) && (
                            <button
                                type="button"
                                onClick={() => cancelOrder(o)}
                                disabled={cancellingId === o._id}
                                className="text-xs px-3 py-1.5 rounded-full border border-red-300 text-red-700 hover:bg-red-50 disabled:opacity-50 transition whitespace-nowrap"
                            >
                                {cancellingId === o._id ? "Cancelling..." : "Cancel Order"}
                            </button>
                        )}
                        <button
                            onClick={() => setExpandedItem(isOpen ? null : o._id)}
                            className="w-9 h-9 rounded-full bg-chocolate/10 hover:bg-chocolate/20 text-chocolate flex items-center justify-center text-sm font-bold shrink-0"
                        >
                            {isOpen ? "−" : "+"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Expanded body */}
            {isOpen && (
                <div className="border-t border-chocolate/10 card-admin-soft divide-y divide-chocolate/10 w-full overflow-hidden">

                    {/* Product details section */}
                    <div className="p-4 sm:p-5 w-full overflow-hidden">
                        <p className="text-[12px] tracking-widest uppercase font-bold text-chocolate-dark mb-3">Product Details</p>
                        <div className="flex flex-col sm:flex-row items-start gap-4 w-full">
                            {/* Image / grid */}
                            {o.orderType === "product" ? (
                                <img
                                    src={o.productId?.images?.[0]}
                                    alt=""
                                    className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl object-cover border border-chocolate/10 shrink-0 mx-auto sm:mx-0"
                                />
                            ) : (
                                <div className={`shrink-0 card-admin-soft p-1 overflow-hidden max-w-full mx-auto sm:mx-0 ${
                                    o.customizationId?.size === 6  ? "w-32"  :
                                    o.customizationId?.size === 9  ? "w-36"  :
                                    o.customizationId?.size === 12 ? "w-40"  :
                                    o.customizationId?.size === 16 ? "w-44"  : "w-56"
                                }`}>
                                    <ArrangementGrid custom={o.customizationId} showNames={true} />
                                </div>
                            )}
                            {/* Details */}
                            <div className="flex-1 min-w-0 space-y-2 w-full">
                                <DetailField label="Name" value={productName} />
                                {o.orderType === "customization" && (
                                    <DetailField label="Intensity" value={o.customizationId?.preferredIntensity} />
                                )}
                                <DetailField label="Price" value={formatPrice(o.totalAmount / o.quantity)} />
                            </div>
                        </div>
                    </div>

                    {/* Quantity section */}
                    <div className="p-4 sm:p-5 w-full overflow-hidden">
                        <p className="text-[12px] tracking-widest uppercase font-bold text-chocolate-dark mb-3">Quantity</p>
                        <div className="space-y-2">
                            <DetailField label="Boxes Ordered" value={`${o.quantity}`} />
                            <DetailField label="Total Amount" value={formatPrice(o.totalAmount)} />
                        </div>
                    </div>

                    {/* Company details section */}
                    <div className="p-4 sm:p-5 w-full overflow-hidden">
                        <p className="text-[12px] tracking-widest uppercase font-bold text-chocolate-dark mb-3">Company Details</p>
                        <div className="space-y-3 w-full">
                            <DetailField label="Company Name" value={o.companyName} />
                            {o.companyLogo && (
                                <div className="flex items-start gap-3 w-full overflow-hidden">
                                    <p className="text-[10px] tracking-widest uppercase font-bold text-chocolate/60 w-30 shrink-0 pt-0.5">
                                        Company Logo
                                    </p>
                                    <div className="flex-1 min-w-0">
                                        <img
                                            src={o.companyLogo}
                                            alt={o.companyName}
                                            className="w-20 h-20 object-contain rounded-lg bg-white border border-chocolate/10 p-1"
                                        />
                                    </div>
                                </div>
                            )}
                            <DetailField label="Corporate Message" value={o.corporateMessage} italic />
                        </div>
                    </div>

                    {/* Delivery section */}
                    <div className="p-4 sm:p-5 w-full overflow-hidden">
                        <p className="text-[12px] tracking-widest uppercase font-bold text-chocolate-dark mb-3">
                            {o.deliveryMode === "single_address" ? "Delivery — Single Address" : "Delivery — Multiple Recipients"}
                        </p>
                        {o.deliveryMode === "single_address" && o.address?.name ? (
                            <div className="bg-white/60 rounded-xl p-3 sm:p-4 border border-chocolate/10 space-y-2 w-full overflow-hidden">
                                <DetailField label="Name" value={o.address.name} />
                                <DetailField label="Phone" value={o.address.phone} />
                                <DetailField label="Address Line" value={o.address.line} />
                                <DetailField label="City" value={o.address.city} />
                                <DetailField label="State" value={o.address.state} />
                                <DetailField label="Pincode" value={o.address.pincode} />
                            </div>
                        ) : (
                            <div className="bg-white/60 rounded-xl p-3 sm:p-4 border border-chocolate/10 space-y-3 w-full overflow-hidden">
                                <DetailField label="Recipients File" value={o.recipientsList || "Uploaded file"} />
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
}