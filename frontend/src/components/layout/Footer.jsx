import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Terminal, Shield, Bookmark, LayoutDashboard, Compass } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="border-t border-slate-200 dark:border-surface-borderDark bg-white/70 dark:bg-surface-dark/70 backdrop-blur-md transition-colors mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-subtle">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-display font-bold text-lg text-slate-900 dark:text-slate-100">
                Cogni<span className="text-brand-600 dark:text-brand-400">Write</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed font-sans">
              An editorial reading and publishing workspace engineered for technical depth, knowledge curation, and AI-accelerated prose.
            </p>
          </div>

          {/* Reader Exploration */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-100 mb-3">
              Explore & Learn
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/explore" className="text-slate-500 hover:text-brand-600 transition-colors flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5" />
                  <span>Discover Articles</span>
                </Link>
              </li>
              <li>
                <Link to="/bookmarks" className="text-slate-500 hover:text-brand-600 transition-colors flex items-center gap-1.5">
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>Your Bookmarks</span>
                </Link>
              </li>
              <li>
                <Link to="/explore?category=Architecture" className="text-slate-500 hover:text-brand-600 transition-colors">
                  System Architecture
                </Link>
              </li>
              <li>
                <Link to="/explore?category=AI%20%26%20ML" className="text-slate-500 hover:text-brand-600 transition-colors">
                  AI & ML Engineering
                </Link>
              </li>
            </ul>
          </div>

          {/* Author Workspace */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-100 mb-3">
              Author Workspace
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/write" className="text-slate-500 hover:text-brand-600 transition-colors">
                  Writer Studio
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-slate-500 hover:text-brand-600 transition-colors flex items-center gap-1.5">
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>Author Dashboard</span>
                </Link>
              </li>
              <li>
                <Link to="/notifications" className="text-slate-500 hover:text-brand-600 transition-colors">
                  Activity Feed
                </Link>
              </li>
              <li>
                <Link to="/admin" className="text-slate-500 hover:text-brand-600 transition-colors flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Platform Health</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Engineering Architecture */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-100 mb-3">
              Platform Architecture
            </h4>
            <div className="space-y-2 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-brand-600" />
                <code className="text-slate-700 dark:text-slate-300">GET /api/health</code>
              </div>
              <p className="text-[11px] leading-relaxed">
                MERN Stack (MongoDB, Express, React 18, Node.js) with Tailwind Design Tokens and Strategy AI adapters.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-surface-borderDark flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3">
          <p>© {new Date().getFullYear()} CogniWrite. Built with production-style full-stack standards.</p>
          <div className="flex items-center gap-4">
            <Link to="/explore" className="hover:text-brand-600 transition-colors">Archive</Link>
            <Link to="/admin" className="hover:text-brand-600 transition-colors">Status</Link>
            <Link to="/write" className="hover:text-brand-600 transition-colors">Publish</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
