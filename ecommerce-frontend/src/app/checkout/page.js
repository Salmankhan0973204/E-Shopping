"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";
import { Loader2, Check, ArrowLeft, ShoppingBag, CreditCard, MapPin, User } from "lucide-react";
import Link from "next/link";

export default function CheckoutPage() {
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

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setOrderError("");

    // Validate address
    if (!address.street || !address.city || !address.state || !address.country || !address.zipCode) {
      setOrderError("Please fill in all address fields");
      return;
    }

    setPlacing(true);
    try {
      const orderData = {
        items: cartItems.map((item) => ({
          product: item.product,
          quantity: item.quantity,
          price: item.price,
        })),
        totalPrice: cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
        address,
      };

      const res = await api.post("/orders", orderData);
      if (res.data.success) {
        // Clear cart
        localStorage.setItem("cart", "[]");
        setPlaced(true);
      }
    } catch (err) {
      console.error("Order error:", err);
      setOrderError(err.response?.data?.message || "Failed to place order. Please try again.");
    } finally {
      setPlacing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
      </div>
    );
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (placed) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 rounded-full bg-green-900/40 border border-green-800 flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">Order Placed Successfully! 🎉</h1>
          <p className="text-slate-400 mb-8">
            Thank you for your order! We'll process it shortly and keep you updated.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/orders"
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-500 text-white font-bold rounded-xl transition-all hover:from-purple-500 hover:to-blue-400"
            >
              View My Orders
            </Link>
            <Link
              href="/products"
              className="px-6 py-3 bg-slate-800/80 border border-slate-700 text-slate-300 font-semibold rounded-xl hover:text-white transition-all"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-8">
          <Link href="/cart" className="hover:text-purple-400 transition-colors">Cart</Link>
          <span>/</span>
          <span className="text-slate-400">Checkout</span>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-white mb-8">Checkout</h1>

        <form onSubmit={handlePlaceOrder}>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Left: Shipping Address */}
            <div className="lg:col-span-3 space-y-6">
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <MapPin className="w-5 h-5 text-purple-400" />
                  <h2 className="text-lg font-semibold text-white">Shipping Address</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1.5">Street Address</label>
                    <input
                      type="text"
                      name="street"
                      value={address.street}
                      onChange={handleChange}
                      placeholder="123 Main Street"
                      className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-1.5">City</label>
                      <input
                        type="text"
                        name="city"
                        value={address.city}
                        onChange={handleChange}
                        placeholder="New York"
                        className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-1.5">State</label>
                      <input
                        type="text"
                        name="state"
                        value={address.state}
                        onChange={handleChange}
                        placeholder="NY"
                        className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-1.5">Country</label>
                      <input
                        type="text"
                        name="country"
                        value={address.country}
                        onChange={handleChange}
                        placeholder="United States"
                        className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-1.5">ZIP Code</label>
                      <input
                        type="text"
                        name="zipCode"
                        value={address.zipCode}
                        onChange={handleChange}
                        placeholder="10001"
                        className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Order Summary */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Order Summary</h2>
                <div className="space-y-3 mb-4">
                  {cartItems.map((item) => (
                    <div key={item.product} className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-slate-800/50 overflow-hidden flex-shrink-0">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBag className="w-4 h-4 text-slate-600" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-200 truncate">{item.name}</p>
                        <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-semibold text-white">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
                <div className="border-t border-slate-700 pt-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Subtotal</span>
                    <span className="text-white font-medium">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Shipping</span>
                    <span className="text-slate-500">Free</span>
                  </div>
                  <div className="border-t border-slate-700 pt-2 flex items-center justify-between">
                    <span className="text-base font-bold text-white">Total</span>
                    <span className="text-lg font-bold text-white">${subtotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {orderError && (
                <div className="bg-red-950/40 border border-red-900/50 text-red-400 px-4 py-3 rounded-xl text-sm">
                  {orderError}
                </div>
              )}

              <button
                type="submit"
                disabled={placing}
                className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-500 hover:to-blue-400 text-white font-bold rounded-xl shadow-lg shadow-purple-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
              >
                {placing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Placing Order...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" /> Place Order — ${subtotal.toFixed(2)}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}