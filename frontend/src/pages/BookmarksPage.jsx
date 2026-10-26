import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useBookmarks } from '../context/BookmarkContext';
import { useToast } from '../context/ToastContext';
import { ArticleCard } from '../components/common/ArticleCard';
import { SearchBar } from '../components/ui/SearchBar';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Bookmark, Trash2, Compass } from 'lucide-react';

export const BookmarksPage = () => {
  const { bookmarks, clearBookmarks } = useBookmarks();
  const toast = useToast();

  const [search, setSearch] = useState('');
  const [clearDialogOpen, setClearDialogOpen] = useState(false);

  const filteredBookmarks = bookmarks.filter((b) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      b.title?.toLowerCase().includes(q) ||
      b.excerpt?.toLowerCase().includes(q) ||
      b.tags?.some((t) => t.toLowerCase().includes(q))
    );
  });

  const handleClearAll = () => {
    clearBookmarks();
    setClearDialogOpen(false);
    toast.success('All bookmarks cleared');
  };

  return (
    <div className="space-y-8 py-4">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-slate-200 dark:border-surface-borderDark">
        <div>
          <h1 className="text-3xl font-extrabold font-display text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Bookmark className="w-6 h-6 text-brand-600" />
            <span>Saved Bookmarks</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-300 font-sans font-bold">
              {bookmarks.length}
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Articles and technical references you have saved for offline study and quick lookup.
          </p>
        </div>

        {bookmarks.length > 0 && (
          <div className="flex items-center gap-3">
            <div className="w-full sm:w-64">
              <SearchBar
                value={search}
                onChange={setSearch}
                onClear={() => setSearch('')}
                placeholder="Filter saved articles..."
                showShortcut={false}
              />
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setClearDialogOpen(true)}
              startIcon={<Trash2 className="w-3.5 h-3.5 text-rose-500" />}
            >
              Clear All
            </Button>
          </div>
        )}
      </div>

      {/* Bookmarks Grid or Empty State */}
      {bookmarks.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="Your reading list is empty"
          description="Bookmark essays while browsing the Explore feed to curate your personal reference library."
          action={
            <Link to="/explore">
              <Button variant="primary" size="sm" startIcon={<Compass className="w-4 h-4" />}>
                Explore Articles
              </Button>
            </Link>
          }
        />
      ) : filteredBookmarks.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="No bookmarks match your search"
          description={`No saved articles found containing "${search}".`}
          action={
            <Button variant="outline" size="sm" onClick={() => setSearch('')}>
              Clear Search Filter
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBookmarks.map((art) => (
            <ArticleCard key={art._id || art.id} article={art} />
          ))}
        </div>
      )}

      {/* Clear Confirmation Modal */}
      <ConfirmDialog
        open={clearDialogOpen}
        onClose={() => setClearDialogOpen(false)}
        onConfirm={handleClearAll}
        title="Clear all saved bookmarks?"
        message="This will remove all saved articles from your local storage list. This action cannot be undone."
        confirmText="Yes, Clear All"
        variant="danger"
      />
    </div>
  );
};
