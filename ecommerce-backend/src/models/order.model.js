import mongoose from "mongoose";
import { addressSchema } from "./user.model.js";
import { cartItemSchema } from "./cart.model.js";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    items: [cartItemSchema],

    totalPrice: {
      type: Number,
      required: true,
      default: 0,
    },

    status: {
      type: String,
      enum: ["pending", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    address: addressSchema,
  },
  { timestamps: true },
);

export const Order = mongoose.model("Order", orderSchema);
