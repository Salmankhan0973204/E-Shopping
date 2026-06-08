// ─── Server Entry Point ─────────────────────────────────────────────────────
// Yeh root mein hai — DB connect karo, phir app ko start karo
// app.js sirf Express app define karta hai, server.js usse chalata hai

import dotenv from "dotenv";
dotenv.config();

import app from "./src/app.js";
import connectDB from "./src/config/db.js";

const PORT = process.env.PORT || 5000;

// Pehle DB connect karo, phir server start karo
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} 🚀`);
  });
});
