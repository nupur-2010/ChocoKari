import { FLAVOURS } from "./constants";
import {
    fetchChatbotProducts,
    getProductsByIntensity,
    getProductsByCollection,
    getBestsellers,
} from "./chatbotProducts";

// ─────────────────────────────────────────────
// KNOWLEDGE BASE — DO NOT MODIFY
// ─────────────────────────────────────────────
const KB = {
    brand: {
        name: "ChocoKari",
        story: "Born in a home kitchen, perfected in every batch. Each piece is hand-tempered, blended with the finest inclusions, and finished to a silky shine. Small-batch chocolate made for life's sweetest moments.",
        tagline: "Every Bite, A Story to Savor",
        type: "Handcrafted artisan chocolate, made in small batches in India.",
        mission: "Premium handcrafted chocolates using the world's finest ingredients.",
        location: "India — we deliver pan-India.",
    },
    collections: {
        Classic: {
            desc: "Timeless favourites — Perfect for everyday indulgence and casual gifting.",
            best_for: "Everyday treats, casual gifting, first-time buyers.",
            price_range: "Most affordable collection.",
        },
        Signature: {
            desc: "Our chef's carefully crafted combinations using the finest ingredients. Ideal for thoughtful gifting and special moments.",
            best_for: "Thoughtful gifting, birthdays, anniversaries, thank-you gifts as well as festive occasions.",
            price_range: "Mid-range premium pricing.",
        },
        Royale: {
            desc: "The pinnacle of luxury — premium single-origin chocolates for the discerning palate. Best for celebrations and premium gifting.",
            best_for: "Celebrations, premium gifting, corporate gifting, connoisseurs.",
            price_range: "Our most premium collection.",
        },
    },
    flavors: {
        "Roasted Almond": {
            desc: "Roasted almonds enveloped in milk and dark chocolate — crunchy, nutty, and deeply satisfying.",
            type: "Dark chocolate",
            texture: "Crunchy",
            profile: "Nutty & Crunchy",
        },
        "Hazelnut": {
            desc: "Hazelnuts and nutella enrobed in milk and dark chocolate — a classic nutty indulgence.",
            type: "Milk chocolate",
            texture: "Smooth",
            profile: "Nutty & Crunchy",
        },
        "Kunafa": {
            desc: "Middle Eastern kunafa with pistachio, crisp and sweet — a crunchy, exotic treat.",
            type: "Milk chocolate",
            texture: "Crunchy",
            profile: "Nutty & Crunchy",
        },
        "Biscoff": {
            desc: "Dark chocolate filled with creamy Biscoff spread — sweet, caramelly, irresistible.",
            type: "Dark chocolate",
            texture: "Creamy",
            profile: "Sweet & Creamy",
        },
        "Royal Rose": {
            desc: "White chocolate infused with rose petals and dry fruits— floral, romantic, regal.",
            type: "White chocolate",
            texture: "Crunchy",
            profile: "Nutty & Crunchy",
        },
        "Cranberry": {
            desc: "Tangy cranberries wrapped in white chocolate — fruity with a sweet edge.",
            type: "White chocolate",
            texture: "Chewy & smooth",
            profile: "Fruity & Refreshing",
        },
        "Paan": {
            desc: "Betel-leaf inspired chocolate with gulkand — a beloved Indian favourite reimagined.",
            type: "Milk chocolate",
            texture: "Smooth",
            profile: "Fruity & Refreshing",
        },
        "Oreo Delight": {
            desc: "Crushed Oreos in creamy milk chocolate — playful, crunchy, kid-approved.",
            type: "Milk chocolate",
            texture: "Crunchy",
            profile: "Sweet & Creamy",
        },
        "Fresh Mint": {
            desc: "Cool peppermint in a dark chocolate shell — refreshing and clean.",
            type: "Dark chocolate",
            texture: "Smooth",
            profile: "Fruity & Refreshing",
        },
        "Bounty Coconut": {
            desc: "Toasted coconut shavings in milk chocolate — tropical, creamy, sweet.",
            type: "Milk chocolate",
            texture: "Chewy & creamy",
            profile: "Sweet & Creamy",
        },
        "Crackle": {
            desc: "Popping candy surprises in dark chocolate — fun, fizzy, exciting.",
            type: "Dark chocolate",
            texture: "Popping",
            profile: "Nutty & Crunchy",
        },
        "Intense Dark": {
            desc: "Bold 95% cacao for true dark chocolate lovers — rich, deep, uncompromising.",
            type: "Dark chocolate",
            texture: "Smooth",
            profile: "Intensely Rich & Chocolately",
        },
    },
    intensities: {
        "Mild & Sweet": {
            desc: "30-45% cocoa — creamy, gentle, easy on the palate. Great for first-timers and kids.",
            cocoa: "30-45%",
        },
        "Balanced Dark": {
            desc: "50-70% cocoa — rich, smooth, the perfect middle ground. Our most popular intensity.",
            cocoa: "50-70%",
        },
        "Deep & Bold": {
            desc: "70-85% cocoa — intense, complex, for true cocoa lovers.",
            cocoa: "70-85%",
        },
        "Ultra Intense": {
            desc: "90-100% cocoa — bold, bitter-sweet, for the adventurous.",
            cocoa: "90-100%",
        },
    },
    stickers: {
        intro: "Each chocolate is individually wrapped in a premium food-grade wrapper. The wrapped chocolate then gets a themed sticker of your choice for an elegant, personalized finish.",
        themes: ["Flavour (default)", "Birthday", "Anniversary", "Valentine's Day", "Raksha Bandhan", "Diwali", "Christmas", "New Year"],
        note: "Pick your sticker theme in the Custom Chocolate Builder.",
    },
    boxSizes: {
        sizes: [6, 9, 12, 16, 18],
        note: "For size 6 you need at least 2 pieces per flavour; for other sizes, at least 3.",
        guide: "6-piece for personal gifting, 9-12 for friends and family, 16-18 for premium corporate gifting.",
    },
    customBuilder: {
        steps: [
            "Choose your collection (Classic / Signature / Royale) and box size (6-18 pieces).",
            "Pick your flavours — minimum 2 per flavour for size 6, 3 for others.",
            "Choose your intensity level.",
            "Pick a sticker theme, optional gift packaging, and add a personal message.",
        ],
        drag_drop: "Once flavours are picked, the box auto-arranges. You can drag and drop to customize the layout.",
        gift: "Premium gift packaging is an optional add-on for a polished finish.",
    },
    corporate: {
        minimum: "15 boxes minimum per order.",
        collections: "Choose from Classic, Signature, or Royale — or design a fully custom box.",
        branding: "Upload your company logo and add a custom corporate message.",
        delivery: "Deliver to a single address, or upload a CSV/XLSX file with Name, Address, Phone, and Quantity for multiple deliveries - directly to clients.",
        occasions: "Diwali gifting, employee appreciation, client gifting, onboarding kits, festive hampers.",
        payment: "Secure payment via Razorpay — cards, UPI, netbanking, wallets.",
        support: "For large orders or special requests, email hello.chocokari@gmail.com.",
    },
    matchmaker: {
        desc: "The Chocolate Matchmaker is a quick quiz that finds the perfect chocolate for you based on your taste preferences.",
        questions: [
            "Intensity — Choose from the intensity you prefer the most.",
            "Flavour — Pick the flavour families you love.",
            "Occasion — What is this chocolate for?",
            "Budget — Choose your preferred price range.",
        ],
        note: "Every question is optional — skip any step you want for a quicker match.",
    },
    shipping: {
        coverage: "Pan-India delivery.",
        time: "4-7 business days.",
        free: "Free shipping on orders above Rs. 1299.",
        packaging: "Secure packaging so chocolates arrive in perfect condition.",
        tracking: "Once your order is shipped, you will receive an email with a tracking link and tracking ID.",
    },
    payment: {
        methods: "Cards (Visa, Mastercard, RuPay), UPI, Netbanking (all major banks), Wallets — all processed securely via Razorpay.",
        security: "Payments are secured by Razorpay's PCI-compliant infrastructure. We never store your card details.",
        cod: "Cash On Delivery , EMI and Pay Later options are not currently available.",
    },
    returns: {
        cancellation: "You can cancel your order within 24 hours of placing it, as long as it has not been shipped yet.",
        refund: "Refunds are processed to your original payment method within 2-5 business days via Razorpay.",
        shipped: "Once an order is shipped, it cannot be cancelled.",
        damaged: "If your order arrives damaged, email hello.chocokari@gmail.com with unpacking video and we will make it right.",
    },
    account: {
        signup: "You can create an account with your email — you will get an OTP to verify. Or sign up instantly with your Google account — no OTP needed.",
        password: "If you forgot your password, click Forgot Password on the sign-in page and a reset link will be sent to your email. Alternatively, you can sign in using Google without a password.",
        addresses: "You can save multiple delivery addresses in your Profile for faster checkout.",
        orders: "All your orders (regular and corporate) are visible in Profile then Orders, with full tracking info once shipped.",
        wishlist: "You can save products to your Wishlist by clicking the heart icon on any product. Access your wishlist from the navbar.",
        cart: "Add products to your Cart and proceed to checkout when ready. Your cart is saved so you can continue shopping anytime.",
    },
    food_info: {
        veg: "All our chocolates are 100% vegetarian. We do not use gelatin or any animal-derived ingredients.",
        allergens: "Our chocolates may contain nuts, dairy, and gluten. They are made in a facility that handles all common allergens.",
        shelf_life: "Best consumed within 30 days at room temperature. Store in a cool, dry place below 25 degrees away from sunlight. If stored in the refrigerator, they can last for more than 3 months — just let them come to room temperature before eating for the best experience.",
        preservatives: "We use no artificial preservatives. Our chocolates are 100% natural and freshly made.",
        freshness: "All chocolates are handcrafted fresh in small batches.",
        gluten_free: "Not all products are gluten-free as we use ingredients like Oreo and Biscoff in some flavours.",
        vegan: "Not all products are vegan due to dairy content in milk and white chocolate varieties.",
    },
    website: {
        search: "Use the search button in the navbar to find any product by name or flavour.",
        cart: "Add any product to your cart from the all products page or custom builder page.",
        wishlist: "Click the heart icon on any product to save it to your wishlist. View your wishlist from the navbar.",
        profile: "Your Profile has your saved addresses, order history, and saved addresses.",
        pages: {
            home: "The home page gives you an overview of ChocoKari — collections, featured products, and highlights.",
            products: "The all products page lets you browse all the listed products.",
            customBuilder: "The Custom Chocolate Builder lets you design your own box from scratch.",
            matchmaker: "The Chocolate Matchmaker page has a quick quiz to find your perfect chocolate.",
            corporate: "The bulk corporate gifting page is for business and bulk orders.",
        },
    },
    contact: {
        email: "hello.chocokari@gmail.com",
    }
};

// ─────────────────────────────────────────────
// UTILITIES
// ─────────────────────────────────────────────
const TYPO_MAP = {
    "choclate": "chocolate", "choklet": "chocolate",
    "hazlenut": "hazelnut", "hazelnutt": "hazelnut",
    "orreo": "oreo", "orroe": "oreo",
    "biscof": "biscoff",
    "kunafah": "kunafa", "knuafa": "kunafa",
    "cocanut": "coconut",
    "cranbery": "cranberry",
    "delievry": "delivery", "dilvery": "delivery", "deliverey": "delivery",
    "shiping": "shipping", "shpping": "shipping",
    "cancle": "cancel", "cancell": "cancel",
    "refudn": "refund", "reufnd": "refund",
    "custome": "custom", "cutsom": "custom",
    "payemnt": "payment", "paymnt": "payment",
    "acount": "account", "accout": "account",
    "corprate": "corporate", "coporate": "corporate",
    "bulck": "bulk",
    "anniversry": "anniversary", "anniversay": "anniversary",
    "valantine": "valentine", "valentines": "valentine",
    "rakhi": "raksha bandhan",
    "dipawali": "diwali", "deepawali": "diwali",
    "xmas": "christmas",
};

const fixTypos = (text) => {
    let fixed = text.toLowerCase();
    for (const [typo, correct] of Object.entries(TYPO_MAP)) {
        fixed = fixed.replace(new RegExp(`\\b${typo}\\b`, "gi"), correct);
    }
    return fixed;
};

const normalize = (text = "") => {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .replace(/\s+/g, " ")
        .trim();
};

const match = (text, keywords) => {
    const query = normalize(text);
    const compactQuery = query.replace(/\s/g, "");

    return keywords.some((keyword) => {
        const k = normalize(keyword);
        const compactKeyword = k.replace(/\s/g, "");

        if (query.includes(k)) return true;

        if (compactQuery.includes(compactKeyword)) return true;

        const words = compactKeyword.split(/[\s-]+/);

        return words.some(
            (word) =>
                word.length >= 4 &&
                compactQuery.includes(word)
        );
    });
};

const containsLoose = (text, keyword) => {
    const t = text.toLowerCase().replace(/[^a-z0-9]/g, "");
    const k = keyword.toLowerCase().replace(/[^a-z0-9]/g, "");

    return t.includes(k);
};

const formatProductList = (products, limit = 5) => {
    if (!products?.length) return null;
    const list = products.slice(0, limit).map((p) => {
        const price = p.price ? ` — Rs. ${p.price}` : "";
        const col = p.collection && p.collection !== "None" ? ` (${p.collection})` : "";
        return `- ${p.name}${col}${price}`;
    });
    let text = list.join("\n");
    if (products.length > limit)
        text += `\n- ...and ${products.length - limit} more. Visit the all products page to see everything.`;
    return text;
};

const STOP_WORDS = new Set(["i", "me", "my", "the", "a", "an", "is", "are", "was", "do", "does", "can", "will", "please", "tell", "about", "what", "how", "why", "when", "where", "which", "who", "want", "need", "give", "show", "find", "get", "have", "has", "any", "some", "for", "to", "of", "in", "on", "at", "its", "it", "this", "that", "and", "or", "but", "not", "with", "your", "you", "we", "us", "our"]);

const extractKeywords = (text) =>
    text.toLowerCase().split(/\s+/).filter((w) => w.length > 2 && !STOP_WORDS.has(w));

// ─────────────────────────────────────────────
// CONVERSATION CONTEXT TRACKER
// ─────────────────────────────────────────────
const ctx = {
    lastTopic: null,
    lastFlavour: null,
    lastCollection: null,
    lastIntensity: null,
    messageCount: 0,
    update(topic, extras = {}) {
        if (topic) this.lastTopic = topic;
        if (extras.flavour !== undefined) this.lastFlavour = extras.flavour;
        if (extras.collection !== undefined) this.lastCollection = extras.collection;
        if (extras.intensity !== undefined) this.lastIntensity = extras.intensity;
        this.messageCount++;
    },
    reset() {
        this.lastTopic = null;
        this.lastFlavour = null;
        this.lastCollection = null;
        this.lastIntensity = null;
        this.messageCount = 0;
    },
};

// ─────────────────────────────────────────────
// FOLLOW-UP HANDLER
// ─────────────────────────────────────────────
const handleFollowUp = async (q) => {
    // Trigger phrases — checked anywhere in the message, not just at start
    const followUpPhrases = [
        "tell me more", "more about", "more info", "more details",
        "what else", "anything else", "elaborate", "explain more",
        "details", "describe", "know more", "learn more", "expand on",
    ];
    const isFollowUp = followUpPhrases.some((phrase) => q.includes(phrase));
    if (!isFollowUp || !ctx.lastTopic) return null;

    switch (ctx.lastTopic) {
        case "flavour": {
            if (!ctx.lastFlavour) return null;
            const f = KB.flavors[ctx.lastFlavour];
            if (!f) return null;
            return (
                `More about ${ctx.lastFlavour}:\n\n` +
                `- Description: ${f.desc}\n` +
                `- Type: ${f.type}\n` +
                `- Texture: ${f.texture}\n` +
                `- Flavour family: ${f.profile}\n\n` +
                `For photos and pricing, visit the all products page. You can also add it to a custom box on the Custom Chocolate Builder page.`
            );
        }
        case "collection": {
            if (!ctx.lastCollection) return null;
            const c = KB.collections[ctx.lastCollection];
            if (!c) return null;
            return (
                `More about the ${ctx.lastCollection} Collection:\n\n` +
                `- About: ${c.desc}\n` +
                `- Best for: ${c.best_for}\n` +
                `- Pricing: ${c.price_range}\n\n` +
                `Browse it on the all products page.`
            );
        }
        case "intensity": {
            if (!ctx.lastIntensity) return null;
            const i = KB.intensities[ctx.lastIntensity];
            if (!i) return null;
            return (
                `More about ${ctx.lastIntensity}:\n\n` +
                `- Cocoa: ${i.cocoa}\n` +
                `- ${i.desc}\n\n` +
                `You can select this intensity on the Custom Chocolate Builder page.`
            );
        }
        case "custom_builder":
            return (
                `More about the Custom Chocolate Builder:\n\n` +
                `- ${KB.customBuilder.drag_drop}\n` +
                `- ${KB.customBuilder.gift}\n` +
                `- Box sizes available: ${KB.boxSizes.sizes.join(", ")} pieces\n` +
                `- ${KB.boxSizes.note}\n\n` +
                `Visit the Custom Chocolate Builder page to start.`
            );
        case "stickers":
            return (
                `More about sticker themes:\n\n` +
                `Available themes:\n${KB.stickers.themes.map((t) => `- ${t}`).join("\n")}\n\n` +
                `${KB.stickers.note}`
            );
        case "shipping":
            return (
                `More about shipping:\n\n` +
                `- ${KB.shipping.free}\n` +
                `- ${KB.shipping.packaging}\n` +
                `- ${KB.shipping.tracking}\n\n` +
                `Check your order status in Profile then Orders.`
            );
        case "payment":
            return (
                `More about payments:\n\n` +
                `- ${KB.payment.methods}\n` +
                `- ${KB.payment.security}\n` +
                `- ${KB.payment.cod}`
            );
        case "corporate":
            return (
                `More about corporate gifting:\n\n` +
                `- Branding: ${KB.corporate.branding}\n` +
                `- Delivery: ${KB.corporate.delivery}\n` +
                `- Perfect for: ${KB.corporate.occasions}\n` +
                `- ${KB.corporate.support}`
            );
        case "matchmaker":
            return (
                `More about the Chocolate Matchmaker:\n\n` +
                `The quiz has 4 questions:\n\n` +
                KB.matchmaker.questions.map((q, i) => `- Question ${i + 1}: ${q}`).join("\n") +
                `\n\n${KB.matchmaker.note}\n\n` +
                `Visit the Chocolate Matchmaker page to take the quiz.`
            );
        case "returns":
            return (
                `More about cancellations and refunds:\n\n` +
                `- ${KB.returns.cancellation}\n` +
                `- ${KB.returns.refund}\n` +
                `- ${KB.returns.shipped}\n` +
                `- ${KB.returns.damaged}`
            );
        case "food":
            return (
                `More about our chocolates:\n\n` +
                `- ${KB.food_info.veg}\n` +
                `- ${KB.food_info.preservatives}\n` +
                `- ${KB.food_info.freshness}\n` +
                `- Allergens: ${KB.food_info.allergens}\n\n` +
                `For specific queries, email us at ${KB.contact.email}.`
            );
        case "bestsellers":
            return `Visit the all products page to browse and filter all our chocolates by collection, flavour, and intensity.`;
        case "brand":
            return (
                `More about ChocoKari:\n\n` +
                `- Type: ${KB.brand.type}\n` +
                `- Mission: ${KB.brand.mission}\n` +
                `- Tagline: "${KB.brand.tagline}"\n` +
                `- Location: ${KB.brand.location}`
            );
        default:
            return null;
    }
};

// ─────────────────────────────────────────────
// SMART SEARCH FALLBACK
// ─────────────────────────────────────────────
const smartSearch = async (q) => {
    const products = await fetchChatbotProducts();
    if (!products?.length) return [];
    const keywords = extractKeywords(q);
    const scored = products.map((p) => {
        let score = 0;
        const searchText = [
            p.name, p.description, p.collection,
            ...(p.attributes?.flavour || []),
            ...(p.attributes?.intensity || []),
            ...(p.attributes?.occasions || []),
        ].filter(Boolean).join(" ").toLowerCase();
        keywords.forEach((kw) => { if (searchText.includes(kw)) score += kw.length; });
        if (p.rating) score += p.rating * 0.5;
        return { ...p, _score: score };
    });
    return scored.filter((p) => p._score > 0).sort((a, b) => b._score - a._score);
};

// ─────────────────────────────────────────────
// MATCHMAKER REDIRECT — used for any recommendation request
// ─────────────────────────────────────────────
const MATCHMAKER_REDIRECT =
    `For a personalized chocolate recommendation, take our Chocolate Matchmaker quiz.\n\n` +
    `It has 4 quick questions:\n\n` +
    `- Intensity: How bold do you like your chocolate? (30-45% up to 90-100% cocoa)\n` +
    `- Flavour: Pick the flavour families you enjoy\n` +
    `- Occasion: What is this chocolate for?\n` +
    `- Budget: Choose your preferred price range\n\n` +
    `${KB.matchmaker.note}\n\n` +
    `Visit the Chocolate Matchmaker page to find your perfect match.`;

// ─────────────────────────────────────────────
// MAIN CHATBOT FUNCTION
// ─────────────────────────────────────────────
export const askChatbot = async (rawQuestion) => {
    if (!rawQuestion?.trim()) {
        return "How can I help you today?";
    }

    const q = fixTypos(rawQuestion.trim());

    // ── Guardrails ───────────────────────────
    if (match(q, ["admin panel", "admin login", "backend", "api key", "secret key", "database", "source code", "credentials"])) {
        return `That is not something I can share. For any account or order issues, email us at ${KB.contact.email}.`;
    }
    if (match(q, ["someone else's order", "other customer", "other user"])) {
        return "For privacy, I can only help with your own account and orders.";
    }
    if (match(q, ["payment failed", "charged twice", "double charge", "money deducted but"])) {
        return `If a charge failed, the reversal will appear on your bank statement within 24 hours. If you were double-charged, email us at ${KB.contact.email} and we will resolve it immediately.`;
    }
    if (match(q, ["bug", "error", "not working", "broken", "website issue", "technical issue"])) {
        return `Please email ${KB.contact.email} with details and a screenshot. Our team will fix it quickly.`;
    }

    // ── Greetings ────────────────────────────
    if (match(q, ["hello", "hi", "hey", "hii", "hola", "good morning", "good afternoon", "good evening", "howdy", "whats up", "what's up"])) {
        return (
            `Hello! Welcome to ChocoKari. I am your chocolate concierge. I can help you with:\n\n` +
            `- Exploring flavours and collections\n` +
            `- Building a custom chocolate box\n` +
            `- Finding your perfect chocolate via the Matchmaker quiz\n` +
            `- Corporate and bulk gifting\n` +
            `- Shipping, payments, and orders\n` +
            `- Account help\n\n` +
            `What can I help you with?`
        );
    }
    if (match(q, ["thank you", "thanks", "thank u", "thx", "ty"])) {
        return "You are welcome! Feel free to ask if you need anything else.";
    }
    if (match(q, ["bye", "goodbye", "see you", "take care"])) {
        return "Goodbye! Enjoy your chocolates.";
    }

    // ── Follow-up ────────────────────────────
    const followUpResponse = await handleFollowUp(q);
    if (followUpResponse) return followUpResponse;

    // ── Recommendation redirect → Matchmaker ──
    if (match(q, [
        "recommend", "recommendation", "suggest me", "suggest a chocolate",
        "what should i buy", "what to buy", "which one should i get",
        "which is best", "best for me", "help me choose", "which chocolate should i",
        "what chocolate do i", "good for me", "which one is good",
        "which do you suggest", "which would you recommend", "not sure what to pick",
        "don't know what to choose", "help me pick",
    ])) {
        ctx.update("matchmaker");
        return MATCHMAKER_REDIRECT;
    }

    // ── Brand ────────────────────────────────
    if (match(q, ["about chocokari", "who are you", "your story", "brand story", "about the brand", "mission", "where are you", "where is this", "founded", "what is chocokari", "tell me about chocokari", "what do you do"])) {
        ctx.update("brand");
        return (
            `About ChocoKari:\n\n` +
            `${KB.brand.story}\n\n` +
            `- Type: ${KB.brand.type}\n` +
            `- Location: ${KB.brand.location}\n` +
            `- Mission: ${KB.brand.mission}\n` +
            `- Tagline: "${KB.brand.tagline}"\n\n` +
            `Read the full story on our /about page.`
        );
    }

    // ── Policy pages ───────────────────────────
    if (match(q, ["terms", "terms and conditions", "terms of service", "conditions of use", "t&c", "t and c"])) {
        ctx.update("terms");
        return `Our full Terms & Conditions are available on the /terms page. Key points: by placing an order you agree to our terms, all prices are in INR inclusive of GST, and orders may be cancelled within 24 hours if not yet shipped.`;
    }
    if (match(q, ["privacy policy", "privacy", "data protection", "my data", "personal information"])) {
        ctx.update("privacy");
        return `Our full Privacy Policy is on the /privacy page. Quick summary: we collect only what we need to process orders, we never sell your data, and you can request access, correction, or deletion anytime. Email hello.chocokari@gmail.com for privacy queries.`;
    }
    if (match(q, ["faqs", "frequently asked", "common questions", "help center", "help centre"])) {
        ctx.update("faqs");
        return `We have a comprehensive /faqs page with answers to 35+ questions across 7 categories (Products, Custom Builder, Bulk, Shipping, Payment, Returns, Account). You can also search within the page. Want me to answer a specific question here?`;
    }

    // ── Website pages overview ───────────────
    if (match(q, ["what pages", "what sections", "navigate", "pages on the website", "how to navigate", "where can i go", "what is on the website", "site pages"])) {
        return (
            `Here is an overview of our website pages:\n\n` +
            `- Home page: ${KB.website.pages.home}\n` +
            `- All Products page: ${KB.website.pages.products}\n` +
            `- Custom Chocolate Builder page: ${KB.website.pages.customBuilder}\n` +
            `- Chocolate Matchmaker page: ${KB.website.pages.matchmaker}\n` +
            `- Bulk Corporate Gifting page: ${KB.website.pages.corporate}`
        );
    }

    // ── Home page ────────────────────────────
    if (match(q, ["home page", "what is on home", "what can i find on home", "where do i start", "landing page"])) {
        return `${KB.website.pages.home} Visit the home page to get started.`;
    }

    // ── All products page ────────────────────
    if (match(q, ["all products page", "products page", "browse products", "where can i see all", "see all products", "product listing"])) {
        return `${KB.website.pages.products} You can browse by collection, flavour, and intensity on the all products page.`;
    }

    // ── Wishlist ─────────────────────────────
    if (match(q, ["wishlist", "heart icon", "save product", "saved products", "favourite", "like a product"])) {
        ctx.update("wishlist");
        return `${KB.account.wishlist}\n\n${KB.website.wishlist}`;
    }

    // ── Cart ─────────────────────────────────
    if (match(q, ["cart", "add to cart", "shopping cart", "checkout", "my cart"])) {
        ctx.update("cart");
        return `${KB.account.cart}\n\n${KB.website.cart}`;
    }

    // ── Search ───────────────────────────────
    if (match(q, ["search", "search bar", "search button", "how to search", "find product", "look up"])) {
        return KB.website.search;
    }

    // ── Profile ──────────────────────────────
    if (match(q, ["profile", "my profile", "account page", "my account", "profile page"])) {
        return `${KB.website.profile}\n\nFrom your Profile you can also view your order history and manage your saved addresses.`;
    }

    // ── Matchmaker ───────────────────────────
    if (match(q, [
 "matchmaker",
 "chocolate matchmaker",
 "quiz",
 "taste quiz",
 "chocolate quiz",
 "find my chocolate",
 "find chocolate",
 "find perfect chocolate",
 "recommend chocolate",
 "recommendation quiz",
 "match me",
 "chocolate finder",
 "taste finder",
 "what chocolate suits me",
 "which chocolate is for me",
 "help me choose chocolate",
 "help me decide",
 "perfect match",
 "personalized recommendation"
])) {
        ctx.update("matchmaker");
        return (
            `${KB.matchmaker.desc}\n\n` +
            `It has 4 questions:\n\n` +
            KB.matchmaker.questions.map((q, i) => `- Question ${i + 1}: ${q}`).join("\n") +
            `\n\n${KB.matchmaker.note}\n\n` +
            `${KB.website.pages.matchmaker} Visit the Chocolate Matchmaker page to take the quiz.`
        );
    }

    // ── Bestsellers ──────────────────────────
    if (match(q, ["bestseller", "best seller", "popular", "top rated", "most loved", "most popular", "top products", "trending"])) {
        const products = await fetchChatbotProducts();
        const best = getBestsellers(products);
        const list = formatProductList(best, 5);
        ctx.update("bestsellers");
        if (list) {
            return `Our most loved chocolates:\n\n${list}\n\nVisit the all products page to see the full range and details for each product.`;
        }
        return "Visit the all products page to browse our most popular chocolates.";
    }

    // ── All flavours list ────────────────────
    if (match(q, ["all flavours", "all flavors", "list of flavours", "what flavours", "which flavours", "available flavours", "flavour options", "flavor options", "show flavours", "types of flavours"])) {
        ctx.update("flavours");
        const lines = Object.entries(KB.flavors).map(([name, f]) => `- ${name} — ${f.desc}`);
        return (
            `We have ${lines.length} flavours:\n\n` +
            `${lines.join("\n")}\n\n` +
            `Visit the all products page to see full details and photos for each flavour.`
        );
    }

    // ── Specific flavour ─────────────────────
    for (const flavour of FLAVOURS) {
        if (containsLoose(q, flavour)) {
            const f = KB.flavors[flavour];
            ctx.update("flavour", { flavour });
            if (!f) return `${flavour} is one of our flavours. Visit the all products page for full details.`;
            return (
                `${flavour}:\n\n` +
                `- ${f.desc}\n` +
                `- Type: ${f.type}\n` +
                `- Texture: ${f.texture}\n` +
                `- Flavour family: ${f.profile}\n\n` +
                `For full product details and pricing, visit the all products page. You can also add this flavour to a custom box on the Custom Chocolate Builder page.`
            );
        }
    }

    // ── Flavour families / profiles ──────────
    if (match(q, ["nutty", "crunchy", "nutty and crunchy"])) {
        const nutty = Object.entries(KB.flavors).filter(([, f]) => f.profile === "Nutty & Crunchy").map(([name]) => `- ${name}`);
        return `Nutty & Crunchy flavours:\n\n${nutty.join("\n")}\n\nVisit the all products page for details on each.`;
    }
    if (match(q, ["fruity", "refreshing", "fruity and refreshing"])) {
        const fruity = Object.entries(KB.flavors).filter(([, f]) => f.profile === "Fruity & Refreshing").map(([name]) => `- ${name}`);
        return `Fruity & Refreshing flavours:\n\n${fruity.join("\n")}\n\nVisit the all products page for details on each.`;
    }
    if (match(q, ["sweet and creamy", "sweet & creamy", "creamy flavours", "sweet flavours"])) {
        const sweet = Object.entries(KB.flavors).filter(([, f]) => f.profile === "Sweet & Creamy").map(([name]) => `- ${name}`);
        return `Sweet & Creamy flavours:\n\n${sweet.join("\n")}\n\nVisit the all products page for details on each.`;
    }
    if (match(q, ["intense", "dark chocolate flavours", "intensely rich", "rich chocolate"])) {
        const intense = Object.entries(KB.flavors).filter(([, f]) => f.profile === "Intensely Rich & Chocolately").map(([name]) => `- ${name}`);
        return `Intensely Rich & Chocolately flavours:\n\n${intense.join("\n")}\n\nVisit the all products page for details on each.`;
    }

    // ── All collections ──────────────────────
    if (match(q, ["all collections", "what collections", "collection options", "collections available", "show collections", "types of collections", "which collection", "difference between collections", "collection"])) {
        ctx.update("collections");
        return (
            `We have 3 collections:\n\n` +
            `- Classic: ${KB.collections.Classic.desc} Best for: ${KB.collections.Classic.best_for} Pricing: ${KB.collections.Classic.price_range}\n\n` +
            `- Signature: ${KB.collections.Signature.desc} Best for: ${KB.collections.Signature.best_for} Pricing: ${KB.collections.Signature.price_range}\n\n` +
            `- Royale: ${KB.collections.Royale.desc} Best for: ${KB.collections.Royale.best_for} Pricing: ${KB.collections.Royale.price_range}\n\n` +
            `Browse all collections on the all products page.`
        );
    }

    // ── Specific collection ──────────────────
    for (const col of ["Classic", "Signature", "Royale"]) {
        if (containsLoose(q, col)) {
            const c = KB.collections[col];
            const products = await fetchChatbotProducts();
            const found = getProductsByCollection(products, col);
            const list = formatProductList(found, 5);
            ctx.update("collection", { collection: col });
            return (
                `${col} Collection:\n\n` +
                `- About: ${c.desc}\n` +
                `- Best for: ${c.best_for}\n` +
                `- Pricing: ${c.price_range}\n\n` +
                `${list ? `Products in this collection:\n\n${list}\n\n` : ""}` +
                `Visit the all products page to browse the full ${col} collection.`
            );
        }
    }

    // ── Collection comparisons ───────────────
    if (match(q, ["classic vs signature", "classic or signature", "classic and signature", "difference between classic and signature"])) {
        ctx.update("comparison");
        return (
            `Classic vs Signature:\n\n` +
            `- Classic: ${KB.collections.Classic.desc} ${KB.collections.Classic.price_range}\n` +
            `- Signature: ${KB.collections.Signature.desc} ${KB.collections.Signature.price_range}\n\n` +
            `Classic is great for everyday treats and casual gifting. Signature uses finer ingredients and more complex flavour combinations — ideal when you want to make an impression.`
        );
    }
    if (match(q, ["signature vs royale", "signature or royale", "signature and royale", "difference between signature and royale"])) {
        ctx.update("comparison");
        return (
            `Signature vs Royale:\n\n` +
            `- Signature: ${KB.collections.Signature.desc} ${KB.collections.Signature.price_range}\n` +
            `- Royale: ${KB.collections.Royale.desc} ${KB.collections.Royale.price_range}\n\n` +
            `Signature is thoughtfully crafted for special moments. Royale uses single-origin premium chocolate and is our luxury tier — for when only the best will do.`
        );
    }
    if (match(q, ["classic vs royale", "classic or royale", "classic and royale", "difference between classic and royale"])) {
        ctx.update("comparison");
        return (
            `Classic vs Royale:\n\n` +
            `- Classic: ${KB.collections.Classic.desc} ${KB.collections.Classic.price_range}\n` +
            `- Royale: ${KB.collections.Royale.desc} ${KB.collections.Royale.price_range}\n\n` +
            `Classic is great for everyday treats. Royale is a full luxury experience with premium single-origin cacao and artisan finishing.`
        );
    }
    if (match(q, ["dark vs milk", "dark or milk", "milk vs dark", "dark chocolate vs milk", "difference between dark and milk"])) {
        return `Dark chocolate has bolder cocoa notes and lower sugar content. Milk chocolate is creamier and sweeter, and more approachable for all ages. You can choose your preferred intensity on the Custom Chocolate Builder page or take the Chocolate Matchmaker quiz to find what suits you.`;
    }

    // ── Intensity — all levels ───────────────
    if (match(q, [
 "intensity",
 "intensities",
 "cocoa",
 "cocoa level",
 "cocoa levels",
 "cocoa percentage",
 "cocoa percentages",
 "cocoa content",
 "cocoa percent",
 "percent cocoa",
 "darkness",
 "dark level",
 "dark levels",
 "dark chocolate",
 "dark chocolate level",
 "dark chocolate levels",
 "darkness level",
 "darkness levels",
 "how dark",
 "how strong",
 "strong chocolate",
 "chocolate strength",
 "cocoa strength",
 "richness",
 "rich chocolate",
 "chocolate richness",
 "intensity level",
 "intensity levels",
 "intensity option",
 "intensity options",
 "intensity type",
 "intensity types",
 "mild sweet",
 "balanced dark",
 "deep bold",
 "ultra intense",
 "30-45",
 "50-70",
 "70-85",
 "90-100"
])) {
        ctx.update("intensity");
        return (
            `We have 4 intensity levels:\n\n` +
            Object.entries(KB.intensities).map(([name, i]) => `- ${name} (${i.cocoa} cocoa) — ${i.desc}`).join("\n") +
            `\n\nYou can choose your intensity when building a custom box on the Custom Chocolate Builder page, or take the Chocolate Matchmaker quiz to find what suits you.`
        );
    }

    // ── Specific intensity ───────────────────
    for (const [intensity] of Object.entries(KB.intensities)) {
        if (containsLoose(q, intensity)) {
            const i = KB.intensities[intensity];
            const products = await fetchChatbotProducts();
            const found = getProductsByIntensity(products, intensity);
            const list = formatProductList(found, 5);
            ctx.update("intensity", { intensity });
            return (
                `${intensity} (${i.cocoa} cocoa):\n\n` +
                `${i.desc}\n\n` +
                `${list ? `Chocolates at this intensity:\n\n${list}\n\n` : ""}` +
                `Browse on the all products page or build your custom box on the Custom Chocolate Builder page.`
            );
        }
    }

    // ── Custom builder ───────────────────────
    if (match(q, [
 "custom",
 "custom box",
 "custom chocolate",
 "custom chocolates",
 "builder",
 "box builder",
 "build",
 "build box",
 "build a box",
 "build chocolate box",
 "design box",
 "design my box",
 "design chocolate box",
 "create box",
 "create my box",
 "make box",
 "make my box",
 "personalize box",
 "personalise box",
 "own box",
 "bespoke",
 "mix chocolates",
 "choose chocolates",
 "drag and drop",
 "customization"
])) {
        ctx.update("custom_builder");
        return (
            `Custom Chocolate Builder:\n\n` +
            `${KB.customBuilder.steps.map((s, i) => `${i + 1}. ${s}`).join("\n")}\n\n` +
            `- ${KB.customBuilder.drag_drop}\n` +
            `- ${KB.customBuilder.gift}\n\n` +
            `${KB.website.pages.customBuilder} Visit the Custom Chocolate Builder page to start designing your box.`
        );
    }

    // ── Box sizes ────────────────────────────
    if (match(q, ["box size", "how many pieces", "size options", "which size", "6 piece", "9 piece", "12 piece", "16 piece", "18 piece", "box sizes", "number of pieces", "how big", "size"])) {
        ctx.update("box_sizes");
        return (
            `Box Sizes:\n\n` +
            `- Available sizes: ${KB.boxSizes.sizes.join(", ")} pieces\n` +
            `- ${KB.boxSizes.note}\n\n` +
            `Size guide: ${KB.boxSizes.guide}\n\n` +
            `Choose your size on the Custom Chocolate Builder page.`
        );
    }

    // ── Stickers / themes ────────────────────
    if (match(q, ["sticker", "stickers", "sticker theme", "box theme", "box look", "wrapper", "packaging theme", "occasion theme", "themed box"])) {
        ctx.update("stickers");
        return (
            `Sticker Themes:\n\n` +
            `${KB.stickers.intro}\n\n` +
            `Available themes:\n\n` +
            `${KB.stickers.themes.map((t) => `- ${t}`).join("\n")}\n\n` +
            `${KB.stickers.note}`
        );
    }

    // ── Gift packaging ───────────────────────
    if (match(q, ["gift wrap", "gift packaging", "premium packaging", "gift box", "wrapping", "gift ready", "packaging option"])) {
        return `${KB.customBuilder.gift} You can add it on the Custom Chocolate Builder page. It comes with a themed sticker of your choice.`;
    }

    // ── Freshness / handcrafted ───────────────
    if (match(q, ["fresh", "freshly made", "handcrafted", "handmade", "made fresh", "small batch", "batch", "how fresh"])) {
        ctx.update("food");
        return `${KB.food_info.freshness}\n\n${KB.food_info.preservatives}`;
    }

    // ── Shipping ─────────────────────────────
    if (match(q, [
 "shipping",
 "ship",
 "shipment",
 "delivery",
 "deliver",
 "delivery time",
 "shipping time",
 "shipping charges",
 "delivery charges",
 "free shipping",
 "courier",
 "track shipment",
 "track package",
 "package",
 "parcel",
 "when will it arrive",
 "when will i get",
 "how long",
 "dispatch",
 "order delivery"
])) {
        ctx.update("shipping");
        return (
            `Shipping and Delivery:\n\n` +
            `- Coverage: ${KB.shipping.coverage}\n` +
            `- Delivery time: ${KB.shipping.time}\n` +
            `- Free shipping: ${KB.shipping.free}\n` +
            `- Packaging: ${KB.shipping.packaging}\n` +
            `- Tracking: ${KB.shipping.tracking}\n\n` +
            `You can check your order status anytime in Profile then Orders.`
        );
    }

    // ── Order tracking ───────────────────────
    if (match(q, ["track my order", "where is my order", "order status", "tracking id", "tracking link", "where is my package", "track order", "order tracking"])) {
        ctx.update("tracking");
        return (
            `Once your order is shipped, you will receive an email with a tracking link and tracking ID.\n\n` +
            `You can also check your order status in Profile then Orders. All your past orders (regular and corporate) are visible there with full tracking info.`
        );
    }

    // ── Payment ──────────────────────────────
    if (match(q, ["pay", "payment", "payment methods", "how to pay", "upi", "card", "netbanking", "wallet", "razorpay", "emi", "pay later", "installment", "cash on delivery", "cod", "payment options"])) {
        ctx.update("payment");
        return (
            `Payment Options:\n\n` +
            `- ${KB.payment.methods}\n` +
            `- ${KB.payment.security}\n` +
            `- ${KB.payment.cod}`
        );
    }

    // ── Returns & refunds ────────────────────
    if (match(q, ["cancel", "cancellation", "refund", "return", "money back", "order cancel", "cancel order", "get a refund", "order return"])) {
        ctx.update("returns");
        return (
            `Cancellations and Refunds:\n\n` +
            `- ${KB.returns.cancellation}\n` +
            `- ${KB.returns.refund}\n` +
            `- ${KB.returns.shipped}\n` +
            `- ${KB.returns.damaged}`
        );
    }

    // ── Damaged order ────────────────────────
    if (match(q, ["damaged", "broken", "arrived broken", "order damaged", "melted", "crushed"])) {
        return KB.returns.damaged;
    }

    // ── Account — sign up ────────────────────
    if (match(q, ["sign up", "signup", "register", "create account", "new account", "how to create account", "how to register"])) {
        ctx.update("account");
        return KB.account.signup;
    }

    // ── Account — Google login ───────────────
    if (match(q, ["google", "sign in with google", "google login", "login with google", "google sign in", "google signup"])) {
        ctx.update("account");
        return "You can sign in or sign up with Google in one click — no OTP or password needed. Just click Sign in with Google on the sign-in page.";
    }

    // ── Account — password ───────────────────
    if (match(q, ["forgot password", "reset password", "cant login", "can't log in", "password reset", "lost password", "change password", "recover account"])) {
        ctx.update("account");
        return KB.account.password;
    }

    // ── Account — addresses ──────────────────
    if (match(q, ["my address", "save address", "saved addresses", "change address", "delivery address", "add address", "multiple addresses", "address book"])) {
        ctx.update("account");
        return KB.account.addresses;
    }

    // ── Account — order history ──────────────
    if (match(q, ["order history", "past orders", "previous orders", "my orders", "see my orders", "view orders"])) {
        ctx.update("account");
        return KB.account.orders;
    }

    // ── Corporate / bulk ─────────────────────
    if (match(q, [
 "corporate",
 "corporate gifting",
 "bulk",
 "bulk gifting",
 "bulk order",
 "bulk orders",
 "company gifts",
 "company gifting",
 "office gifts",
 "office gifting",
 "employee gifts",
 "employee gifting",
 "client gifts",
 "client gifting",
 "business gifts",
 "business gifting",
 "wholesale",
 "large order",
 "large orders",
 "15 boxes",
 "branding",
 "custom branding"
])) {
        ctx.update("corporate");
        return (
            `Corporate and Bulk Gifting:\n\n` +
            `- Minimum order: ${KB.corporate.minimum}\n` +
            `- Collections: ${KB.corporate.collections}\n` +
            `- Branding: ${KB.corporate.branding}\n` +
            `- Delivery: ${KB.corporate.delivery}\n` +
            `- Payment: ${KB.corporate.payment}\n` +
            `- Perfect for: ${KB.corporate.occasions}\n\n` +
            `${KB.website.pages.corporate} Visit the bulk corporate gifting page to get started, or email ${KB.contact.email} for special requirements.`
        );
    }

    // ── Food — vegetarian ────────────────────
    if (match(q, ["vegetarian", "veg", "non veg", "gelatin", "is it veg", "100 percent veg", "animal products", "animal derived"])) {
        ctx.update("food");
        return KB.food_info.veg;
    }

    // ── Food — vegan ─────────────────────────
    if (match(q, ["vegan", "dairy free", "dairy-free", "plant based", "no milk", "no dairy", "lactose free"])) {
        ctx.update("food");
        return `${KB.food_info.vegan}\n\nFor specific dietary queries, email us at ${KB.contact.email}.`;
    }

    // ── Food — allergens ─────────────────────
    if (match(q, ["allergen", "allergy", "nut allergy", "gluten", "lactose", "contains nuts", "contains dairy", "allergic"])) {
        ctx.update("food");
        return `Allergen Info:\n\n${KB.food_info.allergens}\n\nFor severe allergies, please email us before ordering: ${KB.contact.email}`;
    }

    // ── Food — shelf life / storage ──────────
    if (match(q, ["shelf life", "expiry", "expire", "how long does it last", "best before", "use by", "store", "storage", "refrigerator", "fridge", "how to store", "keep chocolate"])) {
        ctx.update("food");
        return KB.food_info.shelf_life;
    }

    // ── Food — preservatives / natural ───────
    if (match(q, ["preservative", "artificial", "natural ingredients", "chemicals", "100 percent natural", "no preservatives", "additive"])) {
        ctx.update("food");
        return KB.food_info.preservatives;
    }

    // ── Food — gluten free ───────────────────
    if (match(q, ["gluten free", "gluten-free", "no gluten", "gluten intolerant"])) {
        ctx.update("food");
        return `${KB.food_info.gluten_free}\n\nFor specific ingredient queries, email us: ${KB.contact.email}`;
    }

    // ── Food — calories / nutrition ──────────
    if (match(q, ["calorie", "calories", "nutrition", "nutritional info", "nutritional value", "how many calories"])) {
        ctx.update("food");
        return `Calorie content varies by flavour and is listed on the product packaging. For detailed nutritional information, email us at ${KB.contact.email}.`;
    }

    // ── Pricing ──────────────────────────────
    if (match(q, ["price", "cost", "how much", "pricing", "rate", "expensive", "cheap", "affordable", "budget", "price range"])) {
        ctx.update("pricing");
        return (
            `Pricing varies by collection and box size:\n\n` +
            `- Classic Collection — ${KB.collections.Classic.price_range}\n` +
            `- Signature Collection — ${KB.collections.Signature.price_range}\n` +
            `- Royale Collection — ${KB.collections.Royale.price_range}\n\n` +
            `Visit the all products page to see exact prices, or use the Custom Chocolate Builder page to see prices as you design your box.\n\n` +
            `${KB.shipping.free}`
        );
    }

    // ── Help / contact ───────────────────────
    if (match(q, ["help", "support", "contact", "reach you", "email", "talk to someone", "customer service", "customer support", "get in touch"])) {
        ctx.update("support");
        return (
            `I can help you with:\n\n` +
            `- Flavours and collections\n` +
            `- Custom box building\n` +
            `- Bulk and corporate orders\n` +
            `- Shipping and delivery\n` +
            `- Payments\n` +
            `- Cancellations and refunds\n` +
            `- Account and order help\n\n` +
            `For anything else, email us at ${KB.contact.email} and we will get back to you within 24 hours.`
        );
    }

    // ── Smart product search fallback ─────────
    const searchResults = await smartSearch(rawQuestion);
    if (searchResults.length > 0) {
        const list = formatProductList(searchResults, 5);
        ctx.update("product_search");
        return `Here is what I found for "${rawQuestion}":\n\n${list}\n\nVisit the all products page for full details, photos, and pricing.`;
    }

    // ── Fallback ─────────────────────────────
    ctx.update("fallback");
    return (
        `I did not quite catch that. Here are some things I can help with:\n\n` +
        `- "What flavours do you have?"\n` +
        `- "Show me your bestsellers"\n` +
        `- "How does the custom builder work?"\n` +
        `- "Tell me about corporate orders"\n` +
        `- "How do I reset my password?"\n\n` +
        `Or email us at ${KB.contact.email} for anything specific.`
    );
};

// ─────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────
export const getInitialMessage = () => ({
    role: "bot",
    text: (
        `Welcome to ChocoKari.\n\n` +
        `I am your chocolate concierge. I can help you with:\n\n` +
        `- Exploring flavours and collections\n` +
        `- Building a custom chocolate box\n` +
        `- Corporate and bulk gifting\n` +
        `- Finding the right chocolate via our Matchmaker quiz\n` +
        `- Shipping, payments, and orders\n\n` +
        `What can I help you with?`
    ),
});

export const getSuggestedPrompts = () => [
    { label: "All Flavours", text: "What flavours do you have?" },
    { label: "Bestsellers", text: "Show me your bestsellers" },
    { label: "Custom Box", text: "How does the custom builder work?" },
    { label: "Corporate Orders", text: "Tell me about bulk corporate orders" },
    { label: "Chocolate Matchmaker", text: "Tell me about the Chocolate Matchmaker" },
    { label: "Shipping", text: "What are your shipping charges and delivery times?" },
    { label: "Returns", text: "What is your return and cancellation policy?" },
];