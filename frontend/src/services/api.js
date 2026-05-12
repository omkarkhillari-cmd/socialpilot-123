import axios from 'axios';
import { useAuthStore } from '../contexts/authStore.js';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api`
    : '/api',
  timeout: 60000
});

// Request interceptor - attach token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor - handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data)
};

// Workspaces
export const workspaceAPI = {
  list: () => api.get('/workspaces'),
  create: (data) => api.post('/workspaces', data),
  get: (id) => api.get(`/workspaces/${id}`),
  update: (id, data) => api.put(`/workspaces/${id}`, data),
  delete: (id) => api.delete(`/workspaces/${id}`)
};

// Content
export const contentAPI = {
  list: (workspaceId, params) => api.get(`/content/workspace/${workspaceId}`, { params }),
  get: (id) => api.get(`/content/${id}`),
  update: (id, data) => api.put(`/content/${id}`, data),
  delete: (id) => api.delete(`/content/${id}`),
  approve: (id) => api.post(`/content/${id}/approve`)
};

// AI
export const aiAPI = {
  getConfig: () => api.get('/ai/config'),
  generate: (data) => api.post('/ai/generate', data),
  generateImage: (data) => api.post('/ai/generate/image', data),
  regenerate: (contentId, data) => api.post(`/ai/regenerate/${contentId}`, data),
  stream: (data, onChunk, onDone, onError) => {
    const token = useAuthStore.getState().token;
    const ctrl = new AbortController();

    fetch('/api/ai/generate/stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(data),
      signal: ctrl.signal
    }).then(async (res) => {
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const parsed = JSON.parse(line.slice(6));
              if (parsed.chunk) onChunk(parsed.chunk);
              if (parsed.done) onDone(parsed.saved);
              if (parsed.error) onError(new Error(parsed.error));
            } catch {}
          }
        }
      }
    }).catch(onError);

    return () => ctrl.abort();
  }
};

// Schedule
export const scheduleAPI = {
  list: (workspaceId) => api.get(`/schedule/workspace/${workspaceId}`),
  create: (data) => api.post('/schedule', data),
  update: (id, data) => api.put(`/schedule/${id}`, data),
  delete: (id) => api.delete(`/schedule/${id}`)
};

// Export
export const exportAPI = {
  markdown: (workspaceId) => api.get(`/export/workspace/${workspaceId}/markdown`, { responseType: 'blob' }),
  json: (workspaceId) => api.get(`/export/workspace/${workspaceId}/json`, { responseType: 'blob' }),
  pdfData: (contentId) => api.get(`/export/content/${contentId}/pdf-data`)
};

export default api;
