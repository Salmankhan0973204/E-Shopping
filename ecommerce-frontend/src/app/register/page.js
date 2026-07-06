"use client";

import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Mail, Lock, Eye, EyeOff, Loader2, ShoppingBag, Check, X } from "lucide-react";

export default function RegisterPage() {
  const { register, loading } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");

  // ─── Password Validation Criteria ──────────────────────────────────────────
  const validationRules = {
    length: password.length >= 8,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[^A-Za-z0-9]/.test(password),
  };

  const isPasswordValid = Object.values(validationRules).every(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (!isPasswordValid) {
      setError("Password does not meet all secure requirements");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const result = await register(name, email, password);
    if (!result.success) {
      setError(result.error);
    } else {
      router.push("/login");
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-950 text-slate-100 px-4 py-12">
      {/* Decorative Blur Background Gradients */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-purple-600/20 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-blue-600/20 blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md z-10">
        {/* Logo/Brand Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-gradient-to-tr from-purple-600 to-blue-500 rounded-2xl shadow-lg shadow-purple-500/30 mb-3 animate-pulse">
            <ShoppingBag className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-purple-400 bg-clip-text text-transparent">
            Create Account
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            Sign up to start your shopping journey
          </p>
        </div>

        {/* Form Container (Glassmorphism card) */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-950/50 border border-red-800/50 text-red-400 text-sm flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Input */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-300">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <User className="w-5 h-5" />
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none text-slate-100 placeholder:text-slate-600 transition-all text-sm"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Email Input */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-300">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <Mail className="w-5 h-5" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none text-slate-100 placeholder:text-slate-600 transition-all text-sm"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-300">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <Lock className="w-5 h-5" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 bg-slate-950/80 border border-slate-800 rounded-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none text-slate-100 placeholder:text-slate-600 transition-all text-sm"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition-all"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* Real-time Validation UI */}
              {password.length > 0 && (
                <div className="p-4 mt-2 bg-slate-950/50 rounded-2xl border border-slate-850 space-y-2 text-xs">
                  <p className="font-semibold text-slate-400 mb-2">Password requirements:</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="flex items-center gap-2">
                      {validationRules.length ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <X className="w-4 h-4 text-slate-600" />
                      )}
                      <span className={validationRules.length ? "text-green-400" : "text-slate-500"}>
                        At least 8 characters
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {validationRules.hasUpper ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <X className="w-4 h-4 text-slate-600" />
                      )}
                      <span className={validationRules.hasUpper ? "text-green-400" : "text-slate-500"}>
                        One uppercase letter
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {validationRules.hasLower ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <X className="w-4 h-4 text-slate-600" />
                      )}
                      <span className={validationRules.hasLower ? "text-green-400" : "text-slate-500"}>
                        One lowercase letter
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {validationRules.hasNumber ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <X className="w-4 h-4 text-slate-600" />
                      )}
                      <span className={validationRules.hasNumber ? "text-green-400" : "text-slate-500"}>
                        One number (0-9)
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {validationRules.hasSpecial ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <X className="w-4 h-4 text-slate-600" />
                      )}
                      <span className={validationRules.hasSpecial ? "text-green-400" : "text-slate-500"}>
                        One special character
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password Input */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-300">
                Confirm Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <Lock className="w-5 h-5" />
                </span>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 bg-slate-950/80 border border-slate-800 rounded-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none text-slate-100 placeholder:text-slate-600 transition-all text-sm"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition-all"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || (password.length > 0 && !isPasswordValid)}
              className="w-full py-3.5 mt-2 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-500 hover:to-blue-400 text-white font-bold rounded-xl shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Get Started"
              )}
            </button>
          </form>

          {/* Bottom Link */}
          <div className="mt-6 pt-6 border-t border-slate-800/60 text-center">
            <p className="text-slate-400 text-sm">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-purple-400 hover:text-purple-300 font-semibold hover:underline transition-all"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
