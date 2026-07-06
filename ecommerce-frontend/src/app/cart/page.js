"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft, ShoppingBag, Loader2 } from "lucide-react";

export default function CartPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCartItems(cart);
    setLoading(false);
  }, []);

  const updateQuantity = (productId, newQty) => {
    if (newQty < 1) return;
    const updated = cartItems.map((item) =>
      item.product === productId ? { ...item, quantity: newQty } : item
    );
    setCartItems(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  const removeItem = (productId) => {
    const updated = cartItems.filter((item) => item.product !== productId);
    setCartItems(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.setItem("cart", "[]");
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">Shopping Cart</h1>
            <p className="text-slate-500 mt-1">{itemCount} item{itemCount !== 1 ? "s" : ""} in your cart</p>
          </div>
          {cartItems.length > 0 && (
            <button
              onClick={clearCart}
              className="flex items-center gap-2 px-4 py-2 bg-red-950/40 hover:bg-red-900/40 border border-red-900/50 text-red-400 text-sm font-semibold rounded-xl transition-all"
            >
              <Trash2 className="w-4 h-4" /> Clear Cart
            </button>
          )}
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingCart className="w-20 h-20 text-slate-700 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-400">Your cart is empty</h2>
            <p className="text-slate-600 mt-2">Add some products to get started!</p>
            <Link
              href="/products"
              className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-500 hover:to-blue-400 text-white font-bold rounded-xl transition-all"
            >
              <ShoppingBag className="w-4 h-4" /> Browse Products
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Cart Items */}
            {cartItems.map((item) => (
              <div
                key={item.product}
                className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex items-center gap-4"
              >
                {/* Image */}
                <div className="w-20 h-20 rounded-xl bg-slate-800/50 overflow-hidden flex-shrink-0">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingBag className="w-6 h-6 text-slate-600" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-200 truncate">{item.name}</h3>
                  <p className="text-sm text-slate-500 mt-0.5">${item.price.toFixed(2)} each</p>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.product, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                    className="w-8 h-8 rounded-lg bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-10 text-center font-semibold text-white">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.product, item.quantity + 1)}
                    className="w-8 h-8 rounded-lg bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                {/* Price */}
                <div className="text-right w-24">
                  <p className="font-bold text-white">${(item.price * item.quantity).toFixed(2)}</p>
                </div>

                {/* Remove */}
                <button
                  onClick={() => removeItem(item.product)}
                  className="p-2 text-slate-600 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}

            {/* Summary */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 mt-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-slate-400">Subtotal ({itemCount} items)</span>
                <span className="text-white font-semibold">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between mb-3 text-slate-500">
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>
              <div className="border-t border-slate-700 my-3" />
              <div className="flex items-center justify-between mb-6">
                <span className="text-lg font-bold text-white">Total</span>
                <span className="text-xl font-bold text-white">${subtotal.toFixed(2)}</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/products"
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-800/80 border border-slate-700 text-slate-300 font-semibold rounded-xl hover:text-white transition-all"
                >
                  <ArrowLeft className="w-4 h-4" /> Continue Shopping
                </Link>
                <button
                  onClick={() => {
                    if (!user) {
                      router.push("/login");
                      return;
                    }
                    router.push("/checkout");
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-500 hover:to-blue-400 text-white font-bold rounded-xl shadow-lg shadow-purple-500/20 transition-all"
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}