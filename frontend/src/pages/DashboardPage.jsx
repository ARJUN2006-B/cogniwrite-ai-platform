import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';
import { articleService } from '../services/articleService';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { EmptyState } from '../components/ui/EmptyState';
import { formatDate } from '../utils/formatDate';
import {
  LayoutDashboard,
  PenTool,
  BookOpen,
  Eye,
  Heart,
  MessageSquare,
  FileText,
  Edit2,
  Trash2,
  ExternalLink,
  RotateCcw,
  LogIn,
  CheckCircle2,
  Clock,
  Sparkles
} from 'lucide-react';

export const DashboardPage = () => {
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();

  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'published' | 'draft'

  // Action dialogs
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingStatusId, setTogglingStatusId] = useState(null);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const data = await articleService.getDashboardMetrics();
      setMetrics(data);
    } catch (err) {
      toast.error(err.message || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchMetrics();
    }
  }, [isAuthenticated]);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await articleService.deleteArticle(deleteTarget._id);
      toast.success('Article deleted permanently');
      setDeleteTarget(null);
      await fetchMetrics();
    } catch (err) {
      toast.error(err.message || 'Failed to delete article');
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleStatus = async (article) => {
    const newStatus = article.status === 'published' ? 'draft' : 'published';
    setTogglingStatusId(article._id);
    try {
      await articleService.updateArticle(article._id, { status: newStatus });
      toast.success(
        newStatus === 'published'
          ? 'Article published to live feed!'
          : 'Article reverted to private draft'
      );
      await fetchMetrics();
    } catch (err) {
      toast.error(err.message || 'Failed to update article status');
    } finally {
      setTogglingStatusId(null);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-16 text-center space-y-4">
        <Card className="p-8 space-y-4 shadow-subtle">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950/40 text-brand-600 flex items-center justify-center mx-auto">
            <LogIn className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold font-display text-slate-900 dark:text-slate-100">
            Sign In to Access Dashboard
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Your author dashboard displays real metrics, draft states, and management controls for your articles.
          </p>
          <div className="flex flex-col gap-2 pt-2">
            <Link to="/login">
              <Button variant="primary" className="w-full">
                Sign In Now
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const articles = metrics?.articles || [];
  const filteredArticles = articles.filter((art) => {
    if (statusFilter === 'all') return true;
    return art.status === statusFilter;
  });

  return (
    <div className="space-y-8 py-4">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-surface-borderDark">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6 text-brand-600" />
            <span>Author Workspace & Real Analytics</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Welcome back, {user?.name || 'Engineer'}. Monitor live performance and manage your technical essays.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchMetrics}
            startIcon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>

          <Link to="/write">
            <Button
              variant="primary"
              size="sm"
              startIcon={<PenTool className="w-3.5 h-3.5" />}
            >
              Compose New Essay
            </Button>
          </Link>
        </div>
      </div>

      {/* Real KPI Cards Grid (Direct DB aggregation, no fabrication) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total Articles */}
        <Card className="p-4 space-y-1.5">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Essays</span>
            <BookOpen className="w-3.5 h-3.5 text-brand-600" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-display text-slate-900 dark:text-slate-100">
            {loading ? '...' : metrics?.totalArticles ?? 0}
          </div>
          <p className="text-[10px] text-slate-400">Created in database</p>
        </Card>

        {/* Published */}
        <Card className="p-4 space-y-1.5">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">Published</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-display text-emerald-600 dark:text-emerald-400">
            {loading ? '...' : metrics?.totalPublished ?? 0}
          </div>
          <p className="text-[10px] text-slate-400">Live for all readers</p>
        </Card>

        {/* Drafts */}
        <Card className="p-4 space-y-1.5">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">Drafts</span>
            <FileText className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-display text-amber-600 dark:text-amber-400">
            {loading ? '...' : metrics?.totalDrafts ?? 0}
          </div>
          <p className="text-[10px] text-slate-400">Work in progress</p>
        </Card>

        {/* Total Views */}
        <Card className="p-4 space-y-1.5">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Views</span>
            <Eye className="w-3.5 h-3.5 text-accent-cyan" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-display text-slate-900 dark:text-slate-100">
            {loading ? '...' : metrics?.totalViews ?? 0}
          </div>
          <p className="text-[10px] text-slate-400">Actual reader visits</p>
        </Card>

        {/* Total Likes */}
        <Card className="p-4 space-y-1.5">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Likes</span>
            <Heart className="w-3.5 h-3.5 text-rose-500" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-display text-rose-600 dark:text-rose-400">
            {loading ? '...' : metrics?.totalLikes ?? 0}
          </div>
          <p className="text-[10px] text-slate-400">Verified peer likes</p>
        </Card>

        {/* Total Comments */}
        <Card className="p-4 space-y-1.5">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">Comments</span>
            <MessageSquare className="w-3.5 h-3.5 text-purple-500" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-display text-purple-600 dark:text-purple-400">
            {loading ? '...' : metrics?.totalComments ?? 0}
          </div>
          <p className="text-[10px] text-slate-400">Discussion threads</p>
        </Card>
      </div>

      {/* Article Management Table */}
      <Card className="space-y-4 shadow-subtle">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-surface-borderDark/60">
          <div>
            <h3 className="text-sm font-bold font-display text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-600" />
              <span>Article Inventory</span>
            </h3>
            <p className="text-xs text-slate-400">
              Manage publication status, edits, and reader interactions.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                statusFilter === 'all'
                  ? 'bg-brand-600 text-white'
                  : 'bg-slate-100 dark:bg-surface-darkMuted text-slate-600 dark:text-slate-400 hover:text-brand-600'
              }`}
            >
              All ({articles.length})
            </button>
            <button
              onClick={() => setStatusFilter('published')}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                statusFilter === 'published'
                  ? 'bg-brand-600 text-white'
                  : 'bg-slate-100 dark:bg-surface-darkMuted text-slate-600 dark:text-slate-400 hover:text-brand-600'
              }`}
            >
              Published ({metrics?.totalPublished ?? 0})
            </button>
            <button
              onClick={() => setStatusFilter('draft')}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                statusFilter === 'draft'
                  ? 'bg-brand-600 text-white'
                  : 'bg-slate-100 dark:bg-surface-darkMuted text-slate-600 dark:text-slate-400 hover:text-brand-600'
              }`}
            >
              Drafts ({metrics?.totalDrafts ?? 0})
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-12 space-y-3 animate-pulse">
            <div className="h-10 bg-slate-100 dark:bg-surface-darkMuted rounded-xl" />
            <div className="h-10 bg-slate-100 dark:bg-surface-darkMuted rounded-xl" />
            <div className="h-10 bg-slate-100 dark:bg-surface-darkMuted rounded-xl" />
          </div>
        ) : filteredArticles.length === 0 ? (
          <EmptyState
            icon={FileText}
            title={statusFilter === 'all' ? 'No articles created yet' : `No ${statusFilter} articles`}
            description={
              statusFilter === 'all'
                ? 'Begin your authoring journey by publishing your first technical essay.'
                : `You do not have any articles marked as ${statusFilter}.`
            }
            action={
              <Link to="/write">
                <Button variant="primary" size="sm" startIcon={<PenTool className="w-3.5 h-3.5" />} id="dashboard-write-first-article-btn">
                  Write an Essay
                </Button>
              </Link>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-surface-darkMuted border-b border-slate-200 dark:border-surface-borderDark text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-2.5">Title & Category</th>
                  <th className="px-4 py-2.5">Status</th>
                  <th className="px-4 py-2.5">Views</th>
                  <th className="px-4 py-2.5">Likes</th>
                  <th className="px-4 py-2.5">Comments</th>
                  <th className="px-4 py-2.5">Created</th>
                  <th className="px-4 py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-surface-borderDark/60">
                {filteredArticles.map((art) => (
                  <tr key={art._id || art.id} className="hover:bg-slate-50/60 dark:hover:bg-surface-darkMuted/40 transition-colors">
                    {/* Title & Category */}
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900 dark:text-slate-100 line-clamp-1 max-w-xs">
                        {art.title}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                        <span className="text-brand-600 font-semibold">{art.category || 'General'}</span>
                        {art.aiAssisted && (
                          <span className="flex items-center gap-0.5 text-brand-500">
                            • <Sparkles className="w-2.5 h-2.5" /> AI Assisted
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(art)}
                        disabled={togglingStatusId === art._id}
                        title="Click to toggle status"
                        className="group flex items-center gap-1.5 focus:outline-none"
                      >
                        <Badge
                          variant={art.status === 'published' ? 'brand' : 'neutral'}
                          size="sm"
                          dot
                        >
                          {art.status === 'published' ? 'Published' : 'Draft'}
                        </Badge>
                        <span className="text-[10px] text-slate-400 group-hover:text-brand-600 hidden sm:inline">
                          (Toggle)
                        </span>
                      </button>
                    </td>

                    {/* Views */}
                    <td className="px-4 py-3 font-medium">
                      {art.viewsCount || 0}
                    </td>

                    {/* Likes */}
                    <td className="px-4 py-3 font-medium">
                      {art.likesCount || (art.likes?.length || 0)}
                    </td>

                    {/* Comments */}
                    <td className="px-4 py-3 font-medium">
                      {art.commentsCount || 0}
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3 text-slate-400 text-[11px] whitespace-nowrap">
                      {formatDate(art.createdAt)}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/articles/${art.slug || art._id}`}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-surface-darkMuted transition-colors"
                          title="View essay"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                        <Link
                          to={`/articles/${art._id}/edit`}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-surface-darkMuted transition-colors"
                          title="Edit essay"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(art)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                          title="Delete essay"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        loading={deleting}
        title="Delete Article"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? All associated comments and likes will be permanently removed.`}
        confirmText="Delete Permanently"
        variant="danger"
      />
    </div>
  );
};
