import React, { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

export const Button = forwardRef(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled = false,
      startIcon,
      endIcon,
      className = '',
      type = 'button',
      ...props
    },
    ref
  ) => {
    // Base styles with accessible focus indicator and smooth transitions
    const baseClasses =
      'inline-flex items-center justify-center font-medium rounded-xl transition-all select-none disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 active:scale-[0.98]';

    // Variant styles
    const variants = {
      primary:
        'bg-brand-600 hover:bg-brand-700 text-white shadow-subtle hover:shadow-elevated active:bg-brand-800',
      secondary:
        'bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-surface-darkMuted dark:hover:bg-slate-800 dark:text-slate-100',
      outline:
        'border border-slate-300 dark:border-surface-borderDark hover:bg-slate-50 dark:hover:bg-surface-darkMuted text-slate-700 dark:text-slate-200',
      ghost:
        'hover:bg-slate-100 dark:hover:bg-surface-darkMuted text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100',
      danger:
        'bg-rose-600 hover:bg-rose-700 text-white shadow-subtle active:bg-rose-800',
      subtle:
        'bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 hover:bg-brand-100 dark:hover:bg-brand-900/40 border border-brand-200 dark:border-brand-800/40',
    };

    // Size styles
    const sizes = {
      sm: 'text-xs px-3 py-1.5 gap-1.5',
      md: 'text-sm px-4 py-2 gap-2',
      lg: 'text-base px-5 py-2.5 gap-2.5',
      icon: 'p-2 rounded-lg',
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        className={`${baseClasses} ${variants[variant] || variants.primary} ${
          sizes[size] || sizes.md
        } ${className}`}
        {...props}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin text-current" />
        ) : (
          startIcon && <span className="flex-shrink-0">{startIcon}</span>
        )}
        <span>{children}</span>
        {!loading && endIcon && <span className="flex-shrink-0">{endIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
