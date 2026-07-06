"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";
import { Package, ShoppingBag, Loader2, ChevronLeft, MapPin, Calendar, CreditCard } from "lucide-react";

const statusColors = {
  pending: "bg-yellow-900/40 text-yellow-400 border-yellow-800",
  shipped: "bg-blue-900/40 text-blue-400 border-blue-800",
  delivered: "bg-green-900/40 text-green-400 border-green-800",
  cancelled: "bg-red-900/40 text-red-400 border-red-800",
};

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/orders/${id}`);
        if (res.data.success) setOrder(res.data.data.order);
      } catch (err) {
        console.error("Error fetching order:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-slate-700 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-400">Order not found</h2>
          <Link href="/orders" className="mt-4 inline-flex items-center gap-2 text-purple-400 hover:text-purple-300">
            <ChevronLeft className="w-4 h-4" /> Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-8">
          <Link href="/orders" className="hover:text-purple-400 transition-colors">My Orders</Link>
          <span>/</span>
          <span className="text-slate-400">Order #{order._id.slice(-8).toUpperCase()}</span>
        </div>

        {/* Order Header */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white">
                Order #{order._id.slice(-8).toUpperCase()}
              </h1>
              <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(order.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>
            <span
              className={`px-4 py-2 rounded-xl text-sm font-bold uppercase border w-fit ${statusColors[order.status] || statusColors.pending}`}
            >
              {order.status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Items */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Items</h2>
              <div className="space-y-4">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 pb-4 border-b border-slate-800 last:border-0 last:pb-0">
                    <div className="w-16 h-16 rounded-xl bg-slate-800/50 overflow-hidden flex-shrink-0">
                      {item.product?.mainImage?.url ? (
                        <img src={item.product.mainImage.url} alt={item.product?.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="w-6 h-6 text-slate-600" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-200">{item.product?.name || "Product"}</p>
                      <p className="text-sm text-slate-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-lg font-bold text-white">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-4">
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Summary</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Subtotal</span>
                  <span className="text-white font-medium">${order.totalPrice?.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Shipping</span>
                  <span className="text-green-400 font-medium">Free</span>
                </div>
                <div className="border-t border-slate-700 pt-3 flex items-center justify-between">
                  <span className="text-base font-bold text-white">Total</span>
                  <span className="text-xl font-bold text-white">${order.totalPrice?.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            {order.address && (
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-5 h-5 text-purple-400" />
                  <h2 className="text-lg font-semibold text-white">Shipping Address</h2>
                </div>
                <div className="text-sm text-slate-400 space-y-1">
                  <p className="text-slate-200 font-medium">{order.address.street}</p>
                  <p>{order.address.city}, {order.address.state} {order.address.zipCode}</p>
                  <p>{order.address.country}</p>
                </div>
              </div>
            )}

            <Link
              href="/orders"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-800/80 border border-slate-700 text-slate-300 font-semibold rounded-xl hover:text-white transition-all"
            >
              <ChevronLeft className="w-4 h-4" /> Back to Orders
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}