import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { toast } from 'react-hot-toast';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Token management
let accessToken: string | null = null;
let refreshToken: string | null = null;

export const setTokens = (tokens: { accessToken: string; refreshToken: string }) => {
  accessToken = tokens.accessToken;
  refreshToken = tokens.refreshToken;
  
  // Store in localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem('mavit_access_token', tokens.accessToken);
    localStorage.setItem('mavit_refresh_token', tokens.refreshToken);
  }
};

export const getTokens = () => {
  if (typeof window !== 'undefined') {
    const storedAccessToken = localStorage.getItem('mavit_access_token');
    const storedRefreshToken = localStorage.getItem('mavit_refresh_token');
    
    if (storedAccessToken && storedRefreshToken) {
      accessToken = storedAccessToken;
      refreshToken = storedRefreshToken;
      return { accessToken, refreshToken };
    }
  }
  return { accessToken, refreshToken };
};

export const clearTokens = () => {
  accessToken = null;
  refreshToken = null;
  
  if (typeof window !== 'undefined') {
    localStorage.removeItem('mavit_access_token');
    localStorage.removeItem('mavit_refresh_token');
  }
};

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const { accessToken: currentToken } = getTokens();
    
    if (currentToken && config.headers) {
      config.headers.Authorization = `Bearer ${currentToken}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { refreshToken: currentRefreshToken } = getTokens();
        
        if (currentRefreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken: currentRefreshToken,
          });

          const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data.data;
          
          setTokens({ 
            accessToken: newAccessToken, 
            refreshToken: newRefreshToken 
          });

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        clearTokens();
        window.location.href = '/auth/login';
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    if (error.response?.data?.error?.message) {
      toast.error(error.response.data.error.message);
    } else if (error.message) {
      toast.error(error.message);
    } else {
      toast.error('An unexpected error occurred');
    }

    return Promise.reject(error);
  }
);

// API methods
export const apiClient = {
  // Auth methods
  auth: {
    login: (credentials: { email: string; password: string }) =>
      api.post('/auth/login', credentials),
    
    register: (credentials: { name: string; email: string; password: string; confirmPassword: string }) =>
      api.post('/auth/register', credentials),
    
    refreshToken: (refreshToken: string) =>
      api.post('/auth/refresh', { refreshToken }),
    
    logout: () => api.post('/auth/logout'),
    
    getProfile: () => api.get('/auth/profile'),
  },

  // Tasks methods
  tasks: {
    getAll: (params?: any) => api.get('/tasks', { params }),
    getById: (id: string) => api.get(`/tasks/${id}`),
    create: (data: any) => api.post('/tasks', data),
    update: (id: string, data: any) => api.put(`/tasks/${id}`, data),
    delete: (id: string) => api.delete(`/tasks/${id}`),
    bulkUpdate: (data: { taskIds: string[]; updates: any }) => 
      api.patch('/tasks/bulk', data),
  },

  // Events methods
  events: {
    getAll: (params?: any) => api.get('/events', { params }),
    getById: (id: string) => api.get(`/events/${id}`),
    create: (data: any) => api.post('/events', data),
    update: (id: string, data: any) => api.put(`/events/${id}`, data),
    delete: (id: string) => api.delete(`/events/${id}`),
    getCalendarView: (params: { startDate: string; endDate: string; view: string }) => 
      api.get('/events/calendar', { params }),
  },

  // Notes methods
  notes: {
    getAll: (params?: any) => api.get('/notes', { params }),
    getById: (id: string) => api.get(`/notes/${id}`),
    create: (data: any) => api.post('/notes', data),
    update: (id: string, data: any) => api.put(`/notes/${id}`, data),
    delete: (id: string) => api.delete(`/notes/${id}`),
    search: (query: string, params?: any) => 
      api.get('/notes/search', { params: { query, ...params } }),
  },

  // Lists methods
  lists: {
    getAll: (params?: any) => api.get('/lists', { params }),
    getById: (id: string) => api.get(`/lists/${id}`),
    create: (data: any) => api.post('/lists', data),
    update: (id: string, data: any) => api.put(`/lists/${id}`, data),
    delete: (id: string) => api.delete(`/lists/${id}`),

    // List items
    getItems: (listId: string, params?: any) =>
      api.get(`/lists/${listId}/items`, { params }),
    addItem: (listId: string, data: any) =>
      api.post(`/lists/${listId}/items`, data),
    createItem: (listId: string, data: any) =>
      api.post(`/lists/${listId}/items`, data),
    updateItem: (listId: string, itemId: string, data: any) =>
      api.put(`/lists/${listId}/items/${itemId}`, data),
    deleteItem: (listId: string, itemId: string) =>
      api.delete(`/lists/${listId}/items/${itemId}`),
    removeItem: (listId: string, itemId: string) =>
      api.delete(`/lists/${listId}/items/${itemId}`),
    bulkUpdateItems: (listId: string, data: any) =>
      api.patch(`/lists/${listId}/items/bulk`, data),
    reorderItems: (listId: string, data: { itemIds: string[] }) =>
      api.patch(`/lists/${listId}/items/reorder`, data),
  },

  // Transactions methods
  transactions: {
    getAll: (params?: any) => api.get('/transactions', { params }),
    getById: (id: string) => api.get(`/transactions/${id}`),
    create: (data: any) => api.post('/transactions', data),
    update: (id: string, data: any) => api.put(`/transactions/${id}`, data),
    delete: (id: string) => api.delete(`/transactions/${id}`),
    bulkImport: (data: any) => api.post('/transactions/bulk-import', data),
    getStats: (params?: any) => api.get('/transactions/stats', { params }),
  },

  // Subscriptions methods
  subscriptions: {
    getAll: (params?: any) => api.get('/subscriptions', { params }),
    getById: (id: string) => api.get(`/subscriptions/${id}`),
    create: (data: any) => api.post('/subscriptions', data),
    update: (id: string, data: any) => api.put(`/subscriptions/${id}`, data),
    delete: (id: string) => api.delete(`/subscriptions/${id}`),
    cancel: (id: string) => api.patch(`/subscriptions/${id}/cancel`),
    reactivate: (id: string) => api.patch(`/subscriptions/${id}/reactivate`),
  },

  // Analytics methods
  analytics: {
    getDashboard: () => api.get('/analytics/dashboard'),
    getTasks: (params?: any) => api.get('/analytics/tasks', { params }),
    getFinancial: (params?: any) => api.get('/analytics/financial', { params }),
    getProductivity: (params?: any) => api.get('/analytics/productivity', { params }),
  },
};

export default api;