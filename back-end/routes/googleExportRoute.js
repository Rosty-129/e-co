
import express from "express";

import {
    connectGoogle,
    googleCallback,
    googleConnectionStatus,
    exportDashboardToGoogle
} from "../controllers/googleExportController.js";

import { verify } from "../middleware/jwt.js";
import { isadmin } from "../middleware/adminoruser.js";

const router = express.Router();

// Start Google OAuth connection.
router.get("/connect", verify, isadmin, connectGoogle);

// Google OAuth callback.
router.get("/callback", googleCallback);

// Check whether Google is connected.
router.get("/status", verify, isadmin, googleConnectionStatus);

// Create and export dashboard report to Google Docs.
router.get("/", verify, isadmin, exportDashboardToGoogle);

export default router;
