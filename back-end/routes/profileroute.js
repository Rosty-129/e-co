import express from "express";

import {
    getprofile,
    updateprofile,
    changepassword
} from "../controllers/profile.js";

import { verify } from "../middleware/jwt.js";

const router = express.Router();

router.get("/", verify, getprofile);

router.patch("/", verify, updateprofile);

router.patch("/password", verify, changepassword);

export default router;