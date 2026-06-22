import { Review } from "../models/review.model.js";
import { APIresponse } from "../utils/api-response.js";
import { APIerror } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";

const createReview = asyncHandler(async (req, res) => {
    const { productId, rating, comment } = req.body;
    if (!productId || !rating || !comment) {
        throw new APIerror(400, "Product, rating and comment are required");
    }
    if (rating < 1 || rating > 5) {
        throw new APIerror(400, "Rating must be between 1 and 5");
    }
    const review = await Review.create({
        user: req.user._id,
        productId,
        rating,
        comment,
    });
    return res
        .status(201)
        .json(new APIresponse(201, { review }, "Review posted successfully"));
});

export { createReview };
