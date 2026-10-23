import express from "express";

import {
    createimage,
    deleteimage
} from "../controllers/images.js";

import { verify } from "../middleware/jwt.js";
import { isadmin } from "../middleware/adminoruser.js";

const router = express.Router();

// Admin only
router.post("/product/:id", verify, isadmin, createimage);

router.delete("/:id", verify, isadmin, deleteimage);

export default router;