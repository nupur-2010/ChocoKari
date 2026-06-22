import { User } from "../models/user.model.js";
import { Custom } from "../models/custom.model.js";
import { APIresponse } from "../utils/api-response.js";
import { APIerror } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";

const populateCart = async (userId) => {
    const user = await User.findById(userId)
        .populate("cart.productId")
        .populate("cart.customizationId");
    return user.cart;
};

const sortAnswers = (answers = []) =>
    [...answers]
        .map((a) => `${a.question}::${a.answer}`)
        .sort()
        .join("|");

const fingerprint = (item) => {
    if (item.itemType === "product") {
        const productId = item.productId?._id
            ? item.productId._id.toString()
            : item.productId?.toString();
        return `p|${productId}|${sortAnswers(item.customQuestionAnswer)}|${item.giftPackaging ? 1 : 0}|${item.message || ""}`;
    }
    const c = item.customizationId;
    if (!c) return `c|empty`;
    const arrangement = (c.arrangement || []).map((a) => a.flavour).join(",");
    const gift = c.giftPackaging ? 1 : 0;
    return `c|${c.box}|${c.size}|${c.preferredIntensity}|${c.stickers}|${gift}|${c.message || ""}|${arrangement}`;
};

const fingerprintForNew = async (itemType, payload) => {
    if (itemType === "product") {
        const productId = payload.productId;
        return `p|${productId}|${sortAnswers(payload.customQuestionAnswer)}|${payload.giftPackaging ? 1 : 0}|${payload.message || ""}`;
    }
    const c = await Custom.findById(payload.customizationId);
    if (!c) return `c|empty`;
    const arrangement = (c.arrangement || []).map((a) => a.flavour).join(",");
    const gift = c.giftPackaging ? 1 : 0;
    return `c|${c.box}|${c.size}|${c.preferredIntensity}|${c.stickers}|${gift}|${c.message || ""}|${arrangement}`;
};

const getCart = asyncHandler(async (req, res) => {
    const cart = await populateCart(req.user._id);
    return res
        .status(200)
        .json(new APIresponse(200, { cart }, "Cart fetched"));
});

const addToCart = asyncHandler(async (req, res) => {
    const { itemType, productId, customizationId, quantity, customQuestionAnswer, giftPackaging, message } = req.body;
    if (!itemType) {
        throw new APIerror(400, "Item type is required");
    }
    const user = await User.findById(req.user._id);

    const userWithCart = await User.findById(req.user._id)
        .populate("cart.customizationId");
    const newFp = await fingerprintForNew(itemType, { productId, customizationId, customQuestionAnswer, giftPackaging, message });

    const existing = userWithCart.cart.find((i) => fingerprint(i) === newFp);

    if (existing) {
        existing.quantity = (existing.quantity || 1) + (quantity || 1);
        await userWithCart.save({ validateBeforeSave: false });
    } else {
        const newItem = {
            itemType,
            quantity: quantity || 1,
        };
        if (itemType === "product") {
            newItem.productId = productId;
            newItem.customQuestionAnswer = customQuestionAnswer || [];
            newItem.giftPackaging = giftPackaging || false;
            newItem.message = message || "";
        } else {
            newItem.customizationId = customizationId;
        }
        user.cart.push(newItem);
        await user.save({ validateBeforeSave: false });
    }

    const cart = await populateCart(req.user._id);
    return res
        .status(200)
        .json(new APIresponse(200, { cart }, "Added to cart"));
});

const updateCartItem = asyncHandler(async (req, res) => {
    const { itemType, productId, customizationId, quantity } = req.body;
    const user = await User.findById(req.user._id);
    const item = user.cart.find(
        (i) =>
            i.itemType === itemType &&
            ((productId && i.productId?.toString() === productId) ||
                (customizationId && i.customizationId?.toString() === customizationId)),
    );
    if (!item) {
        throw new APIerror(404, "Cart item not found");
    }
    if (quantity <= 0) {
        user.cart = user.cart.filter((i) => i !== item);
    } else {
        item.quantity = quantity;
    }
    await user.save({ validateBeforeSave: false });
    const cart = await populateCart(req.user._id);
    return res
        .status(200)
        .json(new APIresponse(200, { cart }, "Cart updated"));
});

const removeFromCart = asyncHandler(async (req, res) => {
    const { itemType, productId, customizationId, customQuestionAnswer, giftPackaging, message } = req.body;
    const user = await User.findById(req.user._id);

    const userWithCart = await User.findById(req.user._id)
        .populate("cart.customizationId");
    const targetFp = await fingerprintForNew(itemType, { productId, customizationId, customQuestionAnswer, giftPackaging, message });

    userWithCart.cart = userWithCart.cart.filter((i) => fingerprint(i) !== targetFp);
    await userWithCart.save({ validateBeforeSave: false });
    const cart = await populateCart(req.user._id);
    return res
        .status(200)
        .json(new APIresponse(200, { cart }, "Removed from cart"));
});

const clearCart = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    user.cart = [];
    await user.save({ validateBeforeSave: false });
    return res
        .status(200)
        .json(new APIresponse(200, { cart: [] }, "Cart cleared"));
});

export { getCart, addToCart, updateCartItem, removeFromCart, clearCart };
