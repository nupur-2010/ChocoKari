// @ts-nocheck
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../lib/api";
import ProductCard from "../components/ProductCard";
import ProductModal from "../components/ProductModal";

export default function AllProducts() {
    const [params, setParams] = useSearchParams();
    const initial = params.get("collection") || "All";
    const [active, setActive] = useState(initial);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState(null);

    useEffect(() => {
        setLoading(true);
        const query = active === "All" ? "" : `?collection=${active}`;
        api.get(`/product${query}`)
            .then((r) => setProducts(r?.data?.data?.products || []))
            .finally(() => setLoading(false));
    }, [active]);

    useEffect(() => {
        if (active && active !== "All") setParams({ collection: active });
        else setParams({});
    }, [active]);

    return (
        <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="text-center mb-10">
                <p className="text-xs tracking-[0.3em] uppercase text-chocolate/60 mb-3">Discover</p>
                <h1 className="font-serif text-3xl md:text-4xl uppercase text-chocolate font-semibold">All Products</h1>
                <p className="text-chocolate/70 text-sm mt-3 max-w-xl mx-auto">Handcrafted with premium and finest ingredients.</p>
            </div>

            {loading ? (
                <div className="text-center py-20 text-chocolate/60">Loading chocolates...</div>
            ) : products.length === 0 ? (
                <div className="text-center py-20">
                    <p className="text-chocolate/60">No products found in this collection.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                    {products.map((p) => (
                        <ProductCard key={p._id} product={p} onClick={() => setSelectedProduct(p)} />
                    ))}
                </div>
            )}

            {selectedProduct && (
                <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} redirectToCart />
            )}
        </div>
    );
}
