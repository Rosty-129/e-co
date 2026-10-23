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

const router = express.Router();

// User
router.post("/", verify, createorder);
router.get("/", verify, getallorder);

// Admin — note: /admin/all comes BEFORE /:id/... so Express doesn't try to
// parse "admin" as an :id param
router.get("/admin/all", verify, isadmin, getallordersadmin);
router.patch("/:id/complete", verify, isadmin, changetocomplete);
router.patch("/:id/disapprove", verify, isadmin, changetodisapprove);

export default router;