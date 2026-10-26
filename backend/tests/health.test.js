const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../src/app');

test('Backend Health & Error Handling Suite', async (t) => {
  await t.test('GET /api/health should respond with system health details', async () => {
    const res = await request(app).get('/api/health');
    
    // Status can be 200 or 503 depending on whether DB is connected in test
    assert.ok(res.status === 200 || res.status === 503);
    assert.equal(typeof res.body, 'object');
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.uptimeSeconds >= 0);
    assert.equal(res.body.data.service, 'cogniwrite-api');
    assert.ok(res.body.data.aiService);
    assert.equal(typeof res.body.data.aiService.provider, 'string');
    assert.ok(res.body.data.database);
    assert.ok(res.body.data.memoryUsage);
  });

  await t.test('GET /api/unknown-endpoint should return 404 with structured ApiError', async () => {
    const res = await request(app).get('/api/unknown-endpoint');
    assert.equal(res.status, 404);
    assert.equal(res.body.success, false);
    assert.ok(res.body.message.includes('Cannot find route'));
    assert.ok(res.body.timestamp);
  });

  await t.test('POST /api/ai/improve without text should return 400 Bad Request', async () => {
    const res = await request(app)
      .post('/api/ai/improve')
      .send({});
    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.ok(res.body.message.includes('Text field is required'));
  });

  await t.test('POST /api/ai/improve with valid text returns improved output via provider', async () => {
    const res = await request(app)
      .post('/api/ai/improve')
      .send({
        text: 'this is gonna be a good test',
        tone: 'professional'
      });
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.improvedText);
    assert.ok(res.body.data.provider);
  });
});
