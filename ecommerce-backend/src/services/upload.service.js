import { cloudinary } from "../utils/cloudinary.js";

// ─── Generate Signed Upload Params ──────────────────────────────────────────
// Browser directly Cloudinary par upload karega — ye signature prove karta hai
// ke upload humare server ne authorize kiya hai, bina API secret expose kiye.
// Note: yahan sign hone wale params (folder + timestamp) EXACTLY wahi hone
// chahiye jo frontend Cloudinary ko bhejta hai, warna signature invalid hoga.
export const getUploadSignature = () => {
  const timestamp = Math.round(Date.now() / 1000);
  const folder = "products";

  const signature = cloudinary.utils.api_sign_request(
    { folder, timestamp },
    process.env.CLOUDINARY_API_SECRET
  );

  return {
    timestamp,
    signature,
    folder,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  };
};
