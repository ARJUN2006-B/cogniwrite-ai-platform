import React from 'react';

export const Card = ({
  children,
  className = '',
  hoverable = false,
  as: Component = 'div',
  ...props
}) => {
  return (
    <Component
      className={`rounded-2xl editorial-card p-6 shadow-subtle ${
        hoverable
          ? 'hover:shadow-elevated hover:-translate-y-0.5 cursor-pointer transition-all duration-200'
          : ''
      } ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
};

export const CardHeader = ({ children, className = '', ...props }) => (
  <div className={`space-y-1.5 pb-4 border-b border-slate-100 dark:border-surface-borderDark/60 ${className}`} {...props}>
    {children}
  </div>
);

export const CardTitle = ({ children, className = '', as: Component = 'h3', ...props }) => (
  <Component className={`text-lg font-bold font-display text-slate-900 dark:text-slate-100 ${className}`} {...props}>
    {children}
  </Component>
);

export const CardDescription = ({ children, className = '', ...props }) => (
  <p className={`text-sm text-slate-500 dark:text-slate-400 leading-relaxed ${className}`} {...props}>
    {children}
  </p>
);

export const CardContent = ({ children, className = '', ...props }) => (
  <div className={`pt-4 ${className}`} {...props}>
    {children}
  </div>
);

export const CardFooter = ({ children, className = '', ...props }) => (
  <div className={`pt-4 mt-4 border-t border-slate-100 dark:border-surface-borderDark/60 flex items-center justify-between ${className}`} {...props}>
    {children}
  </div>
);
