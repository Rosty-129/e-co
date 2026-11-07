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

const router = express.Router();

router.get("/", getallproduct);

router.get(
    "/:id",
    validate(productParamsSchema, "params"),
    getoneproduct
);

router.post(
    "/",
    verify,
    isadmin,
    validate(createProductSchema),
    createproduct
);

router.patch(
    "/:id",
    verify,
    isadmin,
    validate(productParamsSchema, "params"),
    validate(updateProductSchema),
    updateproduct
);

router.delete(
    "/:id",
    verify,
    isadmin,
    validate(productParamsSchema, "params"),
    deleteproduct
);

export default router;