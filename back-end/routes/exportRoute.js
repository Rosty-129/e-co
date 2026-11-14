import express from "express";

import { exportDashboard } from "../controllers/exportController.js";

import { verifyToken, isadmin } from "../middleware/adminoruser.js";

const router = express.Router();

router.get(
  "/dashboard",
  verifyToken,
  isadmin,
  exportDashboard
);

export default router;