import mongoose, {Schema} from "mongoose";

const productSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            required: true,
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
            required: true,
            min: 0
        },
        attributes: {
            flavour: [{
                type: String,
                enum: ["Sweet & Creamy", "Nutty & Crunchy", "Fruity & Refreshing", "Intensely Rich & Chocolately"]
            }],
            intensity: [{
                type: String,
                enum: ["Mild & Sweet", "Balanced Dark", "Deep & Bold", "Ultra Intense"]
            }],
            occasions: [{
                type: String,
                enum: ["Personal Use", "Gifting", "Birthday", "Anniversary", "Valentine's Day", "Raksha Bandhan", "Diwali", "Christmas", "New Year"]
            }]
        },
        collection: {
            type: String,
            enum: ["Classic", "Signature", "Royale", "None"]
        },
        customQuestions: [
            {
                label: {
                    type: String,
                    required: true,
                    trim: true
                },
                required: {
                    type: Boolean
                },
                options: [
                    {
                        optionNumber: {
                            type: Number,
                            required: true,
                            trim: true
                        },
                        optionText: {
                            type: String,
                            required: true,
                            trim: true
                        }
                    }
                ]
            }
        ],
        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

export const Product = mongoose.model("Product", productSchema);