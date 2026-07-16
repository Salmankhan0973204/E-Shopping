import express from "express";
import { createIntent } from "../controllers/payment.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/create-intent", protect, createIntent);

export default router;