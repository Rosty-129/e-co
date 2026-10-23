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

const router = express.Router();

// Public
router.get("/", getallcat);
router.get("/:id", getone);

// Admin only
router.post("/", verify, isadmin, createcat);
router.patch("/:id", verify, isadmin, updatecat);
router.delete("/:id", verify, isadmin, deletecat);

export default router;