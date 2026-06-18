
import {
  createOrder,
  deleteOrder,
  getAllOrder,
  getOrderById,
  updateOrder,
} from "../services/order.service.js";
import { sendSuccess } from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

export const create = asyncHandler(async (req, res) => {
 const data = { ...req.body, user: req.user._id }; 
  const order = await createOrder(data);
  sendSuccess(res,201, "Order created successfully", { order });
});

export const getAll = asyncHandler(async (req, res) => {
  const order = await getAllOrder();
  sendSuccess(res, 200, "Order fetched successfully", {
    count: order.length,
    order,
  });
});

export const getOne = asyncHandler(async (req, res) => {
  const order = await getOrderById(req.params.id);
  sendSuccess(res, 200, "Order fetched successfully", {
    order,
  });
});

export const update = asyncHandler(async (req, res) => {
  const data = { ...req.body, updatedBy: req.user._id };
  const order = await updateOrder(req.params.id, data);
  sendSuccess(res, 200, "Order updated successfully", {
    order,
  });
});

export const remove = asyncHandler(async (req, res) => {
  await deleteOrder(req.params.id);
  sendSuccess(res, 200, "Product deleted successfully");
});
