import { getUploadSignature } from "../services/upload.service.js";
import { sendSuccess } from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

// ─── Get Cloudinary Upload Signature (Admin Only) ───────────────────────────
export const getSignature = asyncHandler(async (req, res) => {
  const params = getUploadSignature();
  sendSuccess(res, 200, "Upload signature generated", params);
});
