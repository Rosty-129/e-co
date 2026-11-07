import express from "express";

import {
    getprofile,
    updateprofile,
    changepassword
} from "../controllers/profile.js";

import { verify } from "../middleware/jwt.js";
import { validate } from "../middleware/validate.js";

import {
    updateProfileSchema,
    changePasswordSchema
} from "../middleware/validators/profileValidator.js";

const router = express.Router();

router.get("/", verify, getprofile);

router.patch(
    "/",
    verify,
    validate(updateProfileSchema),
    updateprofile
);

router.patch(
    "/password",
    verify,
    validate(changePasswordSchema),
    changepassword
);

export default router;