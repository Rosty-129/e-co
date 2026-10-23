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

const router = express.Router();

router.get("/", getallproduct);
router.get("/:id", getoneproduct);

router.post("/", verify, isadmin, createproduct);
router.patch("/:id", verify, isadmin, updateproduct);
router.delete("/:id", verify, isadmin, deleteproduct);

export default router;