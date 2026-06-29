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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Products</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm"
        >
          Add Product
        </button>
      </div>

      {/* ─── ADD PRODUCT MODAL ─── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
              <h2 className="text-xl font-bold text-gray-900">Add New Product</h2>
              <button 
                onClick={() => setShowModal(false)} 
                className="text-gray-400 hover:text-gray-600 transition-colors"
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
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Product Name</label>
                  <input 
                    required
                    type="text" 
                    value={form.name}
                    onChange={(e) => setForm({...form, name: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-gray-900 bg-white placeholder-gray-400"
                    placeholder="e.g. Samsung Galaxy S24"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category</label>
                  <select 
                    required
                    value={form.category}
                    onChange={(e) => setForm({...form, category: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-gray-900 bg-white placeholder-gray-400"
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Sub Category</label>
                  <input 
                    type="text" 
                    value={form.subCategory}
                    onChange={(e) => setForm({...form, subCategory: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-gray-900 bg-white placeholder-gray-400"
                    placeholder="e.g. Smartphones"
                  />
                </div>
              </div>

              {/* Row 2: Brand & SKU */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Brand</label>
                  <input 
                    required
                    type="text" 
                    value={form.brand}
                    onChange={(e) => setForm({...form, brand: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-gray-900 bg-white placeholder-gray-400"
                    placeholder="e.g. Samsung"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">SKU</label>
                  <input 
                    required
                    type="text" 
                    value={form.sku}
                    onChange={(e) => setForm({...form, sku: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-gray-900 bg-white placeholder-gray-400"
                    placeholder="e.g. SAM-S24-001"
                  />
                </div>
              </div>
              
              {/* Row 3: Price, Sale Price, Currency */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Price</label>
                  <input 
                    required
                    type="number" 
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => setForm({...form, price: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-gray-900 bg-white placeholder-gray-400"
                    placeholder="1999"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Sale Price</label>
                  <input 
                    type="number" 
                    min="0"
                    step="0.01"
                    value={form.salePrice}
                    onChange={(e) => setForm({...form, salePrice: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-gray-900 bg-white placeholder-gray-400"
                    placeholder="1799"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Currency</label>
                  <select 
                    value={form.currency}
                    onChange={(e) => setForm({...form, currency: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-gray-900 bg-white placeholder-gray-400"
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
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Stock Quantity</label>
                  <input 
                    required
                    type="number" 
                    min="0"
                    value={form.stock}
                    onChange={(e) => setForm({...form, stock: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-gray-900 bg-white placeholder-gray-400"
                    placeholder="30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Stock Status</label>
                  <select 
                    value={form.stockStatus}
                    onChange={(e) => setForm({...form, stockStatus: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-gray-900 bg-white placeholder-gray-400"
                  >
                    <option value="in_stock">In Stock</option>
                    <option value="out_of_stock">Out of Stock</option>
                  </select>
                </div>
              </div>

              {/* Row 5: Status & Featured */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Product Status</label>
                  <select 
                    value={form.status}
                    onChange={(e) => setForm({...form, status: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-gray-900 bg-white placeholder-gray-400"
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
                    className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <label htmlFor="isFeatured" className="ml-2 block text-sm font-semibold text-gray-900">
                    Is Featured Product?
                  </label>
                </div>
              </div>

              {/* Row 5.5: Image Uploads */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Main Image</label>
                  <input 
                    type="file"
                    accept="image/*"
                    onChange={(e) => setForm({...form, mainImageFile: e.target.files[0]})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-gray-900 bg-white"
                  />
                  <p className="text-xs text-gray-500 mt-1">Select 1 main product image</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Gallery Images</label>
                  <input 
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => setForm({...form, galleryFiles: Array.from(e.target.files)})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-gray-900 bg-white"
                  />
                  <p className="text-xs text-gray-500 mt-1">Select up to 5 gallery images</p>
                </div>
              </div>

              {/* Row 6: Short Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Short Description</label>
                <input 
                  required
                  type="text"
                  value={form.shortDescription}
                  onChange={(e) => setForm({...form, shortDescription: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-gray-900 bg-white placeholder-gray-400"
                  placeholder="Latest Samsung flagship phone"
                />
              </div>

              {/* Row 7: Full Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Description</label>
                <textarea 
                  required
                  rows="4"
                  value={form.fullDescription}
                  onChange={(e) => setForm({...form, fullDescription: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none text-gray-900 bg-white placeholder-gray-400"
                  placeholder="Samsung Galaxy S24 with advanced AI features and stunning display..."
                ></textarea>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex gap-3 border-t border-gray-100 mt-6">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── PRODUCT LIST ─── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500 font-medium animate-pulse">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 mb-4 border border-gray-100">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No products yet</h3>
            <p className="text-gray-500">Get started by adding a new product to your store.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 font-semibold text-sm text-gray-600">Name</th>
                  <th className="px-6 py-4 font-semibold text-sm text-gray-600">Price</th>
                  <th className="px-6 py-4 font-semibold text-sm text-gray-600">Stock</th>
                  <th className="px-6 py-4 font-semibold text-sm text-gray-600">Category</th>
                  <th className="px-6 py-4 font-semibold text-sm text-gray-600 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">{product.name}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-600">${Number(product.price).toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${product.stock > 10 ? 'bg-green-100 text-green-700' : product.stock > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                        {product.stock} in stock
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <span className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md text-xs font-semibold border border-indigo-100">
                        {product.category?.name || product.category || "Uncategorized"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-right">
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="text-red-500 hover:text-red-700 font-semibold transition-colors"
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
