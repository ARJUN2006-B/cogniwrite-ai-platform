import axios from 'axios';
import { STORAGE_KEYS } from '../utils/constants';

// Determine base API endpoint with fallback to proxy
const baseURL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: inject Bearer Token if user is logged in
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: centralized error extraction and auth management
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // If backend returns a structured error message
    const customMessage = error.response?.data?.message;
    const errorsList = error.response?.data?.errors;
    
    // Auto-clear invalid/expired session token on 401
    if (error.response?.status === 401) {
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
    }

    const enhancedError = new Error(
      customMessage || error.message || 'An unexpected error occurred while communicating with the server'
    );
    enhancedError.status = error.response?.status;
    enhancedError.errors = errorsList || [];
    enhancedError.originalError = error;

    return Promise.reject(enhancedError);
  }
);

export default api;
