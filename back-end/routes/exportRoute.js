import express from "express";

import { exportDashboard } from "../controllers/exportController.js";

import { isadmin } from "../middleware/adminoruser.js";

import { verifyToken } from "../middleware/jwt.js"  

const router = express.Router();

router.get(
  "/dashboard",
  verifyToken,
  isadmin,
  exportDashboard
);

export default router;