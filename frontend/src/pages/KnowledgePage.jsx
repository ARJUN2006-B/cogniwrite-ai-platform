import React, { useState } from 'react';
import { Layers, BookOpen, ExternalLink, Code2, Server, Database, Sparkles, Terminal, Shield } from 'lucide-react';

const KNOWLEDGE_TOPICS = [
  {
    id: 'arch-1',
    category: 'Architecture',
    title: 'Clean Architecture in Modern Node.js / Express',
    description: 'Separation of concerns across controllers, services, repositories, and models to ensure testability and prevent monolithic server.js bloat.',
    tags: ['express', 'node', 'patterns', 'clean-code'],
    resources: [
      { title: 'The Clean Architecture (Robert C. Martin)', url: 'https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html' },
      { title: 'Node.js Best Practices Repository', url: 'https://github.com/goldbergyoni/nodebestpractices' }
    ]
  },
  {
    id: 'ai-1',
    category: 'AI & ML',
    title: 'Pluggable Server-Side AI Provider Architecture',
    description: 'Designing polymorphic AI interfaces so applications can seamlessly swap between local mock heuristics, OpenAI, and Google Gemini without breaking contracts.',
    tags: ['ai', 'providers', 'design-patterns', 'openai', 'gemini'],
    resources: [
      { title: 'Strategy & Factory Pattern in Modern JavaScript', url: 'https://refactoring.guru/design-patterns/factory-method' },
      { title: 'OpenAI API Reference Guide', url: 'https://platform.openai.com/docs' }
    ]
  },
  {
    id: 'db-1',
    category: 'Database',
    title: 'Mongoose Connection Resilience & Schema Optimization',
    description: 'Configuring server selection timeouts, reconnect listeners, index optimization, and graceful teardown during containerized or local shutdowns.',
    tags: ['mongodb', 'mongoose', 'nosql', 'performance'],
    resources: [
      { title: 'Mongoose Connection Guide', url: 'https://mongoosejs.com/docs/connections.html' },
      { title: 'MongoDB Indexing Strategies', url: 'https://www.mongodb.com/docs/manual/indexes/' }
    ]
  },
  {
    id: 'sec-1',
    category: 'Security',
    title: 'JWT Authentication with Bcrypt Password Hashing',
    description: 'Stateless session handling with Bearer authorization tokens, bcrypt salt rounds, and centralized operational error interception.',
    tags: ['security', 'jwt', 'bcrypt', 'auth'],
    resources: [
      { title: 'OWASP Authentication Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/' },
      { title: 'JWT.io Debugger & Spec', url: 'https://jwt.io/' }
    ]
  },
  {
    id: 'fe-1',
    category: 'Frontend',
    title: 'Vite React Architecture with Tailwind Design Tokens',
    description: 'Rapid bundling with Vite, React Router layout nesting, Axios interceptor configuration, and accessible dark/light theme persistence.',
    tags: ['react', 'vite', 'tailwind', 'routing'],
    resources: [
      { title: 'Vite Documentation & Guide', url: 'https://vite.dev/' },
      { title: 'React Router v6 Documentation', url: 'https://reactrouter.com/' }
    ]
  }
];

export const KnowledgePage = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState('');

  const categories = ['All', 'Architecture', 'AI & ML', 'Database', 'Security', 'Frontend'];

  const filteredTopics = KNOWLEDGE_TOPICS.filter((topic) => {
    const matchesCat = selectedCategory === 'All' || topic.category === selectedCategory;
    const matchesSearch =
      search === '' ||
      topic.title.toLowerCase().includes(search.toLowerCase()) ||
      topic.description.toLowerCase().includes(search.toLowerCase()) ||
      topic.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-10 py-4">
      {/* Header */}
      <div className="max-w-3xl space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20">
          <Layers className="w-3.5 h-3.5" />
          <span>Curated Domain Taxonomy</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-slate-900 dark:text-white">
          Knowledge Base & Engineering Reference
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
          Explore architectural blueprints, security checklists, and implementation guides that underpin production-ready full-stack systems.
        </p>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto scrollbar-none pb-2 sm:pb-0">
          {categories.map((cat) => (
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

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter knowledge topics..."
          className="w-full sm:w-72 px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      {/* Knowledge Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredTopics.map((topic) => (
          <div
            key={topic.id}
            className="p-6 rounded-2xl glass-panel border border-slate-200/80 dark:border-slate-800/80 hover:border-brand-500/40 transition-all flex flex-col justify-between space-y-5"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400 bg-brand-500/10 px-2.5 py-0.5 rounded-md">
                  {topic.category}
                </span>
              </div>
              <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white">
                {topic.title}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {topic.description}
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {topic.tags.map((t) => (
                  <span
                    key={t}
                    className="text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </div>

            {/* External Reference Links */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Curated Resources:
              </span>
              <ul className="space-y-1.5 text-xs">
                {topic.resources.map((res, i) => (
                  <li key={i}>
                    <a
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 group"
                    >
                      <span>{res.title}</span>
                      <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
