
import express from "express";

import {
    addtocart,
    getusercart,
    updatequantity,
    deleteitem,
    clearcart
} from "../controllers/cart.js";

import { verify } from "../middleware/jwt.js";
import { validate } from "../middleware/validate.js";

import {
    addToCartSchema,
    updateCartSchema,
    cartItemParamsSchema
} from "../middleware/validators/cartValidator.js";

import { cartLimiter } from "../middleware/rateLimit.js";

const router = express.Router();

router.post(
    "/:id",
    cartLimiter,
    verify,
    validate(cartItemParamsSchema, "params"),
    validate(addToCartSchema),
    addtocart
);

router.get(
    "/",
    cartLimiter,
    verify,
    getusercart
);

router.patch(
    "/:id",
    cartLimiter,
    verify,
    validate(cartItemParamsSchema, "params"),
    validate(updateCartSchema),
    updatequantity
);

router.delete(
    "/:id",
    cartLimiter,
    verify,
    validate(cartItemParamsSchema, "params"),
    deleteitem
);

router.delete(
    "/",
    cartLimiter,
    verify,
    clearcart
);

export default router;
