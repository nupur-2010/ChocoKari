import { Router } from "express";
import {
    createOrder,
    getMyOrders,
    getOrderById,
    getAllOrders,
    updateOrderStatus,
    addTrackingEvent,
    cancelOrder,
    createOrderPayment,
    verifyOrderPayment,
} from "../controllers/order.controller.js";
import { verifyJWT } from "../middlewares/user.middleware.js";

const router = Router();

router.route("/").post(verifyJWT, createOrder);
router.route("/my").get(verifyJWT, getMyOrders);
router.route("/:orderId").get(verifyJWT, getOrderById);
router.route("/:orderId/cancel").patch(verifyJWT, cancelOrder);
router.route("/payment/create").post(verifyJWT, createOrderPayment);
router.route("/payment/verify").post(verifyJWT, verifyOrderPayment);

router.route("/admin/all").get(verifyJWT, getAllOrders);
router.route("/admin/:orderId/status").patch(verifyJWT, updateOrderStatus);
router.route("/admin/:orderId/tracking").post(verifyJWT, addTrackingEvent);

export default router;
