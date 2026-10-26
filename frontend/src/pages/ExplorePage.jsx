import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { articleService } from '../services/articleService';
import { aiService } from '../services/aiService';
import { ArticleCard } from '../components/common/ArticleCard';
import { SearchBar } from '../components/ui/SearchBar';
import { Pagination } from '../components/ui/Pagination';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { Button } from '../components/ui/Button';
import { Dialog } from '../components/ui/Dialog';
import { Badge } from '../components/ui/Badge';
import { CATEGORIES } from '../utils/constants';
import { useToast } from '../context/ToastContext';
import {
  Filter,
  SlidersHorizontal,
  BookOpen,
  Compass,
  Sparkles,
  ArrowRight,
  Search,
  Check,
  RotateCcw
} from 'lucide-react';

export const ExplorePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const toast = useToast();

  const initialCategory = searchParams.get('category') || 'All';
  const initialSearch = searchParams.get('search') || '';
  const initialTag = searchParams.get('tag') || '';
  const initialPage = parseInt(searchParams.get('page') || '1', 10);

  const [articles, setArticles] = useState([]);
  const [pagination, setPagination] = useState({ page: initialPage, totalPages: 1 });
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [activeTag, setActiveTag] = useState(initialTag);
  const [sortBy, setSortBy] = useState('newest');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // AI Search Assistant modal
  const [aiSearchOpen, setAiSearchOpen] = useState(false);
  const [naturalQuery, setNaturalQuery] = useState('');
  const [aiSearchLoading, setAiSearchLoading] = useState(false);
  const [aiSearchResult, setAiSearchResult] = useState(null);

  const fetchArticles = async (
    page = 1,
    cat = selectedCategory,
    query = searchQuery,
    tag = activeTag,
    sort = sortBy
  ) => {
    setLoading(true);
    setError('');

    try {
      const res = await articleService.getArticles({
        page,
        limit: 9,
        category: cat !== 'All' ? cat : '',
        tag: tag || '',
        search: query,
        sortBy: sort
      });

      setArticles(res.articles || []);
      setPagination(res.pagination || { page: 1, totalPages: 1 });

      // Update URL search parameters
      const newParams = new URLSearchParams();
      if (page > 1) newParams.set('page', page);
      if (cat && cat !== 'All') newParams.set('category', cat);
      if (query) newParams.set('search', query);
      if (tag) newParams.set('tag', tag);
      setSearchParams(newParams, { replace: true });
    } catch (err) {
      setError(err.message || 'Unable to retrieve articles.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles(1, selectedCategory, searchQuery, activeTag, sortBy);
  }, [selectedCategory, sortBy, activeTag]);

  const handleSearchSubmit = (val) => {
    setSearchQuery(val);
    fetchArticles(1, selectedCategory, val, activeTag, sortBy);
  };

  const handleClearFilters = () => {
    setSelectedCategory('All');
    setSearchQuery('');
    setActiveTag('');
    setSortBy('newest');
    fetchArticles(1, 'All', '', '', 'newest');
  };

  const handlePageChange = (newPage) => {
    fetchArticles(newPage, selectedCategory, searchQuery, activeTag, sortBy);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Run AI Search Assistant
  const handleRunAISearch = async (e) => {
    e.preventDefault();
    if (!naturalQuery.trim()) return;

    setAiSearchLoading(true);
    try {
      const res = await aiService.aiSearchAssist({ query: naturalQuery.trim() });
      setAiSearchResult(res);
    } catch (err) {
      toast.error(err.message || 'AI Search Assist failed');
    } finally {
      setAiSearchLoading(false);
    }
  };

  // Apply AI Search Extracted Keywords & Filters
  const handleApplyAISearch = () => {
    if (!aiSearchResult) return;

    const keywords = aiSearchResult.extractedKeywords?.join(' ') || naturalQuery;
    const matchedCategory = aiSearchResult.suggestedCategory;

    setSearchQuery(keywords);
    if (matchedCategory && CATEGORIES.includes(matchedCategory)) {
      setSelectedCategory(matchedCategory);
    }
    setAiSearchOpen(false);
    toast.success('Applied AI-assisted search filters');
    fetchArticles(1, matchedCategory || selectedCategory, keywords, activeTag, sortBy);
  };

  return (
    <div className="space-y-8 py-4">
      {/* Header and Controls */}
      <div className="space-y-4 pb-6 border-b border-slate-200 dark:border-surface-borderDark">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold font-display text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Compass className="w-6 h-6 text-brand-600" />
              <span>Explore Knowledge & Technical Essays</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Search across deep architectural essays, peer-reviewed practices, and systems tutorials.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="w-full md:w-80">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                onSubmit={handleSearchSubmit}
                onClear={() => {
                  setSearchQuery('');
                  fetchArticles(1, selectedCategory, '', activeTag, sortBy);
                }}
                placeholder="Search title, content, or tag..."
              />
            </div>

            <Button
              variant="outline"
              size="md"
              onClick={() => setAiSearchOpen(true)}
              startIcon={<Sparkles className="w-4 h-4 text-brand-600" />}
              title="Natural language search assistant"
              className="flex-shrink-0"
            >
              AI Assist
            </Button>
          </div>
        </div>

        {/* Categories Bar & Sort Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <Filter className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mr-1" />
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setActiveTag('');
                }}
                className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat && !activeTag
                    ? 'bg-brand-600 text-white shadow-subtle'
                    : 'bg-white dark:bg-surface-darkCard text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-surface-borderDark hover:border-brand-500/40'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500 self-end sm:self-auto flex-shrink-0">
            {activeTag && (
              <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-brand-50 dark:bg-brand-950/40 text-brand-600 text-[11px] font-bold">
                #{activeTag}
                <button
                  type="button"
                  onClick={() => setActiveTag('')}
                  className="hover:text-rose-500 ml-1 font-bold"
                >
                  ×
                </button>
              </span>
            )}

            {(selectedCategory !== 'All' || searchQuery || activeTag) && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="text-[11px] text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            )}

            <div className="flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <label htmlFor="sort-by-select">Sort:</label>
              <select
                id="sort-by-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-xs rounded-xl px-2.5 py-1 bg-white dark:bg-surface-darkCard border border-slate-200 dark:border-surface-borderDark text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-500 font-sans"
              >
                <option value="newest">Latest Added</option>
                <option value="popular">Most Liked</option>
                <option value="reads">Shortest Read</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <LoadingSkeleton.ArticleCard />
          <LoadingSkeleton.ArticleCard />
          <LoadingSkeleton.ArticleCard />
          <LoadingSkeleton.ArticleCard />
          <LoadingSkeleton.ArticleCard />
          <LoadingSkeleton.ArticleCard />
        </div>
      ) : error ? (
        <ErrorState
          title="Failed to Load Articles"
          description={error}
          onRetry={() => fetchArticles(1, selectedCategory, searchQuery, activeTag, sortBy)}
        />
      ) : articles.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No articles match your query"
          description="Try broadening your search term, resetting category filters, or using AI search assist."
          action={
            <Button variant="outline" size="sm" onClick={handleClearFilters}>
              Clear All Filters
            </Button>
          }
        />
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((art) => (
              <ArticleCard key={art._id || art.id} article={art} />
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center pt-6 border-t border-slate-200 dark:border-surface-borderDark">
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      )}

      {/* AI Natural Language Search Dialog */}
      <Dialog
        open={aiSearchOpen}
        onClose={() => setAiSearchOpen(false)}
        maxWidth="max-w-lg"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-surface-borderDark">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-600" />
              <h3 className="text-base font-bold font-display text-slate-900 dark:text-slate-100">
                Natural-Language AI Search Assist
              </h3>
            </div>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Describe what technical topic or problem you want to explore in plain English. AI will extract key terms and recommend matching categories.
          </p>

          <form onSubmit={handleRunAISearch} className="space-y-3">
            <textarea
              value={naturalQuery}
              onChange={(e) => setNaturalQuery(e.target.value)}
              rows={3}
              placeholder="e.g. How do distributed locks work with redis to avoid race conditions and split-brain scenarios?"
              className="w-full text-xs rounded-xl p-3 bg-white dark:bg-surface-darkCard border border-slate-300 dark:border-surface-borderDark text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 font-sans resize-none"
            />
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={aiSearchLoading}
              disabled={!naturalQuery.trim()}
              startIcon={<Search className="w-3.5 h-3.5" />}
              className="w-full"
            >
              Analyze Query & Match Articles
            </Button>
          </form>

          {aiSearchResult && (
            <div className="space-y-3 p-3.5 rounded-xl bg-slate-50 dark:bg-surface-darkMuted border border-slate-200 dark:border-surface-borderDark text-xs">
              <div className="space-y-1">
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  Semantic Understanding:
                </span>
                <p className="text-slate-600 dark:text-slate-400">
                  {aiSearchResult.intentAnalysis || 'Natural language query parsed successfully.'}
                </p>
              </div>

              {aiSearchResult.extractedKeywords && (
                <div className="space-y-1">
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    Extracted Keywords:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {aiSearchResult.extractedKeywords.map((kw, i) => (
                      <Badge key={i} variant="brand" size="sm">
                        {kw}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {aiSearchResult.suggestedCategory && (
                <div className="text-[11px] text-slate-500">
                  Recommended Category: <strong className="text-brand-600">{aiSearchResult.suggestedCategory}</strong>
                </div>
              )}

              <Button
                variant="primary"
                size="sm"
                onClick={handleApplyAISearch}
                startIcon={<Check className="w-3.5 h-3.5" />}
                className="w-full mt-2"
              >
                Apply to Search
              </Button>
            </div>
          )}

          <div className="flex justify-end pt-2 border-t border-slate-200 dark:border-surface-borderDark">
            <Button variant="outline" size="sm" onClick={() => setAiSearchOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};
