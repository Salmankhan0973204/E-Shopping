import ApiError from "../utils/apiError.js";

// ─── CORS Allow-List ────────────────────────────────────────────────────────
// credentials:true ke saath har origin allow karna khatarnaak hai — phir koi bhi
// website user ki cookies use karke is API ko call karke response padh sakti hai.
// Isliye sirf apni known origins allow karo.
//
// Note: FRONTEND_URL ko function ke andar padha ja raha hai (module load par nahi),
// kyunki ESM imports hoist hote hain aur ho sakta hai dotenv abhi tak load na hua ho.
export const getAllowedOrigins = () =>
  [
    "http://localhost:3000",
    "https://e-shopping-two-zeta.vercel.app",
    "https://e-shopping-9ie97qymd-salmankhan0973204s-projects.vercel.app",
    process.env.FRONTEND_URL, // ← naye deploy ke liye code badalne ki zaroorat nahi
  ].filter(Boolean);

// origin undefined hota hai jab request browser se nahi aati
// (curl, Postman, server-to-server) — unhe block mat karo
export const isOriginAllowed = (origin) =>
  !origin || getAllowedOrigins().includes(origin);

export const corsOptions = {
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      return callback(null, true);
    }
    // Allow-list ke saath silent CORS failure debug karna sab se mushkil hota hai,
    // isliye reject hui origin ko log zaroor karo
    console.warn(`CORS blocked origin: ${origin}`);
    return callback(new ApiError(403, "Not allowed by CORS"));
  },
  credentials: true, // ← Taaki frontend aur backend cookies share kar sakein
};
