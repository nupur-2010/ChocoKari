import { Router } from "express";
import {
    registerUser,
    loginUser,
    logoutUser,
    getUser,
    verifyEmail,
    resendOtp,
    refreshAccessToken,
    forgotPasswordRequest,
    resetPassword,
    googleAuth,
    linkGoogleAccount
} from "../controllers/user.controller.js";
import {
    registerValidator,
    loginValidator,
    forgotPasswordValidator,
    resetPasswordValidator,
} from "../validators/index.js";
import { verifyJWT } from "../middlewares/user.middleware.js";
import { validate } from "../middlewares/validator.middleware.js";

const router = Router();

router.route("/register").post(registerValidator(), validate, registerUser);
router.route("/login").post(loginValidator(), validate, loginUser);
router.route("/google-auth").post(googleAuth);
router.route("/google-link").post(verifyJWT, linkGoogleAccount);
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/me").get(verifyJWT, getUser);
router.route("/verify-email").post(verifyEmail);
router.route("/resend-otp").post(resendOtp);
router.route("/refresh-token").post(refreshAccessToken);
router
    .route("/forgot-password")
    .post(forgotPasswordValidator(), validate, forgotPasswordRequest);
router
    .route("/reset-password/:unhashedToken")
    .post(resetPasswordValidator(), validate, resetPassword);

export default router;
