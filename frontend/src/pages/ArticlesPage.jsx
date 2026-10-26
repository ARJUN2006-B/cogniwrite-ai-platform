import React, { useState, useEffect } from 'react';
import { articleService } from '../services/articleService';
import { ArticleCard } from '../components/common/ArticleCard';
import { CATEGORIES } from '../utils/constants';
import { Search, Filter, BookOpen, PenTool } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ArticlesPage = () => {
  const [articles, setArticles] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchArticles = async (page = 1, category = selectedCategory, search = searchQuery) => {
    setLoading(true);
    setError('');
    try {
      const res = await articleService.getArticles({
        page,
        limit: 9,
        tag: category === 'All' ? '' : category,
        search
      });
      setArticles(res.articles || []);
      setPagination(res.pagination || { page: 1, totalPages: 1 });
    } catch (err) {
      setError(err.message || 'Failed to load articles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles(1, selectedCategory, searchQuery);
  }, [selectedCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchArticles(1, selectedCategory, searchQuery);
  };

  const handleLike = async (id) => {
    try {
      const updated = await articleService.likeArticle(id);
      setArticles(prev =>
        prev.map(art => (art._id === id ? { ...art, likesCount: updated.likesCount } : art))
      );
    } catch (err) {
      console.error('Like failed', err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header and Search */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-3xl font-extrabold font-display text-slate-900 dark:text-white">
            Explore Articles
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Browse peer-reviewed technical articles, tutorials, and architectural patterns.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 max-w-md w-full">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, keyword, or tag..."
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all shadow-sm"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-sm transition-all"
          >
            Search
          </button>
        </form>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-brand-500/40'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Articles Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-72 rounded-2xl glass-panel animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm">
          {error}
        </div>
      ) : articles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((art) => (
            <ArticleCard key={art._id} article={art} onLike={handleLike} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 rounded-2xl glass-panel border border-dashed border-slate-300 dark:border-slate-800 space-y-4">
          <BookOpen className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
            No articles found
          </h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            Try adjusting your search criteria, selecting another category, or publish a new article.
          </p>
          <Link
            to="/write"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-brand-600 hover:bg-brand-500 shadow-sm"
          >
            <PenTool className="w-4 h-4" />
            <span>Write New Article</span>
          </Link>
        </div>
      )}

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-6">
          <button
            disabled={pagination.page <= 1}
            onClick={() => fetchArticles(pagination.page - 1)}
            className="px-4 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-800 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Previous
          </button>
          <span className="text-xs text-slate-500">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => fetchArticles(pagination.page + 1)}
            className="px-4 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-800 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};
