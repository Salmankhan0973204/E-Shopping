
import { createPaymentIntent } from "../services/pyment.service.js";
import { sendSuccess } from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

export const createIntent = asyncHandler(async (req, res) => {
  const { amount } = req.body;
  const result = await createPaymentIntent(amount);
  sendSuccess(res, 200, "Payment intent created", result);
});