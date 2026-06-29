"use client";
import { useState, useEffect } from "react";
import api from "../../../lib/axios";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get("/orders");
      setOrders(res.data?.data?.order || []);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusUpdate = async (id, status) => {
    await api.put(`/orders/${id}`, { status });
    fetchOrders();
  };

  const statusStyle = {
    delivered: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
    shipped:   "bg-blue-500/15 text-blue-400 border-blue-500/20",
    cancelled: "bg-red-500/15 text-red-400 border-red-500/20",
    pending:   "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Orders</h1>
          <p className="text-gray-500 text-sm mt-1">{orders.length} orders total</p>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500 animate-pulse">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center">
            <span className="text-4xl block mb-3">🛒</span>
            <h3 className="text-gray-400 font-medium mb-1">No orders yet</h3>
            <p className="text-gray-600 text-sm">When customers place orders, they will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800/60 border-b border-gray-800">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Update Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-800/40 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs bg-gray-800 text-gray-400 px-2.5 py-1 rounded-lg border border-gray-700">
                        #{order._id.slice(-8).toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-white font-semibold">${order.totalPrice}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${statusStyle[order.status] || statusStyle.pending}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                        className="bg-gray-800 border border-gray-700 text-gray-200 rounded-xl px-3 py-1.5 text-sm outline-none focus:border-violet-500 transition-colors cursor-pointer"
                      >
                        <option value="pending">Pending</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}