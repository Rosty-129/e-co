import express from "express";

import { exportDashboard } from "../controllers/exportController.js";

import { isadmin } from "../middleware/adminoruser.js";

import { verify } from "../middleware/jwt.js"  

const router = express.Router();

router.get(
  "/dashboard",
  verify,
  isadmin,
  exportDashboard
);

export default router;