import express from "express";
import {
  create,
  getAll,
  getMyOrders,
  getOne,
  update,
  remove,
} from "../controllers/order.controller.js";
import { protect, adminOnly } from "../middleware/auth.middleware.js";

const router = express.Router();

// ─── Customer Routes ────────────────────────────────────────────────────────
router.post("/", protect, create);              // POST   /api/orders
router.get("/my-orders", protect, getMyOrders); // GET    /api/orders/my-orders
router.get("/:id", protect, getOne);            // GET    /api/orders/:id

// ─── Admin Routes ───────────────────────────────────────────────────────────
router.get("/", protect, adminOnly, getAll);    // GET    /api/orders
router.put("/:id", protect, adminOnly, update); // PUT    /api/orders/:id
router.delete("/:id", protect, adminOnly, remove); // DELETE /api/orders/:id

export default router;
