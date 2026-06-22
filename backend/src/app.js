import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { handleRazorpayWebhook } from "./controllers/order.controller.js";

const app = express();

app.post(
    "/order/payment/webhook",
    express.raw({ type: "application/json" }),
    (req, res, next) => {
        req.body = req.body.toString();
        const event = JSON.parse(req.body);
        req.body = event;
        next();
    },
    handleRazorpayWebhook
);

app.use(express.json({limit: "10mb"}));
app.use(express.urlencoded({extended: true, limit: "10mb"}));
app.use(cors({
    origin: (origin, callback) => callback(null, true),
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Authorization", "Content-Type", "Accept", "Origin", "X-Requested-With", "X-Razorpay-Signature"],
}));
app.use(cookieParser());

import userRouter from "./routes/user.route.js";
import productRouter from "./routes/product.route.js";
import customRouter from "./routes/custom.route.js";
import corporateRouter from "./routes/corporate.route.js";
import orderRouter from "./routes/order.route.js";
import reviewRouter from "./routes/review.route.js";
import wishlistRouter from "./routes/wishlist.route.js";
import cartRouter from "./routes/cart.route.js";
import addressRouter from "./routes/address.route.js";
import adminRouter from "./routes/admin.route.js";

app.use("/user", userRouter);
app.use("/product", productRouter);
app.use("/custom", customRouter);
app.use("/corporate", corporateRouter);
app.use("/order", orderRouter);
app.use("/review", reviewRouter);
app.use("/wishlist", wishlistRouter);
app.use("/cart", cartRouter);
app.use("/address", addressRouter);
app.use("/admin", adminRouter);

app.use((err, req, res, next) => {
    console.error("=== BACKEND ERROR ===");
    console.error("Path:", req.method, req.originalUrl);
    console.error("Status:", err.statusCode || 500);
    console.error("Message:", err.message);
    if (err.stack) console.error("Stack:", err.stack);
    console.error("=== END ERROR ===");
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        statusCode,
        message: err.message || "Internal server error",
        errors: err.errors || [],
    });
});

export {app};
