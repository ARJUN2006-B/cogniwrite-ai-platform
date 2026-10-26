import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export const Dialog = ({
  open,
  onClose,
  title,
  description,
  children,
  maxWidth = 'max-w-lg',
}) => {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && open) {
        onClose();
      }
    };
    if (open) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      aria-describedby={description ? 'dialog-description' : undefined}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto animate-fade-in"
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 dark:bg-black/75 backdrop-blur-sm transition-opacity"
      />

      {/* Modal Dialog Content */}
      <div
        className={`relative z-10 w-full ${maxWidth} bg-white dark:bg-surface-darkCard rounded-3xl border border-slate-200 dark:border-surface-borderDark shadow-floating p-6 sm:p-8 space-y-5 animate-slide-in`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            {title && (
              <h3
                id="dialog-title"
                className="text-lg font-bold font-display text-slate-900 dark:text-slate-100"
              >
                {title}
              </h3>
            )}
            {description && (
              <p
                id="dialog-description"
                className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed"
              >
                {description}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-surface-darkMuted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div>{children}</div>
      </div>
    </div>
  );
};
