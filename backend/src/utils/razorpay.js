import Razorpay from "razorpay";
import crypto from "crypto";

let _razorpayInstance = null;

const getKeyId = () => process.env.RAZORPAY_KEY_ID;
const getKeySecret = () => process.env.RAZORPAY_KEY_SECRET;
const getWebhookSecret = () => process.env.RAZORPAY_WEBHOOK_SECRET;

const isPlaceholder = (val) =>
    !val || val === "PLACEHOLDER_REPLACE_WITH_YOUR_KEY_ID" || val === "PLACEHOLDER_REPLACE_WITH_YOUR_KEY_SECRET";

const isRazorpayConfigured = () => {
    const keyId = getKeyId();
    const keySecret = getKeySecret();
    return Boolean(keyId && keySecret) && !isPlaceholder(keyId) && !isPlaceholder(keySecret);
};

const getRazorpayInstance = () => {
    if (_razorpayInstance) return _razorpayInstance;
    if (!isRazorpayConfigured()) {
        throw new Error("Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in backend/.env");
    }
    _razorpayInstance = new Razorpay({
        key_id: getKeyId(),
        key_secret: getKeySecret(),
    });
    return _razorpayInstance;
};

export const verifyRazorpaySignature = (orderId, paymentId, signature) => {
    const body = orderId + "|" + paymentId;
    const expectedSignature = crypto
        .createHmac("sha256", getKeySecret())
        .update(body)
        .digest("hex");
    return expectedSignature === signature;
};

export const verifyWebhookSignature = (body, signature) => {
    const expectedSignature = crypto
        .createHmac("sha256", getWebhookSecret())
        .update(body)
        .digest("hex");
    return expectedSignature === signature;
};

export const createRazorpayOrder = async ({ amount, currency = "INR", receipt, notes = {} }) => {
    const razorpay = getRazorpayInstance();
    const order = await razorpay.orders.create({
        amount: Math.round(amount * 100),
        currency,
        receipt,
        notes,
    });
    return order;
};

export const getRazorpayKeyId = () => {
    if (!isRazorpayConfigured()) return null;
    return getKeyId();
};
