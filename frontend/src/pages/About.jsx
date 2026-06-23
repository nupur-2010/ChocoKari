// @ts-nocheck
import { Link } from "react-router-dom";
import { Award, Heart, Leaf, Sparkles, ChefHat, Truck, Users } from "lucide-react";
import PolicyPage, { Section } from "../components/PolicyPage";

const VALUES = [
    {
        icon: Heart,
        title: "Made with Love",
        text: "Every batch is hand-tempered, hand-blended, and hand-finished by people who genuinely care about the craft. No factory floor, no shortcuts.",
    },
    {
        icon: Leaf,
        title: "100% Vegetarian",
        text: "We use only real, plant-based ingredients. No gelatin, no animal-derived additives, ever.",
    },
    {
        icon: ChefHat,
        title: "Real Ingredients",
        text: "Single-origin Belgian cocoao, premium nuts sourced directly from farms, and natural flavour pairings — nothing artificial.",
    },
    {
        icon: Award,
        title: "Small-Batch Craft",
        text: "Every piece is made fresh, in small quantities, by hand. We don't mass-produce; we craft.",
    },
    {
        icon: Sparkles,
        title: "Built to Gift",
        text: "Each chocolate is individually wrapped in premium food-grade wrappers, with a themed sticker of your choice for a polished finish.",
    },
    {
        icon: Truck,
        title: "Pan-India Reach",
        text: "From our kitchen to your doorstep — secure packaging and careful handling every step of the way.",
    },
];

const STATS = [
    { value: "100%", label: "Vegetarian" },
    { value: "12+", label: "Handcrafted Flavours" },
    { value: "3", label: "Curated Collections" },
    { value: "5–7", label: "Days Pan-India" },
];

const PROCESS = [
    {
        step: "01",
        title: "Source",
        text: "We start with single-origin Belgian cocoa and the world's finest inclusions — hand-picked nuts, real fruit, and natural flavours.",
    },
    {
        step: "02",
        title: "Temper",
        text: "Each batch is hand-tempered to bring out a silky snap and a glossy finish. No shortcuts, no compromises.",
    },
    {
        step: "03",
        title: "Blend",
        text: "Recipes are developed and tested in small batches until the balance of flavour and texture is exactly right.",
    },
    {
        step: "04",
        title: "Wrap",
        text: "Every piece is individually wrapped in a premium food-grade wrapper. The box gets a themed sticker for a polished, personal finish.",
    },
    {
        step: "05",
        title: "Ship",
        text: "Secure packaging keeps every order in perfect condition, from our kitchen to your hands.",
    },
];

export default function About() {
    const sections = [
        { id: "our-story", label: "Our Story" },
        { id: "what-we-do", label: "What We Do" },
        { id: "our-values", label: "Our Values" },
        { id: "our-process", label: "Our Process" },
        { id: "our-stats", label: "By the Numbers" },
        { id: "join-us", label: "Join the Journey" },
    ];

    return (
        <PolicyPage
            title="About ChocoKari"
            subtitle="Born in a home kitchen, perfected in every batch — small-batch chocolate made for life's sweetest moments."
            heroTagline="Our Story"
            lastUpdated="June 2026"
            tocItems={sections}
        >
            <Section id="our-story" title="Our Story">
                <p>
                    ChocoKari started where many of the best things do — at home, in a small kitchen, with too much
                    curiosity and not nearly enough caution. What began as weekend experiments with cocoa and
                    a borrowed thermometer slowly turned into something a little more serious.
                </p>
                <p>
                    We kept refining: better beans, better tempering, better pairings. Friends became customers.
                    Customers became regulars. And somewhere along the way, a home kitchen hobby became a
                    small-batch chocolate label with a real point of view.
                </p>
                <p>
                    Today, every piece of ChocoKari chocolate is still made in small batches, by hand, with
                    the same care that went into those first weekend experiments. We've just gotten a lot better
                    at the tempering.
                </p>
            </Section>

            <Section id="what-we-do" title="What We Do">
                <p>
                    We make premium handcrafted chocolates in three curated collections — <b>Classic</b>,
                    <b> Signature</b>, and <b>Royale</b> — plus a fully customisable <b>Custom Builder</b> and
                    a <b>Bulk Corporate</b> gifting programme. Every product is built around three simple
                    promises: real ingredients, careful craft, and a beautiful unboxing.
                </p>
                <p>
                    Whether you're buying a single box for yourself, building a custom box for a friend, or
                    sending 200 branded boxes to your clients, the same hands and the same ingredients go
                    into every piece.
                </p>
            </Section>

            <Section id="our-values" title="Our Values">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 not-prose mt-2">
                    {VALUES.map(({ icon: Icon, title, text }, i) => (
                        <div key={i} className="p-4 rounded-xl bg-cream/50 border border-chocolate/10">
                            <div className="w-10 h-10 rounded-full chocolate-gradient flex items-center justify-center text-cream mb-3">
                                <Icon size={18} />
                            </div>
                            <h3 className="font-serif text-lg text-chocolate font-semibold mb-1">{title}</h3>
                            <p className="text-sm text-chocolate/75 leading-relaxed">{text}</p>
                        </div>
                    ))}
                </div>
            </Section>

            <Section id="our-process" title="Our Process">
                <div className="not-prose space-y-3 mt-2">
                    {PROCESS.map((p, i) => (
                        <div key={i} className="flex gap-4 p-4 rounded-xl bg-cream/50 border border-chocolate/10">
                            <div className="text-2xl font-serif text-gold font-bold shrink-0 w-12">{p.step}</div>
                            <div>
                                <h3 className="font-serif text-lg text-chocolate font-semibold mb-1">{p.title}</h3>
                                <p className="text-sm text-chocolate/75 leading-relaxed">{p.text}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </Section>

            <Section id="our-stats" title="By the Numbers">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 not-prose mt-2">
                    {STATS.map((s, i) => (
                        <div key={i} className="p-4 rounded-xl chocolate-gradient text-cream text-center">
                            <p className="font-serif text-2xl md:text-3xl font-bold text-gold-light mb-1">{s.value}</p>
                            <p className="text-[10px] tracking-widest uppercase text-cream/80">{s.label}</p>
                        </div>
                    ))}
                </div>
            </Section>

            <Section id="join-us" title="Join the Journey">
                <p>
                    We're a small team with a simple belief: chocolate should be made with the same care
                    you'd put into a meal for someone you love. If that resonates with you, we'd love to
                    have you along for the ride.
                </p>
                <div className="flex flex-wrap gap-3 not-prose mt-4">
                    <Link to="/products" className="btn-primary inline-flex items-center gap-2">
                        Shop Our Chocolates
                    </Link>
                    <Link to="/custom-builder" className="btn-outline inline-flex items-center gap-2">
                        Design Your Own Box
                    </Link>
                </div>
            </Section>
        </PolicyPage>
    );
}
