import mongoose from "mongoose";
import { Product } from "../models/product.model.js";
import ApiError from "../utils/apiError.js";
import { cloudinary } from "../utils/cloudinary.js";

// Ek hi jagah se price nikalo taaki frontend aur backend kabhi alag na hon.
// Frontend bhi yahi rule use karta hai: salePrice ho to wo, warna price
export const getEffectivePrice = (product) =>
  product.salePrice > 0 ? product.salePrice : product.price;

// ─── Cart Items ko DB prices ke saath price karo ────────────────────────────
// Client ki bheji hui price par KABHI bharosa mat karo — wo localStorage se
// aati hai aur user use DevTools mein badal sakta hai. Sirf product id aur
// quantity lo, baaki sab DB se nikaalo.
const priceCartItems = async (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    throw new ApiError(400, "Cart is empty");
  }

  // Same product do baar aaye to quantity jama kar do
  const wanted = new Map();
  for (const item of items) {
    const id = String(item?.product || "");
    const quantity = Number(item?.quantity);

    if (!mongoose.isValidObjectId(id)) {
      throw new ApiError(400, "Cart mein invalid product id hai");
    }
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 100) {
      throw new ApiError(400, "Cart mein invalid quantity hai");
    }
    wanted.set(id, (wanted.get(id) || 0) + quantity);
  }

  // Sirf active products order ho sakte hain (draft nahi)
  const products = await Product.find({
    _id: { $in: [...wanted.keys()] },
    status: "active",
  });

  const pricedItems = [];
  let total = 0;

  for (const [id, quantity] of wanted) {
    const product = products.find((p) => String(p._id) === id);
    if (!product) {
      throw new ApiError(400, "Cart ka koi product ab available nahi hai");
    }
    if (product.stock < quantity) {
      throw new ApiError(400, `"${product.name}" ka itna stock available nahi hai`);
    }

    const price = getEffectivePrice(product);
    pricedItems.push({ product: product._id, quantity, price });
    total += price * quantity;
  }

  return {
    items: pricedItems,
    totalPrice: Math.round(total * 100) / 100,
    // Stripe hamesha integer cents leta hai — round karna zaroori hai,
    // warna 19.99 * 100 = 1998.9999... Stripe reject kar deta hai
    amountInCents: Math.round(total * 100),
  };
};

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

  // Product delete hone ke baad uski images bhi Cloudinary se hata do,
  // warna wo hamesha ke liye wahan pari rehti hain (public_id isi kaam ke liye store hota hai).
  // Cloudinary fail ho to bhi product to delete ho hi chuka hai — sirf warn karo
  if (product) {
    const publicIds = [product.mainImage, ...(product.gallery || [])]
      .map((image) => image?.public_id)
      .filter(Boolean);

    await Promise.all(
      publicIds.map((publicId) =>
        cloudinary.uploader
          .destroy(publicId)
          .catch((err) =>
            console.warn(`Cloudinary image delete fail hui (${publicId}):`, err.message)
          )
      )
    );
  }

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
  getProductById,
  priceCartItems
};
