import { Router } from "express";
import {
    getWishlist,
    addToWishlist,
    removeFromWishlist,
} from "../controllers/wishlist.controller.js";
import { verifyJWT } from "../middlewares/user.middleware.js";

const router = Router();

router.route("/").get(verifyJWT, getWishlist);
router.route("/").post(verifyJWT, addToWishlist);
router.route("/").delete(verifyJWT, removeFromWishlist);

export default router;
