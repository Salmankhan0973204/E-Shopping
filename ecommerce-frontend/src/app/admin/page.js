"use client";

import { useState, useEffect } from "react";
import axiosInstance from "@/lib/axios";

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await axiosInstance.get("/dashboard");
        if (response.data.success) {
          setDashboardData(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  const stats = [
    { 
      label: "Total Revenue", 
      value: loading ? "..." : `$${dashboardData.totalRevenue.toFixed(2)}`, 
      icon: "💰", 
      color: "from-violet-500/20 to-indigo-500/20 border-violet-500/20", 
      textColor: "text-violet-400" 
    },
    { 
      label: "Total Orders", 
      value: loading ? "..." : dashboardData.totalOrders, 
      icon: "📦", 
      color: "from-blue-500/20 to-cyan-500/20 border-blue-500/20", 
      textColor: "text-blue-400" 
    },
    { 
      label: "Total Products", 
      value: loading ? "..." : dashboardData.totalProducts, 
      icon: "🛍️", 
      color: "from-emerald-500/20 to-teal-500/20 border-emerald-500/20", 
      textColor: "text-emerald-400" 
    },
    { 
      label: "Total Customers", 
      value: loading ? "..." : dashboardData.totalCustomers, 
      icon: "👥", 
      color: "from-rose-500/20 to-pink-500/20 border-rose-500/20", 
      textColor: "text-rose-400" 
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Overview of your store performance</p>
        </div>
        {!loading && (
          <span className="bg-emerald-500/10 text-emerald-400 text-xs font-medium px-3 py-1.5 rounded-full border border-emerald-500/20">
            ⚡ Live Data
          </span>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`bg-gradient-to-br ${stat.color} border rounded-2xl p-6 backdrop-blur-sm transition-opacity duration-300 ${loading ? "opacity-50" : "opacity-100"}`}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl">{stat.icon}</span>
              <span className={`text-xs font-semibold uppercase tracking-wider ${stat.textColor}`}>
                {stat.label}
              </span>
            </div>
            <p className={`text-4xl font-extrabold ${stat.textColor}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[
          { title: "Manage Products", desc: "Add, edit or remove products from your store.", href: "/admin/products", icon: "📦" },
          { title: "Manage Categories", desc: "Organize your products with categories.", href: "/admin/categories", icon: "🏷️" },
          { title: "Manage Orders", desc: "View and update customer order statuses.", href: "/admin/orders", icon: "🛒" },
        ].map((card) => (
          <a
            key={card.href}
            href={card.href}
            className="group bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-violet-600/40 hover:bg-gray-800/60 transition-all duration-300"
          >
            <span className="text-3xl mb-3 block">{card.icon}</span>
            <h3 className="text-white font-semibold mb-1 group-hover:text-violet-400 transition-colors">{card.title}</h3>
            <p className="text-gray-500 text-sm">{card.desc}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
