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

const router = express.Router();

router.post(
    "/:id",
    verify,
    validate(cartItemParamsSchema, "params"),
    validate(addToCartSchema),
    addtocart
);

router.get("/", verify, getusercart);

router.patch(
    "/:id",
    verify,
    validate(cartItemParamsSchema, "params"),
    validate(updateCartSchema),
    updatequantity
);

router.delete(
    "/:id",
    verify,
    validate(cartItemParamsSchema, "params"),
    deleteitem
);

router.delete("/", verify, clearcart);

export default router;