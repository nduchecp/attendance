"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Lock,
  Mail,
  AlertCircle,
  Eye,
  EyeOff,
  Radio,
  HelpCircle,
  X,
  Check,
} from "lucide-react";
import { useToast } from "@/components/ToastContext";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function LoginPage() {
  const router = useRouter();
  const { success, error: toastError } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showForgotModal, setShowForgotModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email.trim() || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Invalid email or password. Please try again.");
        return;
      }

      success("Authenticated successfully. Welcome back!");
      router.push("/");
      router.refresh();
    } catch {
      setErrorMessage("Network connection error. Please verify backend connectivity.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-100 dark:bg-[#06101e] text-slate-900 dark:text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 md:p-8 relative overflow-hidden transition-colors duration-200">
      {/* Top Bar with Theme Switcher */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20 flex items-center gap-3">
        <ThemeToggle showLabel />
      </div>

      {/* Subtle ambient gradient mesh in background */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] bg-[#97C6E6]/20 dark:bg-[#1733C0]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[380px] h-[380px] bg-[#0E6F70]/15 dark:bg-[#0E6F70]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Login Card - Pixel-perfect to Reference Picture 2 */}
      <div className="relative z-10 w-full max-w-[460px] sm:max-w-[490px] bg-white dark:bg-[#0c1f3d] border-2 border-slate-200 dark:border-slate-700/80 rounded-[32px] sm:rounded-[36px] p-7 sm:p-10 shadow-xl dark:shadow-2xl transition-all">
        {/* By Project Group 8 (2025/2026 session) badge without pill background */}
        <div className="flex items-center justify-center mb-5">
          <div className="inline-flex items-center gap-2 text-[#092B5A] dark:text-[#97C6E6] text-xs font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>By Project Group 8 (2025/2026 session)</span>
          </div>
        </div>

        {/* Clean Header from Reference 2 */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#092B5A] dark:text-white tracking-tight leading-tight">
            Welcome to <span className="whitespace-nowrap">Attendance Sys</span>
          </h1>
          <p className="text-xl sm:text-2xl font-heading font-extrabold text-slate-900 dark:text-slate-100 mt-1.5">
            login now!
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-6 p-3.5 bg-rose-50 dark:bg-rose-500/10 border-2 border-rose-200 dark:border-rose-500/30 rounded-2xl flex items-center gap-2.5 text-xs text-rose-700 dark:text-rose-300 font-semibold animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form with Notched Border Labels from Reference 2 */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email field with seamless matching notched label */}
          <div className="relative">
            <label className="absolute -top-2.5 left-5 px-2 bg-white dark:bg-[#0c1f3d] text-xs font-bold text-slate-700 dark:text-slate-200 z-10 leading-none">
              Email
            </label>
            <div className="relative flex items-center">
              <Mail className="w-5 h-5 text-slate-400 dark:text-slate-400 absolute left-4 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="mica.brooks@gmail.com"
                className="w-full bg-white dark:bg-[#0c1f3d] border-2 border-slate-300 dark:border-slate-600 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 font-medium focus:outline-none focus:border-[#1733C0] dark:focus:border-[#97C6E6] focus:ring-4 focus:ring-[#1733C0]/10 transition-all shadow-2xs"
              />
            </div>
          </div>

          {/* Password field with seamless matching notched label and eye toggle */}
          <div className="relative">
            <label className="absolute -top-2.5 left-5 px-2 bg-white dark:bg-[#0c1f3d] text-xs font-bold text-slate-700 dark:text-slate-200 z-10 leading-none">
              Password
            </label>
            <div className="relative flex items-center">
              <Lock className="w-5 h-5 text-slate-400 dark:text-slate-400 absolute left-4 pointer-events-none" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password#$"
                className="w-full bg-white dark:bg-[#0c1f3d] border-2 border-slate-300 dark:border-slate-600 rounded-2xl pl-12 pr-12 py-3.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 font-medium focus:outline-none focus:border-[#1733C0] dark:focus:border-[#97C6E6] focus:ring-4 focus:ring-[#1733C0]/10 transition-all shadow-2xs"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <Eye className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                ) : (
                  <EyeOff className="w-5 h-5 text-slate-400" />
                )}
              </button>
            </div>
          </div>

          {/* Helper Row: Remember me checkbox + Forgot Password link (Exact layout of Ref 2) */}
          <div className="flex items-center justify-between text-xs sm:text-sm pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none group">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-[#092B5A] focus:ring-[#092B5A] accent-[#092B5A] cursor-pointer"
              />
              <span className="font-semibold text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                Remember me
              </span>
            </label>

            <button
              type="button"
              onClick={() => setShowForgotModal(true)}
              className="font-bold text-slate-800 hover:text-[#1733C0] dark:text-slate-200 dark:hover:text-[#97C6E6] transition-colors"
            >
              Forgot Password?
            </button>
          </div>

          {/* Hero Tactile Button (Executive Deep Midnight Navy) */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 px-6 btn-tactile-navy rounded-2xl text-base font-extrabold text-white flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-60 cursor-pointer shadow-md"
          >
            {isLoading ? (
              <div className="flex items-center gap-2 text-white">
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                <span>Logging in...</span>
              </div>
            ) : (
              <span className="text-white">Login</span>
            )}
          </button>
        </form>
      </div>

      {/* Forgot Password Helper Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm animate-fadeIn"
            onClick={() => setShowForgotModal(false)}
          />
          <div className="relative z-10 w-full max-w-sm bg-white dark:bg-[#0D1F3F] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-heading font-bold text-base text-brand-navy dark:text-white">
                Password Recovery
              </h3>
              <button
                onClick={() => setShowForgotModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-3 leading-relaxed">
              Attendance Sys admin credentials are configured in the system environment variables (<code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded font-mono text-[11px]">ADMIN_EMAIL</code> and <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded font-mono text-[11px]">ADMIN_PASSWORD</code>).
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              If you forgot your password, update <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded font-mono text-[11px]">ADMIN_PASSWORD</code> in your Vercel or hosting environment settings.
            </p>
            <button
              onClick={() => setShowForgotModal(false)}
              className="mt-5 w-full py-2.5 px-4 btn-tactile-primary rounded-xl text-xs font-semibold"
            >
              Back to Login
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
