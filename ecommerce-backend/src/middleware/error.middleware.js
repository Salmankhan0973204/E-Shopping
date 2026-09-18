import { isOriginAllowed } from "../config/cors.js";

// ─── Global Error Handler Middleware ────────────────────────────────────────
// Saare errors ek jagah handle honge — controller mein res.status() likhne ki zarurat nahi
// Express mein 4 arguments wala middleware = error handler

const errorHandler = (err, req, res, next) => {
  // Agar ApiError hai toh uska statusCode use karo, warna default 500
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  // Error responses par bhi CORS headers chahiye, LEKIN sirf allowed origins ke liye.
  // Pehle yahan har origin wapas reflect ho rahi thi — jis se allow-list bypass ho
  // jaati thi aur koi bhi website error response padh sakti thi
  const origin = req.headers.origin;
  if (origin && isOriginAllowed(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Access-Control-Allow-Credentials", "true");
  }

  res.status(statusCode).json({
    success: false,
    message,
    // Development mein stack trace dikhao (debugging ke liye)
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
};

export default errorHandler;
