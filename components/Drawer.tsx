"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: "sm" | "md" | "lg";
}

export function Drawer({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  width = "md",
}: DrawerProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const widthClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-xl",
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity animate-fadeIn"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div
        className={`relative z-10 w-full ${widthClasses[width]} bg-white dark:bg-[#0D1F3F] border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col h-full animate-slideInRight transition-colors`}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between bg-white/95 dark:bg-[#0D1F3F]/95 sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-heading font-bold text-brand-navy dark:text-white tracking-tight">
              {title}
            </h2>
            {subtitle && (
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#0D1F3F]/95 sticky bottom-0 z-10">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
