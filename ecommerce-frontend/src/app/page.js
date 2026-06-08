"use client";

import { useAuth } from "../context/AuthContext";
import Link from "next/link";
import { Loader2, ShoppingBag, LogOut, ShieldCheck, Mail, UserCheck } from "lucide-react";

export default function Home() {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100">
        <Loader2 className="w-12 h-12 text-purple-500 animate-spin mb-4" />
        <p className="text-slate-400 text-sm animate-pulse">Checking authentication status...</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden">
      {/* Decorative Blur Gradients */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-purple-600/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none"></div>

      {/* Navbar */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-black text-xl bg-gradient-to-r from-purple-500 to-blue-400 bg-clip-text text-transparent">
            <ShoppingBag className="w-6 h-6 text-purple-500" />
            E-SHOPPING
          </div>

          <nav className="flex items-center gap-4">
            {user ? (
              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 bg-red-950/40 hover:bg-red-900/40 border border-red-900/50 text-red-400 text-sm font-semibold rounded-xl transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            ) : (
              <div className="flex items-center gap-3">
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
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 max-w-4xl mx-auto w-full z-10">
        {user ? (
          // Logged In Dashboard
          <div className="w-full bg-slate-900/40 border border-slate-800/80 rounded-3xl p-8 backdrop-blur-md shadow-2xl">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              {/* Profile Avatar / Icon */}
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-purple-600 to-blue-500 flex items-center justify-center text-4xl font-extrabold shadow-lg shadow-purple-500/30">
                {user.name.charAt(0).toUpperCase()}
              </div>

              {/* User Details */}
              <div className="flex-1 space-y-6 text-center md:text-left">
                <div>
                  <span className="px-3 py-1 bg-purple-900/50 border border-purple-800 text-purple-400 text-xs font-bold rounded-full uppercase tracking-wider">
                    Logged In Securely
                  </span>
                  <h2 className="text-3xl font-black mt-3 text-white">
                    Hello, {user.name}!
                  </h2>
                  <p className="text-slate-400 mt-1">
                    Welcome to your learning dashboard. Here is your current credentials profile.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-4 bg-slate-950/60 border border-slate-800/60 rounded-2xl">
                    <Mail className="w-5 h-5 text-purple-400" />
                    <div className="text-left">
                      <p className="text-xs text-slate-500 font-medium">Email Address</p>
                      <p className="text-sm font-semibold text-slate-200">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-slate-950/60 border border-slate-800/60 rounded-2xl">
                    <ShieldCheck className="w-5 h-5 text-blue-400" />
                    <div className="text-left">
                      <p className="text-xs text-slate-500 font-medium">Account Role</p>
                      <p className="text-sm font-semibold text-slate-200 capitalize">{user.role}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-slate-950/60 border border-slate-800/60 rounded-2xl">
                    <UserCheck className="w-5 h-5 text-green-400" />
                    <div className="text-left">
                      <p className="text-xs text-slate-500 font-medium">Authentication Mode</p>
                      <p className="text-sm font-semibold text-slate-200">HttpOnly Cookies + JWT</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Landing View
          <div className="text-center space-y-8 py-12">
            <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-none">
              Find Your Style,{" "}
              <span className="block mt-2 bg-gradient-to-r from-purple-500 via-blue-400 to-green-400 bg-clip-text text-transparent">
                Elevate Your Shopping
              </span>
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Discover premium products tailored to your lifestyle. Shop the latest fashion trends, 
              cutting-edge electronics, and home essentials with secure payments and lightning-fast delivery.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/login"
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-500 hover:to-blue-400 text-white font-bold rounded-xl shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 transition-all duration-300 active:scale-[0.98] cursor-pointer"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-8 py-4 bg-slate-900 border border-slate-800 hover:bg-slate-800/80 text-white font-bold rounded-xl transition-all duration-300 active:scale-[0.98] cursor-pointer"
              >
                Create Account
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
