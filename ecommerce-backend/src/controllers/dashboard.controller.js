import { Order } from "../models/order.model.js";
import { Product } from "../models/product.model.js";
import { User } from "../models/user.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/apiResponse.js";

// @desc    Get dashboard statistics
// @route   GET /api/dashboard
// @access  Private/Admin
export const getDashboardStats = asyncHandler(async (req, res) => {
  // 1. Get total revenue
  const revenueAggregation = await Order.aggregate([
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$totalPrice" },
      },
    },
  ]);
  const totalRevenue = revenueAggregation.length > 0 ? revenueAggregation[0].totalRevenue : 0;

  // 2. Get total orders
  const totalOrders = await Order.countDocuments();

  // 3. Get total products
  const totalProducts = await Product.countDocuments();

  // 4. Get total customers (users with role 'user')
  const totalCustomers = await User.countDocuments({ role: "user" });

  sendSuccess(res, 200, "Dashboard statistics fetched successfully", {
    totalRevenue,
    totalOrders,
    totalProducts,
    totalCustomers,
  });
});
