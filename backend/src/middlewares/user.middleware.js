import { User } from "../models/user.model.js";
import { APIerror } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import jwt from "jsonwebtoken";

export const verifyJWT = asyncHandler(async (req, res, next) => {
    const token =
        req.cookies?.accessToken ||
        req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
        throw new APIerror(401, "Session expired. Please sign in again.");
    }
    try {
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedToken?._id).select(
            "-password -refreshToken",
        );
        if (!user) {
            throw new APIerror(401, "User not found. Please sign in again.");
        }
        req.user = user;
        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            throw new APIerror(401, "Session expired. Please sign in again.");
        }
        throw new APIerror(401, "Invalid session. Please sign in again.");
    }
});
