import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from './Button';

export const ErrorState = ({
  title = 'Something went wrong',
  message = 'An unexpected error occurred while loading this section.',
  onRetry,
  retryText = 'Try Again',
  className = '',
}) => {
  return (
    <div
      role="alert"
      className={`text-center py-10 px-6 rounded-2xl border border-rose-200 dark:border-rose-950/60 bg-rose-50/50 dark:bg-rose-950/20 space-y-4 max-w-lg mx-auto ${className}`}
    >
      <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/50 flex items-center justify-center text-rose-500 mx-auto">
        <AlertCircle className="w-6 h-6" />
      </div>

      <div className="space-y-1">
        <h3 className="text-base font-bold font-display text-rose-900 dark:text-rose-200">
          {title}
        </h3>
        <p className="text-xs text-rose-700/80 dark:text-rose-300/80 leading-relaxed max-w-sm mx-auto">
          {message}
        </p>
      </div>

      {onRetry && (
        <div className="pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            startIcon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            {retryText}
          </Button>
        </div>
      )}
    </div>
  );
};
