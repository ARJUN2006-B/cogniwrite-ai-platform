import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(({ message, type = 'info', title = '', duration = 4500 }) => {
    const id = Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
    const newToast = { id, message, type, title };

    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
    return id;
  }, [removeToast]);

  const toast = {
    success: (message, title = 'Success') => addToast({ message, type: 'success', title }),
    error: (message, title = 'Error') => addToast({ message, type: 'error', title }),
    info: (message, title = 'Information') => addToast({ message, type: 'info', title }),
    warning: (message, title = 'Warning') => addToast({ message, type: 'warning', title }),
    remove: removeToast
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast Render Stack */}
      <div
        aria-live="polite"
        role="region"
        aria-label="Notifications"
        className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
      >
        {toasts.map((t) => {
          const isSuccess = t.type === 'success';
          const isError = t.type === 'error';
          const isWarning = t.type === 'warning';

          return (
            <div
              key={t.id}
              role="status"
              className={`pointer-events-auto p-4 rounded-xl border shadow-floating flex items-start gap-3 animate-slide-in backdrop-blur-md transition-all ${
                isSuccess
                  ? 'bg-white/95 dark:bg-[#111726]/95 border-emerald-500/30 text-slate-800 dark:text-slate-100'
                  : isError
                  ? 'bg-white/95 dark:bg-[#111726]/95 border-rose-500/30 text-slate-800 dark:text-slate-100'
                  : isWarning
                  ? 'bg-white/95 dark:bg-[#111726]/95 border-amber-500/30 text-slate-800 dark:text-slate-100'
                  : 'bg-white/95 dark:bg-[#111726]/95 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100'
              }`}
            >
              <div className="flex-shrink-0 mt-0.5">
                {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                {isError && <AlertCircle className="w-5 h-5 text-rose-500" />}
                {isWarning && <AlertTriangle className="w-5 h-5 text-amber-500" />}
                {!isSuccess && !isError && !isWarning && <Info className="w-5 h-5 text-brand-500" />}
              </div>

              <div className="flex-1 min-w-0">
                {t.title && (
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-0.5">
                    {t.title}
                  </h4>
                )}
                <p className="text-sm leading-snug">{t.message}</p>
              </div>

              <button
                onClick={() => removeToast(t.id)}
                aria-label="Close notification"
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 -mr-1 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
