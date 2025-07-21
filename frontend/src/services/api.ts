// services/api.ts - Axios instance with auth interceptors

import axios, { AxiosError, AxiosResponse } from 'axios';

// API Base URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5288/api';

// Axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Session ID'yi de ekle (guest users için)
    const sessionId = localStorage.getItem('sessionId') || `session-${Date.now()}`;
    if (!token) {
      config.headers['X-Session-Id'] = sessionId;
      localStorage.setItem('sessionId', sessionId);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Eğer login sayfasında değilse yönlendir
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    // 403 Forbidden - Yetkisiz erişim
    if (error.response?.status === 403) {
      console.error('Access denied:', error.response.data);
    }

    // 500 Internal Server Error
    if (error.response?.status === 500) {
      console.error('Server error:', error.response.data);
    }

    return Promise.reject(error);
  }
);

export default api;