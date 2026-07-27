import express from "express";
import { createIntent } from "../controllers/payment.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Payment
 *   description: Payment processing API
 */

/**
 * @swagger
 * /api/payment/create-intent:
 *   post:
 *     summary: Create payment intent
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Payment intent created
 */
router.post("/create-intent", protect, createIntent);

export default router;