import { User } from "../models/user.model.js";
import { APIresponse } from "../utils/api-response.js";
import { APIerror } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";

const populateWishlist = async (userId) => {
    const user = await User.findById(userId)
        .populate("wishlist.productId")
        .populate("wishlist.customizationId");
    return user.wishlist;
};

const getWishlist = asyncHandler(async (req, res) => {
    const wishlist = await populateWishlist(req.user._id);
    return res
        .status(200)
        .json(new APIresponse(200, { wishlist }, "Wishlist fetched"));
});

const addToWishlist = asyncHandler(async (req, res) => {
    const { itemType, productId, customizationId } = req.body;
    if (!itemType) {
        throw new APIerror(400, "Item type is required");
    }
    const user = await User.findById(req.user._id);
    const exists = user.wishlist.find(
        (i) =>
            i.itemType === itemType &&
            ((productId && i.productId?.toString() === productId) ||
                (customizationId && i.customizationId?.toString() === customizationId)),
    );
    if (exists) {
        throw new APIerror(409, "Item already in wishlist");
    }
    user.wishlist.push({ itemType, productId, customizationId });
    await user.save({ validateBeforeSave: false });
    const wishlist = await populateWishlist(req.user._id);
    return res
        .status(200)
        .json(new APIresponse(200, { wishlist }, "Added to wishlist"));
});

const removeFromWishlist = asyncHandler(async (req, res) => {
    const { itemType, productId, customizationId } = req.body;
    const user = await User.findById(req.user._id);
    user.wishlist = user.wishlist.filter(
        (i) =>
            !(
                i.itemType === itemType &&
                ((productId && i.productId?.toString() === productId) ||
                    (customizationId && i.customizationId?.toString() === customizationId))
            ),
    );
    await user.save({ validateBeforeSave: false });
    const wishlist = await populateWishlist(req.user._id);
    return res
        .status(200)
        .json(new APIresponse(200, { wishlist }, "Removed from wishlist"));
});

export { getWishlist, addToWishlist, removeFromWishlist };
