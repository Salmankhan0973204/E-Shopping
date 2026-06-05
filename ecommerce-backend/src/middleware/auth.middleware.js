import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const protect = async (req, res, next) => {
  try {
    // 1. Token header se lo
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided",
      });
    }

    // 2. "Bearer <token>" se sirf token nikalo
    const token = authHeader.split(" ")[1];

    // 3. Token verify karo
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. User DB se find karo
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    // 5. User ko request mein attach karo
    req.user = user; // ← ab kisi bhi route mein req.user available hoga

    next(); // ← aage jao
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

// ─── Admin only middleware ───────────────────────────────────────────────────
export const adminOnly = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admins only",
    });
  }
  next();
};