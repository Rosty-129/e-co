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

const router = express.Router();

router.post("/register", validate(registerSchema), register);

router.post("/verify", validate(verifyEmailSchema), verifycode);

router.post("/login", validate(loginSchema), login);

router.post("/forgot-password", validate(forgotPasswordSchema), forgotpassword);

router.post("/reset-password", validate(resetPasswordSchema), verifyinglogin);

export default router;