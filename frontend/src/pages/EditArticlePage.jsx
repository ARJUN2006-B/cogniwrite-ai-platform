import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { articleService } from '../services/articleService';
import { aiService } from '../services/aiService';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Dialog } from '../components/ui/Dialog';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { ARTICLE_CATEGORIES, AI_TONE_OPTIONS } from '../utils/constants';
import {
  ArrowLeft,
  Save,
  Trash2,
  AlertCircle,
  Sparkles,
  Wand2,
  Tags,
  Eye,
  Edit2,
  Check,
  Send,
  Lightbulb,
  BarChart3,
  ListTree,
  AlertTriangle
} from 'lucide-react';

export const EditArticlePage = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  // Form fields
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Architecture');
  const [status, setStatus] = useState('published');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);
  const [isPreview, setIsPreview] = useState(false);

  // Status & loading
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // AI Assistant states
  const [aiTone, setAiTone] = useState('professional');
  const [aiInstruction, setAiInstruction] = useState('polish');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [aiMessage, setAiMessage] = useState('');

  // AI Title & Metadata State
  const [metaDialogOpen, setMetaDialogOpen] = useState(false);
  const [metaLoading, setMetaLoading] = useState(false);
  const [metaSuggestions, setMetaSuggestions] = useState(null);

  // AI Analysis State
  const [analysisDialogOpen, setAnalysisDialogOpen] = useState(false);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  // Calculate word count & estimated read time
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const estimatedReadTime = Math.max(1, Math.ceil(wordCount / 200));

  useEffect(() => {
    let mounted = true;
    const fetchArticle = async () => {
      setLoading(true);
      try {
        const data = await articleService.getArticle(id);
        if (mounted) {
          setArticle(data);
          setTitle(data.title || '');
          setCategory(data.category || 'Architecture');
          setStatus(data.status || 'published');
          setExcerpt(data.excerpt || '');
          setContent(data.content || '');
          setCoverImage(data.coverImage || '');
          setTags(data.tags || []);
        }
      } catch (err) {
        toast.error('Failed to load article for editing');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchArticle();
    return () => {
      mounted = false;
    };
  }, [id]);

  const handleAddTag = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = tagInput.trim().replace(/^#/, '').toLowerCase();
      if (val && !tags.includes(val)) {
        setTags([...tags, val]);
        setTagInput('');
      }
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  // AI Action: Polish, Shorten, Expand, Simplify, Intro, Conclusion
  const handleAIAssist = async (instruction = aiInstruction) => {
    if (!content.trim()) {
      toast.warning('Please enter content before requesting AI assistance.');
      return;
    }
    setAiLoading(true);
    setAiMessage('');
    try {
      const res = await aiService.improveWriting({
        text: content,
        instruction,
        tone: aiTone
      });
      setAiResult(res.improvedText);
      setAiMessage(res.changesSummary || `AI transformation (${instruction}) ready.`);
      toast.success('AI suggestion ready for review');
    } catch (err) {
      setAiMessage(`AI assistance note: ${err.message}`);
      toast.error('AI operation failed.');
    } finally {
      setAiLoading(false);
    }
  };

  const applyAITextToContent = () => {
    if (aiResult) {
      setContent(aiResult);
      setAiResult(null);
      setAiMessage('Polished text applied to editor.');
      toast.info('Applied AI suggestion to draft');
    }
  };

  // AI Action: Suggest Titles & Metadata
  const handleGenerateMetadata = async () => {
    if (!title.trim() && !content.trim()) {
      toast.warning('Provide a tentative title or body content first.');
      return;
    }
    setMetaDialogOpen(true);
    setMetaLoading(true);
    try {
      const res = await aiService.generateTitlesAndMetadata({
        title: title || 'Technical Essay',
        content: content || title
      });
      setMetaSuggestions(res);
    } catch (err) {
      toast.error('Metadata generation failed.');
    } finally {
      setMetaLoading(false);
    }
  };

  // AI Action: Analyze Writing
  const handleRunAnalysis = async () => {
    if (!content.trim()) {
      toast.warning('Please enter article content to analyze.');
      return;
    }
    setAnalysisDialogOpen(true);
    setAnalysisLoading(true);
    try {
      const res = await aiService.analyzeWriting({
        title: title || 'Article',
        content
      });
      setAnalysisResult(res);
    } catch (err) {
      toast.error('Analysis failed');
    } finally {
      setAnalysisLoading(false);
    }
  };

  const handleUpdate = async (newStatus = status) => {
    if (!title.trim() || !content.trim()) {
      toast.error('Title and content are required');
      return;
    }

    setSaving(true);
    try {
      const updated = await articleService.updateArticle(article._id, {
        title,
        category,
        status: newStatus,
        excerpt,
        content,
        coverImage,
        tags,
        aiAssisted: Boolean(article.aiAssisted || aiResult || aiMessage)
      });
      toast.success('Article updated successfully');
      navigate(`/articles/${updated.slug || updated._id}`);
    } catch (err) {
      toast.error(err.message || 'Failed to update article');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await articleService.deleteArticle(article._id);
      setDeleteDialogOpen(false);
      toast.success('Article removed permanently');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Failed to delete article');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-12 space-y-6 animate-pulse">
        <div className="h-4 w-32 bg-slate-200 dark:bg-surface-darkMuted rounded" />
        <div className="h-10 w-4/5 bg-slate-200 dark:bg-surface-darkMuted rounded-xl" />
        <div className="h-64 w-full bg-slate-200 dark:bg-surface-darkMuted rounded-2xl" />
      </div>
    );
  }

  // Authorization check (author or admin)
  const currentUserId = user?._id || user?.id;
  const isAuthor =
    user &&
    article &&
    (currentUserId === article.author?._id || currentUserId === article.author?.id || currentUserId === article.author);
  const isAdmin = user?.role === 'admin';
  const canEdit = isAuthor || isAdmin;

  if (!canEdit) {
    return (
      <div className="max-w-md mx-auto my-16 text-center space-y-4">
        <Card className="p-8 space-y-4 shadow-subtle">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold font-display text-slate-900 dark:text-slate-100">
            Unauthorized
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            You are not the designated author of this essay. Only the original author or an administrator can modify or delete this piece.
          </p>
          <Link to={`/articles/${id}`}>
            <Button variant="outline" size="sm">
              Return to Article
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-4">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-surface-borderDark">
        <div className="space-y-1">
          <Link
            to={`/articles/${article.slug || article._id}`}
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-brand-600 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Cancel and return to essay</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>Edit Essay</span>
            <Badge variant={status === 'published' ? 'brand' : 'neutral'} size="sm">
              {status === 'published' ? 'Live Published' : 'Draft'}
            </Badge>
          </h1>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={() => setDeleteDialogOpen(true)}
            startIcon={<Trash2 className="w-3.5 h-3.5" />}
          >
            Delete
          </Button>

          {status === 'published' ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={saving}
              onClick={() => handleUpdate('draft')}
            >
              Switch to Draft
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={saving}
              onClick={() => handleUpdate('draft')}
              startIcon={<Save className="w-3.5 h-3.5" />}
            >
              Save Draft
            </Button>
          )}

          <Button
            type="button"
            variant="primary"
            size="sm"
            loading={saving}
            onClick={() => handleUpdate('published')}
            startIcon={<Send className="w-3.5 h-3.5" />}
          >
            {status === 'published' ? 'Save Changes' : 'Publish Article'}
          </Button>
        </div>
      </div>

      {/* Editor & Co-Pilot Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Editor Main Canvas */}
        <div className="lg:col-span-2 space-y-5">
          {/* Title */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Article Title *
              </label>
              <button
                type="button"
                onClick={handleGenerateMetadata}
                className="text-[11px] font-semibold text-brand-600 hover:underline flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" /> AI Title & Metadata
              </button>
            </div>
            <Input
              id="edit-article-title-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title..."
              required
            />
          </div>

          {/* Category & Status Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Technical Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs rounded-xl p-2.5 bg-white dark:bg-surface-darkCard border border-slate-300 dark:border-surface-borderDark text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 font-sans"
              >
                {ARTICLE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Publication Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full text-xs rounded-xl p-2.5 bg-white dark:bg-surface-darkCard border border-slate-300 dark:border-surface-borderDark text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 font-sans"
              >
                <option value="published">Published (Visible to all)</option>
                <option value="draft">Draft (Private in Dashboard)</option>
              </select>
            </div>
          </div>

          {/* Excerpt */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Summary / Teaser
              </label>
              <span className="text-[11px] text-slate-400">
                {excerpt.length}/300 chars
              </span>
            </div>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={2}
              maxLength={300}
              placeholder="Summary..."
              className="w-full text-xs rounded-xl p-3 bg-white dark:bg-surface-darkCard border border-slate-300 dark:border-surface-borderDark text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none font-sans"
            />
          </div>

          {/* Content Editor with Preview Toggle */}
          <div className="space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Article Body (Markdown) *
                </label>
                <span className="text-[11px] text-slate-400">
                  {wordCount} words • ~{estimatedReadTime} min read
                </span>
              </div>

              <div className="flex items-center gap-1 border border-slate-200 dark:border-surface-borderDark rounded-xl p-0.5 bg-slate-50 dark:bg-surface-darkMuted">
                <button
                  type="button"
                  onClick={() => setIsPreview(false)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
                    !isPreview
                      ? 'bg-white dark:bg-surface-darkCard text-slate-900 dark:text-slate-100 shadow-subtle'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Edit2 className="w-3 h-3 inline mr-1" /> Edit
                </button>
                <button
                  type="button"
                  onClick={() => setIsPreview(true)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
                    isPreview
                      ? 'bg-white dark:bg-surface-darkCard text-slate-900 dark:text-slate-100 shadow-subtle'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Eye className="w-3 h-3 inline mr-1" /> Preview
                </button>
              </div>
            </div>

            {isPreview ? (
              <div className="min-h-[380px] p-6 rounded-2xl editorial-card reading-prose text-slate-800 dark:text-slate-200 whitespace-pre-line">
                {content || <span className="text-slate-400 italic">No content written yet...</span>}
              </div>
            ) : (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={16}
                placeholder="Draft your in-depth architectural analysis, code snippets, or systems guide here..."
                className="w-full text-sm rounded-2xl p-4 bg-white dark:bg-surface-darkCard border border-slate-300 dark:border-surface-borderDark text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500 leading-relaxed font-sans resize-y"
              />
            )}
          </div>

          {/* Tags Section */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
              Tags & Taxonomy
            </label>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder="e.g. nodejs, architecture..."
              className="w-full text-xs rounded-xl p-3 bg-white dark:bg-surface-darkCard border border-slate-300 dark:border-surface-borderDark text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-surface-darkMuted text-slate-700 dark:text-slate-300"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-slate-400 hover:text-rose-500 ml-1"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* AI Co-Pilot Panel */}
        <div className="space-y-6">
          <Card className="space-y-5 border-brand-200 dark:border-surface-borderDark shadow-subtle">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-surface-borderDark/60">
              <div className="w-8 h-8 rounded-xl bg-brand-50 dark:bg-brand-950/40 text-brand-600 flex items-center justify-center">
                <Wand2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold font-display text-slate-900 dark:text-slate-100">
                  AI Writing Co-Pilot
                </h3>
                <p className="text-[11px] text-slate-400">
                  Refinement & Tone Polishing
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Improvement Action
                </label>
                <select
                  value={aiInstruction}
                  onChange={(e) => setAiInstruction(e.target.value)}
                  className="w-full text-xs rounded-xl p-2 bg-slate-50 dark:bg-surface-darkMuted border border-slate-200 dark:border-surface-borderDark text-slate-800 dark:text-slate-200"
                >
                  <option value="polish">Polish Grammar & Clarity</option>
                  <option value="simplify">Simplify & Clarify</option>
                  <option value="shorten">Shorten & Condense</option>
                  <option value="expand">Expand & Elaborate</option>
                  <option value="intro">Generate Engaging Introduction</option>
                  <option value="conclusion">Generate Technical Conclusion</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Target Tone
                </label>
                <select
                  value={aiTone}
                  onChange={(e) => setAiTone(e.target.value)}
                  className="w-full text-xs rounded-xl p-2 bg-slate-50 dark:bg-surface-darkMuted border border-slate-200 dark:border-surface-borderDark text-slate-800 dark:text-slate-200"
                >
                  {AI_TONE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <Button
                variant="primary"
                size="sm"
                loading={aiLoading}
                onClick={() => handleAIAssist()}
                startIcon={<Sparkles className="w-3.5 h-3.5" />}
                className="w-full"
              >
                Run AI Assistant
              </Button>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateMetadata}
                  startIcon={<Lightbulb className="w-3 h-3 text-amber-500" />}
                >
                  Titles & Meta
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRunAnalysis}
                  startIcon={<BarChart3 className="w-3 h-3 text-accent-cyan" />}
                >
                  Analyze Prose
                </Button>
              </div>
            </div>

            {aiMessage && (
              <p className="text-xs text-brand-700 dark:text-brand-300 bg-brand-50 dark:bg-brand-950/40 p-2.5 rounded-xl border border-brand-200 dark:border-brand-900/40 leading-relaxed">
                {aiMessage}
              </p>
            )}

            {aiResult && (
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-surface-borderDark/60">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    AI Suggestion Preview
                  </label>
                  <span className="text-[10px] text-emerald-600 font-bold">Unapplied</span>
                </div>
                <div className="max-h-48 overflow-y-auto p-3 text-xs rounded-xl bg-slate-50 dark:bg-surface-darkMuted border border-slate-200 dark:border-surface-borderDark text-slate-800 dark:text-slate-200 leading-relaxed font-sans">
                  {aiResult}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={applyAITextToContent}
                    startIcon={<Check className="w-3.5 h-3.5" />}
                    className="flex-1"
                  >
                    Apply Suggestion
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAiResult(null)}
                  >
                    Discard
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Article Permanently"
        message="Are you certain you want to remove this essay? All comments, likes, and engagement metrics will be purged permanently from the database."
        confirmText="Delete Essay"
        variant="danger"
      />

      {/* AI Title & Metadata Dialog */}
      <Dialog
        open={metaDialogOpen}
        onClose={() => setMetaDialogOpen(false)}
        maxWidth="max-w-xl"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-surface-borderDark">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-600" />
              <h3 className="text-base font-bold font-display text-slate-900 dark:text-slate-100">
                AI Title & Metadata Suggestions
              </h3>
            </div>
          </div>

          {metaLoading ? (
            <div className="py-10 text-center space-y-3">
              <Sparkles className="w-8 h-8 text-brand-600 animate-spin mx-auto" />
              <p className="text-xs text-slate-500">Generating suggestions...</p>
            </div>
          ) : metaSuggestions ? (
            <div className="space-y-4 text-xs">
              <div className="space-y-2">
                <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                  Alternative Titles (Click to Adopt):
                </span>
                <div className="space-y-1.5">
                  {metaSuggestions.alternativeTitles?.map((altTitle, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setTitle(altTitle);
                        toast.success('Adopted suggested title');
                      }}
                      className="w-full text-left p-2.5 rounded-xl border border-slate-200 dark:border-surface-borderDark hover:border-brand-500 hover:bg-brand-50/40 dark:hover:bg-brand-950/20 text-slate-800 dark:text-slate-200 transition-colors flex items-center justify-between"
                    >
                      <span>{altTitle}</span>
                      <span className="text-[10px] text-brand-600 font-semibold ml-2">Use Title</span>
                    </button>
                  ))}
                </div>
              </div>

              {metaSuggestions.suggestedExcerpt && (
                <div className="space-y-1">
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                    Synthesized Excerpt:
                  </span>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-surface-darkMuted border border-slate-200 dark:border-surface-borderDark flex items-start justify-between gap-2">
                    <p className="text-slate-600 dark:text-slate-400">{metaSuggestions.suggestedExcerpt}</p>
                    <button
                      type="button"
                      onClick={() => {
                        setExcerpt(metaSuggestions.suggestedExcerpt);
                        toast.success('Adopted suggested excerpt');
                      }}
                      className="text-[10px] text-brand-600 font-bold hover:underline flex-shrink-0"
                    >
                      Use
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : null}

          <div className="flex justify-end pt-3 border-t border-slate-200 dark:border-surface-borderDark">
            <Button variant="outline" size="sm" onClick={() => setMetaDialogOpen(false)}>
              Done
            </Button>
          </div>
        </div>
      </Dialog>

      {/* AI Analysis Dialog */}
      <Dialog
        open={analysisDialogOpen}
        onClose={() => setAnalysisDialogOpen(false)}
        maxWidth="max-w-xl"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-surface-borderDark">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-brand-600" />
              <h3 className="text-base font-bold font-display text-slate-900 dark:text-slate-100">
                AI Prose & Structure Analysis
              </h3>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-200">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Notice:</strong> AI assessments are algorithmic estimates, not objective facts.
            </p>
          </div>

          {analysisLoading ? (
            <div className="py-8 text-center space-y-2">
              <Sparkles className="w-6 h-6 text-brand-600 animate-spin mx-auto" />
              <p className="text-xs text-slate-500">Evaluating clarity, structural cohesion, and repetition...</p>
            </div>
          ) : analysisResult ? (
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-surface-darkMuted text-center">
                  <div className="text-[10px] text-slate-400 uppercase">Readability Estimate</div>
                  <div className="text-lg font-bold text-brand-600">{analysisResult.readabilityScore || 85}/100</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-surface-darkMuted text-center">
                  <div className="text-[10px] text-slate-400 uppercase">Clarity Alerts</div>
                  <div className="text-lg font-bold text-emerald-600">{analysisResult.clarityIssues?.length || 0} items</div>
                </div>
              </div>

              {analysisResult.suggestions && (
                <div className="space-y-1">
                  <span className="font-bold text-slate-800 dark:text-slate-200">Suggestions:</span>
                  <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-surface-darkMuted p-2.5 rounded-xl">
                    {analysisResult.suggestions.map((s, idx) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : null}

          <div className="flex justify-end pt-3 border-t border-slate-200 dark:border-surface-borderDark">
            <Button variant="outline" size="sm" onClick={() => setAnalysisDialogOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};
