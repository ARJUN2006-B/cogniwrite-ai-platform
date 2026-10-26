import React from 'react';

export const TextSkeleton = ({ lines = 3, className = '' }) => (
  <div className={`space-y-2.5 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <div
        key={i}
        className={`h-3.5 bg-slate-200 dark:bg-surface-darkMuted rounded-md animate-pulse ${
          i === lines - 1 ? 'w-2/3' : 'w-full'
        }`}
      />
    ))}
  </div>
);

export const ArticleCardSkeleton = () => (
  <div className="rounded-2xl editorial-card p-6 shadow-subtle space-y-4 animate-pulse">
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-surface-darkMuted" />
      <div className="space-y-1.5 flex-1">
        <div className="h-3 w-28 bg-slate-200 dark:bg-surface-darkMuted rounded" />
        <div className="h-2.5 w-16 bg-slate-200 dark:bg-surface-darkMuted rounded" />
      </div>
    </div>
    <div className="space-y-2 pt-1">
      <div className="h-5 w-4/5 bg-slate-200 dark:bg-surface-darkMuted rounded" />
      <div className="h-3.5 w-full bg-slate-200 dark:bg-surface-darkMuted rounded" />
      <div className="h-3.5 w-3/4 bg-slate-200 dark:bg-surface-darkMuted rounded" />
    </div>
    <div className="pt-3 border-t border-slate-100 dark:border-surface-borderDark/60 flex items-center justify-between">
      <div className="h-3 w-16 bg-slate-200 dark:bg-surface-darkMuted rounded" />
      <div className="h-3 w-8 bg-slate-200 dark:bg-surface-darkMuted rounded" />
    </div>
  </div>
);

export const TableSkeleton = ({ rows = 5, cols = 4 }) => (
  <div className="w-full space-y-3 animate-pulse">
    <div className="h-10 bg-slate-100 dark:bg-surface-darkMuted rounded-xl w-full" />
    {Array.from({ length: rows }).map((_, r) => (
      <div
        key={r}
        className="h-12 bg-slate-50 dark:bg-surface-darkCard/60 border border-slate-100 dark:border-surface-borderDark/60 rounded-xl w-full flex items-center px-4 gap-4"
      >
        {Array.from({ length: cols }).map((_, c) => (
          <div
            key={c}
            className={`h-3 bg-slate-200 dark:bg-surface-darkMuted rounded ${
              c === 0 ? 'w-1/3' : 'w-1/4'
            }`}
          />
        ))}
      </div>
    ))}
  </div>
);

export const LoadingSkeleton = {
  Text: TextSkeleton,
  ArticleCard: ArticleCardSkeleton,
  Table: TableSkeleton,
};
