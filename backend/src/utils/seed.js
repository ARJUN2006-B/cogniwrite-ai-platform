const mongoose = require('mongoose');
const env = require('../config/env');
const { connectDB, disconnectDB } = require('../config/db');
const User = require('../models/User');
const Article = require('../models/Article');
const Comment = require('../models/Comment');
const logger = require('./logger');

const seedData = async () => {
  await connectDB();

  try {
    // Clear out existing seed data for a fresh clean state
    await Promise.all([
      User.deleteMany({ email: { $in: ['developer@cogniwrite.dev', 'marcus@cogniwrite.dev'] } }),
      Article.deleteMany({ slug: { $in: [
        'building-resilient-microservices-with-nodejs-and-mongodb',
        'designing-decoupled-ai-provider-abstractions-in-express',
        'vite-and-tailwind-css-building-high-performance-modern-frontends'
      ] } })
    ]);

    logger.info('Seeding demo authors and technical articles...');

    // 1. Create Primary Demo Author
    const demoUser = await User.create({
      name: 'Elena Rostova',
      email: 'developer@cogniwrite.dev',
      password: 'secret123',
      bio: 'Principal Systems Architect specializing in distributed consensus, event-driven pipelines, and high-throughput Node.js microservices.',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
      role: 'author'
    });

    // 2. Create Second Demo Author (for peer review & ownership testing)
    const secondUser = await User.create({
      name: 'Dr. Marcus Vance',
      email: 'marcus@cogniwrite.dev',
      password: 'secret123',
      bio: 'Staff Engineer researching compiler optimizations and high-concurrency memory layouts.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
      role: 'author'
    });

    // Set up mutual follow relationship
    demoUser.following.push(secondUser._id);
    secondUser.followers.push(demoUser._id);
    await Promise.all([demoUser.save(), secondUser.save()]);

    // 3. Create Articles with Categories, Views, and Likes
    const [art1, art2, art3] = await Article.create([
      {
        title: 'Building Resilient Microservices with Node.js and MongoDB',
        slug: 'building-resilient-microservices-with-nodejs-and-mongodb',
        category: 'Architecture',
        excerpt: 'A comprehensive architectural walkthrough covering connection pooling, circuit breakers, idempotency, and graceful teardown patterns.',
        content: `In distributed systems, microservices must be engineered for partial failure. When architecting Node.js services with MongoDB backends, naive connection handling frequently leads to cascading connection exhaustion during traffic spikes.

### 1. Connection Lifecycle & Pool Tuning
Always establish persistent connections outside request lifecycles. Mongoose manages an internal pool; tune maxPoolSize and serverSelectionTimeoutMS to fail fast rather than accumulating pending socket promises.

### 2. Idempotency in State Transitions
Network partitions cause retries. Ensure your write mutations use MongoDB atomic operators like $set and $inc with unique indexing constraints rather than non-atomic read-then-write loops.

### 3. Graceful Shutdown & Signal Handling
When deploying inside Kubernetes or container runtimes, listen for SIGTERM and allow inflight HTTP handlers to finish before calling mongoose.disconnect().`,
        tags: ['architecture', 'nodejs', 'mongodb', 'backend'],
        author: demoUser._id,
        readTimeMinutes: 5,
        status: 'published',
        published: true,
        likes: [secondUser._id],
        likesCount: 14,
        viewsCount: 142,
        commentsCount: 2,
        aiAssisted: true
      },
      {
        title: 'Designing Decoupled AI Provider Abstractions in Express',
        slug: 'designing-decoupled-ai-provider-abstractions-in-express',
        category: 'AI & ML',
        excerpt: 'How to structure multi-model LLM adapters using the Strategy Pattern to seamlessly toggle between local offline heuristics and cloud providers.',
        content: `Hardcoding specific AI SDKs directly inside controller logic tightly couples your application to third-party proprietary APIs, creating vendor lock-in and complicating automated testing.

### The Strategy & Factory Pattern
By defining an abstract AIProvider contract with uniform methods (improveWriting, summarizeArticle, suggestTags), controllers remain completely agnostic of whether requests are served by OpenAI, Google Gemini, Anthropic, or an offline heuristic engine.

### Zero-Dependency Local Fallback
For continuous integration and local onboarding, an algorithmic mock provider eliminates the requirement for developer API keys while maintaining contract fidelity.`,
        tags: ['ai', 'express', 'patterns', 'architecture'],
        author: demoUser._id,
        readTimeMinutes: 4,
        status: 'published',
        published: true,
        likes: [],
        likesCount: 22,
        viewsCount: 289,
        commentsCount: 1,
        aiAssisted: true
      },
      {
        title: 'Vite and Tailwind CSS: Building High-Performance Modern Frontends',
        slug: 'vite-and-tailwind-css-building-high-performance-modern-frontends',
        category: 'Frontend',
        excerpt: 'Leveraging native ES modules, Tailwind CSS design tokens, and React Router v6 for instantaneous development feedback and minimal bundle sizes.',
        content: `Frontend engineering in 2026 demands sub-second hot module replacement and structured design token hierarchies.

### Instantaneous HMR via Rollup/ESBuild
Vite serves source code over native ESM, offloading module resolution to the browser. Only changed modules are re-transformed during development.

### Glassmorphism & Token Scalability
By defining curated color tokens and backdrop blur utilities within tailwind.config.js, applications maintain consistent aesthetic polish across dark and light modes.`,
        tags: ['frontend', 'react', 'vite', 'tailwind'],
        author: secondUser._id,
        readTimeMinutes: 3,
        status: 'published',
        published: true,
        likes: [demoUser._id],
        likesCount: 9,
        viewsCount: 88,
        commentsCount: 1,
        aiAssisted: false
      }
    ]);

    // 4. Create Initial Comments
    await Comment.create([
      {
        article: art1._id,
        author: secondUser._id,
        content: 'The section on idempotency in state transitions was spot-on. We solved a huge race condition in our payments cluster using atomic $inc operations.'
      },
      {
        article: art1._id,
        author: demoUser._id,
        content: 'Thanks Marcus! Next week I will follow up with connection pool sizing benchmarks under Kubernetes HPA scaling.'
      },
      {
        article: art2._id,
        author: secondUser._id,
        content: 'The Strategy Pattern adapter approach saved our team when migrating between LLM inference endpoints without touching controller code.'
      },
      {
        article: art3._id,
        author: demoUser._id,
        content: 'Vite native ESM transformed our development velocity. Cold boot in under 800ms is game-changing.'
      }
    ]);

    // Add art1 to demoUser's bookmarks
    demoUser.bookmarks.push(art1._id);
    await demoUser.save();

    logger.info('Demo seed data created successfully!');
    logger.info('User 1: developer@cogniwrite.dev / secret123');
    logger.info('User 2: marcus@cogniwrite.dev / secret123');
  } catch (error) {
    logger.error('Failed to seed demo data:', error.message);
  } finally {
    await disconnectDB();
  }
};

if (require.main === module) {
  seedData();
}

module.exports = seedData;
