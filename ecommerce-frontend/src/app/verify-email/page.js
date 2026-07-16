"use client";
import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import api from "../../lib/axios";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState("verifying"); // verifying, success, error

  const effectRan = useRef(false);

  useEffect(() => {
    if (effectRan.current) return;
    effectRan.current = true;

    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      return;
    }

    const verify = async () => {
      try {
        await api.get(`/auth/verify-email?token=${token}`);
        setStatus("success");
        setTimeout(() => router.push("/login"), 3000);
      } catch (error) {
        setStatus("error");
      }
    };

    verify();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      {status === "verifying" && (
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-2">Verifying...</h1>
          <p className="text-slate-400">Please wait</p>
        </div>
      )}
      {status === "success" && (
        <div className="text-center">
          <h1 className="text-2xl font-bold text-green-400 mb-2">Email Verified! ✅</h1>
          <p className="text-slate-400">Redirecting to login...</p>
        </div>
      )}
      {status === "error" && (
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-2">Invalid Token ❌</h1>
          <p className="text-slate-400">Please register again</p>
        </div>
      )}
    </div>
  );
}