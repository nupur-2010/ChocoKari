// @ts-nocheck
export const formatPrice = (n) => {
    if (n === undefined || n === null) return "₹0";
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(n);
};

export const FLAVOURS = [
    "Roasted Almond", "Hazelnut", "Kunafa", "Biscoff", "Royal Rose", "Cranberry",
    "Paan", "Oreo Delight", "Fresh Mint", "Bounty Coconut", "Crackle", "Intense Dark",
];

export const FLAVOUR_COLORS = {
    "Roasted Almond": "from-amber-200 to-amber-400",
    "Hazelnut": "from-orange-500 to-orange-700",
    "Kunafa": "from-lime-200 to-green-300",
    "Biscoff": "from-amber-100 to-orange-300",
    "Royal Rose": "from-pink-200 to-pink-400",
    "Cranberry": "from-purple-200 to-purple-400",
    "Paan": "from-green-500 to-emerald-600",
    "Oreo Delight": "from-stone-500 to-stone-700",
    "Fresh Mint": "from-emerald-100 to-emerald-300",
    "Bounty Coconut": "from-stone-100 to-stone-300",
    "Crackle": "from-amber-600 to-amber-800",
    "Intense Dark": "from-chocolate-light to-chocolate-dark",
};

export const FLAVOUR_ABBR = {
    "Roasted Almond": "RA",
    "Royal Rose": "RR",
    "Hazelnut": "HN",
    "Paan": "PN",
    "Fresh Mint": "FM",
    "Bounty Coconut": "BC",
    "Cranberry": "CR",
    "Oreo Delight": "OD",
    "Crackle": "CK",
    "Intense Dark": "ID",
    "Kunafa": "KN",
    "Biscoff": "BS",
};

export const STICKERS = [
    "Flavour", "Birthday", "Anniversary", "Valentine's Day", "Raksha Bandhan",
    "Diwali", "Christmas", "New Year",
];

export const INTENSITIES = ["Mild & Sweet", "Balanced Dark", "Deep & Bold", "Ultra Intense"];

export const COLLECTIONS = ["Classic", "Signature", "Royale"];

export const BOX_SIZES = [6, 9, 12, 16, 18];

export const GRID_FOR_SIZE = {
    6: { rows: 2, cols: 3 },
    9: { rows: 3, cols: 3 },
    12: { rows: 3, cols: 4 },
    16: { rows: 4, cols: 4 },
    18: { rows: 3, cols: 6 },
};

export const MIN_FLAVOUR_QTY = (size) => (size === 6 ? 2 : 3);

export const SIZE_BASE_PRICE = {
    6: 30,
    9: 40,
    12: 60,
    16: 80,
    18: 100,
};

export const COLLECTION_MULTIPLIER = {
    Classic: 1,
    Signature: 1.5,
    Royale: 2,
};

export const FLAVOUR_PIECE_PRICE = {
    "Roasted Almond": 25,
    "Royal Rose": 35,
    "Hazelnut": 35,
    "Paan": 30,
    "Fresh Mint": 30,
    "Bounty Coconut": 30,
    "Cranberry": 25,
    "Oreo Delight": 25,
    "Crackle": 25,
    "Intense Dark": 30,
    "Kunafa": 35,
    "Biscoff": 35,
};

export const DEFAULT_FLAVOUR_PIECE_PRICE = 30;

export const INTENSITY_PREMIUM = {
    "Mild & Sweet": 0,
    "Balanced Dark": 0,
    "Deep & Bold": 0,
    "Ultra Intense": 0,
};

export const GIFT_PACKAGING_PRICE = 50;

export const STANDARD_SHIPPING_COST = 120;
export const FREE_SHIPPING_THRESHOLD = 1299;
export const CORPORATE_SHIPPING_PER_BOX_SINGLE = 100;
export const CORPORATE_SHIPPING_PER_BOX_MULTI = 200;

export const getFlavourPiecePrice = (flavour) =>
    FLAVOUR_PIECE_PRICE[flavour] ?? DEFAULT_FLAVOUR_PIECE_PRICE;

export const computeCustomPrice = ({
    box,
    size,
    preferredIntensity,
    giftPackaging,
    flavours = [],
}) => {
    const sizeBase = SIZE_BASE_PRICE[size] || 0;
    const multiplier = COLLECTION_MULTIPLIER[box] || 1;
    const boxCost = Math.round(sizeBase * multiplier);
    let flavourCost = 0;
    flavours.forEach((f) => {
        if (f.flavour && Number(f.quantity) > 0) {
            const piece = getFlavourPiecePrice(f.flavour);
            flavourCost += piece * Number(f.quantity);
        }
    });
    const giftPrice = giftPackaging ? GIFT_PACKAGING_PRICE : 0;
    return boxCost + flavourCost + giftPrice;
};


export const validatePhone = (phone) => {
    if (!phone) return false;
    const cleaned = String(phone).replace(/[\s\-()]/g, "");
    if (!/^\+?\d{10,15}$/.test(cleaned)) return false;
    if (cleaned.startsWith("+") && cleaned.length < 11) return false;
    if (!cleaned.startsWith("+") && cleaned.length !== 10) return false;
    return true;
};
