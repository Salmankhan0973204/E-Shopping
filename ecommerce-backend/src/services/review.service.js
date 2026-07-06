import { Review } from "../models/review.model.js";
import { Product } from "../models/product.model.js";

const addReview = async (body) => {
  const review = await Review.create(body);

  // ─── Product ki avg rating update karo ──────────
  const reviews = await Review.find({ product: body.product });
  const avgRating =
    reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  await Product.findByIdAndUpdate(body.product, {
    ratings: avgRating,
    numReviews: reviews.length,
  });
  return review;
};

const getReviews = async (productId) => {
  const review = await Review.find({ product: productId });
  return review;
};

const deleteReview = async (id) => {
  const review = await Review.findByIdAndDelete(id);
  return review;
};

export { addReview, getReviews, deleteReview };
