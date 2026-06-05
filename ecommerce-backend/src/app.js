import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";

dotenv.config();

const app = express();

// ✅ CORS configure karo (credentials allow karne ke liye aur port 3000 ko access dene ke liye)
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true, // ← Taaki frontend aur backend cookies share kar sakein
  })
);

app.use(express.json());
app.use(cookieParser()); // ← Cookies parse karne ke liye

// ✅ API routes
app.use("/api/auth", authRoutes);

// ✅ "/" route
app.get("/", (req, res) => {
  res.send("hello from server");
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected ✅");
    app.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT} 🚀`);
    });
  })
  .catch((err) => console.error("DB connection failed ❌", err));