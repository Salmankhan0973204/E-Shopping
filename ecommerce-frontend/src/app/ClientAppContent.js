"use client";

import { useAuth } from "../context/AuthContext";
import Navbar from "./components/Navbar";
import { ShoppingBag } from "lucide-react";

export default function ClientAppContent({ children }) {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-slate-900 bg-slate-950/80">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 font-black text-lg bg-gradient-to-r from-purple-500 to-blue-400 bg-clip-text text-transparent">
              <ShoppingBag className="w-5 h-5 text-purple-500" />
              E-SHOPPING
            </div>
            <p className="text-sm text-slate-600">
              &copy; 2026 E-Shopping. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}