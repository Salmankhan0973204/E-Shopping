import express from "express";
import { create, getAll, getOne, update, remove } from "../controllers/product.controller.js";
import { protect, adminOnly } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";

const router = express.Router();

// ─── Public Routes ──────────────────────────────────────────────────────────
router.get("/",    getAll);   // GET    /api/products       → saare products
router.get("/:id", getOne);   // GET    /api/products/:id   → ek product

// ─── Admin Routes (protect + adminOnly) ─────────────────────────────────────
router.post(
  "/",      
  protect, 
  adminOnly, 
  upload.fields([
    { name: 'mainImage', maxCount: 1 },
    { name: 'gallery', maxCount: 5 }
  ]),
  create
);  // POST   /api/products

router.put(
  "/:id",    
  protect, 
  adminOnly, 
  upload.fields([
    { name: 'mainImage', maxCount: 1 },
    { name: 'gallery', maxCount: 5 }
  ]),
  update
);  // PUT    /api/products/:id

router.delete("/:id", protect, adminOnly, remove);  // DELETE /api/products/:id

export default router;
