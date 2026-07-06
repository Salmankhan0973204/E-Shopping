"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import api from "@/lib/axios";
import { useAuth } from "../context/AuthContext";
import { ShoppingBag, ArrowRight, Loader2, Star, TrendingUp, Shield, Truck, Package, Grid3X3 } from "lucide-react";

export default function Home() {
  const { user } = useAuth();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          api.get("/products"),
          api.get("/categories"),
        ]);
        if (prodRes.data.success) {
          const all = prodRes.data.data.products || [];
          const featured = all
            .filter((p) => p.status === "active")
            .slice(0, 8);
          setFeaturedProducts(featured);
        }
        if (catRes.data.success) {
          setCategories(catRes.data.data.categories || []);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-purple-600/10 blur-[150px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 py-20 md:py-32 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-purple-900/30 border border-purple-800/50 rounded-full text-purple-400 text-sm font-medium mb-6">
              <Star className="w-4 h-4" />
              Premium Shopping Experience
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight leading-none mb-6">
              Discover Your{" "}
              <span className="bg-gradient-to-r from-purple-500 via-blue-400 to-green-400 bg-clip-text text-transparent">
                Perfect Style
              </span>
            </h1>
            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              Explore our curated collection of premium products. From fashion to electronics, 
              find everything you need with secure payments and fast delivery.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-500 hover:to-blue-400 text-white font-bold rounded-xl shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 transition-all duration-300 active:scale-[0.98]"
              >
                Shop Now <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href={user ? "/products" : "/register"}
                className="inline-flex items-center gap-2 px-8 py-4 bg-slate-900 border border-slate-800 hover:bg-slate-800/80 text-white font-bold rounded-xl transition-all duration-300 active:scale-[0.98]"
              >
                {user ? "Browse All" : "Get Started"}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-y border-slate-900 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Truck, title: "Free Shipping", desc: "On orders over $50" },
              { icon: Shield, title: "Secure Payment", desc: "100% secure checkout" },
              { icon: Package, title: "Easy Returns", desc: "30-day return policy" },
              { icon: TrendingUp, title: "Best Prices", desc: "Daily deals & offers" },
            ].map((feature, idx) => (
              <div key={idx} className="text-center p-4">
                <feature.icon className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                <h3 className="font-semibold text-slate-200">{feature.title}</h3>
                <p className="text-sm text-slate-500 mt-1">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      {!loading && categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-white">Shop by Category</h2>
            <p className="text-slate-500 mt-2">Browse our curated categories</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat._id}
                href={`/products?category=${cat._id}`}
                className="group bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 text-center hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/5 transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-600/20 to-blue-600/20 border border-purple-800/30 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Grid3X3 className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="font-semibold text-slate-200 group-hover:text-white transition-colors">
                  {cat.name}
                </h3>
                {cat.parent && (
                  <p className="text-xs text-slate-600 mt-1">
                    {cat.parent?.name || "Sub Category"}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white">Featured Products</h2>
            <p className="text-slate-500 mt-2">Hand-picked just for you</p>
          </div>
          <Link
            href="/products"
            className="hidden sm:inline-flex items-center gap-2 text-sm font-semibold text-purple-400 hover:text-purple-300 transition-colors"
          >
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
          </div>
        ) : featuredProducts.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag className="w-16 h-16 text-slate-700 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-400">No products yet</h3>
            <p className="text-slate-600 mt-2">Check back soon for new arrivals!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <Link
                key={product._id}
                href={`/products/${product._id}`}
                className="group bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/5 transition-all duration-300"
              >
                <div className="aspect-square bg-slate-800/50 overflow-hidden">
                  {product.mainImage?.url ? (
                    <img
                      src={product.mainImage.url}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingBag className="w-12 h-12 text-slate-700" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <p className="text-xs text-purple-400 font-medium uppercase tracking-wider mb-1">
                    {product.category?.name || "General"}
                  </p>
                  <h3 className="font-semibold text-slate-200 group-hover:text-white transition-colors line-clamp-1">
                    {product.name}
                  </h3>
                  <div className="mt-2 flex items-center gap-2">
                    {product.salePrice ? (
                      <>
                        <span className="text-lg font-bold text-white">
                          ${product.salePrice.toFixed(2)}
                        </span>
                        <span className="text-sm text-slate-500 line-through">
                          ${product.price.toFixed(2)}
                        </span>
                      </>
                    ) : (
                      <span className="text-lg font-bold text-white">
                        ${product.price.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Mobile View All */}
        <div className="sm:hidden text-center mt-8">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-500 text-white font-bold rounded-xl transition-all"
          >
            View All Products <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="max-w-7xl mx-auto px-4 pb-16">
          <div className="bg-gradient-to-r from-purple-900/40 via-slate-900 to-blue-900/40 border border-slate-800 rounded-3xl p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-4">
              Ready to Start Shopping?
            </h2>
            <p className="text-slate-400 max-w-lg mx-auto mb-8">
              Create an account today and enjoy exclusive deals, order tracking, and a seamless shopping experience.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/register"
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-500 hover:to-blue-400 text-white font-bold rounded-xl shadow-lg shadow-purple-500/20 transition-all"
              >
                Create Free Account
              </Link>
              <Link
                href="/products"
                className="px-8 py-4 bg-slate-800/80 border border-slate-700 hover:bg-slate-700/80 text-white font-bold rounded-xl transition-all"
              >
                Browse as Guest
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}