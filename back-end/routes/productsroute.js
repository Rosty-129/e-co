
import express from "express";

import {
    createproduct,
    updateproduct,
    deleteproduct,
    getallproduct,
    getoneproduct
} from "../controllers/products.js";

import { verify } from "../middleware/jwt.js";
import { isadmin } from "../middleware/adminoruser.js";
import { validate } from "../middleware/validate.js";

import {
    createProductSchema,
    updateProductSchema,
    productParamsSchema
} from "../middleware/validators/productValidator.js";

import {
    readLimiter,
    adminWriteLimiter
} from "../middleware/rateLimit.js";

const router = express.Router();

// Public
router.get(
    "/",
    readLimiter,
    getallproduct
);

router.get(
    "/:id",
    readLimiter,
    validate(productParamsSchema, "params"),
    getoneproduct
);

// Admin only
router.post(
    "/",
    adminWriteLimiter,
    verify,
    isadmin,
    validate(createProductSchema),
    createproduct
);

router.patch(
    "/:id",
    adminWriteLimiter,
    verify,
    isadmin,
    validate(productParamsSchema, "params"),
    validate(updateProductSchema),
    updateproduct
);

router.delete(
    "/:id",
    adminWriteLimiter,
    verify,
    isadmin,
    validate(productParamsSchema, "params"),
    deleteproduct
);

export default router;
