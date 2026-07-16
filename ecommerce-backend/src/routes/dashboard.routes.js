import express from "express";
import { getDashboardStats } from "../controllers/dashboard.controller.js";
import { protect, adminOnly } from "../middleware/auth.middleware.js";

const router = express.Router();

// ─── Admin Dashboard Routes ──────────────────────────────────────────────────
router.get("/", protect, adminOnly, getDashboardStats);

export default router;
