import mongoose, {Schema} from "mongoose";

const orderSchema = new Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        items: [
            {
                itemType: {
                    type: String,
                    required: true,
                    enum: ["product", "customization"]
                },
                productSnapshot: {
                    id: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "Product"
                    },
                    name: {
                        type: String,
                        trim: true
                    },
                    description: {
                        type: String,
                        trim: true
                    },
                    images: [
                        {
                            type: String,
                            trim: true
                        }
                    ],
                    price: {
                        type: Number,
                        min: 0
                    },
                    customQuestionAnswer: [
                        {
                            question: {
                                type: String
                            },
                            answer: {
                                type: String
                            }
                        }
                    ],
                    giftPackaging: {
                        type: Boolean,
                        default: false
                    },
                    message: {
                        type: String,
                        trim: true
                    }
                },
                customizationSnapshot: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Custom"
                },
                quantity: {
                    type: Number,
                    required: true,
                    trim: true,
                    min: 1
                },
                itemTotal: {
                    type: Number,
                    required: true,
                    trim: true,
                    min: 0
                }
            }
        ],
        totalAmount: {
            type: Number,
            required: true,
            trim: true,
            min: 0
        },
        shippingAddress: {
            name: {
                type: String,
                required: [true, "Name is required"],
                trim: true
            },
            phone: {
                type: String,
                required: [true, "Phone number is required"],
                trim: true
            },
            line: {
                type: String,
                required: [true, "Address line is required"],
                trim: true
            },
            city: {
                type: String, 
                required: [true, "Address city is required"],
                trim: true
            },
            state: {
                type: String,
                required: [true, "Address state is required"],
                trim: true
            },
            pincode: {
                type: String,
                required: [true, "Address pincode is required"],
                trim: true
            }
        },
        paymentStatus: {
            type: String,
            enum: ["pending", "paid", "failed"],
            default: "pending"
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
        },
        trackingId: {
            type: String,
            trim: true
        },
        trackingLink: {
            type: String,
            trim: true
        },
        shippedAt: {
            type: Date
        },
        trackingEmailSentAt: {
            type: Date
        }
    },
    {
        timestamps: true
    }
);

export const Order = mongoose.model("Order",orderSchema);