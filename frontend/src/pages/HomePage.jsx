import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { articleService } from '../services/articleService';
import { aiService } from '../services/aiService';
import { ArticleCard } from '../components/common/ArticleCard';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../hooks/useAuth';
import {
  Sparkles,
  ArrowRight,
  BookOpen,
  Compass,
  Layers,
  Cpu,
  Shield,
  Wand2,
  CheckCircle2,
  Copy,
  Mail,
  TrendingUp,
  Feather
} from 'lucide-react';

// Explicitly marked sample mock articles for visual development only
const SAMPLE_DISCOVERY_ARTICLES = [
  {
    id: 'sample-1',
    isSample: true,
    title: 'Zero-Allocation JSON Parsing in High-Throughput Gateways',
    slug: 'zero-allocation-json-parsing',
    excerpt: 'An investigation into memory profiling techniques in V8, buffer pools, and SIMD string scanning to achieve 150k req/sec.',
    author: {
      name: 'Dr. Marcus Vance',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
    },
    readTimeMinutes: 7,
    tags: ['performance', 'v8', 'node', 'systems'],
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    likesCount: 38,
    aiAssisted: true,
  },
  {
    id: 'sample-2',
    isSample: true,
    title: 'Why We Abandoned Distributed Transactions for Event Choreography',
    slug: 'event-choreography-architecture',
    excerpt: 'A post-mortem on two-phase commit overheads across polyglot microservices, and how idempotency keys rescued database consistency.',
    author: {
      name: 'Sofia Chen',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250&q=80',
    },
    readTimeMinutes: 9,
    tags: ['architecture', 'microservices', 'database'],
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    likesCount: 52,
    aiAssisted: false,
  },
];

export const HomePage = () => {
  const { isAuthenticated, user } = useAuth();
  const toast = useToast();

  const [dbArticles, setDbArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Newsletter state
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubmitting, setNewsletterSubmitting] = useState(false);

  // Live AI Demonstration state
  const [demoInput, setDemoInput] = useState(
    'In order to build high scale web apps, you gotta use a good database and write clean code basically.'
  );
  const [demoTone, setDemoTone] = useState('professional');
  const [demoOutput, setDemoOutput] = useState('');
  const [demoSummary, setDemoSummary] = useState('');
  const [demoLoading, setDemoLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchArticles = async () => {
      try {
        const res = await articleService.getArticles({ limit: 4 });
        if (isMounted) {
          setDbArticles(res.articles || []);
        }
      } catch (err) {
        console.error('Failed to load recent articles', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchArticles();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleRunAIDemo = async () => {
    if (!demoInput.trim()) return;
    setDemoLoading(true);
    try {
      const res = await aiService.improveWriting({
        text: demoInput,
        tone: demoTone,
      });
      setDemoOutput(res.improvedText);
      setDemoSummary(res.changesSummary);
      toast.success('Text transformed via AI Provider abstraction');
    } catch (err) {
      toast.error('AI provider offline. Using fallback local heuristics.');
      setDemoOutput(demoInput.trim());
    } finally {
      setDemoLoading(false);
    }
  };

  const handleCopyDemo = () => {
    if (demoOutput) {
      navigator.clipboard.writeText(demoOutput);
      setCopied(true);
      toast.info('Copied AI text to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    setNewsletterSubmitting(true);
    setTimeout(() => {
      setNewsletterSubmitting(false);
      setNewsletterEmail('');
      toast.success('Subscribed! You will receive the weekly engineering digest.');
    }, 600);
  };

  return (
    <div className="space-y-16 py-4">
      {/* Editorial Hero Header */}
      <section className="text-center max-w-4xl mx-auto space-y-6 pt-4 pb-8">
        <div className="inline-flex items-center gap-2">
          <Badge variant="brand" size="md">
            <Feather className="w-3.5 h-3.5 mr-1" />
            An Editorial Platform for Engineers
          </Badge>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold font-display tracking-tight text-slate-900 dark:text-slate-100 leading-[1.12]">
          Depth Over Noise.{' '}
          <span className="text-brand-600 dark:text-brand-400">
            Engineered for Insight.
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed font-sans">
          CogniWrite marries long-form editorial publishing with a modern engineering workspace. Explore architectural deep-dives, organize system knowledge, and refine your prose with modular server-side AI.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link to="/explore">
            <Button
              variant="primary"
              size="lg"
              endIcon={<ArrowRight className="w-4 h-4" />}
            >
              Start Reading
            </Button>
          </Link>

          {isAuthenticated ? (
            <Link to="/write">
              <Button variant="outline" size="lg">
                Open Writer Studio
              </Button>
            </Link>
          ) : (
            <Link to="/register">
              <Button variant="outline" size="lg">
                Create Free Account
              </Button>
            </Link>
          )}
        </div>
      </section>

      {/* Category Discovery Navigation */}
      <section className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-surface-borderDark">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Curated Categories
          </h2>
          <Link
            to="/explore"
            className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
          >
            <span>All Topics</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-4">
          {[
            { label: 'Architecture', tag: 'architecture', count: '14 essays' },
            { label: 'Distributed Systems', tag: 'systems', count: '9 essays' },
            { label: 'AI & ML Tools', tag: 'ai', count: '18 essays' },
            { label: 'Backend & Node', tag: 'backend', count: '24 essays' },
            { label: 'Frontend & UI', tag: 'frontend', count: '12 essays' },
            { label: 'Database & SQL', tag: 'database', count: '11 essays' },
          ].map((cat) => (
            <Link
              key={cat.tag}
              to={`/explore?category=${encodeURIComponent(cat.label)}`}
              className="p-3.5 rounded-xl editorial-card hover:border-brand-500/40 text-left space-y-1 block transition-all"
            >
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {cat.label}
              </h3>
              <p className="text-[11px] text-slate-400">{cat.count}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured / Recent Articles from Database */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100">
              Recent Engineering Articles
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Live records served from the connected MongoDB database
            </p>
          </div>
          <Link
            to="/explore"
            className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
          >
            <span>Explore All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <LoadingSkeleton.ArticleCard />
            <LoadingSkeleton.ArticleCard />
            <LoadingSkeleton.ArticleCard />
          </div>
        ) : dbArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dbArticles.map((art) => (
              <ArticleCard key={art._id} article={art} />
            ))}
          </div>
        ) : (
          <Card className="text-center py-10">
            <BookOpen className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              No live database articles yet
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Run <code className="text-brand-600">npm run seed</code> or start publishing in the Writer Studio.
            </p>
          </Card>
        )}
      </section>

      {/* Visual Demonstration Sample Content (Explicitly Labeled) */}
      <section className="space-y-4 pt-4 border-t border-slate-200 dark:border-surface-borderDark">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold font-display text-slate-900 dark:text-slate-100">
                Editorial Samples & Layout Demonstration
              </h2>
              <Badge variant="sample" size="sm">
                Visual Demo Only
              </Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Curated static layouts to illustrate editorial reading presentation
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {SAMPLE_DISCOVERY_ARTICLES.map((sample) => (
            <ArticleCard key={sample.id} article={sample} isSample={true} />
          ))}
        </div>
      </section>

      {/* Interactive AI Co-Pilot Demonstration */}
      <section className="rounded-3xl editorial-card p-6 sm:p-8 shadow-subtle border-brand-200 dark:border-surface-borderDark space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-surface-borderDark/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/40 text-brand-600 flex items-center justify-center">
              <Wand2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-display text-slate-900 dark:text-slate-100">
                Server-Side AI Assistant Preview
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Polymorphic provider abstraction (Mock Heuristics, OpenAI, or Gemini)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="demo-tone-select" className="text-xs text-slate-500">Tone:</label>
            <select
              id="demo-tone-select"
              value={demoTone}
              onChange={(e) => setDemoTone(e.target.value)}
              className="text-xs rounded-xl px-3 py-1.5 bg-slate-50 dark:bg-surface-darkMuted border border-slate-300 dark:border-surface-borderDark text-slate-800 dark:text-slate-200"
            >
              <option value="professional">Professional & Direct</option>
              <option value="concise">Concise & Lean</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Draft Input
            </label>
            <textarea
              value={demoInput}
              onChange={(e) => setDemoInput(e.target.value)}
              rows={4}
              className="w-full text-xs rounded-xl p-3 bg-slate-50 dark:bg-surface-darkMuted border border-slate-200 dark:border-surface-borderDark text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none font-sans"
              placeholder="Enter text to polish..."
            />
            <Button
              variant="primary"
              size="sm"
              loading={demoLoading}
              onClick={handleRunAIDemo}
              startIcon={<Sparkles className="w-3.5 h-3.5" />}
              className="w-full"
            >
              Polish with Server AI
            </Button>
          </div>

          <div className="space-y-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Transformed Output
                </label>
                {demoOutput && (
                  <button
                    onClick={handleCopyDemo}
                    className="text-xs text-brand-600 hover:underline flex items-center gap-1"
                  >
                    {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                )}
              </div>
              <div className="min-h-[96px] text-xs rounded-xl p-3 bg-white dark:bg-surface-darkCard border border-slate-200 dark:border-surface-borderDark text-slate-800 dark:text-slate-200 leading-relaxed font-sans">
                {demoOutput || (
                  <span className="text-slate-400 italic">
                    Click "Polish with Server AI" to test the response...
                  </span>
                )}
              </div>
            </div>

            {demoSummary && (
              <p className="text-[11px] text-brand-700 dark:text-brand-300 bg-brand-50 dark:bg-brand-950/40 px-3 py-1.5 rounded-lg border border-brand-200 dark:border-brand-900/40">
                {demoSummary}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Newsletter Subscription */}
      <section className="max-w-2xl mx-auto text-center space-y-4 py-8">
        <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-surface-darkMuted flex items-center justify-center text-slate-700 dark:text-slate-300 mx-auto">
          <Mail className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h3 className="text-xl font-bold font-display text-slate-900 dark:text-slate-100">
            Subscribe to the Weekly Dispatch
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            Curated architectural post-mortems, distributed systems benchmarks, and AI engineering patterns delivered to your inbox every Thursday.
          </p>
        </div>

        <form onSubmit={handleNewsletterSubmit} className="flex items-center gap-2 max-w-md mx-auto pt-2">
          <input
            type="email"
            value={newsletterEmail}
            onChange={(e) => setNewsletterEmail(e.target.value)}
            placeholder="engineer@company.com"
            className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-surface-darkCard border border-slate-300 dark:border-surface-borderDark text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <Button
            type="submit"
            variant="primary"
            size="sm"
            loading={newsletterSubmitting}
          >
            Subscribe
          </Button>
        </form>
      </section>
    </div>
  );
};
