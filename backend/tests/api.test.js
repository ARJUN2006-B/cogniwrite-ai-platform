const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../src/app');
const { connectDB, disconnectDB } = require('../src/config/db');
const User = require('../src/models/User');
const Article = require('../src/models/Article');
const Comment = require('../src/models/Comment');

test('Comprehensive Backend API & Security Test Suite', async (t) => {
  let tokenUser1 = '';
  let tokenUser2 = '';
  let user1Id = '';
  let user2Id = '';
  let testArticleId = '';
  let testCommentId = '';

  t.before(async () => {
    await connectDB();
  });

  t.after(async () => {
    // Clean up test users & articles created in test
    await Promise.all([
      User.deleteMany({ email: { $in: ['test1@qa.dev', 'test2@qa.dev'] } }),
      Article.deleteMany({ title: /QA Automated Test/ }),
    ]);
    await disconnectDB();
  });

  // 1. Health & Error Handling
  await t.test('GET /api/health should respond with operational status', async () => {
    const res = await request(app).get('/api/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.service, 'cogniwrite-api');
    assert.equal(res.body.data.database.status, 'connected');
    assert.equal(res.body.data.aiService.provider, 'mock-local');
  });

  await t.test('GET /api/unknown-endpoint returns 404 with structured ApiError', async () => {
    const res = await request(app).get('/api/unknown-endpoint');
    assert.equal(res.status, 404);
    assert.equal(res.body.success, false);
    assert.ok(res.body.message.includes('Cannot find route'));
  });

  // 2. Authentication & Authorization Checks
  await t.test('POST /api/auth/register creates user and prevents self-elevation to admin', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'QA Engineer One',
        email: 'test1@qa.dev',
        password: 'password123',
        role: 'admin' // Attempting to self-elevate to admin!
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.user.role, 'user', 'Role must default to "user" and ignore self-assigned "admin"');
    assert.ok(res.body.data.token);
    tokenUser1 = res.body.data.token;
    user1Id = res.body.data.user.id;
  });

  await t.test('Register second user for ownership authorization tests', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'QA Engineer Two',
        email: 'test2@qa.dev',
        password: 'password123'
      });

    assert.equal(res.status, 201);
    tokenUser2 = res.body.data.token;
    user2Id = res.body.data.user.id;
  });

  await t.test('POST /api/auth/login succeeds with valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test1@qa.dev',
        password: 'password123'
      });

    assert.equal(res.status, 200);
    assert.ok(res.body.data.token);
  });

  await t.test('GET /api/auth/me returns current user profile with token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${tokenUser1}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.data.user.email, 'test1@qa.dev');
  });

  await t.test('Protected routes reject requests without Bearer token', async () => {
    const res = await request(app)
      .post('/api/articles')
      .send({ title: 'Unauthorized', content: 'Test content here.' });

    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
  });

  // 3. Article CRUD & Ownership Authorization
  await t.test('User 1 creates an article successfully', async () => {
    const res = await request(app)
      .post('/api/articles')
      .set('Authorization', `Bearer ${tokenUser1}`)
      .send({
        title: 'QA Automated Test: Concurrency in Node',
        category: 'Systems',
        excerpt: 'Benchmarking worker threads and event loops.',
        content: 'Concurrency in Node.js relies on libuv threadpools and non-blocking IO event polling.',
        tags: ['node', 'systems', 'qa'],
        status: 'published'
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.data.title, 'QA Automated Test: Concurrency in Node');
    assert.equal(res.body.data.category, 'Systems');
    testArticleId = res.body.data._id;
  });

  await t.test('User 2 CANNOT edit User 1\'s article (403 Forbidden)', async () => {
    const res = await request(app)
      .put(`/api/articles/${testArticleId}`)
      .set('Authorization', `Bearer ${tokenUser2}`)
      .send({
        title: 'Malicious Update by User 2',
        content: 'Trying to overwrite article content.'
      });

    assert.equal(res.status, 403, 'Must reject edits by non-owners with 403');
    assert.equal(res.body.success, false);
  });

  await t.test('User 1 CAN edit their own article', async () => {
    const res = await request(app)
      .put(`/api/articles/${testArticleId}`)
      .set('Authorization', `Bearer ${tokenUser1}`)
      .send({
        title: 'QA Automated Test: Concurrency in Node (Updated)',
        category: 'Architecture',
        content: 'Updated content with deeper architectural analysis of worker threads.'
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.data.title, 'QA Automated Test: Concurrency in Node (Updated)');
    assert.equal(res.body.data.category, 'Architecture');
  });

  // 4. Social Interactions: Likes (No duplicates), Bookmarks & Follows
  await t.test('POST /api/articles/:id/like toggles like without duplicates', async () => {
    // Like
    const res1 = await request(app)
      .post(`/api/articles/${testArticleId}/like`)
      .set('Authorization', `Bearer ${tokenUser2}`);

    assert.equal(res1.status, 200);
    assert.equal(res1.body.data.liked, true);
    assert.equal(res1.body.data.likesCount, 1);

    // Unlike
    const res2 = await request(app)
      .post(`/api/articles/${testArticleId}/like`)
      .set('Authorization', `Bearer ${tokenUser2}`);

    assert.equal(res2.status, 200);
    assert.equal(res2.body.data.liked, false);
    assert.equal(res2.body.data.likesCount, 0);
  });

  await t.test('POST /api/auth/bookmarks/:id toggles bookmark persistence', async () => {
    const res = await request(app)
      .post(`/api/auth/bookmarks/${testArticleId}`)
      .set('Authorization', `Bearer ${tokenUser2}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.data.bookmarked, true);

    const getBookmarksRes = await request(app)
      .get('/api/auth/bookmarks')
      .set('Authorization', `Bearer ${tokenUser2}`);

    assert.equal(getBookmarksRes.status, 200);
    assert.ok(getBookmarksRes.body.data.some((b) => b._id.toString() === testArticleId.toString()));
  });

  await t.test('POST /api/auth/users/:id/follow toggles follow relationship', async () => {
    const res = await request(app)
      .post(`/api/auth/users/${user1Id}/follow`)
      .set('Authorization', `Bearer ${tokenUser2}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.data.following, true);
    assert.ok(res.body.data.followersCount >= 1);
  });

  // 5. Comments CRUD
  await t.test('POST /api/articles/:id/comments adds real comment', async () => {
    const res = await request(app)
      .post(`/api/articles/${testArticleId}/comments`)
      .set('Authorization', `Bearer ${tokenUser2}`)
      .send({
        content: 'Excellent breakdown of the libuv threadpool architecture.'
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.data.content, 'Excellent breakdown of the libuv threadpool architecture.');
    testCommentId = res.body.data._id;
  });

  await t.test('GET /api/articles/:id/comments retrieves comments list', async () => {
    const res = await request(app).get(`/api/articles/${testArticleId}/comments`);
    assert.equal(res.status, 200);
    assert.ok(res.body.data.length >= 1);
  });

  // 6. User Dashboard Metrics (Real database metrics, no fabricated stats)
  await t.test('GET /api/articles/dashboard/metrics returns actual database stats', async () => {
    const res = await request(app)
      .get('/api/articles/dashboard/metrics')
      .set('Authorization', `Bearer ${tokenUser1}`);

    assert.equal(res.status, 200);
    assert.ok(res.body.data.totalArticles >= 1);
    assert.equal(typeof res.body.data.totalViews, 'number');
    assert.equal(typeof res.body.data.totalLikes, 'number');
    assert.equal(typeof res.body.data.totalComments, 'number');
    assert.ok(Array.isArray(res.body.data.articles));
  });

  // 7. Complete AI Endpoints Suite (All 7 Features)
  await t.test('POST /api/ai/improve processes text with tone', async () => {
    const res = await request(app)
      .post('/api/ai/improve')
      .send({ text: 'this gonna be a good test', tone: 'professional', instruction: 'polish' });

    assert.equal(res.status, 200);
    assert.ok(res.body.data.improvedText);
  });

  await t.test('POST /api/ai/titles-metadata generates alternative titles & category', async () => {
    const res = await request(app)
      .post('/api/ai/titles-metadata')
      .send({ title: 'MongoDB Indexing', content: 'Database performance patterns in NoSQL' });

    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body.data.titles));
    assert.equal(res.body.data.category, 'Database');
  });

  await t.test('POST /api/ai/summarize generates summary and key takeaways', async () => {
    const res = await request(app)
      .post('/api/ai/summarize')
      .send({ content: 'Distributed systems require idempotency and consensus to survive network partitions.' });

    assert.equal(res.status, 200);
    assert.ok(res.body.data.summary);
    assert.ok(Array.isArray(res.body.data.keyPoints));
  });

  await t.test('POST /api/ai/analyze returns readability metrics with explicit disclaimer', async () => {
    const res = await request(app)
      .post('/api/ai/analyze')
      .send({ title: 'Node.js Internals', content: 'An architectural investigation of event loops.' });

    assert.equal(res.status, 200);
    assert.equal(typeof res.body.data.readabilityScore, 'number');
    assert.ok(res.body.data.disclaimer.includes('algorithmic estimates'));
  });

  await t.test('POST /api/ai/chat returns grounded response when info present', async () => {
    const res = await request(app)
      .post('/api/ai/chat')
      .send({
        articleTitle: 'Redis Caching',
        articleContent: 'Redis is an in-memory data store frequently utilized as a cache and message broker.',
        question: 'What is Redis used for?'
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.data.grounded, true);
    assert.ok(res.body.data.answer.includes('Redis'));
  });

  await t.test('POST /api/ai/chat admits when article does NOT contain enough information', async () => {
    const res = await request(app)
      .post('/api/ai/chat')
      .send({
        articleTitle: 'Redis Caching',
        articleContent: 'Redis is an in-memory data store frequently utilized as a cache and message broker.',
        question: 'How do you bake a sourdough bread?'
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.data.grounded, false);
    assert.ok(res.body.data.answer.includes('does not contain enough information'));
  });

  await t.test('POST /api/ai/ideas-outlines generates article ideas and structured outline', async () => {
    const res = await request(app)
      .post('/api/ai/ideas-outlines')
      .send({ topic: 'Event Sourcing', audience: 'Backend Architects' });

    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body.data.ideas));
    assert.ok(res.body.data.outline.title);
    assert.ok(Array.isArray(res.body.data.outline.sections));
  });

  await t.test('POST /api/ai/search-assist extracts clean query keywords', async () => {
    const res = await request(app)
      .post('/api/ai/search-assist')
      .send({ query: 'Find articles about distributed nodejs systems' });

    assert.equal(res.status, 200);
    assert.ok(res.body.data.suggestedTags.includes('nodejs'));
  });

  // 8. Delete Article & Cascade Comments
  await t.test('User 1 deletes article and cascades comments deletion', async () => {
    const res = await request(app)
      .delete(`/api/articles/${testArticleId}`)
      .set('Authorization', `Bearer ${tokenUser1}`);

    assert.equal(res.status, 200);

    // Verify comment is also gone
    const commentCheck = await Comment.findById(testCommentId);
    assert.equal(commentCheck, null, 'Associated comments must be cascade deleted');
  });
});
