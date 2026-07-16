"use client";

import Link from "next/link";
import { MailCheck } from "lucide-react";

export default function CheckEmailPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-950 text-slate-100 px-4 py-12">
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-purple-600/20 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-blue-600/20 blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md z-10 text-center">
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-10 shadow-2xl flex flex-col items-center">
          <div className="p-4 bg-gradient-to-tr from-purple-600 to-blue-500 rounded-full shadow-lg shadow-purple-500/30 mb-6">
            <MailCheck className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-purple-400 bg-clip-text text-transparent mb-4">
            Check Your Email
          </h1>
          
          <p className="text-slate-300 text-sm mb-8 leading-relaxed">
            We've sent a verification link to your email address. Please check your inbox and click the link to verify your account.
          </p>

          <Link
            href="/login"
            className="w-full py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer border border-slate-700"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
