import mongoose from "mongoose";

// ─── Cloudinary Image Schema ────────────────────────────────────────────────
// Har image ke saath url + public_id store hoga
// public_id chahiye taaki baad mein Cloudinary se image delete kar sako
const cloudinaryImageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true }, // ← Cloudinary CDN URL
    public_id: { type: String, required: true }, // ← Cloudinary ka unique ID (delete ke liye)
  },
  { _id: false }, // ← extra _id mat banao nested doc mein
);

// ─── Product Schema ─────────────────────────────────────────────────────────
const productSchema = new mongoose.Schema(
  {
    // Basic Info
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    slug: { type: String, required: true, unique: true, lowercase: true },
    shortDescription: { type: String, maxlength: 300 },
    fullDescription: { type: String },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
    subCategory: { type: String },
    brand: { type: String },

    // Pricing
    price: { type: Number, required: [true, "Price is required"], min: 0 },
    salePrice: { type: Number, min: 0 },
    currency: { type: String, default: "USD" },

    // Inventory
    sku: {
      type: String,
      required: [true, "SKU is required"],
      unique: true,
      uppercase: true,
    },
    stock: { type: Number, default: 0, min: 0 },
    stockStatus: {
      type: String,
      enum: ["in_stock", "out_of_stock"],
      default: "in_stock",
    },

    // ✅ Images (Cloudinary) — url + public_id dono store honge
    mainImage: {
      type: cloudinaryImageSchema,
      required: [true, "Main image is required"],
    },
    gallery: [cloudinaryImageSchema], // ← multiple images

    // Variants
    variants: [
      {
        size: String,
        color: String,
        material: String,
        price: Number,
        stock: Number,
      },
    ],

    // Status
    status: { type: String, enum: ["active", "draft"], default: "draft" },
    isFeatured: { type: Boolean, default: false },

    // ✅ Admin Tracking
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // User model se link
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    // Status ke baad add karo
ratings: { 
  type: Number, 
  default: 0 
},
numReviews: { 
  type: Number, 
  default: 0 
},
  },
  { timestamps: true }, // ← createdAt & updatedAt auto add hoga
);

export const Product = mongoose.model("Product", productSchema);
