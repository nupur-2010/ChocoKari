import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowRight, ArrowLeft, RotateCcw, Sun, Cookie, Flame, Zap,
    IceCream, Nut, Flower2, Candy, Sofa, Gift, Cake, Heart,
    HandHeart, Users, TreePine, PartyPopper, Gem, Crown, Check
} from "lucide-react";
import ProductCard from "../components/ProductCard";
import ProductModal from "../components/ProductModal";
import { api } from "../lib/api";

const QUESTIONS = [
    {
        id: "intensity",
        title: "How bold do you like your chocolate?",
        sub: "Select one or more intensities (or skip)",
        multi: true,
        options: [
            { value: "Mild & Sweet", label: "Mild & Sweet", desc: "30-45% cocoa - creamy, gentle, easy on the palate", icon: Sun },
            { value: "Balanced Dark", label: "Balanced Dark", desc: "50-70% cocoa - rich, smooth, the perfect middle ground", icon: Cookie },
            { value: "Deep & Bold", label: "Deep & Bold", desc: "70-85% cocoa - intense, complex, for true cocoa lovers", icon: Flame },
            { value: "Ultra Intense", label: "Ultra Intense", desc: "90-100% cocoa - bold, bitter-sweet, for the adventurous", icon: Zap },
        ],
    },
    {
        id: "flavour",
        title: "What flavour profile speaks to you?",
        sub: "Select one or more flavours you love (or skip)",
        multi: true,
        options: [
            { value: "Sweet & Creamy", label: "Sweet & Creamy", desc: "Biscoff, Kunafa, Fresh Mint, Bounty Coconut, Oreo Delight - comforting and indulgent", icon: IceCream },
            { value: "Nutty & Crunchy", label: "Nutty & Crunchy", desc: "Hazelnut, Royal Rose, Roasted Almond, Oreo Delight, Crackle - texture and warmth", icon: Nut },
            { value: "Fruity & Refreshing", label: "Fruity & Refreshing", desc: "Cranberry, Paan, Fresh Mint, Bounty Coconut - light and aromatic", icon: Flower2 },
            { value: "Intensely Rich & Chocolately", label: "Intensely Rich & Chocolately", desc: "Intense Dark, Roasted Almond, Crackle - the connoisseur's pick", icon: Candy },
        ],
    },
    {
        id: "occasion",
        title: "What's the occasion?",
        sub: "Select one or more occasions (or skip)",
        multi: true,
        options: [
            { value: "Personal Use", label: "Personal Use", desc: "Just for me - self indulgence", icon: Sofa },
            { value: "Gifting", label: "Gifting", desc: "A thoughtful present for someone special", icon: Gift },
            { value: "Birthday", label: "Birthday", desc: "Celebrate the day they were born", icon: Cake },
            { value: "Anniversary", label: "Anniversary", desc: "Mark the milestone of love", icon: Heart },
            { value: "Valentine's Day", label: "Valentine's Day", desc: "For the one who has your heart", icon: HandHeart },
            { value: "Raksha Bandhan", label: "Raksha Bandhan", desc: "For the bond with your sibling", icon: Users },
            { value: "Diwali", label: "Diwali", desc: "Festival of lights and sweetness", icon: Flame },
            { value: "Christmas", label: "Christmas", desc: "Joy, warmth, and winter wonder", icon: TreePine },
            { value: "New Year", label: "New Year", desc: "Celebrate the new beginning", icon: PartyPopper },
        ],
    },
    {
        id: "budget",
        title: "What's your budget?",
        sub: "Select one or more budget ranges (or skip)",
        multi: true,
        options: [
            { value: "100-300", label: "₹100 - ₹300", desc: "Sweet treats for everyday indulgence", icon: Heart },
            { value: "300-700", label: "₹300 - ₹700", desc: "The perfect balance of quality and value", icon: Gem },
            { value: "700+", label: "₹700+", desc: "Only the finest, no compromises", icon: Crown },
        ],
    },
];

const BUDGET_RANGES = {
    "100-300": [100, 300],
    "300-700": [300, 700],
    "700+": [700, 99999],
};

export default function Matchmaker() {
    const navigate = useNavigate();
    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState({});
    const [results, setResults] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [loading, setLoading] = useState(false);

    const q = QUESTIONS[step];
    const progress = ((step + 1) / QUESTIONS.length) * 100;
    const selectedValues = answers[q.id] || [];

    const toggleOption = (val) => {
        const current = answers[q.id] || [];
        const next = current.includes(val)
            ? current.filter((v) => v !== val)
            : [...current, val];
        setAnswers({ ...answers, [q.id]: next });
    };

    const clearSelection = () => {
        const next = { ...answers };
        delete next[q.id];
        setAnswers(next);
    };

    const handleNext = async () => {
        if (step < QUESTIONS.length - 1) {
            setStep(step + 1);
        } else {
            await fetchResults();
        }
    };

    const fetchResults = async () => {
        setLoading(true);

        try {
            const res = await api.get("/product");
            const products = res?.data?.data?.products || [];

            const userIntensity = answers.intensity || [];
            const userFlavour = answers.flavour || [];
            const userOccasion = answers.occasion || [];
            const userBudget = answers.budget || [];

            const inAnyBudget = (price) => {
                if (userBudget.length === 0) return true;

                return userBudget.some((b) => {
                    const [min, max] = BUDGET_RANGES[b] || [0, 99999];
                    return price >= min && price <= max;
                });
            };

            const countMatches = (productAttr, userValues) => {
                if (userValues.length === 0) return 0;
                if (!productAttr) return 0;

                const attrArr = Array.isArray(productAttr)
                    ? productAttr
                    : [productAttr];

                return userValues.filter((v) =>
                    attrArr.includes(v)
                ).length;
            };

            const scored = products
                .map((p) => {
                    let score = 0;

                    score += countMatches(
                        p.attributes?.intensity,
                        userIntensity
                    );

                    score += countMatches(
                        p.attributes?.flavour,
                        userFlavour
                    );

                    score += countMatches(
                        p.attributes?.occasions,
                        userOccasion
                    );

                    if (
                        userBudget.length > 0 &&
                        inAnyBudget(p.price)
                    ) {
                        score += 1;
                    }

                    return {
                        product: p,
                        score,
                    };
                })
                .sort((a, b) => b.score - a.score);

            let filtered = scored
                .filter((s) => s.score > 0)
                .map((s) => s.product);
            
                
            filtered = filtered.slice(0, 6);

            if (filtered.length === 0) {
                filtered = scored.map((s) => s.product);
            }


            setResults(filtered);
        } finally {
            setLoading(false);
        }
    };

    const reset = () => {
        setStep(0);
        setAnswers({});
        setResults(null);
    };

    if (results) {
        return (
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-12">
                <div className="text-center mb-8 md:mb-10">
                    <p className="text-[10px] sm:text-xs tracking-[0.3em] uppercase text-chocolate/60 mb-2 sm:mb-3">Your Personal Match</p>
                    <h1 className="font-serif text-3xl md:text-4xl text-chocolate font-semibold">Your Perfect Picks</h1>
                    <p className="text-sm text-chocolate/70 mt-2 md:mt-3 max-w-xl mx-auto px-4">Based on your answers, we think you'll love these.</p>
                    <button onClick={reset} className="mt-4 text-sm text-chocolate/70 hover:text-chocolate inline-flex items-center gap-1 transition-colors">
                        <RotateCcw size={14} /> Retake quiz
                    </button>
                </div>
                {results.length === 0 ? (
                    <div className="text-center py-20 text-chocolate/60">No matches found. Try different selections.</div>
                ) : (
                    /* Configured to explicitly enforce 2 columns on mobile screens and scale up beautifully */
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

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-16">
            <div className="text-center mb-6 sm:mb-8">
                <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl uppercase text-chocolate font-semibold tracking-wide">Chocolate Matchmaker</h1>
                <p className="text-xs sm:text-sm text-chocolate/70 mt-1 sm:mt-2">4 quick questions to find your perfect chocolate</p>
            </div>

            <div className="mb-6 sm:mb-8">
                <div className="flex justify-between text-[11px] sm:text-xs text-chocolate/60 mb-2">
                    <span>Question {step + 1} of {QUESTIONS.length}</span>
                    <span>{Math.round(progress)}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-chocolate/10 overflow-hidden">
                    <div className="h-full chocolate-gradient transition-all duration-500" style={{ width: `${progress}%` }} />
                </div>
            </div>

            <div className="chocolate-gradient p-5 sm:p-8 rounded-2xl luxury-shadow-lg fade-in text-cream">
                <h2 className="font-serif text-xl sm:text-2xl md:text-3xl font-semibold text-center leading-snug">{q.title}</h2>
                <p className="text-cream/70 text-xs sm:text-sm text-center mt-2 mb-3">{q.sub}</p>
                {selectedValues.length > 0 && (
                    <p className="text-center text-xs text-gold-light mb-4">
                        {selectedValues.length} selected
                        <button onClick={clearSelection} className="ml-3 text-cream/60 hover:text-cream underline transition-colors">
                            Clear
                        </button>
                    </p>
                )}
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {q.options.map((opt) => {
                        const isSelected = selectedValues.includes(opt.value);
                        return (
                            <button
                                key={opt.value}
                                onClick={() => toggleOption(opt.value)}
                                className={`text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-start gap-3 relative min-h-21 sm:min-h-0 ${
                                    isSelected
                                        ? "border-gold bg-cream text-chocolate"
                                        : "border-cream/20 hover:border-cream/50 bg-cream/10 text-cream"
                                }`}
                            >
                                <opt.icon size={26} strokeWidth={1.5} className="shrink-0 mt-0.5 sm:w-8 sm:h-8" />
                                <div className="flex-1 min-w-0 pr-4">
                                    <p className="font-serif font-extrabold text-sm sm:text-base leading-tight">{opt.label}</p>
                                    <p className={`text-[11px] sm:text-xs mt-1 leading-normal ${isSelected ? "text-chocolate/70" : "text-cream/70"}`}>{opt.desc}</p>
                                </div>
                                {isSelected && (
                                    <div className="absolute top-3 right-3 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-gold text-chocolate-dark flex items-center justify-center shrink-0">
                                        <Check size={10} strokeWidth={3} className="sm:w-3 sm:h-3" />
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="mt-6 flex items-center justify-between gap-4">
                <button
                    onClick={() => step > 0 ? setStep(step - 1) : navigate("/")}
                    className="text-chocolate/70 hover:text-chocolate text-xs sm:text-sm flex items-center gap-1 py-2 font-medium transition-colors"
                >
                    <ArrowLeft size={14} /> Back
                </button>
                <div className="flex items-center">
                    <button
                        onClick={handleNext}
                        disabled={loading}
                        className="btn-primary flex items-center gap-2 text-xs sm:text-sm px-4 sm:px-6 py-2 sm:py-2.5 disabled:opacity-50 transition-all"
                    >
                        <span className="truncate max-w-37.5 sm:max-w-none">
                            {loading ? "Finding your match..." : step === QUESTIONS.length - 1 ? "See My Matches" : "Next"}
                        </span> 
                        <ArrowRight size={14} className="shrink-0" />
                    </button>
                </div>
            </div>
        </div>
    );
}