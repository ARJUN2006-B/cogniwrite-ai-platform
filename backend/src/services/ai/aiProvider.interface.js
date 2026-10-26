/**
 * Base AI Provider Abstract Class
 * All AI providers (Mock, OpenAI, Gemini) must implement these methods.
 */
class AIProvider {
  constructor(name) {
    if (this.constructor === AIProvider) {
      throw new Error('AIProvider is an abstract class and cannot be instantiated directly.');
    }
    this.name = name;
  }

  getName() {
    return this.name;
  }

  isConfigured() {
    return true;
  }

  // 1. Writing Assistant (rewrite, polish, shorten, expand, tone, intro, conclusion)
  async improveWriting(options) {
    throw new Error('Method "improveWriting" must be implemented.');
  }

  // 2. Title & Metadata Generator
  async generateTitleAndMetadata(options) {
    throw new Error('Method "generateTitleAndMetadata" must be implemented.');
  }

  // 3. Summary & TL;DR Generator
  async summarizeArticle(options) {
    throw new Error('Method "summarizeArticle" must be implemented.');
  }

  // 4. Writing Analysis (readability, clarity, repetition estimates)
  async analyzeWriting(options) {
    throw new Error('Method "analyzeWriting" must be implemented.');
  }

  // 5. Article Grounded Q&A Chat
  async chatWithArticle(options) {
    throw new Error('Method "chatWithArticle" must be implemented.');
  }

  // 6. Article Ideas & Structured Outlines
  async generateIdeasAndOutlines(options) {
    throw new Error('Method "generateIdeasAndOutlines" must be implemented.');
  }

  // 7. AI Search Query Assister
  async aiSearchAssist(options) {
    throw new Error('Method "aiSearchAssist" must be implemented.');
  }

  // Legacy helper
  async suggestTags(options) {
    throw new Error('Method "suggestTags" must be implemented.');
  }
}

module.exports = AIProvider;
