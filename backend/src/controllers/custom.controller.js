import { Custom } from "../models/custom.model.js";
import { APIresponse } from "../utils/api-response.js";
import { APIerror } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";

const createCustom = asyncHandler(async (req, res) => {
    const {
        box,
        size,
        chocolates,
        preferredIntensity,
        stickers,
        giftPackaging,
        message,
        arrangement,
        price,
    } = req.body;

    if (!box || !size || !chocolates || !preferredIntensity || !stickers || price === undefined) {
        throw new APIerror(400, "Missing required custom chocolate fields");
    }

    const custom = await Custom.create({
        box,
        size,
        chocolates,
        preferredIntensity,
        stickers,
        giftPackaging: giftPackaging || false,
        message: message || "",
        arrangement: arrangement || [],
        price,
    });

    return res
        .status(201)
        .json(new APIresponse(201, { custom }, "Custom chocolate created successfully"));
});

const getCustomById = asyncHandler(async (req, res) => {
    const { customId } = req.params;
    const custom = await Custom.findById(customId);
    if (!custom) {
        throw new APIerror(404, "Custom chocolate not found");
    }
    return res
        .status(200)
        .json(new APIresponse(200, { custom }, "Custom chocolate fetched successfully"));
});

export { createCustom, getCustomById };
