"use client";

import { createContext, useContext, useState, useEffect } from "react";
import api from "../lib/axios";
import { useRouter } from "next/navigation";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // ─── Initial Load Check ──────────────────────────────────────────────────
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("accessToken");

    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // ─── REGISTER FUNCTION ────────────────────────────────────────────────────
  const register = async (name, email, password) => {
    setLoading(true);
    try {
      const response = await api.post("/auth/register", {
        name,
        email,
        password,
      });

      if (response.data.success) {
        const { accessToken, refreshToken, user: userData } = response.data;

        // Save to local storage
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("user", JSON.stringify(userData));

        setUser(userData);
        router.push("/"); // Redirect to home page
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || "Registration failed";
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // ─── LOGIN FUNCTION ───────────────────────────────────────────────────────
  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await api.post("/auth/login", { email, password });

      if (response.data.success) {
        const { accessToken, refreshToken, user: userData } = response.data;

        // Save to local storage
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("user", JSON.stringify(userData));

        setUser(userData);
        router.push("/"); // Redirect to home page
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || "Invalid credentials";
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // ─── LOGOUT FUNCTION ──────────────────────────────────────────────────────
  const logout = async () => {
    setLoading(true);
    try {
      // Backend logout endpoint pe request bhejo (Optional: refresh token delete karne ke liye)
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Backend logout error:", error);
    } finally {
      // Local cleanups hamesha karo chahe API call succeed ho ya fail
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      setUser(null);
      setLoading(false);
      router.push("/login");
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom Hook to use AuthContext
export function useAuth() {
  return useContext(AuthContext);
}
