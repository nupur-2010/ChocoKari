import { Router } from "express";
import {
    createCorporateOrder,
    getAllCorporateOrders,
    getCorporateOrderById,
    getMyCorporateOrders,
    updateCorporateOrderStatus,
    cancelCorporateOrder,
    createCorporatePayment,
    verifyCorporatePayment,
} from "../controllers/corporate.controller.js";
import { verifyJWT } from "../middlewares/user.middleware.js";

const router = Router();

router.route("/").post(verifyJWT, createCorporateOrder);
router.route("/my").get(verifyJWT, getMyCorporateOrders);
router.route("/").get(verifyJWT, getAllCorporateOrders);
router.route("/:orderId").get(verifyJWT, getCorporateOrderById);
router.route("/:orderId/status").patch(verifyJWT, updateCorporateOrderStatus);
router.route("/:orderId/cancel").patch(verifyJWT, cancelCorporateOrder);
router.route("/payment/create").post(verifyJWT, createCorporatePayment);
router.route("/payment/verify").post(verifyJWT, verifyCorporatePayment);

export default router;
