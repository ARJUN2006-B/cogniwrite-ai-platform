import React, { useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';

export const SearchBar = ({
  value = '',
  onChange,
  onClear,
  onSubmit,
  placeholder = 'Search articles, topics, or authors...',
  className = '',
  showShortcut = true,
}) => {
  const inputRef = useRef(null);

  // Keyboard shortcut: pressing '/' focuses the search bar
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        e.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) onSubmit(value);
  };

  return (
    <form onSubmit={handleSubmit} className={`relative flex items-center w-full ${className}`}>
      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />

      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(e) => onChange && onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-16 py-2 text-sm rounded-xl bg-white dark:bg-surface-darkCard border border-slate-200 dark:border-surface-borderDark text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 shadow-subtle transition-all"
      />

      <div className="absolute right-3 flex items-center gap-1.5">
        {value ? (
          <button
            type="button"
            onClick={onClear}
            aria-label="Clear search"
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : showShortcut ? (
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-surface-darkMuted border border-slate-200 dark:border-surface-borderDark rounded">
            /
          </kbd>
        ) : null}
      </div>
    </form>
  );
};
