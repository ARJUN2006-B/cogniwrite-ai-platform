import React, { useState } from 'react';
import { useToast } from '../context/ToastContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import {
  Bell,
  Heart,
  MessageSquare,
  Sparkles,
  UserPlus,
  CheckCheck,
  Trash2
} from 'lucide-react';

const INITIAL_NOTIFICATIONS = [
  {
    id: 'n1',
    type: 'like',
    title: 'New Like on your article',
    message: 'Sofia Chen liked "Building Resilient Microservices with Node.js and MongoDB"',
    timestamp: '15m ago',
    unread: true,
  },
  {
    id: 'n2',
    type: 'ai',
    title: 'Weekly AI Knowledge Digest Ready',
    message: 'Your weekly digest synthesized 3 trending distributed systems topics.',
    timestamp: '2h ago',
    unread: true,
  },
  {
    id: 'n3',
    type: 'follow',
    title: 'New Follower',
    message: 'Dr. Marcus Vance started following your engineering publications.',
    timestamp: '1d ago',
    unread: false,
  },
  {
    id: 'n4',
    type: 'comment',
    title: 'New Peer Critique',
    message: 'David Thorne commented on "Designing Decoupled AI Provider Abstractions".',
    timestamp: '2d ago',
    unread: false,
  },
];

export const NotificationsPage = () => {
  const toast = useToast();
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [filter, setFilter] = useState('all'); // 'all' | 'unread'

  const unreadCount = notifications.filter((n) => n.unread).length;

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    toast.success('All notifications marked as read');
  };

  const handleClearAll = () => {
    setNotifications([]);
    toast.info('Notification feed cleared');
  };

  const filtered = notifications.filter((n) => {
    if (filter === 'unread') return n.unread;
    return true;
  });

  const getIcon = (type) => {
    switch (type) {
      case 'like':
        return <Heart className="w-4 h-4 text-rose-500" />;
      case 'comment':
        return <MessageSquare className="w-4 h-4 text-brand-500" />;
      case 'ai':
        return <Sparkles className="w-4 h-4 text-amber-500" />;
      case 'follow':
        return <UserPlus className="w-4 h-4 text-accent-cyan" />;
      default:
        return <Bell className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-4">
      {/* Notifications Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-surface-borderDark">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Bell className="w-6 h-6 text-brand-600" />
            <span>Activity Notifications</span>
            {unreadCount > 0 && (
              <Badge variant="brand" size="sm">
                {unreadCount} new
              </Badge>
            )}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time peer reactions, reader comments, and AI curation digests.
          </p>
        </div>

        {notifications.length > 0 && (
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                variant="subtle"
                size="sm"
                onClick={handleMarkAllRead}
                startIcon={<CheckCheck className="w-3.5 h-3.5" />}
              >
                Mark Read
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearAll}
              startIcon={<Trash2 className="w-3.5 h-3.5 text-slate-400" />}
            >
              Clear
            </Button>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 pb-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            filter === 'all'
              ? 'bg-brand-600 text-white shadow-subtle'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-surface-darkMuted'
          }`}
        >
          All Activity ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            filter === 'unread'
              ? 'bg-brand-600 text-white shadow-subtle'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-surface-darkMuted'
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* Notification Stream */}
      {filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-2xl editorial-card flex items-start gap-3.5 transition-all ${
                item.unread
                  ? 'border-brand-500/30 bg-brand-50/20 dark:bg-brand-950/20'
                  : ''
              }`}
            >
              <div className="p-2 rounded-xl bg-slate-100 dark:bg-surface-darkMuted flex-shrink-0 mt-0.5">
                {getIcon(item.type)}
              </div>

              <div className="flex-1 min-w-0 space-y-0.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    {item.title}
                  </h4>
                  <span className="text-[11px] text-slate-400">{item.timestamp}</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {item.message}
                </p>
              </div>

              {item.unread && (
                <span className="w-2 h-2 rounded-full bg-brand-600 mt-2 flex-shrink-0" />
              )}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Bell}
          title="All caught up"
          description="There are no pending notifications in this view."
        />
      )}
    </div>
  );
};
