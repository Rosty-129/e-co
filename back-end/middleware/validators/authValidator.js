import express from "express";

import {
    createreview,
    updatereview,
    deletereview,
    getallmyreviews,
    getallreviews
} from "../controllers/review.js";

import { verify } from "../middleware/jwt.js";
import { validate } from "../middleware/validate.js";

import {
    createReviewSchema,
    updateReviewSchema,
    reviewParamsSchema
} from "../validators/reviewValidator.js";

const router = express.Router();

// Public
router.get("/", getallreviews);

// Logged-in user
router.post(
    "/",
    verify,
    validate(createReviewSchema),
    createreview
);

router.get("/my", verify, getallmyreviews);

router.patch(
    "/:id",
    verify,
    validate(reviewParamsSchema, "params"),
    validate(updateReviewSchema),
    updatereview
);

router.delete(
    "/:id",
    verify,
    validate(reviewParamsSchema, "params"),
    deletereview
);

export default router;