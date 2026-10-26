import React, { forwardRef, useId } from 'react';
import { AlertCircle } from 'lucide-react';

export const Input = forwardRef(
  (
    {
      label,
      error,
      helperText,
      startIcon,
      endIcon,
      id,
      className = '',
      disabled = false,
      required = false,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300"
          >
            {label}
            {required && <span className="text-rose-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative flex items-center">
          {startIcon && (
            <div className="absolute left-3.5 pointer-events-none text-slate-400">
              {startIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            aria-describedby={
              error ? errorId : helperText ? helperId : undefined
            }
            className={`w-full rounded-xl text-sm transition-all bg-white dark:bg-surface-darkCard text-slate-900 dark:text-slate-100 placeholder:text-slate-400 disabled:opacity-50 disabled:bg-slate-50 dark:disabled:bg-slate-900 border ${
              error
                ? 'border-rose-500 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                : 'border-slate-300 dark:border-surface-borderDark focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20'
            } ${startIcon ? 'pl-10' : 'pl-3.5'} ${
              endIcon || error ? 'pr-10' : 'pr-3.5'
            } py-2.5 focus:outline-none ${className}`}
            {...props}
          />

          {error ? (
            <div className="absolute right-3.5 text-rose-500 pointer-events-none">
              <AlertCircle className="w-4 h-4" />
            </div>
          ) : (
            endIcon && (
              <div className="absolute right-3.5 text-slate-400">{endIcon}</div>
            )
          )}
        </div>

        {error ? (
          <p id={errorId} className="text-xs text-rose-500 flex items-center gap-1 mt-1">
            <span>{error}</span>
          </p>
        ) : helperText ? (
          <p id={helperId} className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
