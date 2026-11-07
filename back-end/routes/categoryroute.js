
import express from "express";

import {
    createcat,
    getallcat,
    getone,
    updatecat,
    deletecat
} from "../controllers/category.js";

import { verify } from "../middleware/jwt.js";
import { isadmin } from "../middleware/adminoruser.js";
import { validate } from "../middleware/validate.js";

import {
    createCategorySchema,
    updateCategorySchema,
    categoryParamsSchema
} from "../middleware/validators/categoryValidator.js";

import {
    readLimiter,
    adminWriteLimiter
} from "../middleware/rateLimit.js";

const router = express.Router();

// Public
router.get(
    "/",
    readLimiter,
    getallcat
);

router.get(
    "/:id",
    readLimiter,
    validate(categoryParamsSchema, "params"),
    getone
);

// Admin only
router.post(
    "/",
    adminWriteLimiter,
    verify,
    isadmin,
    validate(createCategorySchema),
    createcat
);

router.patch(
    "/:id",
    adminWriteLimiter,
    verify,
    isadmin,
    validate(categoryParamsSchema, "params"),
    validate(updateCategorySchema),
    updatecat
);

router.delete(
    "/:id",
    adminWriteLimiter,
    verify,
    isadmin,
    validate(categoryParamsSchema, "params"),
    deletecat
);

export default router;
