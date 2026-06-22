import { Router } from "express";
import {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
} from "../controllers/cart.controller.js";
import { verifyJWT } from "../middlewares/user.middleware.js";

const router = Router();

router.route("/").get(verifyJWT, getCart);
router.route("/").post(verifyJWT, addToCart);
router.route("/").put(verifyJWT, updateCartItem);
router.route("/").delete(verifyJWT, removeFromCart);
router.route("/clear").post(verifyJWT, clearCart);

export default router;
