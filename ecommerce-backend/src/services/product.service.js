import { Product } from "../models/prodcut.model.js";
import ApiError from "../utils/apiError.js";

// ─── Create Product ─────────────────────────────────────────────────────────
const createProduct = async (data) => {
  const product = await Product.create(data);
  return product;
};

// ─── Get All Products ───────────────────────────────────────────────────────
const getAllProducts = async () => {
  const products = await Product.find();
  return products;
};

// ─── Get Product By ID ──────────────────────────────────────────────────────
const getProductById = async (id) => {
  const product = await Product.findById(id);
  if (!product) throw new ApiError(404, "Product not found");
  return product;
};

// ─── Update Product ─────────────────────────────────────────────────────────
const updateProduct = async (id, data) => {
  const product = await Product.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!product) throw new ApiError(404, "Product not found");
  return product;
};

// ─── Delete Product ─────────────────────────────────────────────────────────
const deleteProduct = async (id) => {
  const product = await Product.findByIdAndDelete(id);
  if (!product) throw new ApiError(404, "Product not found");
  return product;
};

export {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
