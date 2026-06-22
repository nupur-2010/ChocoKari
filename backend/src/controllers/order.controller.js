import { Order } from "../models/order.model.js";
import { User } from "../models/user.model.js";
import { APIresponse } from "../utils/api-response.js";
import { APIerror } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { createRazorpayOrder, verifyRazorpaySignature, verifyWebhookSignature, getRazorpayKeyId } from "../utils/razorpay.js";
import { sendEmail } from "../utils/mail.js";
import { shippedOrderMailgenContent } from "../utils/mail.js";

const createOrder = asyncHandler(async (req, res) => {
    const { items, shippingAddress, totalAmount } = req.body;

    if (!items || items.length === 0) {
        throw new APIerror(400, "Order must contain at least one item");
    }
    if (!shippingAddress || totalAmount === undefined) {
        throw new APIerror(400, "Shipping address and total amount are required");
    }

    const order = await Order.create({
        user: req.user?._id,
        items,
        totalAmount,
        shippingAddress,
        paymentStatus: "pending",
        orderStatus: "placed",
    });

    if (req.user?._id) {
        await User.findByIdAndUpdate(req.user._id, { $set: { cart: [] } });
    }

    return res
        .status(201)
        .json(new APIresponse(201, { order }, "Order placed successfully"));
});

const getMyOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.user._id })
        .populate("items.customizationSnapshot")
        .sort({ createdAt: -1 });
    return res
        .status(200)
        .json(new APIresponse(200, { orders }, "Orders fetched successfully"));
});

const getOrderById = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);
    if (!order) {
        throw new APIerror(404, "Order not found");
    }
    return res
        .status(200)
        .json(new APIresponse(200, { order }, "Order fetched successfully"));
});

const getAllOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find()
        .populate("user", "fullname email")
        .populate("items.customizationSnapshot")
        .sort({ createdAt: -1 });
    return res
        .status(200)
        .json(new APIresponse(200, { orders }, "All orders fetched successfully"));
});

const updateOrderStatus = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const { orderStatus, paymentStatus, trackingId, trackingLink } = req.body;
    const order = await Order.findById(orderId).populate("user", "fullname email");
    if (!order) {
        throw new APIerror(404, "Order not found");
    }

    if (orderStatus) order.orderStatus = orderStatus;
    if (paymentStatus) order.paymentStatus = paymentStatus;

    let emailSent = false;
    let emailError = null;

    if (orderStatus === "shipped" && trackingId && trackingLink) {
        if (order.trackingId && order.trackingLink) {
            throw new APIerror(400, "Tracking information has already been set for this order and cannot be modified.");
        }
        try {
            const url = new URL(trackingLink);
            if (!/^https?:$/.test(url.protocol)) {
                throw new Error("Invalid protocol");
            }
        } catch {
            throw new APIerror(400, "Tracking link must be a valid http or https URL.");
        }
        if (trackingId.trim().length < 3 || trackingId.trim().length > 50) {
            throw new APIerror(400, "Tracking ID must be between 3 and 50 characters.");
        }
        order.trackingId = trackingId.trim();
        order.trackingLink = trackingLink.trim();
        order.shippedAt = new Date();
        if (order.user?.email) {
            try {
                await sendEmail({
                    email: order.user.email,
                    subject: `Your ChocoKari order #${order._id.toString().slice(-8).toUpperCase()} has been shipped!`,
                    mailgenContent: shippedOrderMailgenContent(
                        order.user.fullname || "Customer",
                        order._id.toString(),
                        order.trackingId,
                        order.trackingLink,
                    ),
                });
                order.trackingEmailSentAt = new Date();
                emailSent = true;
            } catch (err) {
                emailError = "Email could not be sent, but order was updated.";
                console.error("Shipping email failed:", err);
            }
        }
    }

    await order.save({ validateBeforeSave: false });
    const updated = await Order.findById(orderId).populate("user", "fullname email");
    return res
        .status(200)
        .json(new APIresponse(200, { order: updated, emailSent, emailError }, "Order updated successfully"));
});

const addTrackingEvent = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const { status, note } = req.body;
    const order = await Order.findById(orderId);
    if (!order) {
        throw new APIerror(404, "Order not found");
    }
    if (status) order.orderStatus = status;
    await order.save({ validateBeforeSave: false });
    return res
        .status(200)
        .json(
            new APIresponse(
                200,
                { order, note: note || "" },
                "Tracking updated successfully",
            ),
        );
});

const cancelOrder = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);
    if (!order) {
        throw new APIerror(404, "Order not found");
    }
    if (order.user?.toString() !== req.user._id.toString()) {
        throw new APIerror(403, "You can only cancel your own orders");
    }
    if (order.orderStatus === "cancelled") {
        throw new APIerror(400, "Order is already cancelled");
    }
    if (order.orderStatus === "delivered") {
        throw new APIerror(400, "Delivered orders cannot be cancelled");
    }
    const hoursSinceOrder = (Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60 * 60);
    if (hoursSinceOrder > 24) {
        throw new APIerror(400, "Orders can only be cancelled within 24 hours of placing them");
    }
    order.orderStatus = "cancelled";
    await order.save({ validateBeforeSave: false });
    return res
        .status(200)
        .json(new APIresponse(200, { order }, "Order cancelled successfully"));
});

const createOrderPayment = asyncHandler(async (req, res) => {
    const { totalAmount } = req.body;
    if (!totalAmount || totalAmount <= 0) {
        throw new APIerror(400, "Valid total amount is required");
    }
    const razorpayOrder = await createRazorpayOrder({
        amount: totalAmount,
        receipt: "order_" + Date.now(),
        notes: { userId: req.user._id.toString(), type: "regular" },
    });
    return res
        .status(200)
        .json(
            new APIresponse(
                200,
                {
                    razorpayOrderId: razorpayOrder.id,
                    amount: razorpayOrder.amount,
                    currency: razorpayOrder.currency,
                    keyId: getRazorpayKeyId(),
                },
                "Razorpay order created"
            )
        );
});

const verifyOrderPayment = asyncHandler(async (req, res) => {
    const {
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        items,
        shippingAddress,
        totalAmount,
    } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
        throw new APIerror(400, "Missing payment verification details");
    }

    const isValid = verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
    if (!isValid) {
        throw new APIerror(400, "Payment verification failed. Signature mismatch.");
    }

    if (!items || items.length === 0) {
        throw new APIerror(400, "Order must contain at least one item");
    }
    if (!shippingAddress || totalAmount === undefined) {
        throw new APIerror(400, "Shipping address and total amount are required");
    }

    const order = await Order.create({
        user: req.user._id,
        items,
        totalAmount,
        shippingAddress,
        paymentStatus: "paid",
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        paidAt: new Date(),
        orderStatus: "placed",
    });

    await User.findByIdAndUpdate(req.user._id, { $set: { cart: [] } });

    return res
        .status(201)
        .json(new APIresponse(201, { order }, "Payment verified and order placed successfully"));
});

const handleRazorpayWebhook = asyncHandler(async (req, res) => {
    const signature = req.headers["x-razorpay-signature"];
    if (!signature) {
        return res.status(400).json({ success: false, message: "Missing signature" });
    }
    const body = JSON.stringify(req.body);
    const isValid = verifyWebhookSignature(body, signature);
    if (!isValid) {
        return res.status(400).json({ success: false, message: "Invalid signature" });
    }
    const event = req.body.event;
    if (event === "payment.captured") {
        const payment = req.body.payload.payment.entity;
        await Order.findOneAndUpdate(
            { razorpayOrderId: payment.order_id },
            {
                paymentStatus: "paid",
                razorpayPaymentId: payment.id,
                razorpaySignature: payment.signature || "",
                paidAt: new Date(),
            },
            { new: true }
        );
    }
    return res.status(200).json({ success: true });
});

export {
    createOrder,
    getMyOrders,
    getOrderById,
    getAllOrders,
    updateOrderStatus,
    addTrackingEvent,
    cancelOrder,
    createOrderPayment,
    verifyOrderPayment,
    handleRazorpayWebhook,
};
