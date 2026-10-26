const express = require('express');
const {
  improveWriting,
  generateTitlesAndMetadata,
  summarizeArticle,
  analyzeWriting,
  chatWithArticle,
  generateIdeasAndOutlines,
  aiSearchAssist,
  suggestTags
} = require('../controllers/aiController');
const { aiRateLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Apply AI rate limiter to all AI endpoints
router.use(aiRateLimiter);

router.post('/improve', improveWriting);
router.post('/titles-metadata', generateTitlesAndMetadata);
router.post('/summarize', summarizeArticle);
router.post('/analyze', analyzeWriting);
router.post('/chat', chatWithArticle);
router.post('/ideas-outlines', generateIdeasAndOutlines);
router.post('/search-assist', aiSearchAssist);
router.post('/suggest-tags', suggestTags);

module.exports = router;
