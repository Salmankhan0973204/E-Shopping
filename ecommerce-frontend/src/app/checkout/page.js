"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";
import { Loader2, Check, ShoppingBag, CreditCard, MapPin, Package, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
);

function CheckoutContent() {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [placed, setPlaced] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [address, setAddress] = useState({
    street: "",
    city: "",
    state: "",
    country: "",
    zipCode: "",
  });

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    if (cart.length === 0) {
      router.push("/cart");
      return;
    }
    setCartItems(cart);
    setLoading(false);
  }, [user, router]);

  const handleChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setOrderError("");
    setPlacing(true);
    try {
      const { data } = await api.post("/payment/create-intent", {
        amount: subtotal,
      });
      const clientSecret = data.data.clientSecret;

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: elements.getElement(CardElement) },
      });

      if (result.error) {
        setOrderError(result.error.message);
        setPlacing(false);
        return;
      }

      await api.post("/orders", {
        items: cartItems.map((item) => ({
          product: item.product,
          quantity: item.quantity,
          price: item.price,
        })),
        totalPrice: subtotal,
        address,
        paymentIntentId: result.paymentIntent.id,
      });

      localStorage.setItem("cart", "[]");
      setPlaced(true);
    } catch (err) {
      setOrderError(err.response?.data?.message || "Failed to place order.");
    } finally {
      setPlacing(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-violet-500 animate-spin" />
      </div>
    );

  if (placed)
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-24 h-24 rounded-full bg-emerald-900/30 border border-emerald-800/50 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-900/20">
            <Check className="w-12 h-12 text-emerald-400" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Order Confirmed! 🎉
          </h1>
          <p className="text-slate-400 mb-8">
            Thank you for your purchase. We are processing your order and will ship it out soon.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/orders"
              className="px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-violet-500/25 transition-all"
            >
              View Orders
            </Link>
            <Link
              href="/products"
              className="px-6 py-3 bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl border border-slate-700 transition-all"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-950 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">Secure Checkout</h1>
          <p className="text-slate-400">Complete your details below to finalize your order.</p>
        </div>

        <form onSubmit={handlePlaceOrder}>
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Column: Form Details */}
            <div className="flex-1 space-y-8">
              {/* Address Section */}
              <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-xl">
                <div className="flex items-center gap-3 mb-6 border-b border-slate-800/60 pb-4">
                  <div className="p-2.5 bg-violet-500/10 rounded-xl">
                    <MapPin className="w-6 h-6 text-violet-400" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Shipping Address</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-400 mb-2">Street Address</label>
                    <input
                      type="text"
                      name="street"
                      value={address.street}
                      onChange={handleChange}
                      placeholder="123 Main St"
                      className="w-full px-4 py-3.5 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">City</label>
                    <input
                      type="text"
                      name="city"
                      value={address.city}
                      onChange={handleChange}
                      placeholder="New York"
                      className="w-full px-4 py-3.5 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">State / Province</label>
                    <input
                      type="text"
                      name="state"
                      value={address.state}
                      onChange={handleChange}
                      placeholder="NY"
                      className="w-full px-4 py-3.5 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Country</label>
                    <input
                      type="text"
                      name="country"
                      value={address.country}
                      onChange={handleChange}
                      placeholder="United States"
                      className="w-full px-4 py-3.5 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Zip Code</label>
                    <input
                      type="text"
                      name="zipCode"
                      value={address.zipCode}
                      onChange={handleChange}
                      placeholder="10001"
                      className="w-full px-4 py-3.5 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Payment Section */}
              <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-xl">
                <div className="flex items-center justify-between mb-6 border-b border-slate-800/60 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-500/10 rounded-xl">
                      <CreditCard className="w-6 h-6 text-blue-400" />
                    </div>
                    <h2 className="text-xl font-bold text-white">Payment Details</h2>
                  </div>
                  <div className="flex items-center gap-1 text-emerald-400 text-xs font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-full">
                    <ShieldCheck className="w-3.5 h-3.5" /> Secure
                  </div>
                </div>
                
                <div className="p-5 bg-slate-950/50 rounded-xl border border-slate-800 focus-within:ring-2 focus-within:ring-blue-500/50 focus-within:border-transparent transition-all">
                  <CardElement
                    options={{
                      style: {
                        base: {
                          color: "#f8fafc",
                          fontFamily: 'Inter, sans-serif',
                          fontSmoothing: 'antialiased',
                          fontSize: "16px",
                          "::placeholder": { color: "#475569" },
                        },
                        invalid: {
                          color: "#ef4444",
                          iconColor: "#ef4444"
                        }
                      },
                      hidePostalCode: true,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Order Summary */}
            <div className="lg:w-[420px] space-y-6">
              <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 sticky top-8 shadow-2xl">
                <h2 className="text-xl font-bold text-white mb-6">Order Summary</h2>
                
                <div className="space-y-5 max-h-[360px] overflow-y-auto pr-2 custom-scrollbar">
                  {cartItems.map((item) => (
                    <div key={item.product} className="flex items-start gap-4 group">
                      <div className="w-16 h-16 rounded-xl bg-slate-800 border border-slate-700/50 overflow-hidden flex-shrink-0 relative">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-6 h-6 text-slate-500" />
                          </div>
                        )}
                        <div className="absolute -top-2 -right-2 bg-slate-700 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-slate-900">
                          {item.quantity}
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0 pt-1">
                        <h3 className="text-sm font-semibold text-slate-200 truncate pr-2">{item.name}</h3>
                        <p className="text-xs text-slate-500 mt-1">Qty: {item.quantity}</p>
                      </div>
                      
                      <div className="pt-1">
                        <span className="text-sm font-bold text-white">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-8 space-y-4">
                  <div className="flex justify-between text-slate-400 text-sm">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400 text-sm pb-4 border-b border-slate-800">
                    <span>Shipping</span>
                    <span className="text-emerald-400">Free</span>
                  </div>
                  <div className="flex justify-between items-end pt-2">
                    <span className="text-lg font-medium text-white">Total</span>
                    <span className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">
                      ${subtotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                {orderError && (
                  <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 flex-shrink-0" />
                    <p className="text-sm text-red-400 font-medium">{orderError}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!stripe || placing}
                  className="w-full mt-8 py-4 px-6 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-violet-600/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                >
                  {placing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" /> Processing...
                    </>
                  ) : (
                    <>
                      Pay ${(subtotal).toFixed(2)}
                    </>
                  )}
                </button>
                <div className="mt-4 text-center">
                  <p className="text-xs text-slate-500 flex items-center justify-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" /> Payments are secure and encrypted.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #334155;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #475569;
        }
      `}</style>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutContent />
    </Elements>
  );
}
