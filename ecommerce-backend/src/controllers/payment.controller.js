
import { createPaymentIntent } from "../services/pyment.service.js";
import { sendSuccess } from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

export const createIntent = asyncHandler(async (req, res) => {
  // Client sirf items bhejta hai — amount server calculate karta hai
  const { items } = req.body;
  const result = await createPaymentIntent(items, req.user._id);
  sendSuccess(res, 200, "Payment intent created", result);
});