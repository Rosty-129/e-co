
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

router.get("/connect", verify, isadmin, connectGoogle);

router.get("/callback", googleCallback);

router.get("/status", verify, isadmin, googleConnectionStatus);

router.get("/", verify, isadmin, exportDashboardToGoogle);

export default router;
