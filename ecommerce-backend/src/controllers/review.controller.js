import { addReview, deleteReview, getReviews } from "../services/review.service.js";
import { sendSuccess } from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

export const create = asyncHandler(async (req, res) => {
  const create = { ...req.body, user: req.user._id, product: req.params.id };
  const review = await addReview(create);
  sendSuccess(res, 201, "Review created successfully", { review });
});
export const getAll = asyncHandler(async (req, res) => {
  const review = await getReviews(req.params.id);
  sendSuccess(res, 200, "Review fetched successfully", { review });
});
export const remove = asyncHandler(async (req, res) => {
  const review = await deleteReview(req.params.id);
  sendSuccess(res, 200, "Review deleted successfully", { review });
});
