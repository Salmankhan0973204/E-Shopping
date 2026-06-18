import express from "express";
import {
  create,
  getAll,
  getOne,
  update,
  remove,
} from "../controllers/order.controller.js";
import { protect, adminOnly } from "../middleware/auth.middleware.js";

const router = express.Router();

// ─── Public Routes ──────────────────────────────────────────────────────────
router.get("/", getAll); // GET    /api/order       → saare order
router.get("/:id", getOne); // GET    /api/order/:id   → ek product

// ─── Admin Routes (protect + adminOnly) ─────────────────────────────────────
router.post("/", protect, create); // POST   /api/order
router.put("/:id", protect, adminOnly, update); // PUT    /api/order/:id
router.delete("/:id", protect, adminOnly, remove); // DELETE /api/order/:id

export default router;
