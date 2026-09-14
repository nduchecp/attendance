import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  if (totalItems === 0) return null;

  const startIdx = (currentPage - 1) * itemsPerPage + 1;
  const endIdx = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 rounded-b-2xl transition-colors">
      <div className="text-xs text-slate-500 dark:text-slate-400">
        Showing <span className="font-bold text-brand-navy dark:text-slate-200">{startIdx}</span> to{" "}
        <span className="font-bold text-brand-navy dark:text-slate-200">{endIdx}</span> of{" "}
        <span className="font-bold text-brand-navy dark:text-slate-200">{totalItems}</span> entries
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="btn-tactile-secondary p-1.5 rounded-lg disabled:opacity-30 disabled:pointer-events-none"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-1 px-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => {
              // Show first, last, and pages close to current
              return (
                p === 1 ||
                p === totalPages ||
                Math.abs(p - currentPage) <= 1
              );
            })
            .map((p, idx, arr) => {
              const showEllipsisBefore = idx > 0 && p - arr[idx - 1] > 1;
              return (
                <React.Fragment key={p}>
                  {showEllipsisBefore && (
                    <span className="px-1 text-slate-400 dark:text-slate-500 text-xs">...</span>
                  )}
                  <button
                    onClick={() => onPageChange(p)}
                    className={`w-7 h-7 text-xs font-semibold rounded-lg transition-all ${
                      currentPage === p
                        ? "btn-tactile-primary shadow-sm"
                        : "text-slate-600 dark:text-slate-400 hover:text-brand-navy dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-800"
                    }`}
                  >
                    {p}
                  </button>
                </React.Fragment>
              );
            })}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="btn-tactile-secondary p-1.5 rounded-lg disabled:opacity-30 disabled:pointer-events-none"
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
