import express from "express";

import {
    createimage,
    deleteimage
} from "../controllers/images.js";

import { verify } from "../middleware/jwt.js";
import { isadmin } from "../middleware/adminoruser.js";
import { validate } from "../middleware/validate.js";

import { imageParamsSchema } from "../middleware/validators/imageValidator.js";

const router = express.Router();

// Admin only
router.post(
    "/product/:id",
    verify,
    isadmin,
    validate(imageParamsSchema, "params"),
    createimage
);

router.delete(
    "/:id",
    verify,
    isadmin,
    validate(imageParamsSchema, "params"),
    deleteimage
);

export default router;