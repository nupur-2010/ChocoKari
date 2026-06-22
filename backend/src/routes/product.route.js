import { Router } from "express";
import {
    getAllProducts,
    getAllProductsAdmin,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    toggleProductStatus,
    getProductReviews,
} from "../controllers/product.controller.js";
import { verifyJWT } from "../middlewares/user.middleware.js";

const router = Router();

router.route("/").get(getAllProducts);
router.route("/:productId").get(getProductById);
router.route("/:productId/reviews").get(getProductReviews);

router.route("/admin/all").get(verifyJWT, getAllProductsAdmin);
router.route("/admin").post(verifyJWT, createProduct);
router.route("/admin/:productId").put(verifyJWT, updateProduct);
router.route("/admin/:productId").delete(verifyJWT, deleteProduct);
router.route("/admin/:productId/toggle").patch(verifyJWT, toggleProductStatus);

export default router;
