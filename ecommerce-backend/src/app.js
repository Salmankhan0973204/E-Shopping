import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";

import authRoutes from "./routes/auth.routes.js";
import productRoutes from "./routes/product.routes.js";
import errorHandler from "./middleware/error.middleware.js";
import categoryRoutes from "./routes/category.routes.js";
import orderRoutes from "./routes/order.route.js";
import reviewRoutes from "./routes/review.routes.js";
import paymentRoutes from "./routes/payment.route.js";
import dashboardRoutes from "./routes/dashboard.routes.js";

const app = express();

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "E-Commerce API",
      version: "1.0.0",
      description: "API documentation for the E-Commerce backend",
    },
    tags: [
      { name: "Auth", description: "Authentication API" },
      { name: "Products", description: "Product management API" },
      { name: "Categories", description: "Category management API" },
      { name: "Orders", description: "Order management API" },
      { name: "Reviews", description: "Product reviews API" },
      { name: "Payment", description: "Payment processing API" },
      { name: "Dashboard", description: "Admin dashboard statistics API" }
    ],
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 5000}`,
        description: "Development server",
      },
      {
        url: process.env.BACKEND_URL || "https://your-production-url.com",
        description: "Production server (set BACKEND_URL in .env)",
      },
      {
        url: "/", 
        description: "Relative to current host",
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/routes/*.js"], // paths to files containing OpenAPI definitions
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

//  CORS configure karo (credentials allow karne ke liye aur port 3000 ko access dene ke liye)
app.use(
  cors({
    origin: function (origin, callback) {
      callback(null, true); // ← sab origins allow
    },
    credentials: true, // ← Taaki frontend aur backend cookies share kar sakein
  })
);

app.use(express.json());
app.use(cookieParser()); // ← Cookies parse karne ke liye

//  API routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/products/:id/reviews", reviewRoutes)
app.use("/api/payment", paymentRoutes);
app.use("/api/dashboard", dashboardRoutes);

//  "/" route
app.get("/", (req, res) => {
  res.send("hello from server");
});

//  Global Error Handler (saare routes ke BAAD hona chahiye)
app.use(errorHandler);

export default app;
