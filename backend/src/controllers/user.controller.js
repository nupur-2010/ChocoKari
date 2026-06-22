import { User } from "../models/user.model.js";
import { APIresponse } from "../utils/api-response.js";
import { APIerror } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import {
    sendEmail,
    verifyMailgenContent,
    forgotPasswordMailgenContent,
} from "../utils/mail.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateAccessRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken };
    } catch (error) {
        throw new APIerror(
            500,
            "Something went wrong while generating access and refresh tokens",
        );
    }
};

const registerUser = asyncHandler(async (req, res) => {
    const { fullname, email, password } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) {
        if (!userExists.isEmailVerified) {
            return res.status(409).json({
                success: false,
                statusCode: 409,
                message: "User already exists but email is not verified. Please verify your email.",
                code: "EMAIL_NOT_VERIFIED",
                email: userExists.email,
            });
        }
        throw new APIerror(409, "User already exists");
    }
    const otp = Math.floor(Math.random() * 900000 + 100000).toString();
    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");
    const user = await User.create({ fullname, email, password });
    user.otp = hashedOtp;
    user.otpExpire = new Date(Date.now() + 5 * 60 * 1000);
    user.lastOtpSentAt = new Date();
    user.otpAttempts = user.otpAttempts + 1;
    await user.save({ validateBeforeSave: false });
    await sendEmail({
        email: user?.email,
        subject: "Verify your email",
        mailgenContent: verifyMailgenContent(user?.fullname, otp),
    });
    const userCreated = await User.findById(user._id).select(
        "-password -refreshToken",
    );
    if (!userCreated) {
        throw new APIerror(
            500,
            "Something went wrong while registering the user",
        );
    }
    return res
        .status(201)
        .json(
            new APIresponse(
                201,
                { user: userCreated },
                "User registered successfully and verification email has been sent",
            ),
        );
});

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        throw new APIerror(400, "User is not registered");
    }
    if (user.authProvider === "google" && !user.password) {
        throw new APIerror(400, "This account uses Google sign-in. Please use Google to sign in.");
    }
    if (!user.isEmailVerified) {
        throw new APIerror(403, "Email not verified");
    }
    const validPassword = await user.isPasswordCorrect(password);
    if (!validPassword) {
        throw new APIerror(400, "Invalid password");
    }
    const { accessToken, refreshToken } = await generateAccessRefreshTokens(
        user._id,
    );
    const userLoggedIn = await User.findById(user._id).select(
        "-password -refreshToken",
    );
    const options = {
        httpOnly: true,
        secure: true,
    };
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new APIresponse(
                200,
                { user: userLoggedIn, accessToken, refreshToken },
                "User logged in successfully",
            ),
        );
});

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: "",
            },
        },
        {
            new: true,
        },
    );
    const options = {
        httpOnly: true,
        secure: true,
    };
    res.status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new APIresponse(200, {}, "User logged out successfully"));
});

const getUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(
            new APIresponse(200, { user: req.user }, "User found successfully"),
        );
});

const verifyEmail = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;
    if (!otp || otp.trim() === "") {
        throw new APIerror(400, "OTP is required");
    }
    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");
    const user = await User.findOne({ email });
    if (!user) {
        throw new APIerror(400, "Incorrect email");
    }
    if (user.isEmailVerified) {
        throw new APIerror(400, "Email already verified");
    }
    if (user.otpExpire.getTime() < Date.now()) {
        throw new APIerror(400, "OTP has expired");
    }
    if (user.otp !== hashedOtp) {
        throw new APIerror(400, "Incorrect OTP");
    }
    user.isEmailVerified = true;
    user.otp = undefined;
    user.otpExpire = undefined;
    user.lastOtpSentAt = undefined;
    user.otpAttempts = undefined;
    user.otpBlockedTill = undefined;
    await user.save({ validateBeforeSave: false });
    return res
        .status(200)
        .json(
            new APIresponse(
                200,
                { isEmailVerified: true },
                "Email verified successfully",
            ),
        );
});

const resendOtp = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        throw new APIerror(400, "Incorrect email");
    }
    if (user.isEmailVerified) {
        throw new APIerror(400, "Email already verified");
    }
    if (user.otpBlockedTill && Date.now() < user.otpBlockedTill) {
        throw new APIerror(400, "OTP is blocked");
    }
    if (
        user.lastOtpSentAt &&
        Date.now() - user.lastOtpSentAt.getTime() < 30 * 1000
    ) {
        throw new APIerror(429, "Wait for sending another OTP");
    }
    const otp = Math.floor(Math.random() * 900000 + 100000).toString();
    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");
    user.otp = hashedOtp;
    user.otpExpire = new Date(Date.now() + 5 * 60 * 1000);
    user.lastOtpSentAt = new Date();
    user.otpAttempts = user.otpAttempts + 1;
    if (user.otpAttempts >= 5) {
        user.otpBlockedTill = new Date(Date.now() + 10 * 60 * 1000);
        user.otpAttempts = 0;
    }
    await user.save({ validateBeforeSave: false });
    await sendEmail({
        email: user.email,
        subject: "Verify your email",
        mailgenContent: verifyMailgenContent(user.fullname, otp),
    });
    res.status(200).json(
        new APIresponse(200, {}, "New OTP has been sent to your email"),
    );
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken =
        req.cookies.refreshToken || req.body.refreshToken;
    if (!incomingRefreshToken) {
        throw new APIerror(401, "Unauthorized access");
    }
    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET,
        );
        const user = await User.findById(decodedToken._id).select(
            "+refreshToken",
        );
        if (!user) {
            throw new APIerror(401, "Invalid refresh token");
        }
        if (incomingRefreshToken !== user.refreshToken) {
            throw new APIerror(401, "Refresh token has expired");
        }
        const { accessToken, refreshToken } = await generateAccessRefreshTokens(
            user._id,
        );
        const options = {
            httpOnly: true,
            secure: true,
        };
        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new APIresponse(
                    200,
                    { accessToken, refreshToken },
                    "Access token refreshed successfully",
                ),
            );
    } catch (error) {
        throw new APIerror(401, "Invalid refresh token");
    }
});

const forgotPasswordRequest = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        throw new APIerror(404, "User does not exist");
    }
    if (user.authProvider === "google" && !user.password) {
        throw new APIerror(400, "This account uses Google sign-in. Password reset is not available.");
    }
    const { unhashedToken, hashedToken, expiryTime } =
        user.generateTemporaryToken();
    user.forgotPasswordToken = hashedToken;
    user.forgotPasswordExpiry = expiryTime;
    await user.save({ validateBeforeSave: false });
    await sendEmail({
        email: user.email,
        subject: "Password reset request",
        mailgenContent: forgotPasswordMailgenContent(
            user.fullname,
            `${process.env.FORGOT_PASSWORD_REDIRECT_URL}/${unhashedToken}`,
        ),
    });
    return res
        .status(200)
        .json(
            new APIresponse(200, {}, "Reset password email sent successfully"),
        );
});

const resetPassword = asyncHandler(async (req, res) => {
    const { password } = req.body;
    const hashedToken = crypto
        .createHash("sha256")
        .update(req.params.unhashedToken)
        .digest("hex");
    const user = await User.findOne({
        forgotPasswordToken: hashedToken,
        forgotPasswordExpiry: { $gt: Date.now() },
    });
    if (!user) {
        throw new APIerror(
            400,
            "Forgot password token is invalid or has expired",
        );
    }
    user.password = password;
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;
    await user.save();
    return res
        .status(200)
        .json(new APIresponse(200, {}, "Password reset successful"));
});

const verifyGoogleToken = async (credential) => {
    if (!process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID === "PLACEHOLDER_REPLACE_WITH_YOUR_GOOGLE_CLIENT_ID") {
        throw new APIerror(500, "Google sign-in is not configured on the server");
    }
    const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
        throw new APIerror(400, "Invalid Google token");
    }
    return {
        googleId: payload.sub,
        email: payload.email,
        name: payload.name || payload.email.split("@")[0],
        emailVerified: payload.email_verified || false,
    };
};

const googleAuth = asyncHandler(async (req, res) => {
    const { credential } = req.body;
    if (!credential) {
        throw new APIerror(400, "Google credential is required");
    }

    const googleData = await verifyGoogleToken(credential);

    let user = await User.findOne({ googleId: googleData.googleId });
    if (!user) {
        user = await User.findOne({ email: googleData.email });
        if (user) {
            if (user.authProvider === "local") {
                user.googleId = googleData.googleId;
                user.authProvider = "google";
                user.isEmailVerified = true;
                await user.save({ validateBeforeSave: false });
            }
        } else {
            user = await User.create({
                fullname: googleData.name,
                email: googleData.email,
                googleId: googleData.googleId,
                authProvider: "google",
                isEmailVerified: true,
            });
        }
    } else {
        user.isEmailVerified = true;
        await user.save({ validateBeforeSave: false });
    }

    if (!user) {
        throw new APIerror(500, "Failed to create or find user");
    }

    const { accessToken, refreshToken } = await generateAccessRefreshTokens(user._id);
    const userLoggedIn = await User.findById(user._id).select("-password -refreshToken");
    const options = {
        httpOnly: true,
        secure: true,
    };
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new APIresponse(
                200,
                { user: userLoggedIn, accessToken, refreshToken },
                "Google sign-in successful",
            ),
        );
});

const linkGoogleAccount = asyncHandler(async (req, res) => {
    const { credential } = req.body;
    if (!credential) {
        throw new APIerror(400, "Google credential is required");
    }

    const googleData = await verifyGoogleToken(credential);

    const existing = await User.findOne({ googleId: googleData.googleId });
    if (existing && existing._id.toString() !== req.user._id.toString()) {
        throw new APIerror(409, "This Google account is already linked to another user");
    }

    const user = await User.findById(req.user._id);
    if (!user) {
        throw new APIerror(404, "User not found");
    }

    if (user.googleId && user.googleId !== googleData.googleId) {
        throw new APIerror(400, "Your account is already linked to a different Google account");
    }

    user.googleId = googleData.googleId;
    user.authProvider = "google";
    user.isEmailVerified = true;
    await user.save({ validateBeforeSave: false });

    const userLoggedIn = await User.findById(user._id).select("-password -refreshToken");
    return res
        .status(200)
        .json(
            new APIresponse(
                200,
                { user: userLoggedIn },
                "Google account linked successfully",
            ),
        );
});

export {
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
};
