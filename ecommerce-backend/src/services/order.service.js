import { Order } from "../models/order.model.js";
import ApiError from "../utils/apiError.js";

const createOrder = async (body) => {
  const order = await Order.create(body);
  return order;
};

const getAllOrder = async () => {
  const order = await Order.find().populate("items.product", "name mainImage price");
  return order;
};

const getOrderById = async (id) => {
  const order = await Order.findById(id).populate("items.product", "name mainImage price");
  if (!order) throw new ApiError(404, "Order not found");
  return order;
};

const deleteOrder = async (id) => {
  const order = await Order.findByIdAndDelete(id);
  return order;
};

const updateOrder = async (id,body) => {
  const order = await Order.findByIdAndUpdate(id,body,{new: true,});
  return order;
};

const getOrdersByUser = async (userId) => {
  const orders = await Order.find({ user: userId }).populate("items.product", "name mainImage slug");
  return orders;
};

export {
    createOrder,
    getAllOrder,
    deleteOrder,
    getOrderById,
    updateOrder,
    getOrdersByUser

}


