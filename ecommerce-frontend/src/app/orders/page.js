"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";
import { Package, ShoppingBag, Loader2, ChevronRight, MapPin, Calendar } from "lucide-react";

const statusColors = {
  pending: "bg-yellow-900/40 text-yellow-400 border-yellow-800",
  shipped: "bg-blue-900/40 text-blue-400 border-blue-800",
  delivered: "bg-green-900/40 text-green-400 border-green-800",
  cancelled: "bg-red-900/40 text-red-400 border-red-800",
};

export default function OrdersPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    const fetchOrders = async () => {
      try {
        const res = await api.get("/orders/my-orders");
        if (res.data.success) setOrders(res.data.data.orders);
      } catch (err) {
        console.error("Error fetching orders:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user, router]);

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
        <div className="flex items-center gap-3 mb-8">
          <Package className="w-8 h-8 text-purple-400" />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">My Orders</h1>
            <p className="text-slate-500 mt-1">
              {orders.length > 0
                ? `You have ${orders.length} order${orders.length !== 1 ? "s" : ""}`
                : "No orders yet"}
            </p>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-20 h-20 text-slate-700 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-400">No orders yet</h2>
            <p className="text-slate-600 mt-2">Start shopping to see your orders here!</p>
            <Link
              href="/products"
              className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-500 hover:to-blue-400 text-white font-bold rounded-xl transition-all"
            >
              <ShoppingBag className="w-4 h-4" /> Browse Products
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 hover:border-purple-500/20 transition-all"
              >
                {/* Order Header */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Order ID</p>
                    <p className="text-sm font-mono text-slate-300">#{order._id.slice(-8).toUpperCase()}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-lg text-xs font-bold uppercase border ${statusColors[order.status] || statusColors.pending}`}
                  >
                    {order.status}
                  </span>
                </div>

                {/* Order Items */}
                <div className="space-y-3 mb-4">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-slate-800/50 overflow-hidden flex-shrink-0">
                        {item.product?.mainImage?.url ? (
                          <img src={item.product.mainImage.url} alt={item.product?.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBag className="w-4 h-4 text-slate-600" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-200 truncate">
                          {item.product?.name || "Product"}
                        </p>
                        <p className="text-xs text-slate-500">Qty: {item.quantity} × ${item.price?.toFixed(2)}</p>
                      </div>
                      <p className="text-sm font-semibold text-white">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Order Footer */}
                <div className="border-t border-slate-800 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                    {order.address && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {order.address.city}, {order.address.country}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-lg font-bold text-white">
                      ${order.totalPrice?.toFixed(2)}
                    </span>
                    <Link
                      href={`/orders/${order._id}`}
                      className="flex items-center gap-1 text-sm text-purple-400 hover:text-purple-300 font-medium transition-colors"
                    >
                      Details <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}