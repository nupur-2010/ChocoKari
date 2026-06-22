import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Star, Award, Leaf, Truck, Crown } from "lucide-react";
import { COLLECTIONS } from "../lib/constants";

const COLLECTION_META = {
    Classic: { tagline: "Timeless Favourites", image: "classic.jpeg"},
    Signature: { tagline: "Chef's Selection", image: "signature.jpeg" },
    Royale: { tagline: "Luxury Redefined", image: "royale.jpeg"},
};

const FloatingCocoa = () => (
    <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
        {[...Array(8)].map((_, i) => (
            <div
                key={i}
                className="absolute w-1 h-1 bg-gold rounded-full"
                style={{
                    top: `${(i * 13) % 100}%`,
                    left: `${(i * 23) % 100}%`,
                    animation: `float ${4 + (i % 3)}s ease-in-out infinite`,
                    animationDelay: `${i * 0.4}s`,
                }}
            />
        ))}
    </div>
);

export default function Home() {
    return (
        <div>
            {/* Hero */}
            <section className="relative chocolate-gradient text-cream overflow-hidden">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, rgba(184, 137, 58, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(184, 137, 58, 0.2) 0%, transparent 50%)" }} />
                <FloatingCocoa />
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-10 md:pb-20">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 items-center">
                        {/* Image */}
                        <div className="flex justify-center md:justify-end order-1 md:order-2 w-full">
                            <img
                                src="/hero.png"
                                alt="ChocoKari Artisan Chocolates"
                                onError={(e) => { e.currentTarget.style.display = "none"; }}
                                className="w-full max-w-xs sm:max-w-md h-auto object-cover rounded-2xl luxury-shadow-lg"
                            />
                        </div>

                        {/* Content */}
                        <div className="text-center md:text-left order-2 md:order-1 md:translate-x-8">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/15 border border-gold/30 mb-4 md:mb-5">
                                <span className="text-[9px] sm:text-[10px] font-semibold tracking-[0.3em] uppercase text-gold-light">Handcrafted with Love</span>
                            </div>
                            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold leading-tight md:leading-none tracking-[-0.02em]">
                                Every Bite,<br />
                                <span className="text-gradient-gold font-medium">A Story to Savor</span>
                            </h1>
                            <p className="mt-4 md:mt-6 text-cream/85 text-xs sm:text-sm leading-[1.6] font-normal tracking-wide max-w-xl mx-auto md:mx-0">
                                Born in a home kitchen, perfected in every batch. Each piece is tempered by hand, blended with the world's finest inclusions, and finished to a silky shine — small-batch chocolate made for life's sweetest moments.
                            </p>
                            <div className="mt-6 md:mt-8 flex flex-col sm:flex-row items-center justify-center md:justify-start gap-3 sm:gap-4 w-full sm:w-auto">
                                <Link to="/products" className="btn-gold flex items-center justify-center gap-2 w-full sm:w-auto text-center">
                                    Shop Now <ArrowRight size={16} />
                                </Link>
                                <Link to="/matchmaker" className="text-cream hover:bg-white/10 backdrop-blur-md bg-white/5 border border-white/20 text-xs sm:text-sm tracking-widest uppercase font-medium flex items-center justify-center gap-2 px-6 py-3 rounded-full transition w-full sm:w-auto text-center">
                                    Take the Quiz
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* USPs - 2 in a row on mobile with added top spacing */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 -mt-4 sm:-mt-8 md:-mt-8 pt-6 sm:pt-0 relative z-10">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                        { icon: Leaf, label: "100% Vegetarian" },
                        { icon: Crown, label: "Premium Ingredients" },
                        { icon: Truck, label: "Pan-India Delivery" },
                        { icon: Award, label: "Handcrafted Daily" },
                    ].map((item, i) => (
                        <div key={i} className="card-luxury p-3 sm:p-4 flex flex-col sm:flex-row items-center text-center sm:text-left gap-2 sm:gap-3 luxury-shadow bg-white">
                            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full chocolate-gradient flex items-center justify-center text-cream shrink-0">
                                <item.icon size={15} />
                            </div>
                            <span className="text-xs sm:text-sm font-medium text-chocolate">{item.label}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* Featured Collections */}
            <section className="max-w-5xl mx-auto px-4 sm:px-6 mt-16 md:mt-20">
    <div className="text-center mb-6 md:mb-8">
        <p className="text-[10px] sm:text-xs tracking-[0.3em] uppercase text-chocolate/60 mb-1 sm:mb-2">Curated for You</p>
        <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-chocolate font-semibold">Featured Collections</h2>
        <div className="divider-gold w-20 sm:w-24 mx-auto mt-2 sm:mt-3" />
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {COLLECTIONS.map((col) => (
            <Link
                key={col}
                to={`/products?collection=${col}`}
                className="group relative aspect-4/3 sm:aspect-5/4 rounded-xl overflow-hidden luxury-shadow block bg-neutral-100"
            >
                {/* Clear, Natural Background Image */}
                {COLLECTION_META[col]?.image && (
                    <img 
                        src={COLLECTION_META[col].image} 
                        alt={`${col} Collection`} 
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-500 ease-out"
                    />
                )}

                {/* Subtle dark gradient overlay at the bottom ONLY for typography contrast */}
                <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />
                
                {/* Collection Metadata Content */}
                <div className="absolute inset-0 p-4 sm:p-5 flex flex-col justify-end text-cream z-10">
                    <p className="text-[9px] sm:text-[10px] tracking-[0.3em] uppercase text-gold-light mb-1">
                        {COLLECTION_META[col]?.tagline}
                    </p>
                    <h3 className="font-serif text-xl sm:text-2xl font-semibold mb-1 shadow-sm">
                        {col}
                    </h3>
                    <span className="flex items-center gap-1.5 text-xs font-medium text-gold-light">
                        Explore <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform duration-200" />
                    </span>
                </div>
            </Link>
        ))}
    </div>
</section>
            {/* Custom Builder CTA */}
            <section className="max-w-6xl mx-auto px-4 sm:px-6 mt-16 md:mt-20">
                <div className="relative rounded-2xl overflow-hidden chocolate-gradient p-6 sm:p-8 text-cream luxury-shadow-lg">
                    <div className="absolute -right-20 -top-20 w-60 h-60 rounded-full bg-gold/20 blur-3xl" />
                    <div className="relative grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-center">
                        <div className="text-center md:text-left">
                            <p className="text-[10px] sm:text-[11px] tracking-[0.3em] uppercase text-gold-light mb-1 sm:mb-2">Your Vision, Our Craft</p>
                            <h2 className="font-serif text-xl sm:text-2xl md:text-3xl font-semibold leading-tight">Design Your Dream Box</h2>
                            <p className="text-cream/80 mt-2 sm:mt-3 text-xs sm:text-sm leading-relaxed max-w-md mx-auto md:mx-0">Choose your box, pick your favourite flavours, and arrange them exactly how you like. Every box tells your story.</p>
                            <Link to="/custom-builder" className="btn-gold inline-flex items-center justify-center gap-2 mt-4 sm:mt-5 text-xs w-full sm:w-auto">
                                Start Building <ArrowRight size={14} />
                            </Link>
                        </div>
                        <div className="flex justify-center md:justify-end w-full">
                            <img
                                src="/custom.png"
                                alt="Custom Chocolate Box"
                                onError={(e) => { e.currentTarget.style.display = "none"; }}
                                className="w-full max-w-xs sm:max-w-md h-auto object-cover rounded-xl luxury-shadow-lg"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-16 md:mt-20">
                <div className="text-center mb-6 md:mb-8">
                    <p className="text-[10px] sm:text-xs tracking-[0.3em] uppercase text-chocolate/60 mb-2">Loved by Many</p>
                    <h2 className="font-serif text-3xl sm:text-4xl text-chocolate font-semibold">What They Say</h2>
                    <div className="divider-gold w-20 sm:w-24 mx-auto mt-2 sm:mt-3" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
                    {[
                        { name: "Ananya S.", text: "The Royale collection is simply divine. Each piece is a masterpiece - rich, smooth, and absolutely unforgettable.", rating: 5 },
                        { name: "Rohan M.", text: "Used ChocoKari for our wedding favours. The custom builder is so easy, and the chocolates were the talk of the evening!", rating: 5 },
                        { name: "Priya K.", text: "Their Hazelnut Chocolate is the best I've ever had - better than the Swiss brands I've tried. Truly world-class.", rating: 5 },
                    ].map((t, i) => (
                        <div key={i} className="card-luxury p-5 sm:p-6 bg-white rounded-xl">
                            <div className="flex gap-1 mb-2 sm:mb-3">
                                {[...Array(t.rating)].map((_, j) => <Star key={j} size={14} className="text-gold" fill="currentColor" />)}
                            </div>
                            <p className="text-chocolate/80 italic text-xs sm:text-sm leading-relaxed">"{t.text}"</p>
                            <p className="mt-3 sm:mt-4 text-chocolate font-semibold text-xs sm:text-sm">— {t.name}</p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}