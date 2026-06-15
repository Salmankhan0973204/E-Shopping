// ─── Standard API Response Helpers ──────────────────────────────────────────
// Har controller mein same format use hoga — consistency ke liye

/**
 * Success response bhejne ke liye
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code (200, 201, etc.)
 * @param {string} message - Success message
 * @param {object} data - Response data (optional)
 */
export const sendSuccess = (res, statusCode, message, data) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Error response bhejne ke liye
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code (400, 401, 500, etc.)
 * @param {string} message - Error message
 */
export const sendError = (res, statusCode, message) => {
  return res.status(statusCode).json({
    success: false,
    message,
  });
};
