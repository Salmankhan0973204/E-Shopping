// ─── Custom Error Class ─────────────────────────────────────────────────────
// throw new ApiError(404, "User not found") → clean error handling

class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.success = false;
  }
}

export default ApiError;
