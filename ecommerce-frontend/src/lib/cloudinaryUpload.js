import api from "./axios";

// ─── Direct Browser → Cloudinary Upload ─────────────────────────────────────
// Flow:
//   1. Backend se signed payload maango (admin-only endpoint)
//   2. Har file ko usi signature ke saath seedha Cloudinary par POST karo
//   3. Sirf { url, public_id } return karo — backend ko files kabhi nahi bhejte
// Ek signature (folder + timestamp) multiple uploads ke liye reuse ho sakta hai
// (Cloudinary signatures ~1 hour valid rehte hain).
export async function uploadImagesToCloudinary(files) {
  const res = await api.get("/uploads/signature");
  const { timestamp, signature, folder, apiKey, cloudName } = res.data.data;

  const uploadOne = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", apiKey);
    formData.append("timestamp", timestamp);
    formData.append("signature", signature);
    formData.append("folder", folder);

    // Jaan bujh kar plain fetch use kiya hai — humara axios instance
    // Authorization header + credentials bhejta hai jo Cloudinary ko nahi jane chahiye
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: "POST", body: formData }
    );
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.error?.message || "Cloudinary upload failed");
    }
    return { url: data.secure_url, public_id: data.public_id };
  };

  return Promise.all(files.map(uploadOne));
}
