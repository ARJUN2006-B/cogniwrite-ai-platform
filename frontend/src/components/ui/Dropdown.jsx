import React, { useState, useRef, useEffect } from 'react';

export const Dropdown = ({
  trigger,
  items = [],
  align = 'right',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setIsOpen(!isOpen); }}>
        {trigger}
      </div>

      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          className={`absolute z-50 mt-2 w-56 rounded-2xl bg-white dark:bg-surface-darkCard border border-slate-200 dark:border-surface-borderDark shadow-floating p-1.5 focus:outline-none animate-fade-in ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          {items.map((item, index) => {
            if (item.type === 'divider') {
              return (
                <div
                  key={index}
                  className="my-1 border-t border-slate-100 dark:border-surface-borderDark/60"
                  role="separator"
                />
              );
            }

            return (
              <button
                key={index}
                role="menuitem"
                disabled={item.disabled}
                onClick={() => {
                  setIsOpen(false);
                  if (item.onClick) item.onClick();
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl text-left transition-colors ${
                  item.danger
                    ? 'text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-surface-darkMuted'
                } ${item.disabled ? 'opacity-40 pointer-events-none' : ''}`}
              >
                {item.icon && <span className="flex-shrink-0 text-slate-400">{item.icon}</span>}
                <span className="flex-1">{item.label}</span>
                {item.badge && <span className="ml-auto text-[10px] text-slate-400">{item.badge}</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
