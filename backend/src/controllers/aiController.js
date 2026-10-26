const { getAIProvider } = require('../services/ai');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');

// 1. Improve Writing
const improveWriting = async (req, res, next) => {
  try {
    const { text, instruction, tone } = req.body;
    if (!text || typeof text !== 'string') {
      throw ApiError.badRequest('Text field is required for improvement');
    }
    if (text.length > 15000) {
      throw ApiError.badRequest('Input exceeds maximum allowed limit of 15,000 characters');
    }

    const provider = getAIProvider();
    const result = await provider.improveWriting({ text, instruction, tone });
    return ApiResponse.success(res, result, 'Text improved successfully');
  } catch (error) {
    next(error);
  }
};

// 2. Titles & Metadata Generator
const generateTitlesAndMetadata = async (req, res, next) => {
  try {
    const { title, content } = req.body;
    if (!title && !content) {
      throw ApiError.badRequest('Title or content required to generate metadata');
    }

    const provider = getAIProvider();
    const result = await provider.generateTitleAndMetadata({ title: title || '', content: content || '' });
    return ApiResponse.success(res, result, 'Titles and metadata generated');
  } catch (error) {
    next(error);
  }
};

// 3. Summarize Article
const summarizeArticle = async (req, res, next) => {
  try {
    const { content, maxLength } = req.body;
    if (!content || typeof content !== 'string') {
      throw ApiError.badRequest('Content field is required for summarization');
    }

    const provider = getAIProvider();
    const result = await provider.summarizeArticle({
      content,
      maxLength: maxLength ? Number(maxLength) : 250
    });
    return ApiResponse.success(res, result, 'Summary generated successfully');
  } catch (error) {
    next(error);
  }
};

// 4. Analyze Writing
const analyzeWriting = async (req, res, next) => {
  try {
    const { content, title } = req.body;
    if (!content && !title) {
      throw ApiError.badRequest('Content or title is required for writing analysis');
    }

    const provider = getAIProvider();
    const result = await provider.analyzeWriting({ content: content || '', title: title || '' });
    return ApiResponse.success(res, result, 'Writing analysis completed');
  } catch (error) {
    next(error);
  }
};

// 5. Article Grounded Q&A Chat
const chatWithArticle = async (req, res, next) => {
  try {
    const { articleTitle, articleContent, question, history } = req.body;
    if (!question || !question.trim()) {
      throw ApiError.badRequest('Question is required for article chat');
    }
    if (!articleContent || !articleContent.trim()) {
      throw ApiError.badRequest('Article content is required to answer grounded questions');
    }

    const provider = getAIProvider();
    const result = await provider.chatWithArticle({
      articleTitle: articleTitle || '',
      articleContent,
      question: question.trim(),
      history: history || []
    });
    return ApiResponse.success(res, result, 'Answer generated');
  } catch (error) {
    next(error);
  }
};

// 6. Article Ideas & Outlines
const generateIdeasAndOutlines = async (req, res, next) => {
  try {
    const { topic, audience } = req.body;
    const provider = getAIProvider();
    const result = await provider.generateIdeasAndOutlines({
      topic: topic || 'Distributed Systems',
      audience: audience || 'Engineers'
    });
    return ApiResponse.success(res, result, 'Ideas and outline generated');
  } catch (error) {
    next(error);
  }
};

// 7. AI Search Assist
const aiSearchAssist = async (req, res, next) => {
  try {
    const { query } = req.body;
    if (!query || typeof query !== 'string') {
      throw ApiError.badRequest('Query string is required');
    }

    const provider = getAIProvider();
    const result = await provider.aiSearchAssist({ query });
    return ApiResponse.success(res, result, 'Search query analyzed');
  } catch (error) {
    next(error);
  }
};

// Legacy tag helper
const suggestTags = async (req, res, next) => {
  try {
    const { title, content } = req.body;
    const provider = getAIProvider();
    const result = await provider.suggestTags({ title: title || '', content: content || '' });
    return ApiResponse.success(res, result, 'Tags suggested successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  improveWriting,
  generateTitlesAndMetadata,
  summarizeArticle,
  analyzeWriting,
  chatWithArticle,
  generateIdeasAndOutlines,
  aiSearchAssist,
  suggestTags
};
