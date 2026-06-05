import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";

dotenv.config();

const app = express();
app.use(express.json());

// ✅ API routes pehle
app.use("/api/auth", authRoutes);

// ✅ "/" sabse neeche
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