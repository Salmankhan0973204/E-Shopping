import express from "express";
import { getSignature } from "../controllers/upload.controller.js";
import { protect, adminOnly } from "../middleware/auth.middleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Uploads
 *   description: Cloudinary signed upload API
 */

/**
 * @swagger
 * /api/uploads/signature:
 *   get:
 *     summary: Get a signed payload for direct browser-to-Cloudinary upload (Admin only)
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Returns timestamp, signature, folder, apiKey and cloudName
 *       401:
 *         description: Not logged in
 *       403:
 *         description: Not an admin
 */
router.get("/signature", protect, adminOnly, getSignature);

export default router;
