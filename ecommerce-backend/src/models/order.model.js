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

    // Stripe payment ka reference. unique isliye ke ek hi successful payment se
    // koi baar baar order na bana sake. sparse isliye ke purane orders mein ye
    // field hai hi nahi — unhe duplicate null nahi maana jaana chahiye
    paymentIntentId: {
      type: String,
      unique: true,
      sparse: true,
    },

    address: addressSchema,
  },
  { timestamps: true },
);

export const Order = mongoose.model("Order", orderSchema);
