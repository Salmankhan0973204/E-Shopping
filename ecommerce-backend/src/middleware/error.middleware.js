// ─── Global Error Handler Middleware ────────────────────────────────────────
// Saare errors ek jagah handle honge — controller mein res.status() likhne ki zarurat nahi
// Express mein 4 arguments wala middleware = error handler

const errorHandler = (err, req, res, next) => {
  // Agar ApiError hai toh uska statusCode use karo, warna default 500
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    message,
    // Development mein stack trace dikhao (debugging ke liye)
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
};

export default errorHandler;
