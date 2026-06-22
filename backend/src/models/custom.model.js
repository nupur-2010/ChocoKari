import mongoose, {Schema} from "mongoose";

const customSchema = new Schema(
    {
        box: {
            type: String,
            required: true,
            enum: ["Classic", "Signature", "Royale"]
        },
        size: {
            type: Number,
            required: true,
            enum: [6, 9, 12, 16, 18]
        },
        chocolates: {
            flavour: {
                type: String,
                required: true,
                enum: ["Roasted Almond", "Hazelnut", "Kunafa", "Biscoff", "Royal Rose", "Cranberry", "Paan", "Oreo Delight", "Fresh Mint", "Bounty Coconut", "Crackle", "Intense Dark"]
            },
            quantity: {
                type: Number,
                required: true,
                trim: true,
                min: 2
            }
        },
        preferredIntensity: {
            type: String,
            required: true,
            enum: ["Balanced Dark", "Deep & Bold"]
        },
        stickers: {
            type: String,
            required: true,
            enum: ["Flavour", "Birthday", "Anniversary", "Valentine's Day", "Raksha Bandhan", "Diwali", "Christmas", "New Year"]
        },
        giftPackaging: {
            type: Boolean,
            default: false
        },
        message: {
            type: String,
            trim: true
        },
        arrangement: [
            {
                flavour: {
                    type: String,
                    required: true,
                    trim: true
                }
            }
        ],
        price: {
            type: Number,
            required: true,
            min: 0
        }
    },
    {
        timestamps: true
    }
);

export const Custom = mongoose.model("Custom", customSchema);