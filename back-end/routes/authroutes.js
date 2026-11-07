
import express from "express";

import {
    register,
    verifycode,
    login,
    forgotpassword,
    verifyinglogin
} from "../controllers/registerandlogin.js";

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

router.post(
    "/register",
    registerLimiter,
    validate(registerSchema),
    register
);

router.post(
    "/verify",
    verifyEmailLimiter,
    validate(verifyEmailSchema),
    verifycode
);

router.post(
    "/login",
    loginLimiter,
    validate(loginSchema),
    login
);

router.post(
    "/forgot-password",
    forgotPasswordLimiter,
    validate(forgotPasswordSchema),
    forgotpassword
);

router.post(
    "/reset-password",
    resetPasswordLimiter,
    validate(resetPasswordSchema),
    verifyinglogin
);

export default router;
