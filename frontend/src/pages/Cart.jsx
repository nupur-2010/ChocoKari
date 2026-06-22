// @ts-nocheck
import { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Minus, Plus, X, ShoppingBag, ArrowRight, Heart, MapPin, Save } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import { formatPrice, GRID_FOR_SIZE, validatePhone, STANDARD_SHIPPING_COST, FREE_SHIPPING_THRESHOLD, GIFT_PACKAGING_PRICE, FLAVOUR_COLORS, FLAVOUR_ABBR } from "../lib/constants";
import Select from "../components/Select";
import { openRazorpayCheckout } from "../lib/razorpay";

const getItemKey = (i) => {
    if (i.itemType === "product") {
        const productId = i.productId?._id || i.productId;
        const answers = (i.customQuestionAnswer || [])
            .map((a) => `${a.question}::${a.answer}`)
            .sort()
            .join("|");
        const gift = i.giftPackaging ? "1" : "0";
        const msg = i.message || "";
        return `p|${productId}|${answers}|${gift}|${msg}`;
    }
    const c = i.customizationId;
    const snap = i.customSnapshot;
    const box = c?.box || snap?.box;
    const size = c?.size || snap?.size;
    const intensity = c?.preferredIntensity || snap?.preferredIntensity;
    const stickers = c?.stickers || snap?.stickers;
    const gift = (c?.giftPackaging ?? snap?.giftPackaging) ? "1" : "0";
    const message = c?.message ?? snap?.message ?? "";
    const arrangement = ((c?.arrangement || snap?.arrangement) || []).map((a) => a.flavour).join(",");
    if (!box && !size && !snap) return `c|empty`;
    return `c|${box}|${size}|${intensity}|${stickers}|${gift}|${message}|${arrangement}`;
};

export default function Cart() {
    const { items, updateItem, removeItem, clear, count } = useCart();
    const { addItem: addToWishlist, isInWishlist } = useWishlist();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [address, setAddress] = useState({ name: "", phone: "", line: "", city: "", state: "", pincode: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [phoneError, setPhoneError] = useState("");
    const [savedAddresses, setSavedAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState("");
    const [showNewAddressForm, setShowNewAddressForm] = useState(false);
    const [newLabel, setNewLabel] = useState("");
    const [saveAsNew, setSaveAsNew] = useState(false);

    useEffect(() => {
        if (user) {
            api.get("/address")
                .then((r) => {
                    const list = r?.data?.data?.addresses || [];
                    setSavedAddresses(list);
                    if (list.length === 0) {
                        setShowNewAddressForm(true);
                        setSaveAsNew(true);
                    } else {
                        const def = list.find((a) => a.isDefault) || list[0];
                        setSelectedAddressId(def._id);
                        setAddress({
                            name: def.name,
                            phone: def.phone,
                            line: def.line,
                            city: def.city,
                            state: def.state,
                            pincode: def.pincode,
                        });
                        setNewLabel(def.label || "");
                    }
                })
                .catch(() => setSavedAddresses([]));
        }
    }, [user]);

    const groups = useMemo(() => {
        const map = new Map();
        for (const item of items) {
            const key = getItemKey(item);
            if (map.has(key)) {
                const g = map.get(key);
                g.items.push(item);
                g.quantity += item.quantity || 1;
            } else {
                map.set(key, { key, items: [item], quantity: item.quantity || 1, representative: item });
            }
        }
        return Array.from(map.values());
    }, [items]);

    const getItemDetails = (i) => {
        if (i.itemType === "product") {
            const basePrice = i.productId?.price || 0;
            const hasGift = i.giftPackaging ?? false;
            return {
                name: i.productId?.name || "Product",
                image: i.productId?.images?.[0],
                price: basePrice,
                priceWithGift: basePrice + (hasGift ? GIFT_PACKAGING_PRICE : 0),
                type: "product",
                giftPackaging: hasGift,
                message: i.message || "",
            };
        }
        const c = i.customizationId;
        const snap = i.customSnapshot;
        const box = c?.box || snap?.box || "Classic";
        const size = c?.size || snap?.size || "?";
        const basePrice = c?.price || 0;
        const intensity = c?.preferredIntensity || snap?.preferredIntensity;
        const stickers = c?.stickers || snap?.stickers;
        const giftPackaging = c?.giftPackaging ?? snap?.giftPackaging ?? false;
        const message = c?.message ?? snap?.message ?? "";
        const arrangement = c?.arrangement || snap?.arrangement || [];
        if (!c && !snap) return { name: "Custom Box", image: null, price: 0, priceWithGift: 0, type: "custom", giftPackaging: false, message: "", arrangement: [], size: 0 };
        return {
            name: `${box} Custom Box (${size} pcs)`,
            image: null,
            price: basePrice,
            priceWithGift: basePrice,
            type: "custom",
            intensity,
            stickers,
            giftPackaging,
            message,
            arrangement,
            size: Number(size) || 0,
        };
    };

    const getEffectivePrice = (i) => getItemDetails(i).priceWithGift;

    const subtotal = groups.reduce((s, g) => {
        const d = getItemDetails(g.representative);
        return s + d.priceWithGift * g.quantity;
    }, 0);
    const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_COST;

    const handleIncrement = async (group) => {
        const first = group.items[0];
        await updateItem(first, (first.quantity || 1) + 1);
    };

    const handleDecrement = async (group) => {
        const first = group.items[0];
        await updateItem(first, (first.quantity || 1) - 1);
    };

    const handleRemoveGroup = async (group) => {
        for (const it of group.items) {
            await removeItem(it);
        }
    };

    const handleMoveToWishlist = async (group) => {
        const first = group.items[0];
        const wishItem = first.itemType === "product"
            ? { itemType: "product", productId: first.productId?._id || first.productId }
            : { itemType: "customization", customizationId: first.customizationId?._id || first.customizationId, customSnapshot: first.customSnapshot };
        const alreadyInWishlist = isInWishlist(wishItem);
        if (!alreadyInWishlist) {
            try {
                await addToWishlist(wishItem);
            } catch (e) {
                // swallow error so remove-from-cart still runs
            }
        }
        await handleRemoveGroup(group);
    };

    const placeOrder = async () => {
        if (!user) { navigate("/login"); return; }
        if (!address.name || !address.phone || !address.line || !address.city || !address.state || !address.pincode) {
            setError("Please fill in complete shipping address");
            return;
        }
        if (!validatePhone(address.phone)) {
            setPhoneError("Enter a valid 10-digit phone number");
            return;
        }
        if (user && showNewAddressForm && saveAsNew && !newLabel.trim()) {
            setError("Please enter a label for the address");
            return;
        }
        if (subtotal + shipping <= 0) {
            setError("Cart total must be greater than zero");
            return;
        }
        try {
            setLoading(true);
            setError("");

            if (user && showNewAddressForm && saveAsNew) {
                try {
                    await api.post("/address", { label: newLabel.trim(), ...address });
                } catch (e) {
                    // ignore - still proceed to payment
                }
            }

            const orderItems = items.map((i) => {
                if (i.itemType === "product") {
                    const basePrice = i.productId?.price || 0;
                    const hasGift = i.giftPackaging || false;
                    const unitPrice = basePrice + (hasGift ? GIFT_PACKAGING_PRICE : 0);
                    return {
                        itemType: "product",
                        productSnapshot: {
                            id: i.productId?._id,
                            name: i.productId?.name,
                            description: i.productId?.description,
                            images: i.productId?.images,
                            price: i.productId?.price,
                            attributes: i.productId?.attributes || {},
                            giftPackaging: hasGift,
                            customQuestionAnswer: i.customQuestionAnswer || [],
                            message: hasGift ? (i.message || "") : null,
                        },
                        quantity: i.quantity || 1,
                        itemTotal: unitPrice * (i.quantity || 1),
                    };
                }
                return {
                    itemType: "customization",
                    customizationSnapshot: i.customizationId,
                    quantity: i.quantity || 1,
                    itemTotal: (i.customizationId?.price || 0) * (i.quantity || 1),
                };
            });

            const totalAmount = subtotal + shipping;

            const createRes = await api.post("/order/payment/create", { totalAmount });
            const { razorpayOrderId, amount, currency, keyId } = createRes.data.data;

            const result = await openRazorpayCheckout({
                keyId,
                razorpayOrderId,
                amount,
                currency,
                customerName: user.fullname,
                customerEmail: user.email,
                description: `ChocoKari Order - ${orderItems.length} item(s)`,
            });

            if (!result.success) {
                if (result.error && result.error !== "Payment cancelled") {
                    setError(result.error);
                }
                return;
            }

            const verifyRes = await api.post("/order/payment/verify", {
                razorpayOrderId: result.response.razorpay_order_id,
                razorpayPaymentId: result.response.razorpay_payment_id,
                razorpaySignature: result.response.razorpay_signature,
                items: orderItems,
                shippingAddress: address,
                totalAmount,
            });

            if (verifyRes.data?.data?.order) {
                await clear();
                navigate("/profile?tab=orders");
            }
        } catch (e) {
            console.error("Place order error:", e);
            const serverMsg = e?.response?.data?.message || e?.response?.data?.error?.description;
            let errMsg = "Failed to place order. Please try again.";
            if (serverMsg && serverMsg !== "undefined" && serverMsg !== "null") {
                errMsg = serverMsg;
            } else if (e?.message && e.message !== "undefined" && e.message !== "null") {
                errMsg = e.message;
            }
            if (e?.response?.status === 401) {
                errMsg = "Your session has expired. Please sign in again.";
            }
            setError(errMsg);
        } finally {
            setLoading(false);
        }
    };

    if (count === 0) {
        return (
            <div className="max-w-2xl mx-auto px-6 py-24 text-center">
                <ShoppingBag size={56} className="mx-auto text-chocolate/30 mb-4" />
                <h1 className="font-serif text-4xl text-chocolate font-semibold">Your cart is empty</h1>
                <p className="text-chocolate/70 mt-2">Discover our artisan chocolates and find your perfect box.</p>
                <Link to="/products" className="btn-primary inline-flex mt-6">Start Shopping</Link>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
            <h1 className="font-serif text-center text-3xl md:text-4xl uppercase text-chocolate font-semibold mb-8">Your Cart</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Side: Cart Items */}
                <div className="lg:col-span-2 space-y-4">
                    {groups.map((group) => {
                        const d = getItemDetails(group.representative);
                        const isProduct = d.type === "product";
                        return (
                            <div key={group.key} className="card-luxury p-3 sm:p-2 flex flex-col sm:flex-row items-start sm:items-center gap-4 relative">
                                {/* Left Side Element: Image or Custom Grid Box */}
                                {isProduct ? (
                                    <div className="w-20 h-20 rounded-xl chocolate-gradient flex items-center justify-center overflow-hidden shrink-0">
                                        {d.image ? (
                                            <img src={d.image} alt={d.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="font-serif text-cream/60 text-2xl">C</span>
                                        )}
                                    </div>
                                ) : (
                                    <div className={`rounded-xl chocolate-gradient flex items-center justify-center shrink-0 p-1 ${d.size === 18 ? "w-32 h-20" : "w-20 h-20"}`}>
                                        {(() => {
                                            const grid = GRID_FOR_SIZE[d.size] || { rows: 2, cols: 3 };
                                            const cells = d.arrangement || [];
                                            return (
                                                <div
                                                    className="grid gap-0.5 w-full h-full"
                                                    style={{
                                                        gridTemplateColumns: `repeat(${grid.cols}, 1fr)`,
                                                        gridTemplateRows: `repeat(${grid.rows}, 1fr)`,
                                                    }}
                                                >
                                                    {Array.from({ length: grid.rows * grid.cols }).map((_, idx) => {
                                                        const cell = cells[idx];
                                                        const flavour = cell?.flavour || cell;
                                                        const gradient = FLAVOUR_COLORS[flavour] || "from-cream/30 to-cream/50";
                                                        return (
                                                            <div
                                                                key={idx}
                                                                className={`rounded-sm bg-linear-to-br ${gradient} flex items-center justify-center overflow-hidden ${flavour ? "" : "opacity-30"}`}
                                                            >
                                                                {flavour && (
                                                                    <span className="text-[8px] font-bold text-chocolate-dark leading-none whitespace-nowrap">
                                                                        {FLAVOUR_ABBR[flavour] || flavour.slice(0, 2).toUpperCase()}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            );
                                        })()}
                                    </div>
                                )}

                                {/* Middle Element: Text Details */}
                                <div className="flex-1 min-w-0 w-full pr-16 sm:pr-0">
                                    <p className="font-serif text-chocolate text-base font-semibold truncate">{d.name}</p>
                                    {isProduct ? (
                                        <div className="mt-1 space-y-0.5">
                                            {group.representative.customQuestionAnswer?.length > 0 ? (
                                                group.representative.customQuestionAnswer.map((qa, j) => (
                                                    <p key={j} className="text-xs text-chocolate/70 wrap-break-word">
                                                        <span className="font-semibold">Q:</span> {qa.question} <span className="text-chocolate/40">→</span> <span className="font-semibold">A:</span> {qa.answer || <em className="text-chocolate/40">no answer</em>}
                                                    </p>
                                                ))
                                            ) : (
                                                <p className="text-xs text-chocolate/50 italic">No customisations</p>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="mt-1 space-y-0.5">
                                            <p className="text-xs text-chocolate/70">
                                                <span className="font-semibold">Intensity:</span> {d.intensity || "—"}
                                            </p>
                                            <p className="text-xs text-chocolate/70">
                                                <span className="font-semibold">Stickers:</span> {d.stickers || "—"}
                                            </p>
                                        </div>
                                    )}
                                    {(d.giftPackaging || d.message) && (
                                        <div className="mt-1 space-y-0.5">
                                            {d.giftPackaging && (
                                                <p className="font-serif text-sm text-chocolate font-extrabold mt-3">Premium Gift Packaging <span className="text-xs text-chocolate/60 font-normal">(+ {formatPrice(GIFT_PACKAGING_PRICE)} per box)</span></p>
                                            )}
                                            {d.message && (
                                                <p className="text-xs text-chocolate/70 italic truncate">"{d.message}"</p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Right Side Element: Actions & Total Price */}
                                <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between gap-3 shrink-0 w-full sm:w-auto sm:self-stretch border-t border-chocolate/5 sm:border-t-0 pt-3 sm:pt-0 mt-2 sm:mt-0">
                                    {/* Actions Container - Positioned absolutely at the top right corner on small screens */}
                                    <div className="flex items-center gap-1.5 absolute top-3 right-3 sm:relative sm:top-0 sm:right-0">
                                        <button onClick={() => handleMoveToWishlist(group)} className="w-8 h-8 rounded-full hover:bg-pink-100 text-pink-600 flex items-center justify-center transition">
                                            <Heart size={14} />
                                        </button>
                                        <button onClick={() => handleRemoveGroup(group)} className="w-8 h-8 rounded-full hover:bg-red-100 text-red-600 flex items-center justify-center transition">
                                            <X size={14} />
                                        </button>
                                    </div>
                                    <p className="text-chocolate font-bold text-base whitespace-nowrap order-2 sm:order-0">{formatPrice(d.priceWithGift * group.quantity)}</p>
                                    <div className="flex items-center gap-1 bg-cream-light rounded-lg border border-chocolate/20 px-1 order-1 sm:order-0">
                                        <button onClick={() => handleDecrement(group)} className="w-7 h-7 rounded-md hover:bg-chocolate/10 flex items-center justify-center">
                                            <Minus size={14} />
                                        </button>
                                        <span className="w-8 text-center text-sm font-medium">{group.quantity}</span>
                                        <button onClick={() => handleIncrement(group)} className="w-7 h-7 rounded-md hover:bg-chocolate/10 flex items-center justify-center">
                                            <Plus size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Right Side: Address & Order Checkout Details */}
                <div className="space-y-4">
                    <div className="card-luxury p-4 sm:p-6 luxury-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-serif text-xl text-chocolate font-semibold">Shipping Address</h3>
                            {user && savedAddresses.length > 0 && !showNewAddressForm && (
                                <button onClick={() => { setShowNewAddressForm(true); setSelectedAddressId(""); setSaveAsNew(true); setNewLabel(""); setAddress({ name: "", phone: "", line: "", city: "", state: "", pincode: "" }); }} className="text-xs text-chocolate hover:text-chocolate-dark flex items-center gap-1">
                                    <Plus size={14} /> Add new
                                </button>
                            )}
                        </div>

                        {user && savedAddresses.length > 0 && (
                            <div className="mb-4">
                                <label className="text-[10px] tracking-widest uppercase font-bold text-chocolate/60 mb-2 block">Saved Addresses</label>
                                <Select
                                    value={selectedAddressId}
                                    onChange={(id) => {
                                        setSelectedAddressId(id);
                                        setShowNewAddressForm(false);
                                        setSaveAsNew(false);
                                        if (id) {
                                            const found = savedAddresses.find((a) => a._id === id);
                                            if (found) {
                                                setAddress({
                                                    name: found.name,
                                                    phone: found.phone,
                                                    line: found.line,
                                                    city: found.city,
                                                    state: found.state,
                                                    pincode: found.pincode,
                                                });
                                                setNewLabel(found.label || "");
                                            }
                                        }
                                    }}
                                    options={savedAddresses.map((a) => ({
                                        value: a._id,
                                        label: `${a.label}${a.isDefault ? " (Default)" : ""}`,
                                    }))}
                                />
                            </div>
                        )}

                        {user && (
                            <>
                                {showNewAddressForm && (
                                    <div className="flex items-center justify-between mb-3">
                                        <p className="text-xs text-chocolate/70 flex items-center gap-1">
                                            <MapPin size={12} /> New address
                                        </p>
                                        {savedAddresses.length > 0 && (
                                            <button onClick={() => { setShowNewAddressForm(false); setSaveAsNew(false); }} className="text-xs text-chocolate/60 hover:text-chocolate">
                                                Cancel
                                            </button>
                                        )}
                                    </div>
                                )}
                                {user && savedAddresses.length === 0 && !showNewAddressForm && (
                                    <div className="flex items-center justify-between mb-3">
                                        <p className="text-xs text-chocolate/70 flex items-center gap-1">
                                            <MapPin size={12} /> Add your shipping address
                                        </p>
                                    </div>
                                )}
                                {user && showNewAddressForm && (
                                    <div className="mb-3">
                                        <label className="text-[10px] tracking-widest uppercase font-bold text-chocolate/60 mb-1 block">Label</label>
                                        <input
                                            value={newLabel}
                                            onChange={(e) => setNewLabel(e.target.value)}
                                            placeholder="e.g. Home, Office, Mom's place"
                                            className="input-luxury"
                                        />
                                    </div>
                                )}
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-[10px] tracking-widest uppercase font-bold text-chocolate/60 mb-1 block">Full Name</label>
                                        <input value={address.name} onChange={(e) => { setSelectedAddressId(""); setAddress({ ...address, name: e.target.value }); }} className="input-luxury" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] tracking-widest uppercase font-bold text-chocolate/60 mb-1 block">Phone</label>
                                        <input
                                            value={address.phone}
                                            onChange={(e) => { setSelectedAddressId(""); setAddress({ ...address, phone: e.target.value }); setPhoneError(""); }}
                                            className={`input-luxury ${phoneError ? "border-red-500" : ""}`}
                                        />
                                        {phoneError && <p className="text-[10px] text-red-600 mt-1">{phoneError}</p>}
                                    </div>
                                    <div>
                                        <label className="text-[10px] tracking-widest uppercase font-bold text-chocolate/60 mb-1 block">Address Line</label>
                                        <input value={address.line} onChange={(e) => { setSelectedAddressId(""); setAddress({ ...address, line: e.target.value }); }} className="input-luxury" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="text-[10px] tracking-widest uppercase font-bold text-chocolate/60 mb-1 block">City</label>
                                            <input value={address.city} onChange={(e) => { setSelectedAddressId(""); setAddress({ ...address, city: e.target.value }); }} className="input-luxury" />
                                        </div>
                                        <div>
                                            <label className="text-[10px] tracking-widest uppercase font-bold text-chocolate/60 mb-1 block">State</label>
                                            <input value={address.state} onChange={(e) => { setSelectedAddressId(""); setAddress({ ...address, state: e.target.value }); }} className="input-luxury" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] tracking-widest uppercase font-bold text-chocolate/60 mb-1 block">Pincode</label>
                                        <input value={address.pincode} onChange={(e) => { setSelectedAddressId(""); setAddress({ ...address, pincode: e.target.value }); }} className="input-luxury" />
                                    </div>
                                </div>
                                {user && showNewAddressForm && (
                                    <label className="flex items-center gap-2 mt-3 text-sm text-chocolate cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={saveAsNew}
                                            onChange={(e) => setSaveAsNew(e.target.checked)}
                                            className="w-4 h-4 accent-chocolate"
                                        />
                                        <Save size={14} className="text-chocolate/70" /> Save this address for future use
                                    </label>
                                )}
                            </>
                        )}
                    </div>

                    <div className="card-luxury p-6 luxury-shadow">
                        <h3 className="font-serif text-xl text-chocolate font-semibold mb-4">Summary</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between"><span className="text-chocolate/70">Subtotal</span><span>{formatPrice(subtotal)}</span></div>
                            <div className="flex justify-between"><span className="text-chocolate/70">Shipping</span><span>{shipping === 0 ? "FREE" : formatPrice(shipping)}</span></div>
                        </div>
                        <div className="divider-gold my-3" />
                        <div className="flex justify-between items-center">
                            <span className="font-medium text-chocolate">Total</span>
                            <span className="text-2xl font-serif font-bold text-chocolate">{formatPrice(subtotal + shipping)}</span>
                        </div>
                        {error && <p className="mt-3 text-sm text-red-700 bg-red-100 px-3 py-2 rounded-lg">{error}</p>}
                        <button onClick={placeOrder} disabled={loading} className="btn-primary w-full mt-4 flex items-center justify-center gap-2 disabled:opacity-50">
                            {loading ? "Processing..." : "Proceed to Pay"} <ArrowRight size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
