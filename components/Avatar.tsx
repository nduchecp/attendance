"use client";

import React, { useState } from "react";

interface AvatarProps {
  name: string;
  userId?: number | string;
  photoUrl?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  isLoading?: boolean;
}

const PALETTES = [
  { bg: "bg-teal-500/20", text: "text-teal-300", border: "border-teal-500/30" },
  { bg: "bg-indigo-500/20", text: "text-indigo-300", border: "border-indigo-500/30" },
  { bg: "bg-emerald-500/20", text: "text-emerald-300", border: "border-emerald-500/30" },
  { bg: "bg-amber-500/20", text: "text-amber-300", border: "border-amber-500/30" },
  { bg: "bg-cyan-500/20", text: "text-cyan-300", border: "border-cyan-500/30" },
  { bg: "bg-rose-500/20", text: "text-rose-300", border: "border-rose-500/30" },
  { bg: "bg-violet-500/20", text: "text-violet-300", border: "border-violet-500/30" },
  { bg: "bg-sky-500/20", text: "text-sky-300", border: "border-sky-500/30" },
];

function getHashColor(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % PALETTES.length;
  return PALETTES[index];
}

function getInitials(name: string): string {
  if (!name || !name.trim()) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function Avatar({
  name,
  userId,
  photoUrl,
  size = "md",
  className = "",
  isLoading = false,
}: AvatarProps) {
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
    xl: "w-16 h-16 text-xl",
  };

  if (isLoading) {
    return (
      <div
        className={`${sizeClasses[size]} rounded-full bg-slate-800 animate-pulse border border-slate-700/50 ${className}`}
      />
    );
  }

  const hashKey = `${userId || ""}-${name || ""}`;
  const color = getHashColor(hashKey);
  const initials = getInitials(name);

  if (photoUrl && !imageError) {
    return (
      <div
        className={`relative inline-flex shrink-0 rounded-full overflow-hidden border border-slate-700/50 ${sizeClasses[size]} ${className}`}
      >
        <img
          src={photoUrl}
          alt={name}
          onError={() => setImageError(true)}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center justify-center shrink-0 rounded-full font-heading font-semibold border select-none transition-transform ${color.bg} ${color.text} ${color.border} ${sizeClasses[size]} ${className}`}
      title={name}
    >
      <span>{initials}</span>
    </div>
  );
}
