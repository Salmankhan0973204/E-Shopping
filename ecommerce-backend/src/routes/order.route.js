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

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order management API
 */

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Create a new order
 *     description: >
 *       Prices and the order total are recalculated on the server from the database.
 *       The payment intent is verified with Stripe before the order is saved, and a
 *       payment can only be used for one order.
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [items, address, paymentIntentId]
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
 *               address:
 *                 type: object
 *                 properties:
 *                   street: { type: string }
 *                   city: { type: string }
 *                   state: { type: string }
 *                   country: { type: string }
 *                   zipCode: { type: string }
 *               paymentIntentId:
 *                 type: string
 *                 description: ID of the succeeded Stripe PaymentIntent
 *     responses:
 *       201:
 *         description: Order created successfully
 *       400:
 *         description: Invalid cart, or the payment was not completed / does not match the total
 *       403:
 *         description: The payment belongs to another user
 *       409:
 *         description: An order already exists for this payment
 */
router.post("/", protect, create);

/**
 * @swagger
 * /api/orders/my-orders:
 *   get:
 *     summary: Get logged in user orders
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's orders
 */
router.get("/my-orders", protect, getMyOrders);

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Get order by ID
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order details
 */
router.get("/:id", protect, getOne);

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Get all orders (Admin only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all orders
 */
router.get("/", protect, adminOnly, getAll);

/**
 * @swagger
 * /api/orders/{id}:
 *   put:
 *     summary: Update order status (Admin only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Order updated successfully
 */
router.put("/:id", protect, adminOnly, update);

/**
 * @swagger
 * /api/orders/{id}:
 *   delete:
 *     summary: Delete order (Admin only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order deleted successfully
 */
router.delete("/:id", protect, adminOnly, remove);

export default router;
