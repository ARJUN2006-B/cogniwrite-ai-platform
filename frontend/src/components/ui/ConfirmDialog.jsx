import React from 'react';
import { Dialog } from './Dialog';
import { Button } from './Button';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';

export const ConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  loading = false,
}) => {
  const isDanger = variant === 'danger';

  return (
    <Dialog open={open} onClose={loading ? () => {} : onClose} maxWidth="max-w-md">
      <div className="flex items-start gap-4">
        <div
          className={`p-3 rounded-2xl flex-shrink-0 ${
            isDanger
              ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600'
              : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600'
          }`}
        >
          {isDanger ? (
            <AlertCircle className="w-6 h-6" />
          ) : (
            <AlertTriangle className="w-6 h-6" />
          )}
        </div>

        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            {title}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            {message}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-surface-borderDark/60">
        <Button
          variant="outline"
          size="sm"
          disabled={loading}
          onClick={onClose}
        >
          {cancelText}
        </Button>
        <Button
          variant={isDanger ? 'danger' : 'primary'}
          size="sm"
          loading={loading}
          onClick={onConfirm}
        >
          {confirmText}
        </Button>
      </div>
    </Dialog>
  );
};
