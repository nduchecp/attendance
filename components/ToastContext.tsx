"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info";

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = "info") => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, message, type }]);

      setTimeout(() => {
        removeToast(id);
      }, 4000);
    },
    [removeToast]
  );

  const success = useCallback(
    (message: string) => showToast(message, "success"),
    [showToast]
  );
  const error = useCallback(
    (message: string) => showToast(message, "error"),
    [showToast]
  );
  const info = useCallback(
    (message: string) => showToast(message, "info"),
    [showToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, success, error, info }}>
      {children}
      {/* Toast container floating bottom-right */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border shadow-2xl backdrop-blur-md transition-all duration-300 animate-fadeIn ${
              toast.type === "success"
                ? "bg-white/95 dark:bg-[#0D1F3F]/95 border-emerald-500/30 text-emerald-600 dark:text-emerald-300"
                : toast.type === "error"
                ? "bg-white/95 dark:bg-[#0D1F3F]/95 border-rose-500/30 text-rose-600 dark:text-rose-300"
                : "bg-white/95 dark:bg-[#0D1F3F]/95 border-brand-blue/30 text-brand-blue dark:text-brand-sky"
            }`}
          >
            <div className="mt-0.5 shrink-0">
              {toast.type === "success" && (
                <CheckCircle2 className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
              )}
              {toast.type === "error" && (
                <AlertCircle className="w-5 h-5 text-rose-500 dark:text-rose-400" />
              )}
              {toast.type === "info" && (
                <Info className="w-5 h-5 text-brand-blue dark:text-brand-sky" />
              )}
            </div>
            <p className="text-sm font-semibold text-brand-navy dark:text-slate-100 flex-1 leading-snug">
              {toast.message}
            </p>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-0.5"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
