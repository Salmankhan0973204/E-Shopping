"use client";

import { useAuth } from "../context/AuthContext";

export default function ClientAppContent({ children }) {
  const { loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-white">Loading...</div>
      </div>
    );
  }
  
  return children;
}
