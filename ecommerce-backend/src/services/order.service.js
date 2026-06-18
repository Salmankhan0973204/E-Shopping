import { Order } from "../models/order.model.js";
import ApiError from "../utils/apiError.js";

const createOrder = async (body) => {
  const order = await Order.create(body);
  return order;
};

const getAllOrder = async () => {
  const order = await Order.find();
  return order;
};

const getOrderById = async (id) => {
  const order = await Order.findById(id);
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

export {
    createOrder,
    getAllOrder,
    deleteOrder,
    getOrderById,
    updateOrder

}


