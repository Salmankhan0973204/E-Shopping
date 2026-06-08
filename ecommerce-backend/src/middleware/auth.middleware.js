import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import ApiError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";

// ─── Protect Route — Login required ─────────────────────────────────────────
export const protect = asyncHandler(async (req, res, next) => {
  // 1. Token header se lo
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new ApiError(401, "Access denied. No token provided");
  }

  // 2. "Bearer <token>" se sirf token nikalo
  const token = authHeader.split(" ")[1];

  // 3. Token verify karo
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // 4. User DB se find karo
  const user = await User.findById(decoded.id);
  if (!user) {
    throw new ApiError(401, "User not found");
  }

  // 5. User ko request mein attach karo
  req.user = user; // ← ab kisi bhi route mein req.user available hoga

  next(); // ← aage jao
});

// ─── Admin Only Middleware ──────────────────────────────────────────────────
export const adminOnly = (req, res, next) => {
  if (req.user.role !== "admin") {
    throw new ApiError(403, "Access denied. Admins only");
  }
  next();
};