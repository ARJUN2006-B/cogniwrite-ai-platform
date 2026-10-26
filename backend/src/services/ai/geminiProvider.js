const AIProvider = require('./aiProvider.interface');
const env = require('../../config/env');
const ApiError = require('../../utils/apiError');
const logger = require('../../utils/logger');

/**
 * Cleanly extracts and parses JSON from Gemini responses (handles ```json ... ``` codeblocks)
 */
function parseGeminiJSON(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    throw new Error('Empty response received from Gemini');
  }

  // Strip markdown code fences if Gemini returned markdown
  let cleaned = rawText.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '').trim();
  }

  return JSON.parse(cleaned);
}

/**
 * Google Gemini Provider implementation using native HTTP fetch
 */
class GeminiProvider extends AIProvider {
  constructor() {
    super('gemini');
    this.apiKey = env.GEMINI_API_KEY;
    this.model = 'gemini-1.5-flash';
  }

  isConfigured() {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  async _callGemini(prompt) {
    if (!this.isConfigured()) {
      throw ApiError.badRequest(
        'Gemini API key is not configured. Add GEMINI_API_KEY=your_key in backend/.env to use real Gemini AI.'
      );
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000); // 20s timeout

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.3
          }
        }),
        signal: controller.signal
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const errorText = await response.text();
        logger.error(`Gemini API error [${response.status}]: ${errorText}`);
        throw ApiError.internal(`Gemini API error (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) {
        throw ApiError.internal('Gemini returned an empty completion');
      }
      return rawText;
    } catch (err) {
      clearTimeout(timeout);
      if (err.name === 'AbortError') {
        throw ApiError.internal('Gemini request timed out after 20 seconds');
      }
      throw err;
    }
  }

  async improveWriting({ text = '', instruction = 'polish', tone = 'professional' }) {
    const prompt = `You are a professional technical editor. Rewrite and improve the following text.
Instruction: ${instruction}
Tone: ${tone}

Return JSON with exactly this structure:
{
  "improvedText": "<the rewritten, enhanced text>",
  "changesSummary": "<brief 1-sentence explanation of changes made>"
}

Original text:
${text}`;

    const raw = await this._callGemini(prompt);
    const parsed = parseGeminiJSON(raw);

    return {
      improvedText: parsed.improvedText || text,
      changesSummary: parsed.changesSummary || `Transformed using Google Gemini (${instruction}, tone: ${tone}).`,
      provider: 'Google Gemini (gemini-1.5-flash)'
    };
  }

  async generateTitleAndMetadata({ title = '', content = '' }) {
    const prompt = `You are a technical publication editor. Based on the article below, suggest 3 alternative titles, a 1-2 sentence excerpt (max 250 chars), 4-6 lowercase technical tags, and the most relevant technical category from: Architecture, Systems, AI & ML, Backend, Frontend, Database, DevOps, General.

Return JSON with exactly this structure:
{
  "alternativeTitles": ["Title 1", "Title 2", "Title 3"],
  "suggestedExcerpt": "<1-2 sentence summary>",
  "suggestedTags": ["tag1", "tag2", "tag3"],
  "suggestedCategory": "<Category>"
}

Current Title: ${title}
Content snippet:
${content.slice(0, 1500)}`;

    const raw = await this._callGemini(prompt);
    const parsed = parseGeminiJSON(raw);

    return {
      alternativeTitles: Array.isArray(parsed.alternativeTitles) ? parsed.alternativeTitles : [title],
      suggestedExcerpt: parsed.suggestedExcerpt || '',
      suggestedTags: Array.isArray(parsed.suggestedTags) ? parsed.suggestedTags : ['architecture'],
      suggestedCategory: parsed.suggestedCategory || 'General',
      provider: 'Google Gemini (gemini-1.5-flash)'
    };
  }

  async summarizeArticle({ content = '', maxLength = 300 }) {
    const prompt = `Analyze and summarize this technical engineering article.
Max summary length: ${maxLength} characters.

Return JSON with exactly this structure:
{
  "summary": "<concise executive summary under ${maxLength} characters>",
  "tldr": "<single punchy TL;DR sentence>",
  "keyPoints": [
    "<key technical takeaway 1>",
    "<key technical takeaway 2>",
    "<key technical takeaway 3>"
  ]
}

Article Content:
${content.slice(0, 4000)}`;

    const raw = await this._callGemini(prompt);
    const parsed = parseGeminiJSON(raw);

    return {
      summary: parsed.summary || content.slice(0, maxLength),
      tldr: parsed.tldr || '',
      keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints : [],
      provider: 'Google Gemini (gemini-1.5-flash)'
    };
  }

  async analyzeWriting({ content = '', title = '' }) {
    const prompt = `Analyze this technical article for readability, clarity, structural cohesion, and repetition.

Return JSON with exactly this structure:
{
  "readabilityScore": <integer between 40 and 95>,
  "gradeLevel": "<e.g. Senior Engineering, Intermediate, Academic>",
  "clarityIssues": ["<specific clarity observation 1>", "<specific clarity observation 2>"],
  "repetitionIssues": ["<overused phrase or cadence 1>"],
  "suggestions": [
    "<actionable editorial recommendation 1>",
    "<actionable editorial recommendation 2>",
    "<actionable editorial recommendation 3>"
  ]
}

Title: ${title}
Content:
${content.slice(0, 3000)}`;

    const raw = await this._callGemini(prompt);
    const parsed = parseGeminiJSON(raw);

    return {
      readabilityScore: Number(parsed.readabilityScore) || 82,
      gradeLevel: parsed.gradeLevel || 'Senior Engineering',
      clarityIssues: Array.isArray(parsed.clarityIssues) ? parsed.clarityIssues : [],
      repetitionIssues: Array.isArray(parsed.repetitionIssues) ? parsed.repetitionIssues : [],
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [
        'Ensure the problem statement is established in the first paragraph.'
      ],
      disclaimer: 'Note: AI writing analysis metrics are algorithmic estimates intended for editorial guidance, not objective facts.',
      provider: 'Google Gemini (gemini-1.5-flash)'
    };
  }

  async chatWithArticle({ articleTitle = '', articleContent = '', question = '', history = [] }) {
    const prompt = `You are an AI assistant answering questions about the technical article "${articleTitle}".
CRITICAL GROUNDING RULES:
1. Answer the question using ONLY information explicitly stated in the Article text below.
2. If the article does not contain enough information to answer the question, you MUST return:
   "The provided article does not contain enough information to answer this question."
   Do NOT hallucinate or extrapolate beyond the text.

Return JSON with exactly this structure:
{
  "answer": "<grounded answer or explicit lack of info statement>",
  "groundedInArticle": <true if found in text, false if info missing>,
  "confidence": "<high|medium|insufficient_information>"
}

Article:
${articleContent.slice(0, 4500)}

Question: ${question}`;

    const raw = await this._callGemini(prompt);
    const parsed = parseGeminiJSON(raw);

    return {
      answer: parsed.answer || 'The provided article does not contain enough information to answer this question.',
      groundedInArticle: Boolean(parsed.groundedInArticle),
      confidence: parsed.confidence || 'high',
      provider: 'Google Gemini (gemini-1.5-flash)'
    };
  }

  async generateIdeasAndOutlines({ topic = 'Architecture', audience = 'Engineers' }) {
    const prompt = `You are a technical content strategist. Generate 3 article concepts and a comprehensive structured outline for the topic "${topic}" targeting audience "${audience}".

Return JSON with exactly this structure:
{
  "title": "<compelling recommended article title>",
  "ideas": ["<idea 1>", "<idea 2>", "<idea 3>"],
  "outline": [
    {
      "section": "<Section Heading 1>",
      "keyPoints": ["<point A>", "<point B>"]
    },
    {
      "section": "<Section Heading 2>",
      "keyPoints": ["<point A>", "<point B>"]
    },
    {
      "section": "<Section Heading 3>",
      "keyPoints": ["<point A>", "<point B>"]
    }
  ]
}`;

    const raw = await this._callGemini(prompt);
    const parsed = parseGeminiJSON(raw);

    return {
      topic,
      audience,
      title: parsed.title || `Architecting ${topic}`,
      ideas: Array.isArray(parsed.ideas) ? parsed.ideas : [],
      outline: Array.isArray(parsed.outline) ? parsed.outline : [],
      provider: 'Google Gemini (gemini-1.5-flash)'
    };
  }

  async aiSearchAssist({ query = '' }) {
    const prompt = `Analyze this natural language technical search query: "${query}".
Extract key technical search terms, infer user intent, and recommend one matching category from: Architecture, Systems, AI & ML, Backend, Frontend, Database, DevOps, General.

Return JSON with exactly this structure:
{
  "extractedKeywords": ["keyword1", "keyword2"],
  "suggestedCategory": "<Category>",
  "intentAnalysis": "<1 sentence explanation of user intent>"
}`;

    const raw = await this._callGemini(prompt);
    const parsed = parseGeminiJSON(raw);

    return {
      originalQuery: query,
      extractedKeywords: Array.isArray(parsed.extractedKeywords) ? parsed.extractedKeywords : [query],
      suggestedCategory: parsed.suggestedCategory || 'General',
      intentAnalysis: parsed.intentAnalysis || 'Extracted technical search intent.',
      searchTip: 'Query analyzed with Google Gemini semantic parser.',
      provider: 'Google Gemini (gemini-1.5-flash)'
    };
  }

  async suggestTags({ title = '', content = '' }) {
    const res = await this.generateTitleAndMetadata({ title, content });
    return { tags: res.suggestedTags, provider: this.name };
  }
}

module.exports = GeminiProvider;
