import { body } from "express-validator";

const registerValidator = () => {
    return [
        body("fullname")
            .trim()
            .notEmpty()
            .withMessage("Full name is required")
            .isLength({ min: 3, max: 50 })
            .withMessage("Full name must be between 3 and 50 characters")
            .matches(/^[A-Za-z\s]+$/)
            .withMessage("Full name can only contain letters and spaces"),
        body("email")
            .trim()
            .notEmpty()
            .withMessage("Email is required")
            .isEmail()
            .withMessage("Invalid email format"),
        body("password")
            .trim()
            .notEmpty()
            .withMessage("Password is required")
            .isLength({ min: 8, max: 20 })
            .withMessage("Password length must be between 8 to 20 characters")
            .matches(/[A-Z]/)
            .withMessage("Password must contain at least one uppercase letter")
            .matches(/[a-z]/)
            .withMessage("Password must contain at least one lowercase letter")
            .matches(/[0-9]/)
            .withMessage("Password must contain at least one number")
            .matches(/[@$!%*?&]/)
            .withMessage(
                "Password must contain at least one special character (@, $, !, %, *, ?, &)",
            ),
    ];
};

const loginValidator = () => {
    return [
        body("email")
            .trim()
            .notEmpty()
            .withMessage("Email is required")
            .isEmail()
            .withMessage("Invalid email format"),
        body("password").trim().notEmpty().withMessage("Password is required"),
    ];
};

const forgotPasswordValidator = () => {
    return [
        body("email")
            .trim()
            .notEmpty()
            .withMessage("Email is required")
            .isEmail()
            .withMessage("Invalid email format"),
    ];
};

const resetPasswordValidator = () => {
    return [
        body("password")
            .trim()
            .notEmpty()
            .withMessage("Password is required")
            .isLength({ min: 8, max: 20 })
            .withMessage("Password length must be between 8 to 20 characters")
            .matches(/[A-Z]/)
            .withMessage("Password must contain at least one uppercase letter")
            .matches(/[a-z]/)
            .withMessage("Password must contain at least one lowercase letter")
            .matches(/[0-9]/)
            .withMessage("Password must contain at least one number")
            .matches(/[@$!%*?&]/)
            .withMessage(
                "Password must contain at least one special character (@, $, !, %, *, ?, &)",
            ),
    ];
};

export {
    registerValidator,
    loginValidator,
    forgotPasswordValidator,
    resetPasswordValidator,
};
