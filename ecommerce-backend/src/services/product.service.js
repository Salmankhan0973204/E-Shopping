import { Product } from "../models/prodcut.model.js";

const createProduct = async (body) => {
  const product = await Product.create(body);
  return product;
};

const getAllProducts = async () => {
  const products = await Product.find({ isActive: true });
  return products;
};

const deleteProduct = async (id) => {
  const product = await Product.findByIdAndDelete(id);
  return product;
};

const updateProduct = async (id, body) => {
  const product = await Product.findByIdAndUpdate(id, body, {
    new: true,
  });
  return product;
};

const getProductById = async(id)=>{
  const product = await Product.findById(id);
  return product;
};

export {
  createProduct,
  getAllProducts,
  deleteProduct,
  updateProduct,
  getProductById
};
