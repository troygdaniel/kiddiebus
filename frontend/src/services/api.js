import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const requestUrl = originalRequest?.url || '';

    // Skip token refresh logic for auth endpoints (login, register, google)
    const isAuthEndpoint = requestUrl.includes('/auth/login') ||
                           requestUrl.includes('/auth/register') ||
                           requestUrl.includes('/auth/google');

    // Handle 401 (unauthorized) and 422 (malformed token) errors, but not for auth endpoints
    if (!isAuthEndpoint && (error.response?.status === 401 || error.response?.status === 422) && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_URL}/auth/refresh`, {}, {
            headers: { Authorization: `Bearer ${refreshToken}` }
          });

          const { access_token } = response.data;
          localStorage.setItem('access_token', access_token);

          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return api(originalRequest);
        } catch (refreshError) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token, clear and redirect
        localStorage.removeItem('access_token');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (userData) => api.post('/auth/register', userData),
  googleLogin: (credential) => api.post('/auth/google', { credential }),
  getMe: () => api.get('/auth/me'),
  updateMe: (data) => api.put('/auth/me', data),
  refresh: () => api.post('/auth/refresh'),
};

// Users API
export const usersAPI = {
  getAll: (role) => api.get('/users', { params: { role } }),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
};

// Buses API
export const busesAPI = {
  getAll: (status) => api.get('/buses', { params: { status } }),
  getById: (id) => api.get(`/buses/${id}`),
  create: (data) => api.post('/buses', data),
  update: (id, data) => api.put(`/buses/${id}`, data),
  updateLocation: (id, lat, lng) => api.put(`/buses/${id}/location`, { latitude: lat, longitude: lng }),
  delete: (id) => api.delete(`/buses/${id}`),
};

// Routes API
export const routesAPI = {
  getAll: (params) => api.get('/routes', { params }),
  getById: (id) => api.get(`/routes/${id}`),
  create: (data) => api.post('/routes', data),
  update: (id, data) => api.put(`/routes/${id}`, data),
  delete: (id) => api.delete(`/routes/${id}`),
  getStudents: (id) => api.get(`/routes/${id}/students`),
};

// Students API
export const studentsAPI = {
  getAll: (routeId) => api.get('/students', { params: { route_id: routeId } }),
  getById: (id) => api.get(`/students/${id}`),
  getByCard: (cardId) => api.get(`/students/card/${cardId}`),
  create: (data) => api.post('/students', data),
  update: (id, data) => api.put(`/students/${id}`, data),
  delete: (id) => api.delete(`/students/${id}`),
  checkin: (id, data) => api.post(`/students/${id}/checkin`, data),
  getBoardings: (id) => api.get(`/students/${id}/boardings`),
};

// Notifications API
export const notificationsAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  getById: (id) => api.get(`/notifications/${id}`),
  create: (data) => api.post('/notifications', data),
  broadcast: (data) => api.post('/notifications/broadcast', data),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
};

export default api;
