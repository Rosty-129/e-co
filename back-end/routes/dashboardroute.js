
import express from "express";

import {
    revenue,
    orderstoday,
    pendingorders,
    completedorders,
    totalcustomers,
    totalproducts,
    lowstock,
    outofstock
} from "../controllers/dashboard.js";

import { verify } from "../middleware/jwt.js";
import { isadmin } from "../middleware/adminoruser.js";

import { dashboardLimiter } from "../middleware/rateLimit.js";

const router = express.Router();

router.use(verify);
router.use(isadmin);
router.use(dashboardLimiter);

router.get("/revenue", revenue);

router.get("/orders/today", orderstoday);

router.get("/orders/pending", pendingorders);

router.get("/orders/completed", completedorders);

router.get("/customers", totalcustomers);

router.get("/products", totalproducts);

router.get("/products/low-stock", lowstock);

router.get("/products/out-of-stock", outofstock);

export default router;
