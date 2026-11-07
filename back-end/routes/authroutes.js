
import express from "express";

import {
    register,
    verifycode,
    login,
    forgotpassword,
    verifyinglogin,
    logout
} from "../controllers/registerandlogin.js";

import { verify } from "../middleware/jwt.js";
import { validate } from "../middleware/validate.js";

import {
    registerSchema,
    verifyEmailSchema,
    loginSchema,
    forgotPasswordSchema,
    resetPasswordSchema
} from "../middleware/validators/authValidator.js";

import {
    registerLimiter,
    verifyEmailLimiter,
    loginLimiter,
    forgotPasswordLimiter,
    resetPasswordLimiter
} from "../middleware/rateLimit.js";

const router = express.Router();

// REGISTER
router.post(
    "/register",
    registerLimiter,
    validate(registerSchema),
    register
);

// VERIFY EMAIL
router.post(
    "/verify",
    verifyEmailLimiter,
    validate(verifyEmailSchema),
    verifycode
);

// LOGIN
router.post(
    "/login",
    loginLimiter,
    validate(loginSchema),
    login
);

// FORGOT PASSWORD
router.post(
    "/forgot-password",
    forgotPasswordLimiter,
    validate(forgotPasswordSchema),
    forgotpassword
);

// RESET PASSWORD
router.post(
    "/reset-password",
    resetPasswordLimiter,
    validate(resetPasswordSchema),
    verifyinglogin
);

// CHECK ACTIVITY AND EXTEND SESSION
router.post(
    "/activity",
    verify,
    (req, res) => {
        return res.status(200).json({
            success: true,
            message: "Session active"
        });
    }
);

// LOGOUT
router.post(
    "/logout",
    verify,
    logout
);

export default router;
