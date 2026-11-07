
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
} from "../middleware/validators/reviewValidator.js";

import {
    readLimiter,
    reviewsLimiter
} from "../middleware/rateLimit.js";

const router = express.Router();

// Public
router.get(
    "/",
    readLimiter,
    getallreviews
);

// Logged-in user
router.post(
    "/",
    reviewsLimiter,
    verify,
    validate(createReviewSchema),
    createreview
);

router.get(
    "/my",
    readLimiter,
    verify,
    getallmyreviews
);

router.patch(
    "/:id",
    reviewsLimiter,
    verify,
    validate(reviewParamsSchema, "params"),
    validate(updateReviewSchema),
    updatereview
);

router.delete(
    "/:id",
    reviewsLimiter,
    verify,
    validate(reviewParamsSchema, "params"),
    deletereview
);

export default router;
