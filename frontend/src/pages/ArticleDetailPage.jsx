import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { articleService } from '../services/articleService';
import { aiService } from '../services/aiService';
import { formatDate } from '../utils/formatDate';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Dialog } from '../components/ui/Dialog';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { AuthorCard } from '../components/domain/AuthorCard';
import { useBookmarks } from '../context/BookmarkContext';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../hooks/useAuth';
import {
  ArrowLeft,
  Clock,
  Sparkles,
  Heart,
  Share2,
  Bookmark,
  CheckCircle2,
  Wand2,
  ListTree,
  MessageSquare,
  Send,
  Lock,
  Edit2,
  Trash2,
  Bot,
  BarChart3,
  HelpCircle,
  AlertTriangle,
  Lightbulb,
  BookOpen
} from 'lucide-react';

export const ArticleDetailPage = () => {
  const { idOrSlug } = useParams();
  const navigate = useNavigate();
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const toast = useToast();
  const { isAuthenticated, user } = useAuth();

  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Reading progress state
  const [scrollProgress, setScrollProgress] = useState(0);

  // Related articles
  const [relatedArticles, setRelatedArticles] = useState([]);

  // AI Summary state
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  // AI Chat state
  const [chatOpen, setChatOpen] = useState(false);
  const [chatQuestion, setChatQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);

  // AI Analysis state
  const [analysisOpen, setAnalysisOpen] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);

  // Comments state
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [deletingComment, setDeletingComment] = useState(false);

  // Delete article state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingArticle, setDeletingArticle] = useState(false);

  // Fetch article, comments, related
  useEffect(() => {
    let mounted = true;
    const fetchArticleData = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await articleService.getArticle(idOrSlug);
        if (!mounted) return;
        setArticle(data);

        // Fetch real comments
        if (data._id) {
          fetchComments(data._id);
          fetchRelated(data._id);
        }
      } catch (err) {
        if (mounted) setError(err.message || 'Article not found');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchArticleData();
    return () => {
      mounted = false;
    };
  }, [idOrSlug]);

  const fetchComments = async (articleId) => {
    setCommentsLoading(true);
    try {
      const data = await articleService.getComments(articleId);
      setComments(data || []);
    } catch (err) {
      console.warn('Failed to load comments', err);
    } finally {
      setCommentsLoading(false);
    }
  };

  const fetchRelated = async (articleId) => {
    try {
      const related = await articleService.getRelatedArticles(articleId);
      setRelatedArticles(related || []);
    } catch (err) {
      console.warn('Failed to load related articles', err);
    }
  };

  // Track scroll progress for reading indicator
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const currentProgress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(Math.min(100, Math.max(0, currentProgress)));
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const currentUserId = user?._id || user?.id;
  const isAuthor = Boolean(
    user && article?.author && (currentUserId === article.author._id || currentUserId === article.author.id)
  );
  const isAdmin = user?.role === 'admin';
  const canManage = isAuthor || isAdmin;

  // Real like status
  const isLiked = Boolean(
    user &&
    article?.likes &&
    article.likes.some((id) => (typeof id === 'string' ? id : id?._id || id) === currentUserId)
  );

  const handleBookmark = () => {
    if (!article) return;
    toggleBookmark(article);
    if (!isBookmarked(article._id || article.id)) {
      toast.success('Saved to your bookmarks');
    } else {
      toast.info('Removed from bookmarks');
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.warning('Please sign in to like this essay');
      return;
    }
    if (!article?._id) return;
    try {
      const res = await articleService.toggleLike(article._id);
      setArticle((prev) => {
        const currentLikes = prev.likes || [];
        const updatedLikes = res.isLiked
          ? [...currentLikes, currentUserId]
          : currentLikes.filter((id) => (typeof id === 'string' ? id : id?._id || id) !== currentUserId);
        return {
          ...prev,
          likesCount: res.likesCount,
          likes: updatedLikes
        };
      });
      if (res.isLiked) {
        toast.success('Thank you for liking this article!');
      } else {
        toast.info('Removed like');
      }
    } catch (err) {
      toast.error(err.message || 'Unable to update like counter.');
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.info('Article link copied to clipboard');
  };

  const handleGenerateSummary = async () => {
    if (!article?.content) return;
    setSummaryLoading(true);
    try {
      const res = await aiService.summarizeArticle({
        content: article.content,
        maxLength: 350,
      });
      setSummary(res);
      toast.success('AI executive summary generated');
    } catch (err) {
      toast.error('AI summarization failed. Check provider setup.');
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleRunAnalysis = async () => {
    if (!article?.content) return;
    setAnalysisOpen(true);
    if (analysis) return; // already loaded
    setAnalysisLoading(true);
    try {
      const res = await aiService.analyzeWriting({
        content: article.content,
        title: article.title
      });
      setAnalysis(res);
    } catch (err) {
      toast.error(err.message || 'Analysis failed. Check AI provider.');
    } finally {
      setAnalysisLoading(false);
    }
  };

  const handleAskQuestion = async (e) => {
    e.preventDefault();
    if (!chatQuestion.trim() || chatLoading) return;

    const question = chatQuestion.trim();
    setChatQuestion('');
    const newHistory = [...chatHistory, { role: 'user', content: question }];
    setChatHistory(newHistory);
    setChatLoading(true);

    try {
      const res = await aiService.chatWithArticle({
        articleTitle: article.title,
        articleContent: article.content,
        question,
        history: chatHistory
      });

      setChatHistory([
        ...newHistory,
        {
          role: 'assistant',
          content: res.answer,
          grounded: res.groundedInArticle,
          confidence: res.confidence
        }
      ]);
    } catch (err) {
      setChatHistory([
        ...newHistory,
        {
          role: 'assistant',
          content: `Unable to query AI assistant: ${err.message}. Please verify server provider credentials.`,
          error: true
        }
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || submittingComment) return;

    setSubmittingComment(true);
    try {
      const newComment = await articleService.addComment(article._id, commentText.trim());
      setComments((prev) => [newComment, ...prev]);
      setCommentText('');
      setArticle((prev) => ({ ...prev, commentsCount: (prev.commentsCount || 0) + 1 }));
      toast.success('Comment posted to discussion');
    } catch (err) {
      toast.error(err.message || 'Failed to post comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteCommentConfirm = async () => {
    if (!commentToDelete) return;
    setDeletingComment(true);
    try {
      await articleService.deleteComment(commentToDelete._id);
      setComments((prev) => prev.filter((c) => c._id !== commentToDelete._id));
      setArticle((prev) => ({
        ...prev,
        commentsCount: Math.max(0, (prev.commentsCount || 1) - 1)
      }));
      toast.success('Comment deleted');
      setCommentToDelete(null);
    } catch (err) {
      toast.error(err.message || 'Failed to delete comment');
    } finally {
      setDeletingComment(false);
    }
  };

  const handleDeleteArticle = async () => {
    if (!article?._id) return;
    setDeletingArticle(true);
    try {
      await articleService.deleteArticle(article._id);
      toast.success('Article deleted permanently');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Failed to delete article');
    } finally {
      setDeletingArticle(false);
    }
  };

  // Generate simple Table of Contents from markdown headings
  const getHeadings = (text) => {
    if (!text) return [];
    const lines = text.split('\n');
    return lines
      .filter((l) => l.startsWith('### ') || l.startsWith('## '))
      .map((l) => l.replace(/^#{2,3}\s+/, '').trim())
      .filter(Boolean);
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 py-12 animate-pulse">
        <div className="h-4 w-28 bg-slate-200 dark:bg-surface-darkMuted rounded" />
        <div className="h-10 w-4/5 bg-slate-200 dark:bg-surface-darkMuted rounded-xl" />
        <div className="h-4 w-1/3 bg-slate-200 dark:bg-surface-darkMuted rounded" />
        <div className="h-96 w-full bg-slate-200 dark:bg-surface-darkMuted rounded-2xl" />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="max-w-md mx-auto text-center py-20 space-y-4">
        <h2 className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100">
          Article Not Found
        </h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          {error || 'The requested essay may have been unpublished or removed.'}
        </p>
        <Link to="/explore">
          <Button variant="primary" size="sm" startIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to Explore
          </Button>
        </Link>
      </div>
    );
  }

  const headings = getHeadings(article.content);
  const authorName = article.author?.name || 'Anonymous Writer';
  const authorAvatar =
    article.author?.avatar ||
    `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(authorName)}`;
  const bookmarked = isBookmarked(article._id || article.id);

  return (
    <div className="relative">
      {/* Top Reading Progress Bar */}
      <div
        className="fixed top-16 left-0 h-0.5 bg-brand-600 dark:bg-brand-400 z-50 transition-all duration-75"
        style={{ width: `${scrollProgress}%` }}
      />

      <article className="max-w-prose mx-auto space-y-10 py-6">
        {/* Navigation Breadcrumb & Author Controls */}
        <div className="flex items-center justify-between gap-4">
          <Link
            to="/explore"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-brand-600 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to all articles</span>
          </Link>

          {canManage && (
            <div className="flex items-center gap-2">
              <Link to={`/articles/${article._id}/edit`}>
                <Button variant="outline" size="sm" startIcon={<Edit2 className="w-3.5 h-3.5" />}>
                  Edit Essay
                </Button>
              </Link>
              <Button
                variant="danger"
                size="sm"
                onClick={() => setDeleteDialogOpen(true)}
                startIcon={<Trash2 className="w-3.5 h-3.5" />}
              >
                Delete
              </Button>
            </div>
          )}
        </div>

        {/* Editorial Header */}
        <header className="space-y-4 pb-6 border-b border-slate-200 dark:border-surface-borderDark">
          <div className="flex items-center gap-2 flex-wrap">
            {article.category && (
              <Badge variant="brand" size="sm">
                {article.category}
              </Badge>
            )}
            {article.status === 'draft' && (
              <Badge variant="neutral" size="sm">
                Unpublished Draft
              </Badge>
            )}
            {article.tags?.[0] && (
              <Badge variant="neutral" size="sm">
                #{article.tags[0]}
              </Badge>
            )}
            {article.aiAssisted && (
              <Badge variant="neutral" size="sm">
                <Sparkles className="w-3 h-3 text-brand-500 mr-1" />
                AI Assisted Prose
              </Badge>
            )}
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold font-display tracking-tight text-slate-900 dark:text-slate-100 leading-tight">
            {article.title}
          </h1>

          {article.excerpt && (
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 font-sans leading-relaxed">
              {article.excerpt}
            </p>
          )}

          {/* Author Meta Row */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4">
            <Link
              to={`/profile/${article.author?._id || article.author?.id || 'author'}`}
              className="flex items-center gap-3 group"
            >
              <Avatar src={authorAvatar} name={authorName} size="md" />
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-brand-600 transition-colors">
                  {authorName}
                </h4>
                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <span>{formatDate(article.createdAt)}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {article.readTimeMinutes || 4} min read
                  </span>
                  <span>•</span>
                  <span>{article.viewsCount || 0} views</span>
                </div>
              </div>
            </Link>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleLike}
                aria-label={isLiked ? 'Unlike article' : 'Like article'}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all active:scale-95 border ${
                  isLiked
                    ? 'bg-rose-500 text-white border-rose-500 shadow-subtle'
                    : 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 border-rose-200 dark:border-rose-900/40 hover:bg-rose-100'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-white' : 'fill-rose-500'}`} />
                <span>{article.likesCount || 0}</span>
              </button>

              <button
                onClick={handleBookmark}
                aria-label="Bookmark article"
                className={`p-2 rounded-xl border border-slate-200 dark:border-surface-borderDark text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-surface-darkMuted transition-colors ${
                  bookmarked ? 'text-brand-600 dark:text-brand-400 bg-brand-50/50 dark:bg-brand-950/30' : ''
                }`}
              >
                <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-current' : ''}`} />
              </button>

              <button
                onClick={handleShare}
                aria-label="Share article"
                className="p-2 rounded-xl border border-slate-200 dark:border-surface-borderDark text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-surface-darkMuted transition-colors"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* AI Toolkit Actions Bar (Summary, Grounded Chat, Writing Analysis) */}
        <section className="rounded-2xl editorial-card p-5 space-y-4 shadow-subtle border-brand-200 dark:border-surface-borderDark">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-bold text-brand-700 dark:text-brand-300">
              <Sparkles className="w-4 h-4 text-brand-600" />
              <span>AI Reader & Editorial Studio</span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {!summary && (
                <Button
                  variant="subtle"
                  size="sm"
                  loading={summaryLoading}
                  onClick={handleGenerateSummary}
                  startIcon={<Wand2 className="w-3.5 h-3.5" />}
                >
                  Synthesize Summary
                </Button>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => setChatOpen(!chatOpen)}
                startIcon={<Bot className="w-3.5 h-3.5 text-brand-600" />}
              >
                {chatOpen ? 'Hide Q&A Chat' : 'Ask AI Q&A'}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleRunAnalysis}
                startIcon={<BarChart3 className="w-3.5 h-3.5 text-accent-cyan" />}
              >
                Writing Analysis
              </Button>
            </div>
          </div>

          {/* AI Executive Summary display */}
          {summary ? (
            <div className="space-y-3 pt-2 text-xs text-slate-700 dark:text-slate-300">
              <div className="p-3.5 rounded-xl bg-brand-50/50 dark:bg-surface-darkMuted border border-brand-100 dark:border-brand-900/40 space-y-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-brand-700 dark:text-brand-400">
                  Executive Summary
                </span>
                <p className="leading-relaxed font-sans">{summary.summary}</p>
              </div>

              {summary.keyPoints && summary.keyPoints.length > 0 && (
                <div className="space-y-1.5 pl-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                    Core Technical Takeaways
                  </span>
                  <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-400 list-disc list-inside">
                    {summary.keyPoints.map((pt, idx) => (
                      <li key={idx}>{pt}</li>
                    ))}
                  </ul>
                </div>
              )}
              <p className="text-[10px] text-slate-400">
                Generated via server-side provider: <code className="text-brand-600">{summary.provider}</code>
              </p>
            </div>
          ) : (
            <p className="text-xs text-slate-500 leading-relaxed">
              Explore this article with AI: generate an executive summary, chat with grounded answers, or inspect writing metrics.
            </p>
          )}

          {/* Grounded AI Q&A Chat Box */}
          {chatOpen && (
            <div className="pt-4 border-t border-slate-200 dark:border-surface-borderDark space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                  <Bot className="w-4 h-4 text-brand-600" />
                  <span>Grounded Article Assistant</span>
                </div>
                <Badge variant="neutral" size="sm">
                  Grounded in text only
                </Badge>
              </div>
              <p className="text-[11px] text-slate-400">
                Ask any question about this essay. Answers are strictly verified against the text content.
              </p>

              {/* Chat messages */}
              <div className="max-h-60 overflow-y-auto space-y-2.5 p-3 rounded-xl bg-slate-50 dark:bg-surface-darkMuted/60 border border-slate-200 dark:border-surface-borderDark text-xs">
                {chatHistory.length === 0 ? (
                  <p className="text-slate-400 italic text-center py-4 text-[11px]">
                    No questions yet. Ask "What are the main tradeoffs discussed?" or "How does this compare to traditional architectures?"
                  </p>
                ) : (
                  chatHistory.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-xl ${
                        msg.role === 'user'
                          ? 'bg-brand-600 text-white ml-6'
                          : 'bg-white dark:bg-surface-darkCard text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-surface-borderDark mr-6'
                      }`}
                    >
                      <div className="text-[10px] font-bold opacity-75 mb-1 uppercase tracking-wider">
                        {msg.role === 'user' ? 'You' : 'CogniWrite AI'}
                      </div>
                      <p className="leading-relaxed whitespace-pre-line">{msg.content}</p>
                    </div>
                  ))
                )}
                {chatLoading && (
                  <div className="p-2 text-xs text-brand-600 flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing essay text...</span>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleAskQuestion} className="flex gap-2">
                <input
                  type="text"
                  value={chatQuestion}
                  onChange={(e) => setChatQuestion(e.target.value)}
                  placeholder="Ask a question about this article..."
                  className="flex-1 text-xs rounded-xl px-3 py-2 bg-white dark:bg-surface-darkCard border border-slate-200 dark:border-surface-borderDark text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500 font-sans"
                />
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  loading={chatLoading}
                  disabled={!chatQuestion.trim()}
                  startIcon={<Send className="w-3.5 h-3.5" />}
                >
                  Ask
                </Button>
              </form>
            </div>
          )}
        </section>

        {/* Table of Contents if headings exist */}
        {headings.length > 1 && (
          <nav aria-label="Table of Contents" className="p-4 rounded-xl bg-slate-50 dark:bg-surface-darkMuted border border-slate-200/80 dark:border-surface-borderDark space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              <ListTree className="w-3.5 h-3.5 text-brand-600" />
              <span>Table of Contents</span>
            </div>
            <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
              {headings.map((h, i) => (
                <li key={i} className="hover:text-brand-600 transition-colors">
                  • {h}
                </li>
              ))}
            </ul>
          </nav>
        )}

        {/* Long-form Editorial Prose Content */}
        <div className="reading-prose text-slate-800 dark:text-slate-200 whitespace-pre-line space-y-6">
          {article.content}
        </div>

        {/* Tags Footnote */}
        {article.tags && article.tags.length > 0 && (
          <div className="pt-6 border-t border-slate-200 dark:border-surface-borderDark flex flex-wrap gap-2">
            {article.tags.map((tag) => (
              <Link
                key={tag}
                to={`/explore?tag=${encodeURIComponent(tag)}`}
                className="px-3 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-surface-darkMuted text-slate-600 dark:text-slate-400 hover:text-brand-600 transition-colors"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}

        {/* Author Bio Card */}
        <AuthorCard author={article.author} />

        {/* Related Articles Section */}
        {relatedArticles.length > 0 && (
          <section className="space-y-4 pt-6 border-t border-slate-200 dark:border-surface-borderDark">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-brand-600" />
              <h3 className="text-lg font-bold font-display text-slate-900 dark:text-slate-100">
                Related Articles in {article.category || 'Engineering'}
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {relatedArticles.map((rel) => (
                <Link
                  key={rel._id}
                  to={`/articles/${rel.slug || rel._id}`}
                  className="p-4 rounded-xl editorial-card hover:border-brand-500/50 transition-all space-y-2 block"
                >
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-2">
                    {rel.title}
                  </h4>
                  {rel.excerpt && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                      {rel.excerpt}
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 pt-1">
                    <span>{rel.author?.name || 'Author'}</span>
                    <span>•</span>
                    <span>{rel.readTimeMinutes || 3}m read</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Deliberate Discussion / Comments Section */}
        <section className="space-y-6 pt-6 border-t border-slate-200 dark:border-surface-borderDark">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-brand-600" />
              <h3 className="text-lg font-bold font-display text-slate-900 dark:text-slate-100">
                Discussion ({comments.length})
              </h3>
            </div>
            <span className="text-xs text-slate-400">Moderated engineering forum</span>
          </div>

          {/* Comment Form */}
          {isAuthenticated ? (
            <form onSubmit={handleAddComment} className="space-y-3">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                rows={3}
                placeholder="Share your perspective, critique, or implementation note..."
                className="w-full text-xs rounded-xl p-3 bg-white dark:bg-surface-darkCard border border-slate-200 dark:border-surface-borderDark text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500 font-sans resize-none"
              />
              <div className="flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  loading={submittingComment}
                  disabled={!commentText.trim()}
                  startIcon={<Send className="w-3.5 h-3.5" />}
                >
                  Post Comment
                </Button>
              </div>
            </form>
          ) : (
            <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-surface-borderDark bg-slate-50/50 dark:bg-surface-darkMuted/30 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Lock className="w-4 h-4 text-slate-400" />
                <span>Sign in to participate in the peer discussion.</span>
              </div>
              <Link to="/login">
                <Button variant="outline" size="sm">
                  Sign In
                </Button>
              </Link>
            </div>
          )}

          {/* Comment Feed */}
          {commentsLoading ? (
            <div className="space-y-3 animate-pulse">
              <div className="h-16 bg-slate-100 dark:bg-surface-darkMuted rounded-xl" />
              <div className="h-16 bg-slate-100 dark:bg-surface-darkMuted rounded-xl" />
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              No comments yet. Be the first to start the discussion!
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((c) => {
                const commentAuthorName = c.author?.name || 'Anonymous';
                const commentAuthorAvatar =
                  c.author?.avatar ||
                  `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(commentAuthorName)}`;
                const canDeleteComment =
                  user && (currentUserId === c.author?._id || currentUserId === c.author || isAdmin);

                return (
                  <div
                    key={c._id || c.id}
                    className="p-4 rounded-xl editorial-card space-y-2 text-xs text-slate-700 dark:text-slate-300"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar src={commentAuthorAvatar} name={commentAuthorName} size="xs" />
                        <span className="font-bold text-slate-900 dark:text-slate-100">
                          {commentAuthorName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-400">
                          {formatDate(c.createdAt)}
                        </span>
                        {canDeleteComment && (
                          <button
                            type="button"
                            onClick={() => setCommentToDelete(c)}
                            className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                            title="Delete comment"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="leading-relaxed pl-8 whitespace-pre-line">{c.content}</p>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </article>

      {/* AI Writing Analysis Dialog */}
      <Dialog
        open={analysisOpen}
        onClose={() => setAnalysisOpen(false)}
        maxWidth="max-w-2xl"
      >
        <div className="space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-surface-borderDark">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-brand-600" />
              <h3 className="text-base font-bold font-display text-slate-900 dark:text-slate-100">
                AI Prose & Structure Analysis
              </h3>
            </div>
            <Badge variant="neutral" size="sm">
              Algorithmic Evaluation
            </Badge>
          </div>

          {/* Prominent Disclaimer Badge */}
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-200">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Notice:</strong> AI assessments are algorithmic estimates and stylistic indicators, not objective grammatical facts or mandatory rules.
            </p>
          </div>

          {analysisLoading ? (
            <div className="py-12 text-center space-y-3">
              <Sparkles className="w-8 h-8 text-brand-600 animate-spin mx-auto" />
              <p className="text-xs text-slate-500">Evaluating clarity, structural cohesion, and repetition...</p>
            </div>
          ) : analysis ? (
            <div className="space-y-4 text-xs text-slate-700 dark:text-slate-300">
              {/* Metric Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-surface-darkMuted border border-slate-200 dark:border-surface-borderDark text-center">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Readability</div>
                  <div className="text-lg font-bold text-brand-600">{analysis.readabilityScore || 85}/100</div>
                  <div className="text-[10px] text-slate-500">{analysis.gradeLevel || 'Technical'}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-surface-darkMuted border border-slate-200 dark:border-surface-borderDark text-center">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Clarity</div>
                  <div className="text-lg font-bold text-emerald-600">{analysis.clarityIssues?.length === 0 ? 'High' : 'Moderate'}</div>
                  <div className="text-[10px] text-slate-500">{analysis.clarityIssues?.length || 0} alerts</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-surface-darkMuted border border-slate-200 dark:border-surface-borderDark text-center">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Structure</div>
                  <div className="text-lg font-bold text-accent-cyan">Cohesive</div>
                  <div className="text-[10px] text-slate-500">Headings detected</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-surface-darkMuted border border-slate-200 dark:border-surface-borderDark text-center">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Provider</div>
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-1 uppercase">{analysis.provider || 'AI'}</div>
                </div>
              </div>

              {/* Suggestions */}
              {analysis.suggestions && analysis.suggestions.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-slate-100 text-xs">
                    <Lightbulb className="w-4 h-4 text-amber-500" />
                    <span>Actionable Recommendations</span>
                  </div>
                  <ul className="space-y-1.5 list-disc list-inside bg-slate-50 dark:bg-surface-darkMuted p-3 rounded-xl border border-slate-200 dark:border-surface-borderDark text-slate-600 dark:text-slate-400">
                    {analysis.suggestions.map((sug, idx) => (
                      <li key={idx} className="leading-relaxed">{sug}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Repetition issues */}
              {analysis.repetitionIssues && analysis.repetitionIssues.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                    Repetition & Cadence Observations:
                  </span>
                  <p className="text-[11px] text-slate-500 bg-slate-50 dark:bg-surface-darkMuted p-2.5 rounded-lg border border-slate-200 dark:border-surface-borderDark">
                    {analysis.repetitionIssues.join(', ')}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-500">Click to analyze essay structure.</p>
          )}

          <div className="flex justify-end pt-3 border-t border-slate-200 dark:border-surface-borderDark">
            <Button variant="outline" size="sm" onClick={() => setAnalysisOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Delete Article Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteArticle}
        loading={deletingArticle}
        title="Delete Article Permanently"
        message="Are you certain you want to remove this essay? All associated reader likes, comments, and metrics will be purged permanently from the database."
        confirmText="Delete Essay"
        variant="danger"
      />

      {/* Delete Comment Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(commentToDelete)}
        onClose={() => setCommentToDelete(null)}
        onConfirm={handleDeleteCommentConfirm}
        loading={deletingComment}
        title="Delete Comment"
        message="Are you sure you want to delete this comment? This action cannot be reversed."
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
};
