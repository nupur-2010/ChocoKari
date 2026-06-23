// @ts-nocheck
import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Search as SearchIcon, Plus, Minus, MessageCircle } from "lucide-react";
import PolicyPage, { Section, List } from "../components/PolicyPage";

const FAQ_CATEGORIES = [
    {
        id: "products",
        title: "Products & Flavours",
        faqs: [
            {
                q: "What flavours of chocolate do you have?",
                a: "We have 12+ handcrafted flavours across four flavour families: Nutty & Crunchy (Roasted Almond, Hazelnut, Royal Rose, Kunafa, Crackle), Sweet & Creamy (Biscoff, Oreo Delight, Bounty Coconut), Fruity & Refreshing (Cranberry, Paan, Fresh Mint), and Intensely Rich (Intense Dark). Visit the All Products page to see the full catalogue.",
            },
            {
                q: "Are your chocolates vegetarian?",
                a: "Yes, 100%. We never use gelatin or any animal-derived ingredients. We are a fully vegetarian kitchen.",
            },
            {
                q: "Are your chocolates vegan?",
                a: "Not all of them. Our milk and white chocolate varieties contain dairy, so they are vegetarian but not vegan. We currently do not have a fully vegan range. If you have specific dietary requirements, please email us before ordering.",
            },
            {
                q: "Do you use real ingredients?",
                a: "Yes. We use single-origin Belgian cocoa, real fruit, premium nuts sourced directly from farms, and natural flavour pairings. No artificial flavours, no artificial preservatives.",
            },
            {
                q: "Do your chocolates contain allergens?",
                a: "Our chocolates may contain nuts, dairy, and gluten. They are made in a facility that handles all common allergens. Some flavours specifically use nuts (almonds, hazelnuts), dairy (milk and white chocolate), and gluten (Oreo, Biscoff). Please check individual product descriptions before ordering.",
            },
            {
                q: "How long do the chocolates last?",
                a: "Best consumed within 30 days of manufacture for optimal taste and texture. Store in a cool, dry place below 25°C, away from direct sunlight. In the refrigerator, they can last over 3 months — just let them come to room temperature before eating for the best flavour.",
            },
        ],
    },
    {
        id: "custom",
        title: "Custom Builder",
        faqs: [
            {
                q: "How does the Custom Chocolate Builder work?",
                a: "It's a 4-step process: (1) choose your box collection and size, (2) pick your favourite flavours and quantities, (3) choose your intensity level, (4) pick a sticker theme, add gift packaging, and write a personal message. Your box is then handcrafted fresh and shipped to you.",
            },
            {
                q: "What box sizes are available?",
                a: "We have five box sizes: 6, 9, 12, 16, and 18 pieces. Pick the size that fits your occasion — 6 for a personal treat, 9–12 for friends and family, and 16–18 for premium gifting.",
            },
            {
                q: "What is the minimum quantity per flavour?",
                a: "For a 6-piece box, you need at least 2 pieces of each flavour. For 9-piece and larger boxes, you need at least 3 pieces per flavour. This helps us maintain the right balance and visual appeal in your box.",
            },
            {
                q: "Can I write a personal message?",
                a: "Yes. In the final step of the Custom Builder, you can add a personalised message. It will be printed on a small card and included with the box. The message field is unlocked when you select the optional gift packaging.",
            },
            {
                q: "What are sticker themes?",
                a: "Each chocolate is wrapped in a premium food-grade wrapper, and each chocolate itself gets a themed sticker of your choice for an elegant, personalised finish. Available themes include Flavour (default), Birthday, Anniversary, Valentine's Day, Raksha Bandhan, Diwali, Christmas, and New Year.",
            },
        ],
    },
    {
        id: "bulk",
        title: "Bulk & Corporate Gifting",
        faqs: [
            {
                q: "Do you take bulk and corporate orders?",
                a: "Yes. Our Bulk Corporate programme is designed for businesses that want premium handcrafted chocolate gifts for clients, employees, events, and festive seasons. Minimum order is 15 boxes.",
            },
            {
                q: "Can I add my company logo and a custom message?",
                a: "Yes. You can upload your company logo and add a custom corporate message. The logo appears on each chocolate and the message can be printed on a card included with each box.",
            },
            {
                q: "What delivery options are available for bulk orders?",
                a: "We support two delivery modes: (1) Single Address — all boxes delivered to one address, (2) Multiple Recipients — upload a CSV or XLSX file with columns Name, Address, Phone, and Quantity, and we ship directly to each recipient.",
            },
            {
                q: "What is the price of bulk corporate gifting?",
                a: "Pricing is the same as our regular collections, plus shipping. Shipping is ₹100 per box for single address and ₹200 per box for multiple recipients. There is no separate corporate pricing tier — you get the same chocolates at the same quality, just in larger quantities.",
            },
            {
                q: "Can I get a custom quotation for very large orders?",
                a: "Yes. For orders above 200 boxes, or for special packaging or custom requirements, please email us at hello.chocokari@gmail.com with your requirements and we will get back to you within 24 hours.",
            },
        ],
    },
    {
        id: "shipping",
        title: "Shipping & Delivery",
        faqs: [
            {
                q: "Where do you deliver?",
                a: "We currently deliver across India. International shipping is available but completely at your cost.",
            },
            {
                q: "How long does delivery take?",
                a: "Standard delivery takes 4–7 business days. Bulk corporate orders may take slightly longer depending on quantity and customisation.",
            },
            {
                q: "How much is shipping?",
                a: "Standard shipping is ₹120 per order. Shipping is free on orders above ₹1299. For bulk corporate orders, shipping is ₹100 per box for single-address delivery and ₹200 per box for multiple-recipient delivery.",
            },
            {
                q: "How can I track my order?",
                a: "Once your order is shipped, you will receive an email with a tracking link and tracking ID. You can also check the status anytime in Profile → Orders.",
            },
            {
                q: "Do you deliver on Sundays and holidays?",
                a: "Our delivery partners operate on all days except major national holidays. Orders placed on holidays are processed the next working day.",
            },
        ],
    },
    {
        id: "payment",
        title: "Payment",
        faqs: [
            {
                q: "What payment methods do you accept?",
                a: "We accept Cards (Visa, Mastercard, RuPay), UPI (Google Pay, PhonePe, Paytm, etc.), Netbanking (all major banks), and Wallets. All payments are processed securely via Razorpay.",
            },
            {
                q: "Is it safe to use my card on your website?",
                a: "Yes. All payments are processed by Razorpay using PCI-compliant infrastructure with bank-grade encryption. We never store your card or payment details on our servers.",
            },
            {
                q: "Do you offer Cash on Delivery?",
                a: "No, we do not currently offer Cash on Delivery. All orders are prepaid via Razorpay. EMI and Pay Later options are also not available.",
            },
            {
                q: "My payment failed but money was deducted. What do I do?",
                a: "Don't worry — failed payments are auto-reversed by your bank within 24 hours. If money is still deducted after 48 hours, please email us at hello.chocokari@gmail.com with your order details and we will help resolve it immediately.",
            },
        ],
    },
    {
        id: "returns",
        title: "Returns & Cancellations",
        faqs: [
            {
                q: "Can I cancel my order?",
                a: "Yes. You can cancel any order within 24 hours of placing it, as long as it has not been shipped yet. To cancel, go to Profile → Orders and click 'Cancel Order' on the eligible order.",
            },
            {
                q: "How do refunds work?",
                a: "Refunds are processed automatically to your original payment method once the order is cancelled. Razorpay refunds typically take 3–5 business days to reflect in your account.",
            },
            {
                q: "Can I return chocolates after they are delivered?",
                a: "Due to the perishable nature of our products, we do not accept returns once the order has been delivered. However, if your order arrives damaged or incorrect, please email us within 48 hours with an unboxing video and we will make it right.",
            },
            {
                q: "What if my chocolates arrive melted or damaged?",
                a: "We use secure packaging to minimise this, but weather during transit is beyond our control, so we suggest you to put the box in refrigerator before consuming them. If your order arrives damaged, please email us at hello.chocokari@gmail.com within 48 hours of delivery with an unboxing video showing the issue. We will replace the affected items or refund the damaged portion.",
            },
        ],
    },
    {
        id: "account",
        title: "Account & Orders",
        faqs: [
            {
                q: "Do I need an account to place an order?",
                a: "Yes, you need an account to place an order. This lets you track your orders, save addresses for faster checkout, and view your order history. You can sign up with email (we'll send you a one-time password) or instantly with Google.",
            },
            {
                q: "I forgot my password. How do I reset it?",
                a: "Click 'Forgot password' on the sign-in page and enter your email. We will send you a reset link that is valid for a limited time. Alternatively, you can sign in instantly with Google if your account was created that way.",
            },
            {
                q: "Can I save multiple delivery addresses?",
                a: "Yes. You can save multiple addresses in your Profile and pick one at checkout. You can mark one as the default for faster checkout.",
            },
            {
                q: "Where can I see my order history?",
                a: "All your orders (regular and corporate) are visible in Profile → Orders. You can see the full order details, track shipment, and download invoices from there.",
            },
        ],
    },
];

export default function FAQs() {
    const [query, setQuery] = useState("");
    const [openIds, setOpenIds] = useState({});

    const toggle = (key) => setOpenIds((p) => ({ ...p, [key]: !p[key] }));

    const filtered = useMemo(() => {
        const q = query.toLowerCase().trim();
        if (!q) return FAQ_CATEGORIES;
        return FAQ_CATEGORIES.map((cat) => ({
            ...cat,
            faqs: cat.faqs.filter(
                (f) => f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q),
            ),
        })).filter((cat) => cat.faqs.length > 0);
    }, [query]);

    const totalCount = FAQ_CATEGORIES.reduce((s, c) => s + c.faqs.length, 0);
    const tocItems = FAQ_CATEGORIES.map((c) => ({ id: c.id, label: c.title }));

    return (
        <PolicyPage
            title="Frequently Asked Questions"
            subtitle="Quick answers to the most common questions about our chocolates, orders, shipping, and more."
            heroTagline="Help & FAQs"
            lastUpdated="June 2026"
            tocItems={tocItems}
        >
            <div className="mb-8">
                <div className="relative">
                    <SearchIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-chocolate/40" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={`Search ${totalCount} questions...`}
                        className="w-full pl-12 pr-4 py-3 rounded-full bg-white border border-chocolate/15 focus:border-chocolate outline-none text-chocolate text-sm transition"
                    />
                </div>
                {query && (
                    <p className="text-xs text-chocolate/60 mt-2 text-center">
                        Showing {filtered.reduce((s, c) => s + c.faqs.length, 0)} of {totalCount} results
                    </p>
                )}
            </div>

            {filtered.length === 0 ? (
                <div className="text-center py-12">
                    <MessageCircle size={48} className="mx-auto text-chocolate/20 mb-3" />
                    <p className="text-chocolate/70 mb-2">No results found for "{query}"</p>
                    <p className="text-xs text-chocolate/50">
                        Try a different keyword or{" "}
                        <Link to="/contact" className="underline">contact us</Link>.
                    </p>
                </div>
            ) : (
                filtered.map((cat) => (
                    <Section key={cat.id} id={cat.id} title={cat.title}>
                        <div className="not-prose space-y-2">
                            {cat.faqs.map((faq, i) => {
                                const key = `${cat.id}-${i}`;
                                const isOpen = !!openIds[key];
                                return (
                                    <div key={key} className="rounded-xl border border-chocolate/10 bg-white/70 overflow-hidden">
                                        <button
                                            onClick={() => toggle(key)}
                                            className="w-full flex items-center justify-between gap-3 p-4 text-left hover:bg-chocolate/5 transition"
                                        >
                                            <span className="font-medium text-sm md:text-base text-chocolate pr-2">
                                                {faq.q}
                                            </span>
                                            {isOpen ? (
                                                <Minus size={18} className="text-chocolate/60 shrink-0" />
                                            ) : (
                                                <Plus size={18} className="text-chocolate/60 shrink-0" />
                                            )}
                                        </button>
                                        {isOpen && (
                                            <div className="px-4 pb-4 text-sm text-chocolate/80 leading-relaxed border-t border-chocolate/5 pt-3">
                                                {faq.a}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </Section>
                ))
            )}

            <div className="mt-8 p-6 rounded-2xl bg-chocolate/5 border border-chocolate/15 text-center">
                <p className="font-serif text-lg text-chocolate mb-1">Can't find what you're looking for?</p>
                <p className="text-sm text-chocolate/70 mb-3">Our team is happy to help with anything else.</p>
                <a
                    href="mailto:hello.chocokari@gmail.com"
                    className="inline-block px-5 py-2 rounded-full chocolate-gradient text-cream text-xs font-semibold tracking-wider uppercase hover:opacity-90 transition"
                >
                    Email Us
                </a>
            </div>
        </PolicyPage>
    );
}
