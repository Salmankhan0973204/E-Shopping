import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { create, getAll, remove } from "../controllers/review.controller.js";

const router = express.Router({ mergeParams: true })

router.post("/", protect, create);
router.get("/", protect, getAll);
router.delete("/:id", protect, remove);
export default router;
