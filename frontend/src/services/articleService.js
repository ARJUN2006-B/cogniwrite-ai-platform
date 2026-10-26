import api from './api';

export const articleService = {
  async getArticles({ page = 1, limit = 10, category = '', tag = '', search = '', authorId = '', status = 'published', sortBy = 'newest' } = {}) {
    const params = new URLSearchParams();
    if (page) params.append('page', page);
    if (limit) params.append('limit', limit);
    if (category && category !== 'All') params.append('category', category);
    if (tag && tag !== 'All') params.append('tag', tag);
    if (search) params.append('search', search);
    if (authorId) params.append('authorId', authorId);
    if (status) params.append('status', status);
    if (sortBy) params.append('sortBy', sortBy);

    const res = await api.get(`/articles?${params.toString()}`);
    return {
      articles: res.data.data,
      pagination: res.data.pagination
    };
  },

  async getArticle(idOrSlug) {
    const res = await api.get(`/articles/${idOrSlug}`);
    return res.data.data;
  },

  async createArticle(data) {
    const res = await api.post('/articles', data);
    return res.data.data;
  },

  async updateArticle(id, data) {
    const res = await api.put(`/articles/${id}`, data);
    return res.data.data;
  },

  async deleteArticle(id) {
    const res = await api.delete(`/articles/${id}`);
    return res.data.data;
  },

  async toggleLike(id) {
    const res = await api.post(`/articles/${id}/like`);
    return res.data.data;
  },

  async getRelatedArticles(idOrSlug) {
    const res = await api.get(`/articles/${idOrSlug}/related`);
    return res.data.data;
  },

  async getComments(articleId) {
    const res = await api.get(`/articles/${articleId}/comments`);
    return res.data.data;
  },

  async addComment(articleId, content) {
    const res = await api.post(`/articles/${articleId}/comments`, { content });
    return res.data.data;
  },

  async deleteComment(commentId) {
    const res = await api.delete(`/articles/comments/${commentId}`);
    return res.data.data;
  },

  async getDashboardMetrics() {
    const res = await api.get('/articles/dashboard/metrics');
    return res.data.data;
  },

  async getAdminMetrics() {
    const res = await api.get('/articles/admin/metrics');
    return res.data.data;
  }
};
