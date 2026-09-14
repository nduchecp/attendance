import React from "react";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionIcon?: LucideIcon;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  actionIcon: ActionIcon,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-12 bg-slate-50/50 dark:bg-slate-900/40 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 my-4 transition-colors">
      <div className="w-16 h-16 rounded-2xl bg-brand-blue/10 dark:bg-brand-blue/20 border border-brand-blue/20 dark:border-brand-blue/30 flex items-center justify-center text-brand-blue dark:text-brand-sky mb-4 shadow-inner">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-heading font-bold text-brand-navy dark:text-slate-100">
        {title}
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mt-1.5 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-5 btn-tactile-primary inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl"
        >
          {ActionIcon && <ActionIcon className="w-4 h-4" />}
          {actionLabel}
        </button>
      )}
    </div>
  );
}
