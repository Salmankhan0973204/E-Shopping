import { Product } from "../models/product.model.js";

const createProduct = async (body) => {
  const product = await Product.create(body);
  return product;
};

const SORT_MAP = {
  price_asc: { price: 1 },
  price_desc: { price: -1 },
  newest: { createdAt: -1 },
  name_asc: { name: 1 },
};

const getAllProducts = async ({
  search,
  category,
  minPrice,
  maxPrice,
  sort,
  isFeatured,
  page = 1,
  limit = 12,
} = {}) => {
  const filter = { status: "active" };

  if (search) filter.name = { $regex: search, $options: "i" };
  if (category) filter.category = category;
  if (isFeatured !== undefined) filter.isFeatured = isFeatured === true || isFeatured === "true";

  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.min(100, Math.max(1, Number(limit) || 12));
  const skip = (pageNum - 1) * limitNum;

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate("category", "name")
      .sort(SORT_MAP[sort] || { createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Product.countDocuments(filter),
  ]);

  return {
    products,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.max(1, Math.ceil(total / limitNum)),
    },
  };
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
