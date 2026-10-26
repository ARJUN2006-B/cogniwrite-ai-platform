const env = require('../../config/env');
const logger = require('../../utils/logger');
const MockAIProvider = require('./mockProvider');
const OpenAIProvider = require('./openaiProvider');
const GeminiProvider = require('./geminiProvider');

let currentProviderInstance = null;

/**
 * Factory function to retrieve or instantiate configured AI Provider.
 * Allows hot-reloading when env changes.
 */
const getAIProvider = () => {
  const requested = (process.env.AI_PROVIDER || env.AI_PROVIDER || 'mock').toLowerCase();

  // If already instantiated for the same provider, reuse it
  if (currentProviderInstance && currentProviderInstance.name === requested) {
    return currentProviderInstance;
  }

  if (requested === 'openai') {
    const openai = new OpenAIProvider();
    if (openai.isConfigured()) {
      logger.info('AI Service initialized with live OpenAI Provider (gpt-4o-mini)');
    } else {
      logger.warn('AI_PROVIDER="openai" but OPENAI_API_KEY is empty in backend/.env');
    }
    currentProviderInstance = openai;
    return currentProviderInstance;
  }

  if (requested === 'gemini') {
    const gemini = new GeminiProvider();
    if (gemini.isConfigured()) {
      logger.info('AI Service initialized with live Google Gemini Provider (gemini-1.5-flash)');
    } else {
      logger.warn('AI_PROVIDER="gemini" but GEMINI_API_KEY is empty in backend/.env');
    }
    currentProviderInstance = gemini;
    return currentProviderInstance;
  }

  logger.info('AI Service initialized with Mock Local Provider (zero-external-dependency mode)');
  currentProviderInstance = new MockAIProvider();
  return currentProviderInstance;
};

module.exports = {
  getAIProvider
};
