import { Category } from "../models/category.model.js";

const createCategory = async (body) => {
  const category = await Category.create(body);
  return category;
};

const getAllCategories = async () => {
  const categories = await Category.find({ isActive: true });
  return categories;
};

const deleteCategory = async (id) => {
  const category = await Category.findByIdAndDelete(id);
  return category;
};

const updateCategory = async (id, body) => {
  const category = await Category.findByIdAndUpdate(id, body, {
    new: true,
  });
  return category;
};

const getCategoryById = async(id)=>{
  const category = await Category.findById(id);
  return category;
};

export {
  createCategory,
  getAllCategories,
  deleteCategory,
  updateCategory,
  getCategoryById
};
