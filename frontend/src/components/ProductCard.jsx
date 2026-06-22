// @ts-nocheck
import { useNavigate } from "react-router-dom";
import { Heart, ShoppingBag } from "lucide-react";
import { formatPrice } from "../lib/constants";
import { useWishlist } from "../context/WishlistContext";

export default function ProductCard({ product, onClick }) {
    const navigate = useNavigate();
    const { isInWishlist, addItem: addWish, removeItem: removeWish } = useWishlist();
    const inWish = isInWishlist({ itemType: "product", productId: product._id });

    const handleWish = (e) => {
        e.stopPropagation();
        if (inWish) {
            removeWish({ itemType: "product", productId: product._id });
        } else {
            addWish({ itemType: "product", productId: product._id });
        }
    };

    const handleAddCart = (e) => {
        e.stopPropagation();
        const intent = localStorage.getItem("corporate_intent");
        if (intent === "product:pending") {
            localStorage.setItem("corporate_intent", `product:${product._id}`);
            navigate("/corporate");
            return;
        }
        onClick?.(e);
    };

    return (
        <div onClick={onClick} className="card-luxury overflow-hidden cursor-pointer group">
            <div className="relative aspect-square overflow-hidden bg-linear-to-br from-cream-light to-cream">
                {product.images?.[0] ? (
                    <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center chocolate-gradient">
                        <span className="font-serif text-cream/40 text-6xl">C</span>
                    </div>
                )}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                    {product.collection && product.collection !== "None" && (
                        <span className="px-3 py-1 text-[10px] tracking-widest uppercase rounded-full bg-chocolate/90 text-cream font-medium">
                            {product.collection}
                        </span>
                    )}
                </div>
                <button
                    onClick={handleWish}
                    className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition ${inWish ? "bg-chocolate text-cream" : "bg-white/80 backdrop-blur text-chocolate hover:bg-white"}`}
                >
                    <Heart size={15} fill={inWish ? "currentColor" : "none"} />
                </button>
                <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition duration-300">
                    <button onClick={handleAddCart} className="w-full py-2.5 rounded-full chocolate-gradient text-cream text-xs tracking-widest uppercase font-medium hover:scale-[1.02] transition flex items-center justify-center gap-2">
                        <ShoppingBag size={14} /> {localStorage.getItem("corporate_intent") === "product:pending" ? "Select for Bulk" : "Add to Cart"}
                    </button>
                </div>
            </div>
            <div className="p-4">
                <h3 className="font-serif text-chocolate text-base font-semibold leading-snug line-clamp-2 min-h-[2.5em]">{product.name}</h3>
                <p className="text-chocolate font-bold text-lg mt-2">{formatPrice(product.price)}</p>
            </div>
        </div>
    );
}
