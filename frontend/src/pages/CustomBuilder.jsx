// @ts-nocheck
import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Minus, X, Heart, ShoppingCart, GripVertical } from "lucide-react";
import { COLLECTIONS, BOX_SIZES, FLAVOURS, STICKERS, INTENSITIES, GIFT_PACKAGING_PRICE, GRID_FOR_SIZE, computeCustomPrice, formatPrice, MIN_FLAVOUR_QTY, FLAVOUR_COLORS } from "../lib/constants";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { api } from "../lib/api";
import Select from "../components/Select";

export default function CustomBuilder() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { addItem } = useCart();
    const { addItem: addWish } = useWishlist();
    const isCorporateCustom = typeof window !== "undefined" && localStorage.getItem("corporate_intent") === "custom:pending";
    const [step, setStep] = useState(1);
    const [box, setBox] = useState("");
    const [size, setSize] = useState(null);
    const [flavours, setFlavours] = useState([{ flavour: "", quantity: 0 }]);
    const [intensity, setIntensity] = useState("");
    const [sticker, setSticker] = useState("");
    const [giftPackaging, setGiftPackaging] = useState(false);
    const [message, setMessage] = useState("");
    const [arrangement, setArrangement] = useState([]);
    const [draggedIdx, setDraggedIdx] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setArrangement(size ? new Array(size).fill("") : []);
    }, [size]);

    const totalSelected = flavours.reduce((s, f) => s + (Number(f.quantity) > 0 ? Number(f.quantity) : 0), 0);
    const remaining = size - totalSelected;
    const price = useMemo(
        () => computeCustomPrice({ box, size, preferredIntensity: intensity, giftPackaging, flavours }),
        [box, size, intensity, giftPackaging, JSON.stringify(flavours)]
    );

    const addFlavourRow = () => {
        if (flavours.length >= 12) return;
        setFlavours([...flavours, { flavour: "", quantity: size ? MIN_FLAVOUR_QTY(size) : 0 }]);
    };

    const updateFlavour = (i, field, value) => {
        const next = [...flavours];
        next[i] = { ...next[i], [field]: value };
        setFlavours(next);
    };

    const removeFlavour = (i) => setFlavours(flavours.filter((_, idx) => idx !== i));

    const validFlavours = flavours.filter((f) => f.flavour && Number(f.quantity) >= MIN_FLAVOUR_QTY(size));
    const isValid = box && size && intensity && sticker && validFlavours.length > 0 && totalSelected === size;

    const expandArrangement = () => {
        const expanded = [];
        validFlavours.forEach((f) => {
            for (let i = 0; i < f.quantity; i++) expanded.push(f.flavour);
        });
        setArrangement(expanded);
    };

    useEffect(() => { expandArrangement(); }, [JSON.stringify(validFlavours)]);

    const handleDragStart = (idx) => setDraggedIdx(idx);
    const handleDragOver = (e) => e.preventDefault();
    const handleDrop = (targetIdx) => {
        if (draggedIdx === null || draggedIdx === targetIdx) return;
        const next = [...arrangement];
        const moved = next[draggedIdx];
        next[draggedIdx] = next[targetIdx];
        next[targetIdx] = moved;
        setArrangement(next);
        setDraggedIdx(null);
    };

    const saveCustomization = async () => {
        if (!user) { navigate("/login"); return null; }
        if (!box || !size || !intensity || !sticker) {
            setError("Please complete all selections before adding to cart.");
            return null;
        }
        try {
            setLoading(true);
            const mappedIntensity = intensity === "Mild & Sweet" || intensity === "Balanced Dark" ? "Balanced Dark" : "Deep & Bold";
            const payload = {
                box, size,
                chocolates: validFlavours[0] || { flavour: "Hazelnut", quantity: size },
                preferredIntensity: mappedIntensity,
                stickers: sticker,
                giftPackaging,
                message: giftPackaging ? message : null,
                arrangement: arrangement.map((f) => ({ flavour: f })),
                price,
            };
            const res = await api.post("/custom", payload);
            return res.data.data.custom;
        } catch (e) {
            setError(e?.response?.data?.message || "Failed to save customization");
            return null;
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = async () => {
        setError("");
        const custom = await saveCustomization();
        if (!custom) return;
        const isCorporate = localStorage.getItem("corporate_intent");
        if (isCorporate === "custom:pending") {
            localStorage.setItem("corporate_intent", `custom:${custom._id}`);
            navigate("/corporate");
        } else {
            await addItem({
                itemType: "customization",
                customizationId: custom._id,
                customSnapshot: {
                    box: custom.box,
                    size: custom.size,
                    preferredIntensity: custom.preferredIntensity,
                    stickers: custom.stickers,
                    giftPackaging: custom.giftPackaging,
                    message: custom.message,
                    arrangement: custom.arrangement,
                },
                quantity: 1,
            });
            navigate("/cart");
        }
    };

    const handleAddToWishlist = async () => {
        setError("");
        const custom = await saveCustomization();
        if (!custom) return;
        await addWish({ itemType: "customization", customizationId: custom._id });
        navigate("/wishlist");
    };

    const grid = GRID_FOR_SIZE[size];
    
    // Grid typography dynamic scaling configuration
    const isSize18 = size === 18;
    const isSize12 = size === 12;
    const isLargeText = size === 6 || size === 9;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12">
            <div className="text-center mb-8 md:mb-10">
                <p className="text-[10px] sm:text-xs tracking-[0.3em] uppercase text-chocolate/60 mb-2">Your Vision, Our Craft</p>
                <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl uppercase text-chocolate font-semibold">Custom Chocolate Builder</h1>
                <p className="text-chocolate/70 mt-2 mx-auto text-xs sm:text-sm max-w-2xl px-2">Design a box as unique as you. Pick your favourite flavours, arrange them, and we'll craft it fresh.</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-5 md:gap-6">
                <div className="lg:col-span-2 space-y-5 md:space-y-6">
                    {/* Box & Size */}
                    <div className="card-luxury p-4 sm:p-5 luxury-shadow">
                        <h3 className="font-serif text-lg sm:text-xl text-chocolate font-semibold mb-3">1. Choose Your Box</h3>
                        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4">
                            {COLLECTIONS.map((c) => (
                                <button
                                    key={c}
                                    onClick={() => setBox(c)}
                                    className={`p-3 sm:p-4 rounded-xl border-2 transition text-center ${
                                        box === c ? "border-chocolate bg-chocolate text-cream" : "border-chocolate/20 hover:border-chocolate/40 bg-white/60"
                                    }`}
                                >
                                    <p className="font-serif font-semibold text-xs sm:text-sm md:text-base">{c}</p>
                                </button>
                            ))}
                        </div>
                        <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                            {BOX_SIZES.map((s) => (
                                <button
                                    key={s}
                                    onClick={() => { setSize(s); setFlavours([{ flavour: "", quantity: MIN_FLAVOUR_QTY(s) }]); }}
                                    className={`py-2 sm:py-3 rounded-lg border-2 text-xs sm:text-sm font-medium transition ${
                                        size === s ? "border-chocolate bg-chocolate text-cream" : "border-chocolate/20 hover:border-chocolate/40 bg-white/60"
                                    }`}
                                >
                                    {s} pcs
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Flavours */}
                    <div className="card-luxury p-4 sm:p-5 luxury-shadow">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-4">
                            <h3 className="font-serif text-lg sm:text-xl text-chocolate font-semibold">2. Pick Your Flavours</h3>
                            {size && (
                                <span className={`text-xs sm:text-sm font-medium ${remaining === 0 ? "text-emerald-700" : "text-chocolate/70"}`}>
                                    {remaining > 0 ? `${remaining} more to select` : `All ${size} chocolates selected ✓`}
                                </span>
                            )}
                        </div>
                        <div className="space-y-3">
                            {flavours.map((f, i) => (
                                <div key={i} className="flex gap-1.5 sm:gap-2">
                                    <Select
                                        value={f.flavour}
                                        onChange={(v) => updateFlavour(i, "flavour", v)}
                                        options={FLAVOURS.filter((fl) => fl === f.flavour || !flavours.some((row) => row.flavour === fl)).map((fl) => ({ value: fl, label: fl }))}
                                        placeholder="Select flavour"
                                        className="flex-1 min-w-0"
                                    />
                                    <div className="flex items-center gap-0.5 sm:gap-1 bg-white/40 rounded-lg border border-chocolate/20 px-0.5 sm:px-1 shrink-0">
                                        <button
                                            onClick={() => updateFlavour(i, "quantity", Math.max(size ? MIN_FLAVOUR_QTY(size) : 0, Number(f.quantity) - 1))}
                                            disabled={size && Number(f.quantity) <= MIN_FLAVOUR_QTY(size)}
                                            className="w-6 h-6 sm:w-7 sm:h-7 rounded-md hover:bg-chocolate/10 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                                        >
                                            <Minus size={12} className="sm:w-3.5 sm:h-3.5" />
                                        </button>
                                        <span className="w-6 sm:w-8 text-center text-xs sm:text-sm font-medium">{f.quantity}</span>
                                        <button
                                            onClick={() => updateFlavour(i, "quantity", size ? Math.min(remaining + Number(f.quantity), Number(f.quantity) + 1) : Number(f.quantity) + 1)}
                                            disabled={size && remaining <= 0}
                                            className="w-6 h-6 sm:w-7 sm:h-7 rounded-md hover:bg-chocolate/10 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                                        >
                                            <Plus size={12} className="sm:w-3.5 sm:h-3.5" />
                                        </button>
                                    </div>
                                    {flavours.length > 1 && (
                                        <button onClick={() => removeFlavour(i)} className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg hover:bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                                            <X size={14} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                        {(!size || (validFlavours.length > 0 && remaining >= MIN_FLAVOUR_QTY(size))) && (
                            <button onClick={addFlavourRow} className="mt-3 text-xs sm:text-sm text-chocolate hover:text-chocolate-dark font-medium flex items-center gap-1">
                                <Plus size={14} /> Add another flavour
                            </button>
                        )}
                    </div>

                    {/* Intensity */}
                    <div className="card-luxury p-4 sm:p-5 luxury-shadow">
                        <h3 className="font-serif text-lg sm:text-xl text-chocolate font-semibold mb-3">3. Preferred Intensity</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {INTENSITIES.map((i) => (
                                <button
                                    key={i}
                                    onClick={() => setIntensity(i)}
                                    className={`py-2 sm:py-2.5 rounded-lg border-2 text-[11px] sm:text-xs font-medium transition ${
                                        intensity === i ? "border-chocolate bg-chocolate text-cream" : "border-chocolate/20 hover:border-chocolate/40 bg-white/60"
                                    }`}
                                >
                                    {i}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Occasion */}
                    <div className="card-luxury p-4 sm:p-5 luxury-shadow">
                        <h3 className="font-serif text-lg sm:text-xl text-chocolate font-semibold mb-3">4. Stickers Theme</h3>
                        <Select
                            value={sticker}
                            onChange={setSticker}
                            options={STICKERS.map((s) => ({ value: s, label: s }))}
                            placeholder="Choose sticker theme"
                        />
                    </div>

                    {/* Gift Packaging */}
                    {!isCorporateCustom && (
                        <div className="card-luxury p-4 sm:p-5 luxury-shadow">
                            <h3 className="font-serif text-lg sm:text-xl text-chocolate font-semibold mb-3">5. Personal Touch</h3>
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-cream-light mb-3">
                                <input
                                    type="checkbox"
                                    id="gift"
                                    checked={giftPackaging}
                                    onChange={(e) => {
                                        const checked = e.target.checked;
                                        setGiftPackaging(checked);
                                        if (!checked) setMessage("");
                                    }}
                                    className="w-4 h-4 accent-chocolate shrink-0"
                                />
                                <label htmlFor="gift" className="text-xs sm:text-sm text-chocolate cursor-pointer flex-1 select-none">
                                    Premium gift packaging
                                </label>
                                <span className="text-xs sm:text-sm font-semibold text-chocolate shrink-0">+ {formatPrice(GIFT_PACKAGING_PRICE)}</span>
                            </div>
                            {giftPackaging && (
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    rows={2}
                                    placeholder="Personalised message (printed on card)"
                                    className="input-luxury text-xs sm:text-sm resize-none"
                                />
                            )}
                        </div>
                    )}
                </div>

                {/* Preview & Summary Side Column */}
                <div className="lg:sticky lg:top-20 lg:self-start space-y-4">
                    <div className="chocolate-gradient p-4 sm:p-5 rounded-2xl luxury-shadow-lg text-cream">
                        <h3 className="font-serif text-base sm:text-lg font-semibold mb-3">Your Arrangement</h3>
                        {!size ? (
                            <div className="bg-cream/20 border-2 border-dashed border-cream/30 rounded-xl p-6 sm:p-8 text-center">
                                <p className="text-cream/70 text-xs sm:text-sm">Select a box size to see your arrangement</p>
                            </div>
                        ) : (
                            <div className="w-full overflow-x-auto pb-2 scrollbar-thin">
                                <div className="min-w-[320px] max-w-sm mx-auto bg-cream/20 p-3 rounded-xl border border-cream/10">
                                    <div
                                        className="grid gap-1.5 justify-center"
                                        style={{ gridTemplateColumns: `repeat(${grid.cols}, minmax(0, 1fr))` }}
                                    >
                                        {arrangement.map((flav, i) => (
                                            <div
                                                key={i}
                                                draggable={!!flav}
                                                onDragStart={() => handleDragStart(i)}
                                                onDragOver={handleDragOver}
                                                onDrop={() => handleDrop(i)}
                                                className={`aspect-square rounded-lg flex items-center justify-center text-center cursor-move transition shadow-sm bg-linear-to-br ${
                                                    isSize18 ? "p-0.2" : "p-1"
                                                } ${
                                                    flav ? FLAVOUR_COLORS[flav] || "from-amber-200 to-amber-400" : "from-cream/30 to-cream/50"
                                                }`}
                                                title={flav}
                                            >
                                                {flav ? (
                                                    <div className="w-full h-full flex items-center justify-center overflow-hidden px-0.5">
                                                        <p className={`text-chocolate-dark font-bold leading-tight tracking-normal whitespace-normal wrap-break-word line-clamp-2 ${
                                                            isSize18 ? "text-[9px]" : isSize12 ? "text-[10px]" : isLargeText ? "text-sm sm:text-base" : "text-xs"
                                                        }`}>
                                                            {flav}
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <span className={`text-chocolate/50 font-bold ${
                                                        isSize18 ? "text-[9px]" : isSize12 ? "text-[10px]" : isLargeText ? "text-sm sm:text-base" : "text-xs"
                                                    }`}>{i + 1}</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                        <p className="text-[10px] sm:text-xs text-cream/70 mt-3 flex items-center gap-1 select-none">
                            <GripVertical size={12} /> Drag chocolates to rearrange
                        </p>
                    </div>

                    <div className="chocolate-gradient p-4 sm:p-5 rounded-2xl luxury-shadow-lg text-cream">
                        <h3 className="font-serif text-base sm:text-lg font-semibold mb-3">Summary</h3>
                        <div className="space-y-2 text-xs sm:text-sm">
                            <div className="flex justify-between gap-2"><span className="text-cream/70">Box</span><span className="font-medium text-right">{box && size ? `${box} - ${size} pcs` : "—"}</span></div>
                            <div className="flex justify-between gap-2"><span className="text-cream/70">Intensity</span><span className="font-medium text-right">{intensity || "—"}</span></div>
                            <div className="flex justify-between gap-2"><span className="text-cream/70">Sticker</span><span className="font-medium text-right">{sticker || "—"}</span></div>
                            {giftPackaging && <div className="flex justify-between gap-2"><span className="text-cream/70">Gift Packaging</span><span className="font-medium text-right">{formatPrice(GIFT_PACKAGING_PRICE)}</span></div>}
                        </div>
                        <div className="bg-linear-to-r from-transparent via-gold to-transparent h-px my-3 sm:my-4 opacity-50" />
                        <div className="flex justify-between items-center">
                            <span className="text-xs sm:text-sm font-medium">Total</span>
                            <span className="text-xl sm:text-2xl font-serif font-bold">{formatPrice(price)}</span>
                        </div>
                        {error && <p className="mt-3 text-xs sm:text-sm text-red-200 bg-red-900/30 px-3 py-2 rounded-lg">{error}</p>}
                        <button
                            onClick={handleAddToCart}
                            disabled={!isValid || loading}
                            className="w-full mt-4 flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-full bg-cream text-chocolate font-medium tracking-wide uppercase text-[10px] sm:text-xs hover:bg-cream-light transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ShoppingCart size={14} className="sm:w-4 sm:h-4" /> {loading ? "Saving..." : (localStorage.getItem("corporate_intent") === "custom:pending" ? "Select for Bulk" : "Add to Cart")}
                        </button>
                        <button
                            onClick={handleAddToWishlist}
                            disabled={!isValid || loading}
                            className="w-full mt-2.5 sm:mt-3 flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-full border border-cream text-cream font-medium tracking-wide uppercase text-[10px] sm:text-xs hover:bg-cream hover:text-chocolate transition disabled:opacity-50"
                        >
                            <Heart size={14} className="sm:w-4 sm:h-4" /> Add to Wishlist
                        </button>
                        {!isValid && (
                            <p className="text-[10px] sm:text-xs text-cream/70 mt-3 text-center px-1">
                                {!box ? "Select a box collection" :
                                 !size ? "Select a box size" :
                                 !intensity ? "Select an intensity" :
                                 !sticker ? "Select an occasion" :
                                 totalSelected === 0 ? "Pick your flavours" :
                                 `Select ${remaining} more chocolate${remaining > 1 ? "s" : ""}`}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}