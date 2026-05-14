import axios from 'axios';

const API_BASE = '/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('forsati_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle auth errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('forsati_token');
      localStorage.removeItem('forsati_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// Jobs
export const jobsAPI = {
  getAll: (params) => api.get('/jobs', { params }),
  getById: (id) => api.get(`/jobs/${id}`),
  create: (data) => api.post('/jobs', data),
  update: (id, data) => api.put(`/jobs/${id}`, data),
  delete: (id) => api.delete(`/jobs/${id}`),
  getMyJobs: () => api.get('/jobs/my'),
  apply: (id) => api.post(`/jobs/${id}/apply`),
};

// Applications
export const applicationsAPI = {
  getMine: () => api.get('/applications/my'),
  getForEmployer: (jobId) => api.get('/applications/employer', { params: { jobId } }),
  updateStatus: (id, status) => api.put(`/applications/${id}/status`, { status }),
};

// Profile
export const profileAPI = {
  getMe: () => api.get('/profile/me'),
  update: (data) => api.put('/profile/me', data),
  getUser: (id) => api.get(`/profile/user/${id}`),
};

// Notifications
export const notificationsAPI = {
  getAll: () => api.get('/notifications'),
  markRead: (id) => api.put(`/notifications/${id}/read`),
};

// AI
export const aiAPI = {
  getRecommended: () => api.get('/ai/recommended-jobs'),
  getProfileSuggestions: (text) => api.post('/ai/profile-suggestions', { text }),
};

// Admin
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: () => api.get('/admin/users'),
  blockUser: (id, isBlocked) => api.put(`/admin/users/${id}/block`, { isBlocked }),
  verifyEmployer: (id) => api.put(`/admin/users/${id}/verify`),
  blockJob: (id) => api.put(`/admin/jobs/${id}/block`),
  getReports: () => api.get('/admin/reports'),
  updateReport: (id, status) => api.put(`/admin/reports/${id}/status`, { status }),
};

// Reports
export const reportsAPI = {
  create: (data) => api.post('/reports', data),
};

export default api;
