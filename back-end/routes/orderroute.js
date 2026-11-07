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

const router = express.Router();

// User
router.post(
    "/",
    verify,
    validate(createOrderSchema),
    createorder
);

router.get("/", verify, getallorder);

// Admin
router.get(
    "/admin/all",
    verify,
    isadmin,
    getallordersadmin
);

router.patch(
    "/:id/complete",
    verify,
    isadmin,
    validate(orderParamsSchema, "params"),
    changetocomplete
);

router.patch(
    "/:id/disapprove",
    verify,
    isadmin,
    validate(orderParamsSchema, "params"),
    changetodisapprove
);

export default router;