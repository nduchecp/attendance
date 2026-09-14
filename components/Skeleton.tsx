import React from "react";

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`relative overflow-hidden bg-slate-200/80 dark:bg-slate-800/80 rounded-lg before:absolute before:inset-0 before:-translate-x-full before:animate-shimmer before:bg-gradient-to-r before:from-transparent before:via-slate-300/40 dark:before:via-slate-700/30 before:to-transparent ${className}`}
    />
  );
}

export function StatCardSkeleton() {
  return (
    <div className="bg-white dark:bg-[#0D1F3F] border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-11 w-11 rounded-2xl" />
      </div>
      <div className="mt-4">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-3.5 w-32 mt-2" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="w-full divide-y divide-slate-100 dark:divide-slate-800">
      {Array.from({ length: rows }).map((_, rIdx) => (
        <div key={rIdx} className="flex items-center px-6 py-4 gap-4">
          <Skeleton className="w-10 h-10 rounded-full shrink-0" />
          <div className="flex-1 grid grid-cols-4 gap-4">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

