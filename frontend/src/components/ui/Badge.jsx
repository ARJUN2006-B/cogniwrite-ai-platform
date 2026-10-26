import React from 'react';

export const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  className = '',
  ...props
}) => {
  const variants = {
    default:
      'bg-slate-100 text-slate-700 dark:bg-surface-darkMuted dark:text-slate-300 border-slate-200 dark:border-surface-borderDark',
    brand:
      'bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300 border-brand-200 dark:border-brand-800/40',
    success:
      'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40',
    warning:
      'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800/40',
    danger:
      'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200 dark:border-rose-800/40',
    neutral:
      'bg-slate-50 text-slate-600 dark:bg-slate-900/60 dark:text-slate-400 border-slate-200/80 dark:border-slate-800',
    sample:
      'bg-indigo-50/70 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/40 italic',
    outline:
      'bg-transparent text-slate-700 dark:text-slate-300 border-slate-300 dark:border-surface-borderDark',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
  };

  const dotColors = {
    default: 'bg-slate-400',
    brand: 'bg-brand-500',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-rose-500',
    neutral: 'bg-slate-400',
    sample: 'bg-indigo-400',
    outline: 'bg-slate-400',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${
        variants[variant] || variants.default
      } ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            dotColors[variant] || dotColors.default
          }`}
        />
      )}
      <span>{children}</span>
    </span>
  );
};
