import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
  timeout: 1200000,  // 20 minutes timeout to match backend
});

// Request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// API functions for different resources
export const authAPI = {
  login: (credentials) => api.post('/api/auth/login/', credentials),
  register: (userData) => api.post('/api/auth/register/', userData),
  getProfile: () => api.get('/api/auth/me/'),
  updateProfile: (data) => api.put('/api/auth/update_profile/', data),
};

export const promptsAPI = {
  getPrompts: (params = {}) => api.get('/api/prompts/', { params }),
  getPrompt: (id) => api.get(`/api/prompts/${id}/`),
  getPromptStats: () => api.get('/api/prompts/stats/'),
  generateSuggestions: (data) => api.post('/api/prompts/generate_suggestions/', data),
  improvePrompt: (data) => api.post('/api/prompts/improve_prompt/', data),
  analyzePrompt: (data) => api.post('/api/prompts/analyze_prompt/', data),
  getGuardrailsStatus: () => api.get('/api/prompts/guardrails_status/'),
  validateWithGuardrails: (data) => api.post('/api/prompts/validate_with_guardrails/', data),
  updateGuardrailsConfig: (data) => api.post('/api/prompts/update_guardrails_config/', data),
  createPrompt: (data) => api.post('/api/prompts/', data),
  updatePrompt: (id, data) => api.put(`/api/prompts/${id}/`, data),
  deletePrompt: (id) => api.delete(`/api/prompts/${id}/`),
  toggleFavorite: (id) => api.post(`/api/prompts/${id}/favorite/`),
  usePrompt: (id) => api.post(`/api/prompts/${id}/use/`),
  getFavorites: () => api.get('/api/prompts/favorites/'),
  searchPrompts: (query, params = {}) => api.get('/api/prompts/search/', {
    params: { q: query, ...params }
  }),
  getPromptVersions: (id) => api.get(`/api/prompts/${id}/versions/`),
  getPromptVersion: (id, version) => api.get(`/api/prompts/${id}/version/?version=${version}`),
  restorePromptVersion: (id, data) => api.post(`/api/prompts/${id}/restore_version/`, data),
  getAuditLogs: (params = '') => api.get(`/api/prompts/audit-logs/${params ? '?' + params : ''}`),
  getAuditStatistics: () => api.get('/api/prompts/audit-logs/statistics/'),
  getSecurityEvents: () => api.get('/api/prompts/audit-logs/security_events/'),
};

export const categoriesAPI = {
  getCategories: (params = {}) => api.get('/api/prompts/categories/', { params }),
  getCategory: (id) => api.get(`/api/prompts/categories/${id}/`),
  createCategory: (data) => api.post('/api/prompts/categories/', data),
  updateCategory: (id, data) => api.put(`/api/prompts/categories/${id}/`, data),
  deleteCategory: (id) => api.delete(`/api/prompts/categories/${id}/`),
  getCategoryStats: () => api.get('/api/prompts/categories/stats/'),
};

export const exportAPI = {
  exportPrompts: (format = 'json', params = {}) => {
    return api.get('/api/prompts/export/', {
      params: { format, ...params },
      responseType: 'blob'
    });
  },
  importPrompts: (file, format = 'json') => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/api/prompts/import/?format=${format}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};
