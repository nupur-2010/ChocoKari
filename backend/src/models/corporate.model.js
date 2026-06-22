import mongoose, {Schema} from "mongoose";

const corporateSchema = new Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        orderType: {
            type: String,
            required: true,
            enum: ["product", "customization"]
        },
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product"
        },
        customizationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Custom"
        },
        quantity: {
            type: Number,
            required: true,
            trim: true,
            min: 15
        },
        companyName: {
            type: String,
            required: true,
            trim: true
        },
        companyLogo: {
            type: String,
            required: true,
            trim: true
        },
        corporateMessage: {
            type: String,
            required: true,
            trim: true
        },
        deliveryMode: {
            type: String,
            required: true,
            enum: ["single_address", "multiple_address"]
        },
        address: {
            name: { type: String, trim: true },
            phone: { type: String, trim: true },
            line: { type: String, trim: true },
            city: { type: String, trim: true },
            state: { type: String, trim: true },
            pincode: { type: String, trim: true }
        },
        recipientsList: {
            type: String,
            trim: true
        },
        totalAmount: {
            type: Number,
            required: true,
            trim: true
        },
        paymentStatus: {
            type: String,
            default: "Pending",
            enum: ["Pending", "Paid", "Failed"]
        },
        razorpayOrderId: {
            type: String,
            trim: true
        },
        razorpayPaymentId: {
            type: String,
            trim: true
        },
        razorpaySignature: {
            type: String,
            trim: true
        },
        paidAt: {
            type: Date
        },
        orderStatus: {
            type: String,
            enum: ["placed", "processing", "packed", "shipped", "delivered", "cancelled"],
            default: "placed"
        }
    },
    {
        timestamps: true
    }
);

export const Corporate = mongoose.model("Corporate", corporateSchema);