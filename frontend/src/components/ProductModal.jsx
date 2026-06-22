// @ts-nocheck
import { useState, useEffect } from "react";
import { X, Heart, ShoppingCart, Star } from "lucide-react";
import { formatPrice, GIFT_PACKAGING_PRICE } from "../lib/constants";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import { useNavigate } from "react-router-dom";
import Select from "./Select";

export default function ProductModal({ product, onClose, onAddedToCart, redirectToCart = false }) {
    const { user } = useAuth();
    const { addItem } = useCart();
    const { isInWishlist, addItem: addWish, removeItem: removeWish } = useWishlist();
    const navigate = useNavigate();
    const [answers, setAnswers] = useState({});
    const [giftPackaging, setGiftPackaging] = useState(false);
    const [message, setMessage] = useState("");
    const [reviews, setReviews] = useState([]);
    const [newReview, setNewReview] = useState({ rating: 5, comment: "" });
    const [error, setError] = useState("");
    const inWish = isInWishlist({ itemType: "product", productId: product._id });
    const isCorporateProduct = typeof window !== "undefined" && localStorage.getItem("corporate_intent") === "product:pending";

    useEffect(() => {
        if (product?._id) {
            api.get(`/product/${product._id}/reviews`)
                .then((r) => setReviews(r?.data?.data?.reviews || []))
                .catch(() => setReviews([]));
        }
    }, [product]);

    if (!product) return null;

    const requiredQuestions = (product.customQuestions || []).filter((q) => q.required);
    const allAnswered = requiredQuestions.every((q, i) => {
        const a = answers[`q_${i}`];
        return a && a.trim() !== "";
    });

    const handleAddToCart = () => {
        if (!user) {
            navigate("/login");
            return;
        }
        if (!allAnswered) {
            setError("Please answer all required questions before adding to cart.");
            return;
        }
        setError("");
        const customQuestionAnswer = (product.customQuestions || []).map((q, i) => ({
            question: q.label,
            answer: answers[`q_${i}`] || "",
        }));
        const isCorporate = localStorage.getItem("corporate_intent");
        if (isCorporate === "product:pending") {
            localStorage.setItem("corporate_intent", `product:${product._id}`);
            navigate("/corporate");
        } else {
            addItem({
                itemType: "product",
                productId: product._id,
                quantity: 1,
                customQuestionAnswer,
                giftPackaging,
                message: giftPackaging ? message : null,
            });
            if (typeof onAddedToCart === "function") onAddedToCart();
            onClose();
            if (redirectToCart) navigate("/cart");
        }
    };

    const handleWish = () => {
        if (!user) { navigate("/login"); return; }
        if (inWish) removeWish({ itemType: "product", productId: product._id });
        else addWish({ itemType: "product", productId: product._id });
    };

    const handlePostReview = async (e) => {
        e.preventDefault();
        if (!user) { navigate("/login"); return; }
        try {
            const res = await api.post("/review", {
                productId: product._id,
                rating: newReview.rating,
                comment: newReview.comment,
            });
            const populated = { ...res.data.data.review, user: { fullname: user.fullname } };
            setReviews((r) => [populated, ...r]);
            setNewReview({ rating: 5, comment: "" });
        } catch (err) {
            setError(err?.response?.data?.message || "Failed to post review");
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-chocolate-dark/70 backdrop-blur-sm flex items-center justify-center p-4 fade-in" onClick={onClose}>
            <div className="bg-cream w-full max-w-5xl max-h-[92vh] overflow-y-auto rounded-2xl luxury-shadow-lg" onClick={(e) => e.stopPropagation()}>
                <div className="sticky top-0 z-10 bg-cream/95 backdrop-blur border-b border-chocolate/10 px-6 py-4 flex items-center justify-between">
                    <h2 className="font-serif text-chocolate text-2xl font-bold uppercase">{product.name}</h2>
                    <button onClick={onClose} className="w-9 h-9 rounded-full hover:bg-chocolate/10 flex items-center justify-center text-chocolate">
                        <X size={20} />
                    </button>
                </div>

                <div className="grid md:grid-cols-2 gap-6 p-6">
                    <div>
                        <div className="aspect-square rounded-2xl overflow-hidden chocolate-gradient flex items-center justify-center">
                            {product.images?.[0] ? (
                                <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                                <span className="font-serif text-cream/40 text-9xl">C</span>
                            )}
                        </div>
                    </div>

                    <div>
                        <p className="text-chocolate/80 leading-relaxed">{product.description}</p>
                        <div className="mt-1">
                            <p className="text-3xl font-serif font-bold text-chocolate">
                                {formatPrice(product.price + (giftPackaging ? GIFT_PACKAGING_PRICE : 0))}
                            </p>
                            {giftPackaging && (
                                <p className="text-xs text-chocolate/60 mt-0.5">
                                    {formatPrice(product.price)} + {formatPrice(GIFT_PACKAGING_PRICE)} gift packaging
                                </p>
                            )}
                        </div>

                        <div className="divider-gold my-6" />

                        {product.customQuestions?.length > 0 && (
                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold tracking-widest uppercase text-chocolate/80">Customise Your Box</h3>
                                {product.customQuestions.map((q, i) => (
                                    <div key={i}>
                                        <label className="text-sm text-chocolate font-medium block mb-2">
                                            {q.label} {q.required && <span className="text-red-600">*</span>}
                                        </label>
                                        <Select
                                            value={answers[`q_${i}`] || ""}
                                            onChange={(v) => setAnswers({ ...answers, [`q_${i}`]: v })}
                                            options={(q.options || []).map((opt) => ({ value: opt.optionText, label: opt.optionText }))}
                                            placeholder="Select an option"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}

                        {!isCorporateProduct && (
                            <div className="mt-6">
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-cream-light">
                                    <input
                                        type="checkbox"
                                        id="giftPkg"
                                        checked={giftPackaging}
                                        onChange={(e) => {
                                            const checked = e.target.checked;
                                            setGiftPackaging(checked);
                                            if (!checked) setMessage("");
                                        }}
                                        className="w-4 h-4 accent-chocolate"
                                    />
                                    <label htmlFor="giftPkg" className="text-sm text-chocolate cursor-pointer">
                                        Add premium gift packaging <span className="text-chocolate/60">(+ ₹50)</span>
                                    </label>
                                </div>

                                {giftPackaging && (
                                    <div className="mt-3">
                                        <label className="text-sm text-chocolate font-medium block mb-2">Personalised message</label>
                                        <textarea
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            rows={2}
                                            placeholder="Add a heartfelt message..."
                                            className="input-luxury resize-none"
                                        />
                                    </div>
                                )}
                            </div>
                        )}

                        {error && <p className="mt-3 text-sm text-red-700 bg-red-100 px-3 py-2 rounded-lg">{error}</p>}

                        <div className="mt-5 grid grid-cols-2 gap-3">
                            <button onClick={handleAddToCart} className="btn-primary flex items-center justify-center gap-2">
                                <ShoppingCart size={16} /> {localStorage.getItem("corporate_intent") === "product:pending" ? "Select for Bulk" : "Add to Cart"}
                            </button>
                            <button onClick={handleWish} className="btn-outline flex items-center justify-center gap-2">
                                <Heart size={16} fill={inWish ? "currentColor" : "none"} /> {inWish ? "In Wishlist" : "Wishlist"}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="px-6 pb-6">
                    <div className="divider-gold mb-6" />
                    <h3 className="font-serif text-chocolate text-2xl font-semibold mb-4">Reviews</h3>

                    {user && (
                        <form onSubmit={handlePostReview} className="card-luxury p-4 mb-6">
                            <p className="text-sm font-semibold text-chocolate mb-2">Write a review</p>
                            <div className="flex gap-1 mb-2">
                                {[1,2,3,4,5].map((n) => (
                                    <button key={n} type="button" onClick={() => setNewReview({ ...newReview, rating: n })}>
                                        <Star size={20} className={n <= newReview.rating ? "text-gold" : "text-chocolate/30"} fill={n <= newReview.rating ? "currentColor" : "none"} />
                                    </button>
                                ))}
                            </div>
                            <textarea
                                value={newReview.comment}
                                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                                required
                                rows={2}
                                placeholder="Share your experience..."
                                className="input-luxury resize-none"
                            />
                            <button type="submit" className="btn-primary mt-3">Post Review</button>
                        </form>
                    )}

                    {reviews.length === 0 ? (
                        <p className="text-chocolate/60 text-sm italic">No reviews yet. Be the first to share!</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-stretch">
                            {reviews.map((r) => (
                                <div key={r._id} className="card-luxury p-4 h-full flex flex-col">
                                    <div className="flex items-center justify-between mb-2 gap-2">
                                        <p className="font-semibold text-chocolate text-sm truncate">{r.user?.fullname || "Customer"}</p>
                                        <div className="flex gap-0.5 shrink-0">
                                            {[1,2,3,4,5].map((n) => (
                                                <Star key={n} size={14} className={n <= r.rating ? "text-gold" : "text-chocolate/20"} fill={n <= r.rating ? "currentColor" : "none"} />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-chocolate/80 text-sm leading-relaxed whitespace-pre-wrap break-words overflow-hidden" style={{ display: "-webkit-box", WebkitLineClamp: 6, WebkitBoxOrient: "vertical" }}>{r.comment}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
