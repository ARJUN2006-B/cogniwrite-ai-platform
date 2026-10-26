import React from 'react';
import { Inbox } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = Inbox,
  title = 'No records found',
  description = 'There are no items to display at this time.',
  action,
  className = '',
}) => {
  return (
    <div
      className={`text-center py-12 px-6 rounded-2xl border border-dashed border-slate-200 dark:border-surface-borderDark bg-slate-50/50 dark:bg-surface-darkCard/40 space-y-4 max-w-lg mx-auto ${className}`}
    >
      <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-surface-darkMuted flex items-center justify-center text-slate-400 mx-auto">
        <Icon className="w-6 h-6" />
      </div>

      <div className="space-y-1">
        <h3 className="text-base font-bold font-display text-slate-800 dark:text-slate-200">
          {title}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm mx-auto">
          {description}
        </p>
      </div>

      {action && <div className="pt-2">{action}</div>}
    </div>
  );
};
