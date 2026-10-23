import express from "express";

import {
    createreview,
    updatereview,
    deletereview,
    getallmyreviews,
    getallreviews
} from "../controllers/review.js";

import { verify } from "../middleware/jwt.js";

const router = express.Router();

// Public
router.get("/", getallreviews);

// Logged-in user
router.post("/", verify, createreview);
router.get("/my", verify, getallmyreviews);
router.patch("/:id", verify, updatereview);
router.delete("/:id", verify, deletereview);

export default router;