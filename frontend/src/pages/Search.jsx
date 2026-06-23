// @ts-nocheck
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search as SearchIcon, X } from "lucide-react";
import { api } from "../lib/api";
import ProductCard from "../components/ProductCard";
import ProductModal from "../components/ProductModal";

export default function Search() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [params] = useSearchParams();
    const initialQ = params.get("q") || "";

    useEffect(() => {
        if (initialQ) setQuery(initialQ);
    }, [initialQ]);

    useEffect(() => {
        const timer = setTimeout(async () => {
            setLoading(true);
            try {
                const res = await api.get("/product");
                const products = res?.data?.data?.products || [];
                if (!query.trim()) {
                    setResults(products);
                } else {
                    const q = query.toLowerCase();
                    setResults(products.filter((p) =>
                        p.name?.toLowerCase().includes(q)
                    ));
                }
            } finally {
                setLoading(false);
            }
        }, 250);
        return () => clearTimeout(timer);
    }, [query]);

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-12">
            <div className="relative max-w-2xl mx-auto mb-8 md:mb-10">
                <SearchIcon size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-chocolate/50" />
                <input
                    autoFocus
                    value={query}
                    onChange={(e) => setQuery(e.target.value.trim())}
                    placeholder="Search chocolates, flavours..."
                    className="w-full pl-14 pr-14 py-2.5 rounded-full bg-white/60 border border-chocolate/15 focus:border-chocolate outline-none text-chocolate text-md transition-colors"
                />
                {query && (
                    <button onClick={() => setQuery("")} className="absolute right-5 top-1/2 -translate-y-1/2 text-chocolate/50 hover:text-chocolate transition-colors">
                        <X size={20} />
                    </button>
                )}
            </div>

            <p className="text-center text-chocolate/70 text-sm mb-6">
                {loading ? "Searching..." : `${results.length} result${results.length !== 1 ? "s" : ""}`}
            </p>

            {results.length === 0 && !loading ? (
                <div className="text-center py-16">
                    <p className="text-chocolate/60">No chocolates match your search.</p>
                </div>
            ) : (
                /* Adjusted to strictly maintain 2 columns on mobile devices and scale responsively */
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
                    {results.map((p) => (
                        <ProductCard key={p._id} product={p} onClick={() => setSelectedProduct(p)} />
                    ))}
                </div>
            )}

            {selectedProduct && <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />}
        </div>
    );
}