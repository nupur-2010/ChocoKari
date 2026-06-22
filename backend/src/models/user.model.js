import mongoose, {Schema} from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const userSchema = new Schema(
    {
        fullname: {
            type: String,
            required: [true, "Fullname is required"],
            trim: true
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            trim: true,
            unique: true,
            lowercase: true
        },
        password: {
            type: String,
            required: false,
            trim: true
        },
        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user"
        },
        authProvider: {
            type: String,
            enum: ["local", "google"],
            default: "local"
        },
        googleId: {
            type: String,
            sparse: true,
            unique: true
        },
        isEmailVerified: {
            type: Boolean,
            default: false
        },
        forgotPasswordToken: {
            type: String
        },
        forgotPasswordExpiry: {
            type: Date
        },
        otp: {
            type: String
        },
        otpExpire: {
            type: Date
        },
        lastOtpSentAt: {
            type: Date
        },
        otpAttempts: {
            type: Number,
            default: 0
        },
        otpBlockedTill: {
            type: Date
        },
        refreshToken: {
            type: String
        },
        address: [
            {
                label: {
                    type: String,
                    required: [true, "Address label is required"],
                    trim: true
                },
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
                },
                isDefault: {
                    type: Boolean,
                    default: false
                }
            }
        ],
        wishlist: [
            {
                itemType: {
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
                }
            }
        ],
        cart: [
            {
                itemType: {
                    type: String,
                    required: true,
                    enum: ["product", "customization"]
                },
                productId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product"
                },
                customizationId:{
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Custom"
                },
                quantity: {
                    type: Number,
                    default: 1,
                    min: 1
                },
                customQuestionAnswer: [
                    {
                        question: { type: String },
                        answer: { type: String }
                    }
                ],
                giftPackaging: {
                    type: Boolean,
                    default: false
                },
                message: {
                    type: String,
                    default: ""
                }
            }
        ]
    },
    {
        timestamps: true
    }
);

userSchema.pre("save", async function () {
    if (!this.isModified("password") || !this.password) return;
    this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.isPasswordCorrect = async function (password) {
    if (!this.password) return false;
    return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    );
};

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    );
};

userSchema.methods.generateTemporaryToken = function () {
    const unhashedToken = crypto.randomBytes(20).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(unhashedToken).digest("hex");
    const expiryTime = Date.now() + 10 * 60 * 1000;
    return {unhashedToken, hashedToken, expiryTime};
};

export const User = mongoose.model("User", userSchema);