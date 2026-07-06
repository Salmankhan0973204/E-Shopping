"use client";
import { useState, useEffect } from "react";
import api from "../../../lib/axios";

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const fetchCategories = async () => {
    const res = await api.get("/categories");
    setCategories(res.data.data.categories);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = async () => {
    if (!name) return;
    setLoading(true);
    await api.post("/categories", { name, parent: parentId || null });
    setName("");
    setParentId("");
    setShowForm(false);
    fetchCategories();
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this category?")) return;
    await api.delete(`/categories/${id}`);
    fetchCategories();
  };

  // ─── Build hierarchical tree ────────────────────────────────────────────────
  const buildTree = (items) => {
    const map = {};
    const tree = [];

    items.forEach((item) => {
      map[item._id] = { ...item, children: [] };
    });

    items.forEach((item) => {
      if (item.parent && map[item.parent]) {
        map[item.parent].children.push(map[item._id]);
      } else {
        tree.push(map[item._id]);
      }
    });

    return tree;
  };

  // ─── Flatten tree into rows with depth for rendering ────────────────────────
  const flattenTree = (nodes, depth = 0) => {
    const rows = [];
    nodes.forEach((node) => {
      rows.push({ ...node, depth });
      if (node.children.length > 0) {
        rows.push(...flattenTree(node.children, depth + 1));
      }
    });
    return rows;
  };

  // ─── Get all categories as flat options with depth for dropdown ─────────────
  const getCategoryOptions = (nodes, depth = 0) => {
    const options = [];
    nodes.forEach((node) => {
      options.push({ ...node, depth });
      if (node.children.length > 0) {
        options.push(...getCategoryOptions(node.children, depth + 1));
      }
    });
    return options;
  };

  const tree = buildTree(categories);
  const flatRows = flattenTree(tree);
  const categoryOptions = getCategoryOptions(tree);

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Categories</h1>
          <p className="text-gray-500 text-sm mt-1">
            {categories.length} categories total
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all duration-200 shadow-lg shadow-violet-500/20"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add Category
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="bg-gray-900 border border-gray-700 p-5 rounded-2xl mb-6 flex flex-col gap-4">
          <div className="flex gap-4">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              placeholder="Category name..."
              className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 outline-none focus:border-violet-500 text-gray-100 placeholder-gray-500 transition-colors"
            />
            <select
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 outline-none focus:border-violet-500 text-gray-100 transition-colors min-w-[200px]"
            >
              <option value="">None (Main Category)</option>
              {categoryOptions.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <button
              onClick={handleCreate}
              disabled={loading}
              className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-2.5 rounded-xl font-medium transition-all duration-200 disabled:opacity-60"
            >
              {loading ? "Saving..." : "Save"}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="text-gray-500 hover:text-gray-300 px-3 py-2.5 rounded-xl transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        {categories.length === 0 ? (
          <div className="p-12 text-center">
            <span className="text-4xl block mb-3">🏷️</span>
            <h3 className="text-gray-400 font-medium mb-1">
              No categories yet
            </h3>
            <p className="text-gray-600 text-sm">
              Click "Add Category" to create your first one.
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-800/60 border-b border-gray-800">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Name
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Slug
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Parent
                </th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {flatRows.map((cat) => (
                <tr
                  key={cat._id}
                  className="hover:bg-gray-800/40 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div
                      className="flex items-center gap-2"
                      style={{ paddingLeft: `${cat.depth * 24}px` }}
                    >
                      {cat.depth > 0 && (
                        <svg
                          className="w-4 h-4 text-gray-500 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M13 7l5 5m0 0l-5 5m5-5H6"
                          />
                        </svg>
                      )}
                      <span
                        className={`font-medium ${cat.depth === 0 ? "text-gray-100" : "text-gray-400"}`}
                      >
                        {cat.name}
                      </span>
                      {cat.depth === 0 && (
                        <span className="text-xs bg-violet-500/10 text-violet-400 px-2 py-0.5 rounded-full border border-violet-500/20">
                          Main
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs bg-gray-800 text-violet-400 px-2.5 py-1 rounded-lg border border-gray-700 font-mono">
                      {cat.slug}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {cat.parent ? (
                      <span className="text-sm text-gray-500">
                        {categories.find(
                          (c) => c._id === (cat.parent?._id || cat.parent),
                        )?.name || "—"}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-600">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDelete(cat._id)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
