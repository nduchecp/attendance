import React from "react";
import { Fingerprint, ScanFace, CheckCircle, AlertTriangle, XCircle, ShieldCheck } from "lucide-react";

export type BadgeVariant =
  | "fingerprint-enrolled"
  | "fingerprint-none"
  | "method-fingerprint"
  | "method-face"
  | "status-verified"
  | "status-failed"
  | "neutral";

interface BadgeProps {
  variant: BadgeVariant;
  label?: string;
  size?: "sm" | "md";
  className?: string;
}

export function Badge({ variant, label, size = "md", className = "" }: BadgeProps) {
  const sizeClasses =
    size === "sm" ? "px-2 py-0.5 text-xs gap-1" : "px-2.5 py-1 text-xs gap-1.5";

  switch (variant) {
    case "fingerprint-enrolled":
      return (
        <span
          className={`inline-flex items-center font-semibold rounded-full bg-emerald-100 text-emerald-950 border border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-500/50 shadow-xs ${sizeClasses} ${className}`}
        >
          <Fingerprint className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
          {label || "Enrolled"}
        </span>
      );

    case "fingerprint-none":
      return (
        <span
          className={`inline-flex items-center font-semibold rounded-full bg-amber-100 text-amber-950 border border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-500/50 shadow-xs ${sizeClasses} ${className}`}
        >
          <Fingerprint className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
          {label || "Not Enrolled"}
        </span>
      );

    case "method-fingerprint":
      return (
        <span
          className={`inline-flex items-center font-semibold rounded-full bg-teal-100 text-teal-950 border border-teal-300 dark:bg-teal-950/80 dark:text-teal-300 dark:border-teal-500/50 shadow-xs ${sizeClasses} ${className}`}
        >
          <Fingerprint className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" />
          {label || "Fingerprint"}
        </span>
      );

    case "method-face":
      return (
        <span
          className={`inline-flex items-center font-semibold rounded-full bg-blue-100 text-blue-950 border border-blue-300 dark:bg-[#1733C0]/30 dark:text-[#97C6E6] dark:border-[#1733C0]/60 shadow-xs ${sizeClasses} ${className}`}
        >
          <ScanFace className="w-3.5 h-3.5 text-[#1733C0] dark:text-[#97C6E6]" />
          {label || "Face"}
        </span>
      );

    case "status-verified":
      return (
        <span
          className={`inline-flex items-center font-semibold rounded-full bg-emerald-100 text-emerald-950 border border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-500/50 shadow-xs ${sizeClasses} ${className}`}
        >
          <CheckCircle className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
          {label || "Verified"}
        </span>
      );

    case "status-failed":
      return (
        <span
          className={`inline-flex items-center font-semibold rounded-full bg-rose-100 text-rose-950 border border-rose-300 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-500/50 shadow-xs ${sizeClasses} ${className}`}
        >
          <XCircle className="w-3.5 h-3.5 text-rose-700 dark:text-rose-400" />
          {label || "Unrecognized"}
        </span>
      );

    case "neutral":
    default:
      return (
        <span
          className={`inline-flex items-center font-semibold rounded-full bg-slate-200 text-slate-900 border border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 shadow-xs ${sizeClasses} ${className}`}
        >
          {label}
        </span>
      );
  }
}

export function parseStatusBadge(statusString: string) {
  const lower = statusString?.toLowerCase() || "";
  if (lower.includes("fingerprint")) {
    return <Badge variant="method-fingerprint" label={statusString} />;
  }
  if (lower.includes("face")) {
    return <Badge variant="method-face" label={statusString} />;
  }
  if (lower.includes("verified")) {
    return <Badge variant="status-verified" label={statusString} />;
  }
  if (lower.includes("failed") || lower.includes("unrecognized") || lower.includes("denied")) {
    return <Badge variant="status-failed" label={statusString} />;
  }
  return <Badge variant="neutral" label={statusString || "Unknown"} />;
}
