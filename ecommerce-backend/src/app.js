import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import productRoutes from "./routes/product.routes.js";
import errorHandler from "./middleware/error.middleware.js";
import categoryRoutes from "./routes/category.routes.js";
import orderRoutes from "./routes/order.route.js";
import reviewRoutes from "./routes/review.routes.js";

const app = express();

//  CORS configure karo (credentials allow karne ke liye aur port 3000 ko access dene ke liye)
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true, // ← Taaki frontend aur backend cookies share kar sakein
  }),
);

app.use(express.json());
app.use(cookieParser()); // ← Cookies parse karne ke liye

//  API routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/products/:id/reviews", reviewRoutes)

//  "/" route
app.get("/", (req, res) => {
  res.send("hello from server");
});

//  Global Error Handler (saare routes ke BAAD hona chahiye)
app.use(errorHandler);

export default app;
