import { Router } from "express";
import {
    getAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
} from "../controllers/address.controller.js";
import { verifyJWT } from "../middlewares/user.middleware.js";

const router = Router();

router.route("/").get(verifyJWT, getAddresses);
router.route("/").post(verifyJWT, addAddress);
router.route("/:addressId").put(verifyJWT, updateAddress);
router.route("/:addressId").delete(verifyJWT, deleteAddress);

export default router;
