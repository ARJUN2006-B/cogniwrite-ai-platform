import api from './api';
import { STORAGE_KEYS } from '../utils/constants';

export const authService = {
  async register({ name, email, password, bio }) {
    const res = await api.post('/auth/register', { name, email, password, bio });
    const { user, token } = res.data.data;
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    return { user, token };
  },

  async login({ email, password }) {
    const res = await api.post('/auth/login', { email, password });
    const { user, token } = res.data.data;
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    return { user, token };
  },

  async getMe() {
    const res = await api.get('/auth/me');
    const { user } = res.data.data;
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    return user;
  },

  async updateProfile(data) {
    const res = await api.put('/auth/profile', data);
    const { user } = res.data.data;
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    return user;
  },

  async getPublicProfile(id) {
    const res = await api.get(`/auth/users/${id}`);
    return res.data.data;
  },

  async toggleFollow(targetUserId) {
    const res = await api.post(`/auth/users/${targetUserId}/follow`);
    return res.data.data;
  },

  async getBookmarks() {
    const res = await api.get('/auth/bookmarks');
    return res.data.data;
  },

  async toggleBookmark(articleId) {
    const res = await api.post(`/auth/bookmarks/${articleId}`);
    return res.data.data;
  },

  logout() {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  },

  getStoredSession() {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    const userStr = localStorage.getItem(STORAGE_KEYS.USER);
    let user = null;
    if (userStr) {
      try {
        user = JSON.parse(userStr);
      } catch {
        localStorage.removeItem(STORAGE_KEYS.USER);
      }
    }
    return { token, user };
  }
};
