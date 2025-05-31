import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:8000', // API Gateway URL
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
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
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API functions
export const authAPI = {
  login: async (credentials: { email: string; password: string }) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  
  logout: () => {
    localStorage.removeItem('authToken');
  },
  
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },
};

// Document API functions
export const documentAPI = {
  upload: async (file: File) => {
    const formData = new FormData();
    formData.append('document', file);
    
    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  list: async () => {
    const response = await api.get('/api/documents');
    return response.data;
  },
  
  get: async (id: string) => {
    const response = await api.get(`/api/documents/${id}`);
    return response.data;
  },
};

// Analytics API functions
export const analyticsAPI = {
  getDashboard: async () => {
    const response = await api.get('/analytics/dashboard/metrics');
    return response.data;
  },
  
  recordStudySession: async (data: { documentId: string; duration: number }) => {
    const response = await api.post('/analytics/test/study-session', data);
    return response.data;
  },
  
  recordQuizCompletion: async (data: { documentId: string; score: number; topic: string }) => {
    const response = await api.post('/analytics/test/quiz-completion', data);
    return response.data;
  },
};

// Schedule API functions
export const scheduleAPI = {
  getToday: async () => {
    const response = await api.get('/schedule/schedule/today');
    return response.data;
  },
  
  seedSchedule: async (documentId: number) => {
    const response = await api.post('/schedule/test/seed', { documentId });
    return response.data;
  },
};

// Notification API functions
export const notificationAPI = {
  getNotifications: async (userId: number) => {
    const response = await api.get(`/notifications/notifications/${userId}`);
    return response.data;
  },
  
  markAsRead: async (notificationId: number) => {
    const response = await api.put(`/notifications/notifications/${notificationId}/read`);
    return response.data;
  },
  
  sendTestReminder: async (data: { documentId: number; userId: number }) => {
    const response = await api.post('/notifications/test/reminder', data);
    return response.data;
  },
};

// Health check functions for all services
export const healthAPI = {
  gateway: () => api.get('/health'),
  auth: () => api.get('/auth/health'),
  ingestion: () => api.get('/ingestion/health'),
  nlp: () => api.get('/nlp/health'),
  scheduler: () => api.get('/scheduler/health'),
  analytics: () => api.get('/analytics/health'),
  notifications: () => api.get('/notifications/health'),
};

export default api; 