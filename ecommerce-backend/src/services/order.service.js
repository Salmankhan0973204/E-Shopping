import { Order } from "../models/order.model.js";
import ApiError from "../utils/apiError.js";
import stripe from "../config/stripe.js";
import { priceCartItems } from "./product.service.js";

// Order banane se pehle do cheezein verify karo:
//   1. Price — client ke bheje hue numbers phenk do, DB se dobara calculate karo
//   2. Payment — Stripe se pucho ke ye payment sach mein hui hai aur kitni hui hai
// Iske bina koi bhi bina paise diye seedha POST /api/orders call karke order bana sakta hai
const createOrder = async ({ userId, items, address, paymentIntentId }) => {
  if (!paymentIntentId) {
    throw new ApiError(400, "Payment reference missing hai");
  }

  const { items: pricedItems, totalPrice, amountInCents } =
    await priceCartItems(items);

  // Stripe ka raw error client ko mat dikhao (internal detail leak hota hai)
  let paymentIntent;
  try {
    paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
  } catch {
    throw new ApiError(400, "Payment verify nahi ho saki");
  }

  if (!paymentIntent || paymentIntent.status !== "succeeded") {
    throw new ApiError(400, "Payment complete nahi hui");
  }
  if (paymentIntent.amount_received !== amountInCents) {
    throw new ApiError(400, "Pay ki gayi amount order total se match nahi karti");
  }
  if (String(paymentIntent.metadata?.userId) !== String(userId)) {
    throw new ApiError(403, "Ye payment kisi aur user ki hai");
  }

  try {
    const order = await Order.create({
      user: userId,
      items: pricedItems, // ← DB se nikli hui prices
      totalPrice, // ← DB se calculate hua total
      address,
      paymentIntentId,
    });
    return order;
  } catch (error) {
    // unique index ne same payment ka dusra order rok diya
    if (error.code === 11000) {
      throw new ApiError(409, "Is payment ka order pehle hi ban chuka hai");
    }
    throw error;
  }
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


