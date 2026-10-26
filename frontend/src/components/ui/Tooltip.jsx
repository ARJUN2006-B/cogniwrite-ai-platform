import React, { useState } from 'react';

export const Tooltip = ({
  children,
  content,
  position = 'top',
  delay = 150,
}) => {
  const [visible, setVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState(null);

  const show = () => {
    const id = setTimeout(() => setVisible(true), delay);
    setTimeoutId(id);
  };

  const hide = () => {
    if (timeoutId) clearTimeout(timeoutId);
    setVisible(false);
  };

  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {visible && content && (
        <div
          role="tooltip"
          className={`absolute z-50 whitespace-nowrap px-2.5 py-1 text-[11px] font-medium text-white bg-slate-900/90 dark:bg-slate-800/95 rounded-lg shadow-elevated border border-slate-700/60 pointer-events-none animate-fade-in ${
            positions[position] || positions.top
          }`}
        >
          {content}
        </div>
      )}
    </div>
  );
};
