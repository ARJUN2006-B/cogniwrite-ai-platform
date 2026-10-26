const AIProvider = require('./aiProvider.interface');
const env = require('../../config/env');
const ApiError = require('../../utils/apiError');
const logger = require('../../utils/logger');

function parseOpenAIJSON(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    throw new Error('Empty response received from OpenAI');
  }

  let cleaned = rawText.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '').trim();
  }

  return JSON.parse(cleaned);
}

/**
 * OpenAI Provider implementation using native HTTP fetch
 */
class OpenAIProvider extends AIProvider {
  constructor() {
    super('openai');
    this.apiKey = env.OPENAI_API_KEY;
    this.endpoint = 'https://api.openai.com/v1/chat/completions';
    this.model = 'gpt-4o-mini';
  }

  isConfigured() {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  async _callOpenAI(systemPrompt, userPrompt, responseFormat = 'json_object') {
    if (!this.isConfigured()) {
      throw ApiError.badRequest(
        'OpenAI API key is missing. Set OPENAI_API_KEY in backend/.env to use real OpenAI LLM.'
      );
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000); // 20s timeout

    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          response_format: responseFormat === 'json_object' ? { type: 'json_object' } : undefined,
          temperature: 0.3
        }),
        signal: controller.signal
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const errText = await response.text();
        logger.error(`OpenAI API error [${response.status}]: ${errText}`);
        throw ApiError.internal(`OpenAI API error (${response.status}): ${errText}`);
      }

      const data = await response.json();
      const rawText = data.choices?.[0]?.message?.content;
      if (!rawText) {
        throw ApiError.internal('OpenAI returned an empty response');
      }
      return rawText;
    } catch (err) {
      clearTimeout(timeout);
      if (err.name === 'AbortError') {
        throw ApiError.internal('OpenAI request timed out after 20 seconds');
      }
      throw err;
    }
  }

  async improveWriting({ text = '', instruction = 'polish', tone = 'professional' }) {
    const systemPrompt = `You are an expert technical editor. Apply the instruction '${instruction}' with tone '${tone}' to the text.
Return JSON with exactly this structure:
{
  "improvedText": "<the rewritten, enhanced text>",
  "changesSummary": "<brief 1-sentence summary of enhancements made>"
}`;

    const raw = await this._callOpenAI(systemPrompt, text);
    const parsed = parseOpenAIJSON(raw);

    return {
      improvedText: parsed.improvedText || text,
      changesSummary: parsed.changesSummary || `Polished with OpenAI GPT-4o-mini (${instruction}, tone: ${tone}).`,
      provider: `OpenAI (${this.model})`
    };
  }

  async generateTitleAndMetadata({ title = '', content = '' }) {
    const systemPrompt = `You are a technical publication editor. Based on the article title and snippet, generate 3 alternative titles, a 1-2 sentence excerpt, 4-6 lowercase tags, and the best category from: Architecture, Systems, AI & ML, Backend, Frontend, Database, DevOps, General.
Return JSON with exactly this structure:
{
  "alternativeTitles": ["Title 1", "Title 2", "Title 3"],
  "suggestedExcerpt": "<1-2 sentence excerpt>",
  "suggestedTags": ["tag1", "tag2"],
  "suggestedCategory": "<Category>"
}`;
    const userPrompt = `Title: ${title}\nContent snippet: ${content.slice(0, 1500)}`;

    const raw = await this._callOpenAI(systemPrompt, userPrompt);
    const parsed = parseOpenAIJSON(raw);

    return {
      alternativeTitles: Array.isArray(parsed.alternativeTitles) ? parsed.alternativeTitles : [title],
      suggestedExcerpt: parsed.suggestedExcerpt || '',
      suggestedTags: Array.isArray(parsed.suggestedTags) ? parsed.suggestedTags : ['architecture'],
      suggestedCategory: parsed.suggestedCategory || 'General',
      provider: `OpenAI (${this.model})`
    };
  }

  async summarizeArticle({ content = '', maxLength = 300 }) {
    const systemPrompt = `Summarize the article in under ${maxLength} characters, provide a 1-sentence TL;DR, and 3 key takeaway bullet points.
Return JSON with exactly this structure:
{
  "summary": "<concise executive summary under ${maxLength} characters>",
  "tldr": "<single sentence TLDR>",
  "keyPoints": ["point 1", "point 2", "point 3"]
}`;

    const raw = await this._callOpenAI(systemPrompt, content.slice(0, 4000));
    const parsed = parseOpenAIJSON(raw);

    return {
      summary: parsed.summary || content.slice(0, maxLength),
      tldr: parsed.tldr || '',
      keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints : [],
      provider: `OpenAI (${this.model})`
    };
  }

  async analyzeWriting({ content = '', title = '' }) {
    const systemPrompt = `Analyze the article for readability, clarity, structural cohesion, and repetition.
Return JSON with exactly this structure:
{
  "readabilityScore": <integer between 40 and 95>,
  "gradeLevel": "<e.g. Senior Engineering, Intermediate, Academic>",
  "clarityIssues": ["issue 1", "issue 2"],
  "repetitionIssues": ["repetition 1"],
  "suggestions": ["recommendation 1", "recommendation 2"]
}`;
    const userPrompt = `Title: ${title}\nContent:\n${content.slice(0, 3000)}`;

    const raw = await this._callOpenAI(systemPrompt, userPrompt);
    const parsed = parseOpenAIJSON(raw);

    return {
      readabilityScore: Number(parsed.readabilityScore) || 82,
      gradeLevel: parsed.gradeLevel || 'Senior Engineering',
      clarityIssues: Array.isArray(parsed.clarityIssues) ? parsed.clarityIssues : [],
      repetitionIssues: Array.isArray(parsed.repetitionIssues) ? parsed.repetitionIssues : [],
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : ['Ensure strong opening problem statement.'],
      disclaimer: 'Note: AI writing analysis metrics are algorithmic estimates intended for editorial guidance, not objective facts.',
      provider: `OpenAI (${this.model})`
    };
  }

  async chatWithArticle({ articleTitle = '', articleContent = '', question = '', history = [] }) {
    const systemPrompt = `You are an AI assistant answering questions about the technical article "${articleTitle}".
CRITICAL GROUNDING RULES:
1. Answer using ONLY facts explicitly present in the Article text.
2. If the article does not contain enough information, you MUST state:
   "The provided article does not contain enough information to answer this question."
   Do NOT extrapolate or invent facts.

Return JSON with exactly this structure:
{
  "answer": "<grounded answer or lack of info statement>",
  "groundedInArticle": <true|false>,
  "confidence": "<high|medium|insufficient_information>"
}`;
    const userPrompt = `Article Content:\n${articleContent.slice(0, 4500)}\n\nQuestion: ${question}`;

    const raw = await this._callOpenAI(systemPrompt, userPrompt);
    const parsed = parseOpenAIJSON(raw);

    return {
      answer: parsed.answer || 'The provided article does not contain enough information to answer this question.',
      groundedInArticle: Boolean(parsed.groundedInArticle),
      confidence: parsed.confidence || 'high',
      provider: `OpenAI (${this.model})`
    };
  }

  async generateIdeasAndOutlines({ topic = 'Architecture', audience = 'Engineers' }) {
    const systemPrompt = `Generate 3 article ideas and a structured article outline for topic and audience.
Return JSON with exactly this structure:
{
  "title": "<recommended article title>",
  "ideas": ["idea 1", "idea 2", "idea 3"],
  "outline": [
    { "section": "<Section Heading 1>", "keyPoints": ["point A", "point B"] },
    { "section": "<Section Heading 2>", "keyPoints": ["point A", "point B"] }
  ]
}`;
    const userPrompt = `Topic: ${topic}\nAudience: ${audience}`;

    const raw = await this._callOpenAI(systemPrompt, userPrompt);
    const parsed = parseOpenAIJSON(raw);

    return {
      topic,
      audience,
      title: parsed.title || `Architecting ${topic}`,
      ideas: Array.isArray(parsed.ideas) ? parsed.ideas : [],
      outline: Array.isArray(parsed.outline) ? parsed.outline : [],
      provider: `OpenAI (${this.model})`
    };
  }

  async aiSearchAssist({ query = '' }) {
    const systemPrompt = `Analyze this natural language search query. Extract key technical keywords, infer intent, and select one category from: Architecture, Systems, AI & ML, Backend, Frontend, Database, DevOps, General.
Return JSON with exactly this structure:
{
  "extractedKeywords": ["keyword1", "keyword2"],
  "suggestedCategory": "<Category>",
  "intentAnalysis": "<1 sentence intent summary>"
}`;

    const raw = await this._callOpenAI(systemPrompt, query);
    const parsed = parseOpenAIJSON(raw);

    return {
      originalQuery: query,
      extractedKeywords: Array.isArray(parsed.extractedKeywords) ? parsed.extractedKeywords : [query],
      suggestedCategory: parsed.suggestedCategory || 'General',
      intentAnalysis: parsed.intentAnalysis || 'Extracted technical search intent.',
      searchTip: 'Query analyzed with OpenAI GPT-4o-mini semantic parser.',
      provider: `OpenAI (${this.model})`
    };
  }

  async suggestTags({ title = '', content = '' }) {
    const res = await this.generateTitleAndMetadata({ title, content });
    return { tags: res.suggestedTags, provider: this.name };
  }
}

module.exports = OpenAIProvider;
