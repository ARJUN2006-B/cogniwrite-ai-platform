const AIProvider = require('./aiProvider.interface');

/**
 * Local Heuristic AI Provider
 * Enables full local development and automated testing without external API keys.
 * Performs deterministic text enhancement, linguistic analysis, grounded Q&A, and outline synthesis.
 */
class MockAIProvider extends AIProvider {
  constructor() {
    super('mock-local');
  }

  isConfigured() {
    return true;
  }

  // 1. Writing Assistant
  async improveWriting({ text = '', instruction = 'polish', tone = 'professional' }) {
    if (!text || text.trim().length === 0) {
      return {
        improvedText: '',
        changesSummary: 'No input text provided.',
        provider: this.name
      };
    }

    const trimmed = text.trim();
    let result = trimmed;

    // Capitalize sentence beginnings
    result = result.replace(/(^\s*|[.!?]\s+)([a-z])/g, (m, sep, char) => sep + char.toUpperCase());
    // Normalize extra whitespace
    result = result.replace(/[ \t]+/g, ' ');

    if (instruction === 'shorten') {
      // Remove verbose filler phrases
      result = result
        .replace(/\b(in order to|as a matter of fact|at the end of the day|basically|actually|literally)\b/gi, '')
        .replace(/\s+/g, ' ')
        .trim();
    } else if (instruction === 'expand') {
      result = `${result} Furthermore, this architecture ensures predictable latency and simplifies end-to-end debugging under high load.`;
    } else if (instruction === 'simplify') {
      result = result
        .replace(/\b(utilize|leverage)\b/gi, 'use')
        .replace(/\b(facilitate)\b/gi, 'help')
        .replace(/\b(commence)\b/gi, 'start')
        .replace(/\b(suboptimal)\b/gi, 'poor');
    } else if (instruction === 'intro') {
      result = `In modern engineering practice, ${result.charAt(0).toLowerCase() + result.slice(1)} This analysis examines key architectural tradeoffs and practical implementation patterns.`;
    } else if (instruction === 'conclusion') {
      result = `In summary, ${result.charAt(0).toLowerCase() + result.slice(1)} By applying these principles, engineering teams build systems that remain resilient and maintainable at scale.`;
    }

    // Tone transformations
    if (tone === 'professional') {
      result = result
        .replace(/\b(gonna)\b/gi, 'going to')
        .replace(/\b(wanna)\b/gi, 'want to')
        .replace(/\b(gotta)\b/gi, 'must')
        .replace(/\b(a lot of)\b/gi, 'numerous')
        .replace(/\b(good)\b/gi, 'effective');
    } else if (tone === 'academic') {
      result = result
        .replace(/\b(we think)\b/gi, 'the empirical evidence suggests')
        .replace(/\b(proves)\b/gi, 'substantiates')
        .replace(/\b(big)\b/gi, 'substantial');
    }

    return {
      improvedText: result,
      changesSummary: `Applied '${instruction}' transformation with '${tone}' tone using local linguistic heuristics.`,
      provider: this.name
    };
  }

  // 2. Title & Metadata Generator
  async generateTitleAndMetadata({ title = '', content = '' }) {
    const base = title || 'High-Performance Architecture';
    const clean = base.replace(/[^a-zA-Z0-9\s]/g, '').trim();

    const titles = [
      `Deep Dive: ${clean} and Scalability Patterns`,
      `How to Architect ${clean}: A Practical Guide`,
      `The Engineering Tradeoffs of ${clean}`,
      `Production Lessons from Building ${clean}`
    ];

    // Infer category
    const combined = `${title} ${content}`.toLowerCase();
    let category = 'General';
    if (combined.includes('react') || combined.includes('frontend') || combined.includes('css') || combined.includes('ui')) {
      category = 'Frontend';
    } else if (combined.includes('mongo') || combined.includes('postgres') || combined.includes('sql') || combined.includes('db')) {
      category = 'Database';
    } else if (combined.includes('ai') || combined.includes('model') || combined.includes('llm') || combined.includes('prompt')) {
      category = 'AI & ML';
    } else if (combined.includes('docker') || combined.includes('k8s') || combined.includes('deploy') || combined.includes('ci')) {
      category = 'DevOps';
    } else if (combined.includes('node') || combined.includes('express') || combined.includes('api') || combined.includes('server')) {
      category = 'Backend';
    } else if (combined.includes('microservice') || combined.includes('system') || combined.includes('distributed')) {
      category = 'Architecture';
    }

    const { tags } = await this.suggestTags({ title, content });
    const { summary } = await this.summarizeArticle({ content: content || title, maxLength: 200 });

    return {
      titles,
      category,
      tags,
      excerpt: summary,
      keywords: tags.slice(0, 4),
      provider: this.name
    };
  }

  // 3. Summary & TL;DR Generator
  async summarizeArticle({ content = '', maxLength = 250 }) {
    if (!content || content.trim().length === 0) {
      return {
        summary: '',
        tldr: '',
        keyPoints: [],
        provider: this.name
      };
    }

    const sentences = content
      .replace(/(\r\n|\n|\r)/gm, ' ')
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 20);

    const topSentences = sentences.slice(0, 3);
    let summary = topSentences.join(' ');
    if (summary.length > maxLength) {
      summary = summary.substring(0, maxLength - 3) + '...';
    }

    const tldr = topSentences[0] || content.slice(0, 120);
    const keyPoints = topSentences.map((s, idx) => `Takeaway ${idx + 1}: ${s}`);

    return {
      summary: summary || content.slice(0, maxLength),
      tldr,
      keyPoints,
      provider: this.name
    };
  }

  // 4. Writing Analysis
  async analyzeWriting({ content = '', title = '' }) {
    const text = `${title} ${content}`.trim();
    const words = text.split(/\s+/).filter(Boolean);
    const sentences = text.split(/(?<=[.!?])\s+/).filter(Boolean);

    const wordCount = words.length;
    const sentenceCount = Math.max(1, sentences.length);
    const avgWordsPerSentence = Math.round((wordCount / sentenceCount) * 10) / 10;

    // Detect repeated words
    const freq = {};
    const stopWords = new Set(['the', 'and', 'a', 'to', 'of', 'in', 'is', 'that', 'for', 'with', 'on', 'as', 'this', 'it']);
    words.forEach((w) => {
      const clean = w.toLowerCase().replace(/[^a-z]/g, '');
      if (clean.length > 4 && !stopWords.has(clean)) {
        freq[clean] = (freq[clean] || 0) + 1;
      }
    });

    const repeatedWords = Object.entries(freq)
      .filter(([_, count]) => count >= 4)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word, count]) => `${word} (${count}x)`);

    // Heuristic readability calculation (0-100 scale: 70+ is easily readable)
    const rawScore = 100 - (avgWordsPerSentence * 1.5);
    const readabilityScore = Math.max(30, Math.min(95, Math.round(rawScore)));

    const suggestions = [];
    if (avgWordsPerSentence > 22) {
      suggestions.push('Average sentence length exceeds 22 words. Break compound sentences down for improved reader retention.');
    }
    if (repeatedWords.length > 0) {
      suggestions.push(`High repetition detected for: ${repeatedWords.join(', ')}. Consider synonyms to vary your technical vocabulary.`);
    }
    if (wordCount < 150) {
      suggestions.push('Draft is concise. Adding code examples or concrete trade-off comparisons will enhance technical depth.');
    } else {
      suggestions.push('Good structural length. Ensure your introduction clearly states the central technical thesis.');
    }

    return {
      wordCount,
      sentenceCount,
      avgWordsPerSentence,
      readabilityScore,
      readabilityLevel: readabilityScore >= 75 ? 'Very Clear' : readabilityScore >= 55 ? 'Standard Technical' : 'Dense Academic',
      repeatedWords,
      suggestions,
      disclaimer: 'Note: AI writing analysis metrics are algorithmic estimates intended for editorial guidance, not objective facts.',
      provider: this.name
    };
  }

  // 5. Grounded Article Chat
  async chatWithArticle({ articleTitle = '', articleContent = '', question = '', history = [] }) {
    if (!question || !question.trim()) {
      return {
        answer: 'Please provide a question regarding the article.',
        grounded: false,
        provider: this.name
      };
    }

    const qLower = question.toLowerCase();
    const sentences = (articleContent || '')
      .replace(/(\r\n|\n|\r)/gm, ' ')
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 15);

    // Find sentences with matching keywords
    const keywords = qLower
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 3 && !['what', 'when', 'where', 'which', 'does', 'how', 'about', 'article'].includes(w));

    const matches = sentences.filter((s) => {
      const sLower = s.toLowerCase();
      return keywords.some((kw) => sLower.includes(kw));
    });

    if (matches.length === 0) {
      return {
        answer: 'The article does not contain enough information to answer this question. Please ask a question related directly to the content above.',
        grounded: false,
        provider: this.name
      };
    }

    const answer = `Based on the article "${articleTitle}": ${matches.slice(0, 2).join(' ')}`;
    return {
      answer,
      grounded: true,
      citedSentences: matches.slice(0, 2),
      provider: this.name
    };
  }

  // 6. Article Ideas & Structured Outlines
  async generateIdeasAndOutlines({ topic = 'Distributed Systems', audience = 'Engineers' }) {
    const cleanTopic = topic.trim() || 'Software Engineering Architecture';

    const ideas = [
      `Architectural Failures in ${cleanTopic} and How to Avoid Them`,
      `A Pragmatic Guide to Scaling ${cleanTopic} for ${audience}`,
      `Comparing State-of-the-Art Approaches in ${cleanTopic}`
    ];

    const outline = {
      title: `Engineering ${cleanTopic}: Patterns & Practice`,
      audience,
      introduction: `Introduction to the challenges of ${cleanTopic} in modern production environments.`,
      sections: [
        {
          heading: '1. Problem Space and Constraints',
          bullets: ['Latency and throughput considerations', 'Failure modes and idempotency']
        },
        {
          heading: '2. Core Architectural Implementation',
          bullets: ['Component interactions', 'Data model and persistence patterns', 'Code walkthrough']
        },
        {
          heading: '3. Benchmarks & Operational Learnings',
          bullets: ['Testing under load', 'Observability and telemetry metrics']
        }
      ],
      conclusion: 'Summary of architectural tradeoffs and recommended next steps.'
    };

    return {
      topic: cleanTopic,
      ideas,
      outline,
      provider: this.name
    };
  }

  // 7. AI Search Query Assister
  async aiSearchAssist({ query = '' }) {
    const q = query.toLowerCase().trim();
    const candidateTags = [
      'react', 'nodejs', 'javascript', 'mongodb', 'express',
      'architecture', 'tailwind', 'vite', 'api', 'backend',
      'frontend', 'database', 'ai', 'performance', 'security', 'devops', 'systems'
    ];

    const matchedTags = candidateTags.filter((t) => q.includes(t));
    const cleanQuery = q.replace(/[^a-z0-9\s]/g, '').trim();

    return {
      originalQuery: query,
      cleanQuery,
      suggestedTags: matchedTags.length > 0 ? matchedTags : ['architecture', 'backend'],
      searchTip: 'Showing results using keyword-based indexed search with tag correlation.',
      provider: this.name
    };
  }

  async suggestTags({ title = '', content = '' }) {
    const combined = `${title} ${content}`.toLowerCase();
    const candidates = [
      'react', 'nodejs', 'javascript', 'mongodb', 'express',
      'architecture', 'tailwind', 'vite', 'api', 'backend',
      'frontend', 'database', 'ai', 'performance', 'security', 'devops', 'systems'
    ];

    const matched = candidates.filter((k) => combined.includes(k));
    const words = title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 4)
      .slice(0, 3);

    const result = Array.from(new Set([...matched, ...words])).slice(0, 5);
    return {
      tags: result.length > 0 ? result : ['engineering', 'systems', 'guide'],
      provider: this.name
    };
  }
}

module.exports = MockAIProvider;
