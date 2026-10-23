import express from "express";

import {
    addtocart,
    getusercart,
    updatequantity,
    deleteitem,
    clearcart
} from "../controllers/cart.js";

import { verify } from "../middleware/jwt.js";

const router = express.Router();

router.post("/:id", verify, addtocart);

router.get("/", verify, getusercart);

router.patch("/:id", verify, updatequantity);

router.delete("/:id", verify, deleteitem);

router.delete("/", verify, clearcart);

export default router;