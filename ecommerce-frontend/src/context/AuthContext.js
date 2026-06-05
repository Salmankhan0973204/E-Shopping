"use client";

import { createContext, useContext, useState, useEffect } from "react";
import api, { setAccessToken } from "../lib/axios";
import { useRouter } from "next/navigation";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // ─── Initial Load Check (Silent Refresh) ──────────────────────────────────
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // App load hote hi backend se naya access token maango (cookies automatically jayengi)
        const response = await api.post("/auth/refresh");
        if (response.data.success) {
          const { accessToken } = response.data;
          setAccessToken(accessToken);

          // User detail browser database (localStorage) se uthao
          const storedUser = localStorage.getItem("user");
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          }
        }
      } catch (error) {
        // Agar refresh fail ho (ya user first time aaya ho), clean up local state
        localStorage.removeItem("user");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
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
        const { accessToken, user: userData } = response.data;

        // In-memory update karo (Secure!)
        setAccessToken(accessToken);
        
        // Localstorage mein sirf user info save karo (non-sensitive)
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
        const { accessToken, user: userData } = response.data;

        // In-memory update karo (Secure!)
        setAccessToken(accessToken);
        
        // Localstorage mein sirf user info save karo (non-sensitive)
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
      // Backend logout call karo (ye HttpOnly cookie bhi clear kar dega)
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Backend logout error:", error);
    } finally {
      // In-memory token empty karo
      setAccessToken("");
      
      // Localstorage delete karo
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
