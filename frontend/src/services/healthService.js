import api from './api';

export const healthService = {
  async checkHealth() {
    try {
      const res = await api.get('/health');
      return res.data.data;
    } catch (error) {
      return {
        status: 'unreachable',
        error: error.message
      };
    }
  }
};
