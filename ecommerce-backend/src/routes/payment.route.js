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
 *     description: >
 *       The charge amount is calculated on the server from the database prices of
 *       the given products. Any amount sent by the client is ignored.
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [items]
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [product, quantity]
 *                   properties:
 *                     product:
 *                       type: string
 *                       description: Product ID
 *                     quantity:
 *                       type: integer
 *                       minimum: 1
 *     responses:
 *       200:
 *         description: Payment intent created
 *       400:
 *         description: Invalid cart, product unavailable, or not enough stock
 */
router.post("/create-intent", protect, createIntent);

export default router;