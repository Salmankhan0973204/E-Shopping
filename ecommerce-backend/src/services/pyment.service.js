import stripe from "../config/stripe.js";
import { priceCartItems } from "./product.service.js";
import ApiError from "../utils/apiError.js";

// Stripe kam se kam 50 cents charge karne deta hai
const STRIPE_MIN_AMOUNT_IN_CENTS = 50;

// Amount client se KABHI mat lo — cart items ke against DB se khud calculate karo,
// warna koi bhi $500 ke cart ke liye $0.50 bhej kar pay kar sakta hai
export const createPaymentIntent = async (items, userId) => {
  const { amountInCents, totalPrice } = await priceCartItems(items);

  if (amountInCents < STRIPE_MIN_AMOUNT_IN_CENTS) {
    throw new ApiError(400, "Order total minimum charge se kam hai");
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountInCents, // ← Stripe cents mein leta hai (server par calculate hua)
    currency: "usd",
    // Order banate waqt verify karenge ke ye payment isi user ka tha
    metadata: { userId: String(userId) },
  });

  return {
    clientSecret: paymentIntent.client_secret,
    totalPrice, // ← frontend chahe to asli total dikha sakta hai
  };
};
