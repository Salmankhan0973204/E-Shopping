import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../services/product.service.js";
import { sendSuccess } from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

// ─── Create Product (Admin Only) ────────────────────────────────────────────
export const create = asyncHandler(async (req, res) => {
  // createdBy field mein logged-in admin ka ID dalo
  const data = { ...req.body, createdBy: req.user._id };
  const product = await createProduct(data);
  sendSuccess(res, 201, "Product created successfully", { product });
});

// ─── Get All Products (Public) ──────────────────────────────────────────────
export const getAll = asyncHandler(async (req, res) => {
  const products = await getAllProducts();
  sendSuccess(res, 200, "Products fetched successfully", { 
    count: products.length,
    products,
  });
});

// ─── Get Single Product (Public) ────────────────────────────────────────────
export const getOne = asyncHandler(async (req, res) => {
  const product = await getProductById(req.params.id);
  sendSuccess(res, 200, "Product fetched successfully", { product });
});

// ─── Update Product (Admin Only) ────────────────────────────────────────────
export const update = asyncHandler(async (req, res) => {
  // updatedBy field mein logged-in admin ka ID dalo
  const data = { ...req.body, updatedBy: req.user._id };
  const product = await updateProduct(req.params.id, data);
  sendSuccess(res, 200, "Product updated successfully", { product });
});

// ─── Delete Product (Admin Only) ────────────────────────────────────────────
export const remove = asyncHandler(async (req, res) => {
  await deleteProduct(req.params.id);
  sendSuccess(res, 200, "Product deleted successfully");
});
