// @ts-nocheck
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, ShoppingCart, X } from "lucide-react";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../lib/constants";
import { api } from "../lib/api";
import ProductModal from "../components/ProductModal";
import ArrangementGrid from "../components/ArrangementGrid";

const CustomWishlistCard = ({ custom, onAdd, onRemove }) => {
    return (
        <div className="card-luxury overflow-hidden flex flex-col h-full">
            <div className="relative aspect-square flex items-center justify-center p-3 chocolate-gradient">
                <div className="w-full h-full flex items-center justify-center">
                    <ArrangementGrid custom={custom} showNames={true} />
                </div>
                <button onClick={onRemove} className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center text-chocolate hover:bg-white luxury-shadow">
                    <X size={14} />
                </button>
            </div>
            <div className="p-3 flex flex-col">
                <p className="font-serif text-chocolate text-md font-semibold leading-snug line-clamp-2">
                    {custom.box || "Classic"} Box ({custom.size || "?"} pcs)
                </p>
                <p className="text-[11px] text-chocolate/60 leading-snug line-clamp-2 mt-0.5">
                    Intensity: {custom.preferredIntensity || "—"} <br/> Sticker: {custom.stickers || "—"}
                </p>
                <div className="flex items-center justify-between mt-2">
                    <p className="text-chocolate font-bold text-base">{formatPrice(custom.price || 0)}</p>
                    <button onClick={onAdd} className="text-[10px] btn-outline px-3 flex items-center gap-1">
                        <ShoppingCart size={15} /> Add
                    </button>
                </div>
            </div>
        </div>
    );
};

const ProductWishlistCard = ({ product, onAdd, onRemove, onClick }) => {
    return (
        <div className="card-luxury overflow-hidden flex flex-col h-full">
            <div onClick={onClick} className="relative aspect-square overflow-hidden bg-linear-to-br from-cream-light to-cream cursor-pointer group">
                {product.images?.[0] ? (
                    <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center chocolate-gradient">
                        <span className="font-serif text-cream/40 text-7xl">C</span>
                    </div>
                )}
                <button
                    onClick={onRemove}
                    className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center text-chocolate hover:bg-white luxury-shadow"
                >
                    <X size={14} />
                </button>
            </div>
            <div className="p-3 flex flex-col">
                <h3 onClick={onClick} className="font-serif text-chocolate text-md font-semibold leading-snug line-clamp-2 cursor-pointer">
                    {product.name}
                </h3>
                <div className="flex items-center justify-between mt-2">
                    <p className="text-chocolate font-bold text-base">{formatPrice(product.price || 0)}</p>
                    <button onClick={onAdd} className="text-[10px] btn-outline px-3 flex items-center gap-1">
                        <ShoppingCart size={15} /> Add
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function Wishlist() {
    const { items, removeItem } = useWishlist();
    const { addItem } = useCart();
    const navigate = useNavigate();
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedWishItem, setSelectedWishItem] = useState(null);
    const [productDetails, setProductDetails] = useState({});

    useEffect(() => {
        items.filter((i) => i.itemType === "product" && i.productId && !i.productId.name).forEach((i) => {
            api.get(`/product/${i.productId._id || i.productId}`).then((r) => {
                if (r?.data?.data?.product) {
                    setProductDetails((prev) => ({ ...prev, [i.productId._id || i.productId]: r.data.data.product }));
                }
            }).catch(() => {});
        });
    }, [items]);

    const getProduct = (i) => {
        const id = i.productId?._id || i.productId;
        if (i.productId?.name) return i.productId;
        if (id && productDetails[id]) return productDetails[id];
        return null;
    };

    if (items.length === 0) {
        return (
            <div className="max-w-2xl mx-auto px-6 py-24 text-center">
                <Heart size={56} className="mx-auto text-chocolate/30 mb-4" />
                <h1 className="font-serif text-4xl text-chocolate font-semibold ">Your wishlist is empty</h1>
                <p className="text-chocolate/70 mt-2">Save your favourite chocolates for later.</p>
                <Link to="/products" className="btn-primary inline-flex mt-6">Discover Chocolates</Link>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
            <h1 className="font-serif text-center text-3xl md:text-4xl uppercase text-chocolate font-semibold mb-8">Your Wishlist</h1>
            {/* Kept identical column configs for md, lg, xl screens while enabling grid-cols-2 on small mobile scales */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {items.map((item, i) => {
                    const isProduct = item.itemType === "product";
                    if (isProduct) {
                        const product = getProduct(item);
                        if (!product) {
                            return (
                                <div key={i} className="card-luxury overflow-hidden flex items-center justify-center min-h-75">
                                    <span className="text-chocolate/50 text-sm">Loading...</span>
                                </div>
                            );
                        }
                        return (
                            <ProductWishlistCard
                                key={i}
                                product={product}
                                onClick={() => { setSelectedWishItem(item); setSelectedProduct(product); }}
                                onRemove={() => removeItem(item)}
                                onAdd={() => { setSelectedWishItem(item); setSelectedProduct(product); }}
                            />
                        );
                    }
                    const custom = item.customizationId;
                    if (!custom) return null;
                    return (
                        <CustomWishlistCard
                            key={i}
                            custom={custom}
                            onRemove={() => removeItem(item)}
                            onAdd={async () => {
                                await addItem({ itemType: "customization", customizationId: custom._id, quantity: 1 });
                                removeItem(item);
                                navigate("/cart");
                            }}
                        />
                    );
                })}
            </div>

            {selectedProduct && (
                <ProductModal
                    product={selectedProduct}
                    onClose={() => { setSelectedProduct(null); setSelectedWishItem(null); }}
                    onAddedToCart={() => { if (selectedWishItem) removeItem(selectedWishItem); }}
                    redirectToCart
                />
            )}
        </div>
    );
}