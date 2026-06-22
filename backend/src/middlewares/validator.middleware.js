import { validationResult } from "express-validator";

export const validate = (req, res, next) => {
    const errors = validationResult(req);

    if (errors.isEmpty()) return next();

    const extractedErrors = errors.array().map((err) => ({
        param: err.param || err.path,
        msg: err.msg,
        value: err.value,
    }));

    return res.status(422).json({
        status: "fail",
        message: "Received data is not valid",
        errors: extractedErrors,
    });
};
