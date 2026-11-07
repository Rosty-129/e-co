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

const router = express.Router();

// Public
router.get("/", getallcat);

router.get(
    "/:id",
    validate(categoryParamsSchema, "params"),
    getone
);

// Admin only
router.post(
    "/",
    verify,
    isadmin,
    validate(createCategorySchema),
    createcat
);

router.patch(
    "/:id",
    verify,
    isadmin,
    validate(categoryParamsSchema, "params"),
    validate(updateCategorySchema),
    updatecat
);

router.delete(
    "/:id",
    verify,
    isadmin,
    validate(categoryParamsSchema, "params"),
    deletecat
);

export default router;