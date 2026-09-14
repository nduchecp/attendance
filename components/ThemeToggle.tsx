"use client";

import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "./ThemeContext";

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggle({ className = "", showLabel = false }: ThemeToggleProps) {
  const { theme, toggleTheme, mounted } = useTheme();

  if (!mounted) {
    return (
      <div className={`w-9 h-9 rounded-xl bg-slate-200/50 dark:bg-slate-800/50 animate-pulse ${className}`} />
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? "Light" : "Dark"} Mode`}
      title={`Current: ${isDark ? "Dark Mode" : "Light Mode"}. Click to switch.`}
      className={`inline-flex items-center justify-center gap-2 p-2 sm:px-3 sm:py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 border active:scale-95 ${
        isDark
          ? "bg-[#0c1e38] hover:bg-[#132c52] text-amber-300 border-amber-400/30 shadow-sm"
          : "bg-white hover:bg-slate-50 text-[#092B5A] border-slate-300 shadow-sm"
      } ${className}`}
    >
      <div className="relative w-4 h-4 flex items-center justify-center shrink-0">
        {isDark ? (
          <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
        ) : (
          <Moon className="w-4 h-4 text-[#1733C0]" />
        )}
      </div>
      <span className={`font-medium text-xs ${showLabel ? "inline" : "hidden sm:inline"}`}>
        {isDark ? "Dark" : "Light"}
      </span>
    </button>
  );
}
