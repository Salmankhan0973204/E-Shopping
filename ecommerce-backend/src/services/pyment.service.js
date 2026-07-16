import stripe from "../config/stripe.js";

export const createPaymentIntent = async (amount) => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount * 100, // ← Stripe cents mein leta hai
    currency: "usd",
  });

  return {
    clientSecret: paymentIntent.client_secret,
  };
};