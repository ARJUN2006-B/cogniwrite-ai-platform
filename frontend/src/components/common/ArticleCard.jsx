import React from 'react';
import { Link } from 'react-router-dom';
import { formatDate } from '../../utils/formatDate';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { Tooltip } from '../ui/Tooltip';
import { useBookmarks } from '../../context/BookmarkContext';
import { useToast } from '../../context/ToastContext';
import { Clock, Sparkles, Heart, Bookmark, ArrowUpRight } from 'lucide-react';

export const ArticleCard = ({
  article,
  onLike,
  isSample = false,
  className = '',
}) => {
  if (!article) return null;

  const { isBookmarked, toggleBookmark } = useBookmarks();
  const toast = useToast();

  const articleId = article._id || article.id;
  const bookmarked = isBookmarked(articleId);

  const authorName = article.author?.name || 'Anonymous Writer';
  const authorAvatar =
    article.author?.avatar ||
    `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(authorName)}`;

  const handleBookmarkClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleBookmark(article);
    if (!bookmarked) {
      toast.success('Article saved to your bookmarks');
    } else {
      toast.info('Removed from bookmarks');
    }
  };

  const handleLikeClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onLike) {
      onLike(articleId);
    }
  };

  return (
    <article
      className={`group relative flex flex-col justify-between rounded-2xl editorial-card p-6 shadow-subtle hover:shadow-elevated transition-all duration-200 ${className}`}
    >
      <div>
        {/* Author Header, Sample Tag & Badges */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <Link
              to={`/profile/${article.author?._id || article.author?.id || 'author'}`}
              className="flex items-center gap-2.5 group/author"
            >
              <Avatar src={authorAvatar} name={authorName} size="sm" />
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover/author:text-brand-600 dark:group-hover/author:text-brand-400 transition-colors">
                  {authorName}
                </h4>
                <p className="text-[11px] text-slate-400">
                  {formatDate(article.createdAt)}
                </p>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Visual Development Sample Badge */}
            {(isSample || article.isSample) && (
              <Badge variant="sample" size="sm">
                Sample
              </Badge>
            )}

            {article.aiAssisted && (
              <Tooltip content="Drafted or polished with AI Provider abstraction">
                <Badge variant="brand" size="sm">
                  <Sparkles className="w-3 h-3 text-brand-500 mr-1" />
                  AI Co-Pilot
                </Badge>
              </Tooltip>
            )}

            <button
              onClick={handleBookmarkClick}
              aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark article'}
              className={`p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-surface-darkMuted transition-colors ${
                bookmarked ? 'text-brand-600 dark:text-brand-400 fill-brand-600' : ''
              }`}
            >
              <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Title and Excerpt */}
        <Link
          to={`/articles/${article.slug || articleId}`}
          className="block group/link space-y-2 mb-4"
        >
          <h3 className="text-lg font-bold font-display text-slate-900 dark:text-slate-100 group-hover/link:text-brand-600 dark:group-hover/link:text-brand-400 transition-colors line-clamp-2 leading-snug flex items-start justify-between">
            <span>{article.title}</span>
            <ArrowUpRight className="w-4 h-4 opacity-0 -translate-x-1 translate-y-1 group-hover/link:opacity-100 group-hover/link:translate-x-0 group-hover/link:translate-y-0 transition-all text-brand-500 flex-shrink-0 ml-1.5 mt-0.5" />
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {article.excerpt || (article.content ? article.content.substring(0, 140) + '...' : '')}
          </p>
        </Link>
      </div>

      {/* Footer Meta & Tags */}
      <div>
        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {article.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 text-[11px] font-medium rounded-md bg-slate-100 dark:bg-surface-darkMuted text-slate-600 dark:text-slate-400"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="pt-3 border-t border-slate-100 dark:border-surface-borderDark/60 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>{article.readTimeMinutes || 3} min read</span>
          </div>

          <button
            onClick={handleLikeClick}
            aria-label="Like article"
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors group/like"
          >
            <Heart className="w-3.5 h-3.5 group-hover/like:fill-rose-500 group-hover/like:text-rose-500 transition-colors" />
            <span>{article.likesCount || 0}</span>
          </button>
        </div>
      </div>
    </article>
  );
};
