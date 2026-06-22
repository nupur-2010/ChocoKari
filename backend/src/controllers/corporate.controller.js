import { Corporate } from "../models/corporate.model.js";
import { Product } from "../models/product.model.js";
import { Custom } from "../models/custom.model.js";
import { APIresponse } from "../utils/api-response.js";
import { APIerror } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { createRazorpayOrder, verifyRazorpaySignature, getRazorpayKeyId } from "../utils/razorpay.js";
import { uploadImage, isBase64Image } from "../utils/cloudinary.js";

const createCorporateOrder = asyncHandler(async (req, res) => {
    const {
        orderType,
        productId,
        customizationPayload,
        quantity,
        companyName,
        companyLogo,
        corporateMessage,
        deliveryMode,
        address,
        recipientsList,
    } = req.body || {};

    if (!orderType || !quantity || !companyName || !companyLogo || !corporateMessage || !deliveryMode) {
        throw new APIerror(400, "Missing required corporate order fields");
    }

    if (quantity < 15) {
        throw new APIerror(400, "Minimum order quantity is 15 boxes");
    }

    if (orderType === "product" && !productId) {
        throw new APIerror(400, "Product is required for product-based corporate order");
    }

    if (deliveryMode === "single_address" && (!address || !address.name || !address.phone)) {
        throw new APIerror(400, "Address is required for single address delivery");
    }

    if (deliveryMode === "multiple_address" && !recipientsList) {
        throw new APIerror(400, "Recipients list is required for multiple address delivery");
    }

    const uploadedLogo = isBase64Image(companyLogo)
        ? await uploadImage(companyLogo, "ChocoKari/logos")
        : companyLogo;

    let unitPrice = 0;
    let savedCustomizationId = null;
    let savedProductId = null;

    if (orderType === "product") {
        const product = await Product.findById(productId);
        if (!product) {
            throw new APIerror(404, "Product not found");
        }
        if (product.isActive === false) {
            throw new APIerror(400, "Selected product is not available");
        }
        unitPrice = product.price;
        savedProductId = product._id;
    } else if (orderType === "customization") {
        if (!customizationPayload) {
            throw new APIerror(400, "Customization payload is required");
        }
        const custom = await Custom.create(customizationPayload);
        savedCustomizationId = custom._id;
        unitPrice = custom.price;
    }

    const totalAmount = unitPrice * quantity;

    let corporate;
    try {
        corporate = await Corporate.create({
            user: req.user?._id,
            orderType,
            productId: savedProductId,
            customizationId: savedCustomizationId,
            quantity,
            companyName,
            companyLogo: uploadedLogo,
            corporateMessage,
            deliveryMode,
            address: deliveryMode === "single_address" ? (address?.name ? address : undefined) : undefined,
            recipientsList: deliveryMode === "multiple_address" ? (recipientsList || "list-uploaded") : undefined,
            totalAmount,
        });
    } catch (dbErr) {
        console.error("Corporate.create error:", dbErr.message);
        console.error("Payload that failed:", { orderType, savedProductId, savedCustomizationId, quantity, companyName, deliveryMode });
        throw new APIerror(500, `Database error: ${dbErr.message}`);
    }

    return res
        .status(201)
        .json(
            new APIresponse(
                201,
                { corporate, totalAmount, unitPrice },
                "Corporate order placed successfully",
            ),
        );
});

const getAllCorporateOrders = asyncHandler(async (req, res) => {
    const orders = await Corporate.find()
        .populate("user", "fullname email")
        .populate("productId", "name price images")
        .populate("customizationId")
        .sort({ createdAt: -1 });
    return res
        .status(200)
        .json(new APIresponse(200, { orders }, "Corporate orders fetched successfully"));
});

const getMyCorporateOrders = asyncHandler(async (req, res) => {
    const orders = await Corporate.find({ user: req.user._id })
        .populate("user", "fullname email")
        .populate("productId", "name price images")
        .populate("customizationId")
        .sort({ createdAt: -1 });
    return res
        .status(200)
        .json(new APIresponse(200, { orders }, "Your corporate orders fetched successfully"));
});

const getCorporateOrderById = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const order = await Corporate.findById(orderId)
        .populate("user", "fullname email")
        .populate("productId", "name");
    if (!order) {
        throw new APIerror(404, "Corporate order not found");
    }
    return res
        .status(200)
        .json(new APIresponse(200, { order }, "Corporate order fetched successfully"));
});

const updateCorporateOrderStatus = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const { paymentStatus, orderStatus } = req.body;
    const order = await Corporate.findById(orderId);
    if (!order) {
        throw new APIerror(404, "Corporate order not found");
    }
    if (paymentStatus) order.paymentStatus = paymentStatus;
    if (orderStatus) order.orderStatus = orderStatus;
    await order.save({ validateBeforeSave: false });
    return res
        .status(200)
        .json(new APIresponse(200, { order }, "Corporate order updated successfully"));
});

const cancelCorporateOrder = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const order = await Corporate.findById(orderId);
    if (!order) {
        throw new APIerror(404, "Corporate order not found");
    }
    if (order.user?.toString() !== req.user._id.toString()) {
        throw new APIerror(403, "You can only cancel your own corporate orders");
    }
    if (order.orderStatus === "cancelled") {
        throw new APIerror(400, "Corporate order is already cancelled");
    }
    if (order.orderStatus === "delivered") {
        throw new APIerror(400, "Delivered corporate orders cannot be cancelled");
    }
    const hoursSinceOrder = (Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60 * 60);
    if (hoursSinceOrder > 24) {
        throw new APIerror(400, "Corporate orders can only be cancelled within 24 hours of placing them");
    }
    order.orderStatus = "cancelled";
    await order.save({ validateBeforeSave: false });
    return res
        .status(200)
        .json(new APIresponse(200, { order }, "Corporate order cancelled successfully"));
});

const createCorporatePayment = asyncHandler(async (req, res) => {
    const { totalAmount } = req.body;
    if (!totalAmount || totalAmount <= 0) {
        throw new APIerror(400, "Valid total amount is required");
    }
    const razorpayOrder = await createRazorpayOrder({
        amount: totalAmount,
        receipt: "corporate_" + Date.now(),
        notes: { userId: req.user._id.toString(), type: "corporate" },
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
                "Razorpay corporate order created"
            )
        );
});

const verifyCorporatePayment = asyncHandler(async (req, res) => {
    const {
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        orderType,
        productId,
        customizationPayload,
        quantity,
        companyName,
        companyLogo,
        corporateMessage,
        deliveryMode,
        address,
        recipientsList,
        totalAmount,
    } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
        throw new APIerror(400, "Missing payment verification details");
    }

    const isValid = verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
    if (!isValid) {
        throw new APIerror(400, "Payment verification failed. Signature mismatch.");
    }

    if (!orderType || !quantity || !companyName || !companyLogo || !corporateMessage || !deliveryMode) {
        throw new APIerror(400, "Missing required corporate order fields");
    }

    if (quantity < 15) {
        throw new APIerror(400, "Minimum order quantity is 15 boxes");
    }

    if (orderType === "product" && !productId) {
        throw new APIerror(400, "Product is required for product-based corporate order");
    }

    if (deliveryMode === "single_address" && (!address || !address.name || !address.phone)) {
        throw new APIerror(400, "Address is required for single address delivery");
    }

    if (deliveryMode === "multiple_address" && !recipientsList) {
        throw new APIerror(400, "Recipients list is required for multiple address delivery");
    }

    const uploadedLogo = isBase64Image(companyLogo)
        ? await uploadImage(companyLogo, "ChocoKari/logos")
        : companyLogo;

    let unitPrice = 0;
    let savedCustomizationId = null;
    let savedProductId = null;

    if (orderType === "product") {
        const product = await Product.findById(productId);
        if (!product) {
            throw new APIerror(404, "Product not found");
        }
        if (product.isActive === false) {
            throw new APIerror(400, "Selected product is not available");
        }
        unitPrice = product.price;
        savedProductId = product._id;
    } else if (orderType === "customization") {
        if (!customizationPayload) {
            throw new APIerror(400, "Customization payload is required");
        }
        const custom = await Custom.create(customizationPayload);
        savedCustomizationId = custom._id;
        unitPrice = custom.price;
    }

    const calculatedTotal = unitPrice * quantity;

    const corporate = await Corporate.create({
        user: req.user._id,
        orderType,
        productId: savedProductId,
        customizationId: savedCustomizationId,
        quantity,
        companyName,
        companyLogo: uploadedLogo,
        corporateMessage,
        deliveryMode,
        address: deliveryMode === "single_address" ? (address?.name ? address : undefined) : undefined,
        recipientsList: deliveryMode === "multiple_address" ? (recipientsList || "list-uploaded") : undefined,
        totalAmount: calculatedTotal,
        paymentStatus: "Paid",
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        paidAt: new Date(),
        orderStatus: "placed",
    });

    return res
        .status(201)
        .json(
            new APIresponse(
                201,
                { corporate, totalAmount: calculatedTotal, unitPrice },
                "Payment verified and corporate order placed successfully"
            )
        );
});

export {
    createCorporateOrder,
    getAllCorporateOrders,
    getCorporateOrderById,
    getMyCorporateOrders,
    updateCorporateOrderStatus,
    cancelCorporateOrder,
    createCorporatePayment,
    verifyCorporatePayment,
};
