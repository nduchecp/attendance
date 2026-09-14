"use client";

import React, { useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  warningNote?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  warningNote,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  isDestructive = true,
  isLoading = false,
}: ConfirmModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isLoading) {
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
  }, [isOpen, onClose, isLoading]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm transition-opacity animate-fadeIn"
        onClick={() => !isLoading && onClose()}
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div
        className="relative z-10 w-full max-w-md bg-white dark:bg-[#0D1F3F] border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl animate-fadeIn transition-colors"
        role="alertdialog"
        aria-modal="true"
      >
        <div className="flex items-start gap-4">
          <div
            className={`p-3 rounded-2xl shrink-0 ${
              isDestructive
                ? "bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30"
                : "bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30"
            }`}
          >
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-heading font-bold text-brand-navy dark:text-white">
              {title}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
              {message}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {warningNote && (
          <div className="mt-4 p-3.5 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/25 rounded-2xl text-xs text-amber-800 dark:text-amber-300/90 leading-relaxed">
            <span className="font-semibold block mb-0.5">
              Physical Hardware Notice:
            </span>
            {warningNote}
          </div>
        )}

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="btn-tactile-secondary px-4 py-2 text-xs font-semibold rounded-xl"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 text-xs font-semibold rounded-xl flex items-center gap-2 ${
              isDestructive ? "btn-tactile-danger" : "btn-tactile-primary"
            }`}
          >
            {isLoading && (
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
