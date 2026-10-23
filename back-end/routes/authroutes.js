import express from "express";

import {
    register,
    verifycode,
    login,
    forgotpassword,
    verifyinglogin
} from "../controllers/registerandlogin.js";

const router = express.Router();

router.post("/register", register);

router.post("/verify", verifycode);

router.post("/login", login);

router.post("/forgot-password", forgotpassword);

router.post("/reset-password", verifyinglogin);

export default router;