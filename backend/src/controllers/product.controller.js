import { Product } from "../models/product.model.js";
import { Review } from "../models/review.model.js";
import { APIresponse } from "../utils/api-response.js";
import { APIerror } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { uploadImages } from "../utils/cloudinary.js";

const getAllProducts = asyncHandler(async (req, res) => {
    const { collection } = req.query;
    const filter = { isActive: { $ne: false } };
    if (collection && collection !== "All") {
        filter.collection = collection;
    }
    const products = await Product.find(filter).sort({ createdAt: -1 });
    return res
        .status(200)
        .json(new APIresponse(200, { products }, "Products fetched successfully"));
});

const getAllProductsAdmin = asyncHandler(async (req, res) => {
    const products = await Product.find().sort({ createdAt: -1 });
    return res
        .status(200)
        .json(new APIresponse(200, { products }, "All products (admin) fetched successfully"));
});

const getProductById = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const product = await Product.findById(productId);
    if (!product) {
        throw new APIerror(404, "Product not found");
    }
    if (product.isActive === false) {
        throw new APIerror(404, "Product not available");
    }
    return res
        .status(200)
        .json(new APIresponse(200, { product }, "Product fetched successfully"));
});

const createProduct = asyncHandler(async (req, res) => {
    const { name, description, images, price, attributes, collection, customQuestions } = req.body;
    if (!name || !description || price === undefined) {
        throw new APIerror(400, "Name, description and price are required");
    }
    const uploadedImages = images && images.length > 0
        ? await uploadImages(images, "ChocoKari/products")
        : [];
    const product = await Product.create({
        name,
        description,
        images: uploadedImages,
        price,
        attributes,
        collection: collection || "None",
        customQuestions: customQuestions || [],
    });
    return res
        .status(201)
        .json(new APIresponse(201, { product }, "Product created successfully"));
});

const updateProduct = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const { images, ...rest } = req.body;
    const updates = { ...rest };
    if (Array.isArray(images) && images.some((img) => typeof img === "string" && img.startsWith("data:image/"))) {
        updates.images = await uploadImages(images, "ChocoKari/products");
    } else if (Array.isArray(images)) {
        updates.images = images;
    }
    const product = await Product.findByIdAndUpdate(productId, updates, {
        new: true,
        runValidators: true,
    });
    if (!product) {
        throw new APIerror(404, "Product not found");
    }
    return res
        .status(200)
        .json(new APIresponse(200, { product }, "Product updated successfully"));
});

const deleteProduct = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const product = await Product.findByIdAndDelete(productId);
    if (!product) {
        throw new APIerror(404, "Product not found");
    }
    return res
        .status(200)
        .json(new APIresponse(200, {}, "Product deleted successfully"));
});

const toggleProductStatus = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const product = await Product.findById(productId);
    if (!product) {
        throw new APIerror(404, "Product not found");
    }
    const newStatus = !product.isActive;
    const updated = await Product.findByIdAndUpdate(
        productId,
        { isActive: newStatus },
        { new: true }
    );
    return res
        .status(200)
        .json(
            new APIresponse(
                200,
                { product: updated },
                `Product ${newStatus ? "activated" : "deactivated"} successfully`,
            ),
        );
});

const getProductReviews = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const reviews = await Review.find({ productId })
        .populate("user", "fullname")
        .sort({ createdAt: -1 });
    return res
        .status(200)
        .json(new APIresponse(200, { reviews }, "Reviews fetched successfully"));
});

export {
    getAllProducts,
    getAllProductsAdmin,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    toggleProductStatus,
    getProductReviews,
};
