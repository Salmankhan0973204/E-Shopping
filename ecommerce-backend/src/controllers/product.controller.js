import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../services/product.service.js";
import { sendSuccess } from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import ApiError from "../utils/apiError.js";

// ─── Create Product (Admin Only) ────────────────────────────────────────────
export const create = asyncHandler(async (req, res) => {
  // If parsing multipart/form-data, req.body might need some fields parsed
  // e.g. variants, but we will focus on images first.
  
  let mainImage = undefined;
  let gallery = [];

  // Check if mainImage file is provided
  if (req.files && req.files.mainImage && req.files.mainImage.length > 0) {
    const mainImageLocalPath = req.files.mainImage[0].path;
    const uploaded = await uploadOnCloudinary(mainImageLocalPath);
    if (!uploaded) throw new ApiError(500, "Error uploading main image to Cloudinary");
    
    mainImage = {
      url: uploaded.secure_url,
      public_id: uploaded.public_id
    };
  }

  // Check if gallery files are provided
  if (req.files && req.files.gallery && req.files.gallery.length > 0) {
    for (const file of req.files.gallery) {
      const uploaded = await uploadOnCloudinary(file.path);
      if (uploaded) {
        gallery.push({
          url: uploaded.secure_url,
          public_id: uploaded.public_id
        });
      }
    }
  }

  // createdBy field mein logged-in admin ka ID dalo
  const data = { 
    ...req.body, 
    createdBy: req.user._id 
  };

  if (mainImage) data.mainImage = mainImage;
  if (gallery.length > 0) data.gallery = gallery;

  // Fallbacks if body contains stringified objects (from simple UI test earlier)
  if (!mainImage && typeof req.body.mainImage === 'string') {
     try { data.mainImage = JSON.parse(req.body.mainImage); } catch(e){}
  } else if (!mainImage && req.body.mainImage) {
     data.mainImage = req.body.mainImage; // Object passed directly
  }

  if (gallery.length === 0 && typeof req.body.gallery === 'string') {
     try { data.gallery = JSON.parse(req.body.gallery); } catch(e){}
  } else if (gallery.length === 0 && req.body.gallery) {
     data.gallery = req.body.gallery; // Array passed directly
  }

  const product = await createProduct(data);
  sendSuccess(res, 201, "Product created successfully", { product });
});

// ─── Get All Products (Public) ──────────────────────────────────────────────
export const getAll = asyncHandler(async (req, res) => {
    const { search, category, minPrice, maxPrice, sort } = req.query;
  const products = await getAllProducts({ search, category, minPrice, maxPrice, sort });
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
