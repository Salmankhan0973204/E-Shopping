"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  ShoppingBag,
  ShoppingCart,
  Package,
  LogOut,
  LayoutDashboard,
  Menu,
  X,
} from "lucide-react";

export default function Navbar() {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const [mobileMenu, setMobileMenu] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  // Update cart count
  useEffect(() => {
    const updateCartCount = () => {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      setCartCount(cart.reduce((sum, item) => sum + item.quantity, 0));
    };
    updateCartCount();
    window.addEventListener("storage", updateCartCount);
    window.addEventListener("cartUpdated", updateCartCount);
    return () => {
      window.removeEventListener("storage", updateCartCount);
      window.removeEventListener("cartUpdated", updateCartCount);
    };
  }, []);

  // Don't show on admin pages
  if (pathname?.startsWith("/admin")) return null;

  if (loading) return null;

  return (
    <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-black text-xl bg-gradient-to-r from-purple-500 to-blue-400 bg-clip-text text-transparent"
        >
          <ShoppingBag className="w-6 h-6 text-purple-500" />
          E-SHOPPING
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/products"
            className="text-sm font-semibold text-slate-400 hover:text-white transition-colors"
          >
            Products
          </Link>
          {user ? (
            <>
              <Link
                href="/orders"
                className="text-sm font-semibold text-slate-400 hover:text-white transition-colors flex items-center gap-1.5"
              >
                <Package className="w-4 h-4" />
                My Orders
              </Link>
              <Link
                href="/cart"
                className="relative text-sm font-semibold text-slate-400 hover:text-white transition-colors"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-purple-600 text-white text-[10px] font-bold flex items-center justify-center">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </Link>
              {user.role === "admin" && (
                <Link
                  href="/admin"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600/20 hover:bg-violet-600/30 border border-violet-600/40 text-violet-400 text-xs font-bold rounded-lg transition-all"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  Admin
                </Link>
              )}
              <button
                onClick={logout}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-950/40 hover:bg-red-900/40 border border-red-900/50 text-red-400 text-xs font-bold rounded-lg transition-all cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                Logout
              </button>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/cart"
                className="relative text-sm font-semibold text-slate-400 hover:text-white transition-colors"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-purple-600 text-white text-[10px] font-bold flex items-center justify-center">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </Link>
              <Link
                href="/login"
                className="text-sm font-semibold text-slate-300 hover:text-white transition-all"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-500 hover:to-blue-400 text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-purple-500/20"
              >
                Get Started
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-3 md:hidden">
          <Link href="/cart" className="relative">
            <ShoppingCart className="w-5 h-5 text-slate-400" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-purple-600 text-white text-[10px] font-bold flex items-center justify-center">
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </Link>
          <button
            onClick={() => setMobileMenu(!mobileMenu)}
            className="text-slate-400 hover:text-white"
          >
            {mobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenu && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950/95 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-3">
            <Link
              href="/products"
              onClick={() => setMobileMenu(false)}
              className="block px-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-sm font-semibold text-slate-300 hover:text-white"
            >
              Products
            </Link>
            {user ? (
              <>
                <Link
                  href="/orders"
                  onClick={() => setMobileMenu(false)}
                  className="block px-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-sm font-semibold text-slate-300 hover:text-white"
                >
                  My Orders
                </Link>
                {user.role === "admin" && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenu(false)}
                    className="block px-4 py-2.5 bg-violet-600/20 border border-violet-600/40 rounded-xl text-sm font-semibold text-violet-400"
                  >
                    Admin Dashboard
                  </Link>
                )}
                <button
                  onClick={() => {
                    logout();
                    setMobileMenu(false);
                  }}
                  className="w-full px-4 py-2.5 bg-red-950/40 border border-red-900/50 rounded-xl text-sm font-semibold text-red-400 text-left cursor-pointer"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileMenu(false)}
                  className="block px-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-sm font-semibold text-slate-300 hover:text-white"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenu(false)}
                  className="block px-4 py-2.5 bg-gradient-to-r from-purple-600 to-blue-500 rounded-xl text-sm font-bold text-white text-center"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}