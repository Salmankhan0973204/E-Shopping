"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";
import { ShoppingBag, ShoppingCart, ChevronLeft, Loader2, Minus, Plus, Check, Star } from "lucide-react";
import Link from "next/link";

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        if (res.data.success) setProduct(res.data.data.product);
      } catch (err) {
        console.error("Error fetching product:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) {
      router.push("/login");
      return;
    }
    setAddingToCart(true);
    try {
      // Store in localStorage for guest/manage cart
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      const existingIndex = cart.findIndex((item) => item.product === id);
      if (existingIndex >= 0) {
        cart[existingIndex].quantity += quantity;
      } else {
        cart.push({
          product: id,
          quantity,
          name: product.name,
          price: product.salePrice || product.price,
          image: product.mainImage?.url || "",
        });
      }
      localStorage.setItem("cart", JSON.stringify(cart));
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    } catch (err) {
      console.error("Error adding to cart:", err);
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="w-16 h-16 text-slate-700 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-400">Product not found</h2>
          <Link href="/products" className="mt-4 inline-flex items-center gap-2 text-purple-400 hover:text-purple-300">
            <ChevronLeft className="w-4 h-4" /> Back to Products
          </Link>
        </div>
      </div>
    );
  }

  const images = [
    product.mainImage?.url,
    ...(product.gallery?.map((g) => g.url) || []),
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-8">
          <Link href="/" className="hover:text-purple-400 transition-colors">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-purple-400 transition-colors">Products</Link>
          <span>/</span>
          <span className="text-slate-400">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-square bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
              {images[selectedImage] ? (
                <img
                  src={images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ShoppingBag className="w-20 h-20 text-slate-700" />
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                      selectedImage === idx
                        ? "border-purple-500"
                        : "border-slate-700 hover:border-slate-500"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <p className="text-sm text-purple-400 font-medium uppercase tracking-wider mb-2">
                {product.category?.name || "General"}
              </p>
              <h1 className="text-3xl md:text-4xl font-bold text-white">{product.name}</h1>
              {product.brand && (
                <p className="text-sm text-slate-500 mt-1">Brand: {product.brand}</p>
              )}
            </div>

            {/* Price */}
            <div className="flex items-center gap-3">
              {product.salePrice ? (
                <>
                  <span className="text-3xl font-bold text-white">
                    ${product.salePrice.toFixed(2)}
                  </span>
                  <span className="text-xl text-slate-500 line-through">
                    ${product.price.toFixed(2)}
                  </span>
                  <span className="px-2 py-1 bg-green-900/40 text-green-400 text-xs font-bold rounded-lg">
                    SALE
                  </span>
                </>
              ) : (
                <span className="text-3xl font-bold text-white">
                  ${product.price.toFixed(2)}
                </span>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              {product.stockStatus === "in_stock" && product.stock > 0 ? (
                <span className="flex items-center gap-1 text-sm text-green-400">
                  <Check className="w-4 h-4" /> In Stock ({product.stock} available)
                </span>
              ) : (
                <span className="text-sm text-red-400">Out of Stock</span>
              )}
            </div>

            {/* Short Description */}
            {product.shortDescription && (
              <p className="text-slate-400 leading-relaxed">{product.shortDescription}</p>
            )}

            {/* Full Description */}
            {product.fullDescription && (
              <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">Description</h3>
                <p className="text-slate-400 leading-relaxed whitespace-pre-line">{product.fullDescription}</p>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-slate-400">Quantity:</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-14 text-center font-semibold text-white text-lg">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock || 99, quantity + 1))}
                  disabled={quantity >= (product.stock || 99)}
                  className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={addingToCart || product.stockStatus === "out_of_stock"}
              className={`w-full flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
                addedToCart
                  ? "bg-green-600 text-white"
                  : "bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-500 hover:to-blue-400 text-white shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30"
              } disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]`}
            >
              {addingToCart ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : addedToCart ? (
                <>
                  <Check className="w-5 h-5" /> Added to Cart!
                </>
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5" /> Add to Cart
                </>
              )}
            </button>

            {/* SKU & Details */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800">
              {product.sku && (
                <div>
                  <p className="text-xs text-slate-500">SKU</p>
                  <p className="text-sm font-medium text-slate-300">{product.sku}</p>
                </div>
              )}
              {product.subCategory && (
                <div>
                  <p className="text-xs text-slate-500">Sub Category</p>
                  <p className="text-sm font-medium text-slate-300">{product.subCategory}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}