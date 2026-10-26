import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="max-w-lg mx-auto text-center py-24 space-y-6">
      <div className="w-16 h-16 rounded-2xl bg-brand-500/10 flex items-center justify-center text-brand-500 mx-auto">
        <Compass className="w-8 h-8" />
      </div>
      <div className="space-y-2">
        <h1 className="text-5xl font-extrabold font-display text-slate-900 dark:text-white">
          404
        </h1>
        <h2 className="text-xl font-bold text-slate-700 dark:text-slate-300">
          Page Not Found
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
          The page or resource you are looking for has been moved, renamed, or does not exist.
        </p>
      </div>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-brand-600 hover:bg-brand-500 shadow-glow-brand transition-all"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Home</span>
      </Link>
    </div>
  );
};
