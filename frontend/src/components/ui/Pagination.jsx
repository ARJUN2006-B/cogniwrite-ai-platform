import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const Pagination = ({
  page = 1,
  totalPages = 1,
  onPageChange,
  className = '',
}) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (page <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (page >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', page - 1, page, page + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <nav
      role="navigation"
      aria-label="Pagination Navigation"
      className={`flex items-center justify-center gap-1.5 ${className}`}
    >
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        aria-label="Go to previous page"
        className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-surface-darkMuted disabled:opacity-30 disabled:pointer-events-none transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {getPageNumbers().map((p, idx) => {
        if (p === '...') {
          return (
            <span
              key={`ellipsis-${idx}`}
              className="px-2 py-1 text-xs text-slate-400 select-none"
            >
              ...
            </span>
          );
        }

        const isCurrent = p === page;

        return (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            aria-current={isCurrent ? 'page' : undefined}
            aria-label={`Page ${p}`}
            className={`min-w-[32px] h-8 px-2 text-xs font-medium rounded-xl transition-all ${
              isCurrent
                ? 'bg-brand-600 text-white font-semibold shadow-subtle'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-surface-darkMuted'
            }`}
          >
            {p}
          </button>
        );
      })}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Go to next page"
        className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-surface-darkMuted disabled:opacity-30 disabled:pointer-events-none transition-colors"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </nav>
  );
};
