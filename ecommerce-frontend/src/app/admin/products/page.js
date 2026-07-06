"use client";
import { useState, useEffect } from "react";
import api from "../../../lib/axios";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [categories, setCategories] = useState([]);
  
  const initialFormState = {
    name: "",
    shortDescription: "",
    fullDescription: "",
    category: "",
    subCategory: "",
    brand: "",
    price: "",
    salePrice: "",
    currency: "USD",
    sku: "",
    stock: "",
    stockStatus: "in_stock",
    status: "draft",
    isFeatured: false,
    mainImageFile: null,
    galleryFiles: [],
  };
  
  const [form, setForm] = useState(initialFormState);

  // ─── Fetch Data ──────────────────────────────────────────────────────────
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get("/products");
      const fetchedProducts = res.data?.data?.products || res.data?.products || [];
      setProducts(fetchedProducts);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories");
      setCategories(res.data?.data?.categories || res.data?.categories || []);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // ─── Delete Product ──────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await api.delete(`/products/${id}`);
      fetchProducts();
    } catch (error) {
      console.error("Failed to delete product:", error);
      alert("Error deleting product.");
    }
  };

  // ─── Create Product ──────────────────────────────────────────────────────
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      // append primitive fields
      Object.keys(form).forEach((key) => {
        if (key !== 'mainImageFile' && key !== 'galleryFiles') {
          formData.append(key, form[key]);
        }
      });
      
      // append files
      if (form.mainImageFile) {
        formData.append('mainImage', form.mainImageFile);
      }
      
      if (form.galleryFiles && form.galleryFiles.length > 0) {
        for (let i = 0; i < form.galleryFiles.length; i++) {
          formData.append('gallery', form.galleryFiles[i]);
        }
      }

      // append auto-generated slug
      const generatedSlug = form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      formData.append('slug', generatedSlug);

      await api.post("/products", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setShowModal(false);
      setForm(initialFormState);
      fetchProducts();
    } catch (error) {
      console.error("Failed to create product:", error);
      alert("Error creating product.");
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Products</h1>
          <p className="text-gray-500 text-sm mt-1">{products.length} products total</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all duration-200 shadow-lg shadow-violet-500/20"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Add Product
        </button>
      </div>

      {/* ─── ADD PRODUCT MODAL ─── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl border border-gray-700">
            <div className="p-6 border-b border-gray-700 flex justify-between items-center bg-gray-800/60 rounded-t-2xl">
              <h2 className="text-xl font-bold text-white">Add New Product</h2>
              <button 
                onClick={() => setShowModal(false)} 
                className="text-gray-400 hover:text-gray-200 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleCreate} className="p-6 overflow-y-auto space-y-6">
              
              {/* Row 1: Name, Category, SubCategory */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-1.5">Product Name</label>
                  <input 
                    required
                    type="text" 
                    value={form.name}
                    onChange={(e) => setForm({...form, name: e.target.value})}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 outline-none focus:border-violet-500 text-gray-100 placeholder-gray-500 transition-colors"
                    placeholder="e.g. Samsung Galaxy S24"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-1.5">Category</label>
                  <select 
                    required
                    value={form.category}
                    onChange={(e) => setForm({...form, category: e.target.value})}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 outline-none focus:border-violet-500 text-gray-100 transition-colors"
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-1.5">Sub Category</label>
                  <input 
                    type="text" 
                    value={form.subCategory}
                    onChange={(e) => setForm({...form, subCategory: e.target.value})}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 outline-none focus:border-violet-500 text-gray-100 placeholder-gray-500 transition-colors"
                    placeholder="e.g. Smartphones"
                  />
                </div>
              </div>

              {/* Row 2: Brand & SKU */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-1.5">Brand</label>
                  <input 
                    required
                    type="text" 
                    value={form.brand}
                    onChange={(e) => setForm({...form, brand: e.target.value})}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 outline-none focus:border-violet-500 text-gray-100 placeholder-gray-500 transition-colors"
                    placeholder="e.g. Samsung"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-1.5">SKU</label>
                  <input 
                    required
                    type="text" 
                    value={form.sku}
                    onChange={(e) => setForm({...form, sku: e.target.value})}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 outline-none focus:border-violet-500 text-gray-100 placeholder-gray-500 transition-colors"
                    placeholder="e.g. SAM-S24-001"
                  />
                </div>
              </div>
              
              {/* Row 3: Price, Sale Price, Currency */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-1.5">Price</label>
                  <input 
                    required
                    type="number" 
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => setForm({...form, price: e.target.value})}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 outline-none focus:border-violet-500 text-gray-100 placeholder-gray-500 transition-colors"
                    placeholder="1999"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-1.5">Sale Price</label>
                  <input 
                    type="number" 
                    min="0"
                    step="0.01"
                    value={form.salePrice}
                    onChange={(e) => setForm({...form, salePrice: e.target.value})}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 outline-none focus:border-violet-500 text-gray-100 placeholder-gray-500 transition-colors"
                    placeholder="1799"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-1.5">Currency</label>
                  <select 
                    value={form.currency}
                    onChange={(e) => setForm({...form, currency: e.target.value})}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 outline-none focus:border-violet-500 text-gray-100 transition-colors"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="INR">INR (₹)</option>
                  </select>
                </div>
              </div>

              {/* Row 4: Stock & Stock Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-1.5">Stock Quantity</label>
                  <input 
                    required
                    type="number" 
                    min="0"
                    value={form.stock}
                    onChange={(e) => setForm({...form, stock: e.target.value})}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 outline-none focus:border-violet-500 text-gray-100 placeholder-gray-500 transition-colors"
                    placeholder="30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-1.5">Stock Status</label>
                  <select 
                    value={form.stockStatus}
                    onChange={(e) => setForm({...form, stockStatus: e.target.value})}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 outline-none focus:border-violet-500 text-gray-100 transition-colors"
                  >
                    <option value="in_stock">In Stock</option>
                    <option value="out_of_stock">Out of Stock</option>
                  </select>
                </div>
              </div>

              {/* Row 5: Status & Featured */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-1.5">Product Status</label>
                  <select 
                    value={form.status}
                    onChange={(e) => setForm({...form, status: e.target.value})}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 outline-none focus:border-violet-500 text-gray-100 transition-colors"
                  >
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
                <div className="flex items-center pt-6">
                  <input 
                    type="checkbox" 
                    id="isFeatured"
                    checked={form.isFeatured}
                    onChange={(e) => setForm({...form, isFeatured: e.target.checked})}
                    className="w-5 h-5 text-violet-600 bg-gray-800 border-gray-700 rounded focus:ring-violet-500"
                  />
                  <label htmlFor="isFeatured" className="ml-2 block text-sm font-semibold text-gray-200">
                    Is Featured Product?
                  </label>
                </div>
              </div>

              {/* Image Uploads */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-1.5">Main Image</label>
                  <input 
                    type="file"
                    accept="image/*"
                    onChange={(e) => setForm({...form, mainImageFile: e.target.files[0]})}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2 outline-none focus:border-violet-500 text-gray-100 transition-colors file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-violet-600 file:text-white file:text-sm file:font-medium hover:file:bg-violet-700"
                  />
                  <p className="text-xs text-gray-500 mt-1">Select 1 main product image</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-1.5">Gallery Images</label>
                  <input 
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => setForm({...form, galleryFiles: Array.from(e.target.files)})}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2 outline-none focus:border-violet-500 text-gray-100 transition-colors file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-violet-600 file:text-white file:text-sm file:font-medium hover:file:bg-violet-700"
                  />
                  <p className="text-xs text-gray-500 mt-1">Select up to 5 gallery images</p>
                </div>
              </div>

              {/* Row 6: Short Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-1.5">Short Description</label>
                <input 
                  required
                  type="text"
                  value={form.shortDescription}
                  onChange={(e) => setForm({...form, shortDescription: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 outline-none focus:border-violet-500 text-gray-100 placeholder-gray-500 transition-colors"
                  placeholder="Latest Samsung flagship phone"
                />
              </div>

              {/* Row 7: Full Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-1.5">Full Description</label>
                <textarea 
                  required
                  rows="4"
                  value={form.fullDescription}
                  onChange={(e) => setForm({...form, fullDescription: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 outline-none focus:border-violet-500 transition-all resize-none text-gray-100 placeholder-gray-500"
                  placeholder="Samsung Galaxy S24 with advanced AI features and stunning display..."
                ></textarea>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex gap-3 border-t border-gray-700 mt-6">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-800 text-gray-300 py-3 rounded-xl font-semibold hover:bg-gray-700 transition-colors border border-gray-700"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-violet-600 text-white py-3 rounded-xl font-semibold hover:bg-violet-700 transition-colors shadow-lg shadow-violet-500/20"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── PRODUCT LIST ─── */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500 animate-pulse">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center">
            <span className="text-4xl block mb-3">📦</span>
            <h3 className="text-gray-400 font-medium mb-1">No products yet</h3>
            <p className="text-gray-600 text-sm">Get started by adding a new product to your store.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800/60 border-b border-gray-800">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {products.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-800/40 transition-colors">
                    <td className="px-6 py-4 text-sm font-semibold text-gray-100">{product.name}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-300">${Number(product.price).toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        product.stock > 10 
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' 
                          : product.stock > 0 
                            ? 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/20' 
                            : 'bg-red-500/15 text-red-400 border border-red-500/20'
                      }`}>
                        {product.stock} in stock
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="bg-violet-500/15 text-violet-400 px-2.5 py-1 rounded-lg text-xs font-semibold border border-violet-500/20">
                        {product.category?.name || product.category || "Uncategorized"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-right">
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200"
                      >
                        Delete
                      </button>
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