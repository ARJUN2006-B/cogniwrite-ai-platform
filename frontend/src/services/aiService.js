import api from './api';

export const aiService = {
  // 1. Writing Assistant
  async improveWriting({ text, instruction = 'polish', tone = 'professional' }) {
    const res = await api.post('/ai/improve', { text, instruction, tone });
    return res.data.data;
  },

  // 2. Titles & Metadata Generator
  async generateTitlesAndMetadata({ title, content }) {
    const res = await api.post('/ai/titles-metadata', { title, content });
    return res.data.data;
  },

  // 3. Summarize Article
  async summarizeArticle({ content, maxLength = 250 }) {
    const res = await api.post('/ai/summarize', { content, maxLength });
    return res.data.data;
  },

  // 4. Writing Analysis
  async analyzeWriting({ content, title }) {
    const res = await api.post('/ai/analyze', { content, title });
    return res.data.data;
  },

  // 5. Article Grounded Q&A Chat
  async chatWithArticle({ articleTitle, articleContent, question, history = [] }) {
    const res = await api.post('/ai/chat', {
      articleTitle,
      articleContent,
      question,
      history
    });
    return res.data.data;
  },

  // 6. Article Ideas & Structured Outlines
  async generateIdeasAndOutlines({ topic, audience }) {
    const res = await api.post('/ai/ideas-outlines', { topic, audience });
    return res.data.data;
  },

  // 7. AI Search Query Assister
  async aiSearchAssist({ query }) {
    const res = await api.post('/ai/search-assist', { query });
    return res.data.data;
  },

  // Legacy helper
  async suggestTags({ title, content }) {
    const res = await api.post('/ai/suggest-tags', { title, content });
    return res.data.data;
  }
};
