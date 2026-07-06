"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import api from "@/lib/axios";
import { Search, ShoppingBag, Filter, X, Loader2 } from "lucide-react";

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          api.get("/products"),
          api.get("/categories"),
        ]);
        if (prodRes.data.success) setProducts(prodRes.data.data.products);
        if (catRes.data.success) setCategories(catRes.data.data.categories);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.shortDescription?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !selectedCategory || p.category?._id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <div className="bg-slate-900/50 border-b border-slate-800 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
              />
            </div>
            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-slate-300 hover:text-white transition-all md:hidden"
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>
              <div className="hidden md:flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setSelectedCategory("")}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    !selectedCategory
                      ? "bg-purple-600/30 text-purple-400 border border-purple-500/50"
                      : "bg-slate-800/80 text-slate-400 border border-slate-700 hover:text-white"
                  }`}
                >
                  All
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat._id}
                    onClick={() => setSelectedCategory(cat._id)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      selectedCategory === cat._id
                        ? "bg-purple-600/30 text-purple-400 border border-purple-500/50"
                        : "bg-slate-800/80 text-slate-400 border border-slate-700 hover:text-white"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {/* Mobile Filters */}
          {showFilters && (
            <div className="md:hidden mt-3 flex items-center gap-2 flex-wrap pb-2">
              <button
                onClick={() => { setSelectedCategory(""); setShowFilters(false); }}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  !selectedCategory
                    ? "bg-purple-600/30 text-purple-400 border border-purple-500/50"
                    : "bg-slate-800/80 text-slate-400 border border-slate-700"
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => { setSelectedCategory(cat._id); setShowFilters(false); }}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    selectedCategory === cat._id
                      ? "bg-purple-600/30 text-purple-400 border border-purple-500/50"
                      : "bg-slate-800/80 text-slate-400 border border-slate-700"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag className="w-16 h-16 text-slate-700 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-400">No products found</h3>
            <p className="text-slate-600 mt-2">Try adjusting your search or filters</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-slate-500 mb-6">
              Showing {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
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
                    <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                      {product.shortDescription || product.fullDescription?.slice(0, 80) || ""}
                    </p>
                    <div className="mt-3 flex items-center gap-2">
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
                      {product.stockStatus === "out_of_stock" && (
                        <span className="ml-auto text-xs text-red-400 font-medium">Out of Stock</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}