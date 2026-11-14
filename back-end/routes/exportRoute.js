import express from "express";

import { exportDashboard } from "../controllers/exportController.js";

import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get(
  "/dashboard",
  verifyToken,
  isAdmin,
  exportDashboard
);

export default router;