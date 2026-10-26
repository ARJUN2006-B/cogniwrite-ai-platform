import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { useBookmarks } from '../../context/BookmarkContext';
import { StatusBadge } from '../common/StatusBadge';
import { Avatar } from '../ui/Avatar';
import { Dropdown } from '../ui/Dropdown';
import {
  Sparkles,
  Compass,
  Bookmark,
  Bell,
  PenTool,
  LayoutDashboard,
  Sun,
  Moon,
  LogOut,
  User,
  Shield,
  Menu,
  X,
  Search
} from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { count: bookmarkCount } = useBookmarks();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold tracking-tight transition-all ${
      isActive
        ? 'text-brand-600 dark:text-brand-400 bg-brand-50/70 dark:bg-brand-950/40'
        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-surface-darkMuted'
    }`;

  // User Profile Dropdown Menu Items
  const profileMenuItems = [
    {
      label: 'Your Profile',
      icon: <User className="w-4 h-4" />,
      onClick: () => navigate('/profile')
    },
    {
      label: 'Author Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
      onClick: () => navigate('/dashboard')
    },
    {
      label: 'Bookmarks',
      icon: <Bookmark className="w-4 h-4" />,
      badge: bookmarkCount > 0 ? bookmarkCount : undefined,
      onClick: () => navigate('/bookmarks')
    },
    {
      label: 'Admin Control',
      icon: <Shield className="w-4 h-4" />,
      onClick: () => navigate('/admin')
    },
    { type: 'divider' },
    {
      label: 'Sign Out',
      danger: true,
      icon: <LogOut className="w-4 h-4" />,
      onClick: handleLogout
    }
  ];

  return (
    <header className="sticky top-0 z-40 w-full editorial-header transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
          <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-subtle group-hover:scale-105 transition-transform">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="text-xl font-bold font-display tracking-tight text-slate-900 dark:text-slate-100">
            Cogni<span className="text-brand-600 dark:text-brand-400">Write</span>
          </span>
        </Link>

        {/* Desktop Nav Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          <NavLink to="/explore" className={navLinkClass}>
            <Compass className="w-4 h-4" />
            <span>Explore</span>
          </NavLink>

          {isAuthenticated && (
            <>
              <NavLink to="/dashboard" className={navLinkClass}>
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </NavLink>

              <NavLink to="/bookmarks" className={navLinkClass}>
                <Bookmark className="w-4 h-4" />
                <span>Bookmarks</span>
                {bookmarkCount > 0 && (
                  <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] bg-brand-100 dark:bg-brand-900/60 text-brand-700 dark:text-brand-300 font-bold">
                    {bookmarkCount}
                  </span>
                )}
              </NavLink>

              <NavLink to="/notifications" className={navLinkClass}>
                <Bell className="w-4 h-4" />
                <span>Notifications</span>
              </NavLink>
            </>
          )}

          <NavLink to="/write" className={navLinkClass}>
            <PenTool className="w-4 h-4" />
            <span>Write</span>
          </NavLink>
        </nav>

        {/* Right Action Tools */}
        <div className="hidden md:flex items-center gap-3">
          <StatusBadge />

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle dark/light theme"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-surface-darkMuted transition-colors"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>

          {/* User Auth or Menu */}
          {isAuthenticated ? (
            <Dropdown
              align="right"
              trigger={
                <button
                  aria-label="User menu"
                  className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-brand-500/20 transition-all focus-visible:outline-none"
                >
                  <Avatar
                    src={user?.avatar}
                    name={user?.name || 'Writer'}
                    size="sm"
                    status="online"
                  />
                </button>
              }
              items={profileMenuItems}
            />
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-1.5 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-subtle transition-all active:scale-95"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2 text-slate-500 dark:text-slate-400"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-surface-darkMuted"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 dark:border-surface-borderDark bg-white dark:bg-surface-dark px-4 pt-3 pb-6 space-y-4 animate-slide-in">
          <StatusBadge />

          <nav className="flex flex-col gap-1">
            <NavLink
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className={navLinkClass}
              end
            >
              <Compass className="w-4 h-4" />
              <span>Home</span>
            </NavLink>
            <NavLink
              to="/explore"
              onClick={() => setMobileMenuOpen(false)}
              className={navLinkClass}
            >
              <Search className="w-4 h-4" />
              <span>Explore</span>
            </NavLink>
            {isAuthenticated && (
              <>
                <NavLink
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className={navLinkClass}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </NavLink>
                <NavLink
                  to="/bookmarks"
                  onClick={() => setMobileMenuOpen(false)}
                  className={navLinkClass}
                >
                  <Bookmark className="w-4 h-4" />
                  <span>Bookmarks ({bookmarkCount})</span>
                </NavLink>
                <NavLink
                  to="/notifications"
                  onClick={() => setMobileMenuOpen(false)}
                  className={navLinkClass}
                >
                  <Bell className="w-4 h-4" />
                  <span>Notifications</span>
                </NavLink>
                <NavLink
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className={navLinkClass}
                >
                  <User className="w-4 h-4" />
                  <span>Your Profile</span>
                </NavLink>
                <NavLink
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className={navLinkClass}
                >
                  <Shield className="w-4 h-4" />
                  <span>Admin Area</span>
                </NavLink>
              </>
            )}
            <NavLink
              to="/write"
              onClick={() => setMobileMenuOpen(false)}
              className={navLinkClass}
            >
              <PenTool className="w-4 h-4" />
              <span>Write Article</span>
            </NavLink>
          </nav>

          <div className="pt-3 border-t border-slate-100 dark:border-surface-borderDark/60 flex flex-col gap-2">
            {isAuthenticated ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-center py-2 text-xs font-semibold text-rose-600 rounded-xl border border-rose-200 dark:border-rose-950"
              >
                Sign Out ({user?.name})
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-surface-borderDark"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 text-xs font-semibold text-white bg-brand-600 rounded-xl shadow-subtle"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
