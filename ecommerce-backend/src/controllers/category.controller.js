// create category

import {
  createCategory,
  deleteCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
} from "../services/category.service.js";
import { sendSuccess } from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

export const create = asyncHandler(async (req, res) => {
  const data = { ...req.body, createdBy: req.user._id };
  const category = await createCategory(data);
  sendSuccess(res, 201, "Category added Sucessfuly", { category });
});

export const getAll = asyncHandler(async (req, res) => {
  const categories = await getAllCategories();
  sendSuccess(res, 200, "Categories fetched successfully", {
    count: categories.length,
    categories,
  });
});

export const getOne = asyncHandler(async (req, res) => {
  const category = await getCategoryById(req.params.id);
  sendSuccess(res, 200, "Category fetched successfully", {
    category,
  });
});

export const update = asyncHandler(async (req, res) => {
  const data = { ...req.body, updatedBy: req.user._id };
  const category = await updateCategory(req.params.id, data);
  sendSuccess(res, 200, "Category updated successfully", { category });
});

export const remove = asyncHandler(async (req, res) => {
  await deleteCategory(req.params.id);
  sendSuccess(res, 200, "Category Deleted successfully");
});
