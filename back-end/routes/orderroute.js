
import express from "express";

import {
    createorder,
    getallorder,
    getallordersadmin,
    changetocomplete,
    changetodisapprove
} from "../controllers/order.js";

import { verify } from "../middleware/jwt.js";
import { isadmin } from "../middleware/adminoruser.js";
import { validate } from "../middleware/validate.js";

import {
    createOrderSchema,
    orderParamsSchema
} from "../middleware/validators/orderValidator.js";

import {
    ordersLimiter,
    readLimiter,
    adminWriteLimiter
} from "../middleware/rateLimit.js";

const router = express.Router();

// User
router.post(
    "/",
    ordersLimiter,
    verify,
    validate(createOrderSchema),
    createorder
);

router.get(
    "/",
    readLimiter,
    verify,
    getallorder
);

// Admin
router.get(
    "/admin/all",
    readLimiter,
    verify,
    isadmin,
    getallordersadmin
);

router.patch(
    "/:id/complete",
    adminWriteLimiter,
    verify,
    isadmin,
    validate(orderParamsSchema, "params"),
    changetocomplete
);

router.patch(
    "/:id/disapprove",
    adminWriteLimiter,
    verify,
    isadmin,
    validate(orderParamsSchema, "params"),
    changetodisapprove
);

export default router;
