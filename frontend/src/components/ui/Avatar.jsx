import React, { useState } from 'react';

export const Avatar = ({
  src,
  alt = 'User Avatar',
  name = '',
  size = 'md',
  status,
  className = '',
}) => {
  const [imageError, setImageError] = useState(false);

  const sizes = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl font-bold',
  };

  const statusSizes = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
    xl: 'w-3.5 h-3.5',
  };

  const getInitials = (str) => {
    if (!str) return 'U';
    const parts = str.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return str.slice(0, 2).toUpperCase();
  };

  const statusColors = {
    online: 'bg-emerald-500',
    busy: 'bg-rose-500',
    away: 'bg-amber-500',
    offline: 'bg-slate-400',
  };

  return (
    <div className={`relative inline-flex flex-shrink-0 ${className}`}>
      {src && !imageError ? (
        <img
          src={src}
          alt={alt || name}
          onError={() => setImageError(true)}
          className={`${sizes[size] || sizes.md} rounded-full object-cover border border-slate-200 dark:border-surface-borderDark`}
        />
      ) : (
        <div
          className={`${sizes[size] || sizes.md} rounded-full bg-slate-200 dark:bg-surface-darkMuted text-slate-700 dark:text-slate-300 font-semibold flex items-center justify-center border border-slate-300 dark:border-surface-borderDark select-none`}
        >
          {getInitials(name)}
        </div>
      )}

      {status && (
        <span
          className={`absolute bottom-0 right-0 ${
            statusSizes[size] || statusSizes.md
          } rounded-full ring-2 ring-white dark:ring-surface-dark ${
            statusColors[status] || statusColors.online
          }`}
        />
      )}
    </div>
  );
};
