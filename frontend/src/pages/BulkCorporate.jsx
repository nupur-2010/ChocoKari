// @ts-nocheck
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, MapPin, Users, Package, Sparkles, ArrowLeft, X } from "lucide-react";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { formatPrice, validatePhone, CORPORATE_SHIPPING_PER_BOX_SINGLE, CORPORATE_SHIPPING_PER_BOX_MULTI } from "../lib/constants";
import ArrangementGrid from "../components/ArrangementGrid";
import { openRazorpayCheckout } from "../lib/razorpay";

export default function BulkCorporate() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { items, clear: clearCart } = useCart();
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedCustom, setSelectedCustom] = useState(null);
    const [quantity, setQuantity] = useState(15);
    const [companyName, setCompanyName] = useState("");
    const [companyLogo, setCompanyLogo] = useState({ name: "", data: "" });
    const [corporateMessage, setCorporateMessage] = useState("");
    const [deliveryMode, setDeliveryMode] = useState("single_address");
    const [address, setAddress] = useState({ name: "", phone: "", line: "", city: "", state: "", pincode: "" });
    const [recipientsFile, setRecipientsFile] = useState(null);
    const [error, setError] = useState("");
    const [phoneError, setPhoneError] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const intent = localStorage.getItem("corporate_intent");
        if (!intent) return;
        if (intent.startsWith("product:")) {
            const productId = intent.split(":")[1];
            if (productId && productId !== "pending") {
                api.get(`/product/${productId}`).then((r) => {
                    if (r?.data?.data?.product) {
                        setSelectedProduct(r.data.data.product);
                        setSelectedCustom(null);
                    }
                }).catch(() => {});
            }
            localStorage.removeItem("corporate_intent");
        } else if (intent.startsWith("custom:")) {
            const customId = intent.split(":")[1];
            if (customId && customId !== "pending") {
                api.get(`/custom/${customId}`).then((r) => {
                    if (r?.data?.data?.custom) {
                        setSelectedCustom(r.data.data.custom);
                        setSelectedProduct(null);
                    }
                }).catch(() => {});
            }
            localStorage.removeItem("corporate_intent");
        }
    }, []);

    const handlePickProduct = () => {
        if (!user) { navigate("/login"); return; }
        localStorage.setItem("corporate_intent", "product:pending");
        navigate("/products");
    };

    const handlePickCustom = () => {
        if (!user) { navigate("/login"); return; }
        localStorage.setItem("corporate_intent", "custom:pending");
        navigate("/custom-builder");
    };

    const handleClear = () => {
        setSelectedProduct(null);
        setSelectedCustom(null);
    };

    const unitPrice = selectedProduct?.price || selectedCustom?.price || 0;
    const itemsTotal = unitPrice * quantity;
    const shippingCost = quantity * (deliveryMode === "single_address" ? CORPORATE_SHIPPING_PER_BOX_SINGLE : CORPORATE_SHIPPING_PER_BOX_MULTI);
    const totalAmount = itemsTotal + shippingCost;
    const hasSelection = selectedProduct || selectedCustom;

    const handleFile = (e) => {
        const f = e.target.files?.[0];
        if (!f) return;
        if (!f.name.endsWith(".csv") && !f.name.endsWith(".xlsx")) {
            setError("Please upload a CSV or XLSX file");
            return;
        }
        setRecipientsFile(f);
        setError("");
    };

    const handleLogoUpload = async (e) => {
        const f = e.target.files?.[0];
        if (!f) return;
        const reader = new FileReader();
        reader.onload = () => setCompanyLogo({ name: f.name, data: reader.result });
        reader.readAsDataURL(f);
    };

    const handlePlace = async () => {
        if (!user) { navigate("/login"); return; }
        setError("");

        if (!hasSelection) {
            setError("Please select a box first");
            return;
        }
        if (!companyName || !companyLogo?.data || !corporateMessage) {
            setError("Please fill in company name, logo and message");
            return;
        }
        if (quantity < 15) {
            setError("Minimum order quantity is 15 boxes");
            return;
        }
        if (deliveryMode === "single_address" && (!address.name || !address.phone || !address.line || !address.city || !address.state || !address.pincode)) {
            setError("Please fill in the complete delivery address");
            return;
        }
        if (deliveryMode === "single_address" && !validatePhone(address.phone)) {
            setPhoneError("Enter a valid 10-digit phone number");
            return;
        }
        if (deliveryMode === "multiple_address" && !recipientsFile) {
            setError("Please upload a recipients list");
            return;
        }

        try {
            setLoading(true);
            const payload = {
                orderType: selectedProduct ? "product" : "customization",
            };
            if (selectedProduct) payload.productId = selectedProduct._id;
            if (selectedCustom) {
                payload.customizationPayload = {
                    box: selectedCustom.box,
                    size: selectedCustom.size,
                    chocolates: selectedCustom.chocolates,
                    preferredIntensity: selectedCustom.preferredIntensity,
                    stickers: selectedCustom.stickers,
                    giftPackaging: selectedCustom.giftPackaging,
                    message: selectedCustom.giftPackaging ? (selectedCustom.message || "") : null,
                    arrangement: selectedCustom.arrangement,
                    price: selectedCustom.price,
                };
            }
            payload.quantity = quantity;
            payload.companyName = companyName;
            payload.companyLogo = companyLogo.data;
            payload.corporateMessage = corporateMessage;
            payload.deliveryMode = deliveryMode;
            if (deliveryMode === "single_address") {
                payload.address = address;
            } else {
                payload.recipientsList = recipientsFile?.name || "list-uploaded";
            }

            const createRes = await api.post("/corporate/payment/create", { totalAmount });
            const { razorpayOrderId, amount, currency, keyId } = createRes.data.data;

            const result = await openRazorpayCheckout({
                keyId,
                razorpayOrderId,
                amount,
                currency,
                customerName: user.fullname,
                customerEmail: user.email,
                description: `ChocoKari Bulk Order - ${quantity} boxes`,
            });

            if (!result.success) {
                if (result.error && result.error !== "Payment cancelled") {
                    setError(result.error);
                }
                return;
            }

            await api.post("/corporate/payment/verify", {
                razorpayOrderId: result.response.razorpay_order_id,
                razorpayPaymentId: result.response.razorpay_payment_id,
                razorpaySignature: result.response.razorpay_signature,
                ...payload,
            });
            await clearCart();
            navigate("/profile?tab=orders");
        } catch (e) {
            console.error("Corporate order error:", e);
            const errorMsg = e?.response?.data?.message || e?.response?.data || e?.message || "Failed to place corporate order";
            setError(typeof errorMsg === "string" ? errorMsg : JSON.stringify(errorMsg));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 md:py-12">
            <div className="text-center mb-8 md:mb-10">
                <p className="text-[10px] sm:text-xs tracking-[0.3em] uppercase text-chocolate/60 mb-2">Corporate & Bulk Gifting</p>
                <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl uppercase text-chocolate font-semibold px-2">Bulk Corporate Orders</h1>
                <p className="text-chocolate/70 mt-2 mx-auto text-xs sm:text-sm max-w-md px-4">Impress your clients and employees with bespoke chocolate gifts.</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
                <div className="lg:col-span-2 space-y-6">
                    {/* Step 1: Choose Box */}
                    <div className="card-luxury p-4 sm:p-5 luxury-shadow">
                        <h3 className="font-serif text-lg sm:text-xl text-chocolate font-semibold mb-4">1. Choose Box</h3>
                        {!hasSelection ? (
                            <div className="grid sm:grid-cols-2 gap-4">
                                <button
                                    onClick={handlePickProduct}
                                    className="p-5 sm:p-6 rounded-2xl border-2 border-chocolate/20 hover:border-chocolate bg-white/60 text-left transition group flex flex-col justify-between h-full"
                                >
                                    <div>
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full chocolate-gradient flex items-center justify-center text-cream mb-3 group-hover:scale-110 transition">
                                            <Package size={18} />
                                        </div>
                                        <p className="font-serif text-chocolate text-base sm:text-lg font-semibold">From All Products</p>
                                        <p className="text-xs text-chocolate/70 mt-1">Pick a ready-made box from our collection</p>
                                    </div>
                                    <p className="text-[11px] text-chocolate/50 mt-4 flex items-center gap-1">
                                        Browse products <ArrowLeft size={12} className="rotate-180" />
                                    </p>
                                </button>
                                <button
                                    onClick={handlePickCustom}
                                    className="p-5 sm:p-6 rounded-2xl border-2 border-chocolate/20 hover:border-chocolate bg-white/60 text-left transition group flex flex-col justify-between h-full"
                                >
                                    <div>
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full chocolate-gradient flex items-center justify-center text-cream mb-3 group-hover:scale-110 transition">
                                            <Sparkles size={18} />
                                        </div>
                                        <p className="font-serif text-chocolate text-base sm:text-lg font-semibold">Customise Your Box</p>
                                        <p className="text-xs text-chocolate/70 mt-1">Build a custom box with your favourite flavours</p>
                                    </div>
                                    <p className="text-[11px] text-chocolate/50 mt-4 flex items-center gap-1">
                                        Open builder <ArrowLeft size={12} className="rotate-180" />
                                    </p>
                                </button>
                            </div>
                        ) : (
                            <div className="rounded-2xl chocolate-gradient text-cream p-4 space-y-3 relative overflow-hidden">
                                <div className="flex flex-row items-start gap-4 sm:gap-6">
                                    {selectedCustom ? (
                                        /* Kept scale matching 100% identically across views */
                                        <div className="shrink-0 my-auto min-w-35 sm:min-w-0">
                                            <div className={`origin-top-left scale-100 bg-cream/10 rounded-lg p-1.5 ${selectedCustom.size === 6 ? "w-32" : selectedCustom.size === 9 ? "w-36" : selectedCustom.size === 12 ? "w-40" : selectedCustom.size === 16 ? "w-44" : "w-56"}`}>
                                                <ArrangementGrid custom={selectedCustom} />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-cream/15 flex items-center justify-center shrink-0 overflow-hidden my-auto">
                                            {selectedProduct?.images?.[0] ? (
                                                <img src={selectedProduct.images[0]} alt={selectedProduct.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-xl sm:text-2xl">🍫</span>
                                            )}
                                        </div>
                                    )}
                                    
                                    <div className="flex-1 min-w-0 pr-6 sm:pr-0 self-center">
                                        {/* Increased mobile base text dimensions via text-xs/text-sm to make info pop out cleanly */}
                                        <p className="text-xs sm:text-[10px] tracking-widest uppercase text-cream/70 font-semibold mb-1 sm:mb-2">
                                            {selectedProduct ? "Product" : "Custom Box"}
                                        </p>
                                        <p className="font-serif text-base sm:text-base md:text-lg font-semibold wrap-break-word leading-tight">
                                            {selectedProduct?.name || `${selectedCustom?.box} Box (${selectedCustom?.size} pcs)`}
                                        </p>
                                        {selectedCustom && (
                                            <p className="text-xs sm:text-[11px] text-cream/80 mt-1 truncate">
                                                <span className="text-cream/60">Intensity:</span> <span className="font-medium">{selectedCustom.preferredIntensity || "—"}</span>
                                            </p>
                                        )}
                                        <p className="text-base sm:text-base font-bold mt-1">
                                            {formatPrice(unitPrice)} <span className="text-xs sm:text-xs text-cream/70 font-normal">/ box</span>
                                        </p>
                                    </div>
                                    
                                    <button
                                        onClick={handleClear}
                                        className="w-7 h-7 rounded-full bg-cream/10 hover:bg-cream/20 flex items-center justify-center text-cream shrink-0 absolute top-3 right-3 sm:relative sm:top-auto sm:right-auto"
                                        title="Change box"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                                {selectedCustom?.message && (
                                    <p className="text-xs sm:text-[10px] text-cream/70 italic border-t border-cream/15 pt-2 wrap-break-word">
                                        Message: "{selectedCustom.message}"
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Step 2: Quantity */}
                    <div className="card-luxury p-4 sm:p-5 luxury-shadow">
                        <h3 className="font-serif text-lg sm:text-xl text-chocolate font-semibold mb-3">2. Quantity</h3>
                        <div>
                            <label className="text-xs sm:text-sm font-medium text-chocolate block mb-1">Number of Boxes (min 15)</label>
                            <input type="number" min="15" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className="input-luxury" />
                        </div>
                    </div>

                    {/* Step 3: Company Details */}
                    <div className="card-luxury p-4 sm:p-5 luxury-shadow">
                        <h3 className="font-serif text-lg sm:text-xl text-chocolate font-semibold mb-3">3. Company Details</h3>
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs sm:text-sm font-medium text-chocolate block mb-1">Company Name</label>
                                <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Your company" className="input-luxury" />
                            </div>
                            <div>
                                <label className="text-xs sm:text-sm font-medium text-chocolate block mb-1">Company Logo</label>
                                {companyLogo.data ? (
                                    <div className="flex items-center gap-3 input-luxury cursor-pointer p-2 sm:p-3">
                                        <img src={companyLogo.data} alt="Company logo" className="h-12 w-12 sm:h-14 sm:w-14 object-contain rounded-md bg-white border border-chocolate/10 shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs sm:text-sm text-chocolate font-medium truncate">{companyLogo.name}</p>
                                            <p className="text-[11px] text-chocolate/60">Logo uploaded</p>
                                        </div>
                                        <label className="text-xs text-chocolate/70 hover:text-chocolate underline cursor-pointer shrink-0">
                                            Change
                                            <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                                        </label>
                                    </div>
                                ) : (
                                    <label className="input-luxury flex items-center gap-2 cursor-pointer py-3">
                                        <Upload size={16} className="shrink-0" />
                                        <span className="text-xs sm:text-sm truncate">Upload logo (PNG, JPG)</span>
                                        <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                                    </label>
                                )}
                            </div>
                            <div>
                                <label className="text-xs sm:text-sm font-medium text-chocolate block mb-1">Corporate Message</label>
                                <textarea value={corporateMessage} onChange={(e) => setCorporateMessage(e.target.value)} rows={2} placeholder="A short message for your clients..." className="input-luxury resize-none" />
                            </div>
                        </div>
                    </div>

                    {/* Step 4: Delivery */}
                    <div className="card-luxury p-4 sm:p-5 luxury-shadow">
                        <h3 className="font-serif text-lg sm:text-xl text-chocolate font-semibold mb-3">4. Delivery</h3>
                        <div className="grid grid-cols-2 gap-3 mb-5">
                            <button onClick={() => setDeliveryMode("single_address")} className={`p-3 sm:p-4 rounded-xl border-2 text-left transition flex flex-col justify-between h-full ${deliveryMode === "single_address" ? "border-chocolate bg-chocolate text-cream" : "border-chocolate/20 hover:border-chocolate/40 bg-white/60"}`}>
                                <MapPin size={18} className="mb-2 shrink-0" />
                                <div>
                                    <p className="font-serif font-semibold text-xs sm:text-sm">Single Address</p>
                                    <p className="text-[10px] sm:text-xs opacity-80 mt-0.5">All boxes to your headquarters</p>
                                </div>
                            </button>
                            <button onClick={() => setDeliveryMode("multiple_address")} className={`p-3 sm:p-4 rounded-xl border-2 text-left transition flex flex-col justify-between h-full ${deliveryMode === "multiple_address" ? "border-chocolate bg-chocolate text-cream" : "border-chocolate/20 hover:border-chocolate/40 bg-white/60"}`}>
                                <Users size={18} className="mb-2 shrink-0" />
                                <div>
                                    <p className="font-serif font-semibold text-xs sm:text-sm">Multiple Recipients</p>
                                    <p className="text-[10px] sm:text-xs opacity-80 mt-0.5">Send boxes directly to clients</p>
                                </div>
                            </button>
                        </div>

                        {deliveryMode === "single_address" ? (
                            <div className="grid sm:grid-cols-2 gap-3">
                                <input value={address.name} onChange={(e) => setAddress({ ...address, name: e.target.value })} placeholder="Name" className="input-luxury" />
                                <div>
                                    <input
                                        value={address.phone}
                                        onChange={(e) => { setAddress({ ...address, phone: e.target.value }); setPhoneError(""); }}
                                        placeholder="Phone"
                                        className={`input-luxury ${phoneError ? "border-red-500" : ""}`}
                                    />
                                    {phoneError && <p className="text-[10px] text-red-600 mt-1">{phoneError}</p>}
                                </div>
                                <input value={address.line} onChange={(e) => setAddress({ ...address, line: e.target.value })} placeholder="Address line" className="input-luxury sm:col-span-2" />
                                <input value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} placeholder="City" className="input-luxury" />
                                <input value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })} placeholder="State" className="input-luxury" />
                                <input value={address.pincode} onChange={(e) => setAddress({ ...address, pincode: e.target.value })} placeholder="Pincode" className="input-luxury sm:col-span-2" />
                            </div>
                        ) : (
                            <div>
                                <p className="text-xs sm:text-sm text-chocolate/80 mb-3">Upload a CSV/XLSX with columns: <b>Name, Address, Phone, Quantity</b></p>
                                <label className="input-luxury flex items-center gap-2 cursor-pointer py-3">
                                    <Upload size={16} className="shrink-0" />
                                    <span className="text-xs sm:text-sm truncate">{recipientsFile ? recipientsFile.name : "Upload recipients file"}</span>
                                    <input type="file" accept=".csv,.xlsx" onChange={handleFile} className="hidden" />
                                </label>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar Order Summary */}
                <div className="lg:sticky lg:top-24 lg:self-start">
                    <div className="chocolate-gradient p-5 sm:p-6 rounded-2xl luxury-shadow-lg text-cream">
                        <h3 className="font-serif text-lg sm:text-xl font-semibold mb-3">Order Summary</h3>
                        {hasSelection ? (
                            <>
                                <div className="space-y-2 text-xs sm:text-sm">
                                    <div className="flex justify-between gap-4"><span className="text-cream/70">Type</span><span className="font-medium capitalize text-right">{selectedProduct ? "Product" : "Custom Box"}</span></div>
                                    <div className="flex justify-between gap-4"><span className="text-cream/70">Unit Price</span><span className="font-medium text-right">{formatPrice(unitPrice)}</span></div>
                                    <div className="flex justify-between gap-4"><span className="text-cream/70">Quantity</span><span className="font-medium text-right">{quantity}</span></div>
                                    <div className="flex justify-between gap-4"><span className="text-cream/70">Items Subtotal</span><span className="font-medium text-right">{formatPrice(itemsTotal)}</span></div>
                                    <div className="flex justify-between gap-4">
                                        <span className="text-cream/70 max-w-50">Shipping ({quantity} boxes × ₹{deliveryMode === "single_address" ? CORPORATE_SHIPPING_PER_BOX_SINGLE : CORPORATE_SHIPPING_PER_BOX_MULTI})</span>
                                        <span className="font-medium text-right">{formatPrice(shippingCost)}</span>
                                    </div>
                                </div>
                                <div className="bg-linear-to-r from-transparent via-gold to-transparent h-px my-4 opacity-50" />
                                <div className="flex justify-between items-center gap-4">
                                    <span className="font-medium text-sm sm:text-base">Total</span>
                                    <span className="text-xl sm:text-2xl font-serif font-bold text-right">{formatPrice(totalAmount)}</span>
                                </div>
                            </>
                        ) : (
                            <p className="text-cream/70 text-xs sm:text-sm py-4">Select a box to see the summary</p>
                        )}
                        {error && <p className="mt-3 text-xs sm:text-sm text-red-200 bg-red-900/30 px-3 py-2 rounded-lg wrap-break-word">{error}</p>}
                        <button
                            onClick={handlePlace}
                            disabled={!hasSelection || loading}
                            className="w-full mt-4 flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-cream text-chocolate font-medium tracking-wide uppercase text-[10px] sm:text-xs hover:bg-cream-light transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Processing..." : "Proceed to Pay"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}