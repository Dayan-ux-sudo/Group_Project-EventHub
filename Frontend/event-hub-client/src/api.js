import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api'; // Adjust if backend is on different port

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired, try refresh
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/token/refresh/`, {
            refresh: refreshToken,
          });
          localStorage.setItem('access_token', response.data.access);
          // Retry the original request
          error.config.headers.Authorization = `Bearer ${response.data.access}`;
          return axios(error.config);
        } catch (refreshError) {
          // Refresh failed, logout
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register/', data),
  login: (data) => api.post('/auth/login/', data),
  getProfile: () => api.get('/auth/profile/'),
};

export const eventsAPI = {
  getEvents: (params) => api.get('/events/', { params }),
  createEvent: (data) => api.post('/events/', data),
  getEvent: (id) => api.get(`/events/${id}/`),
  updateEvent: (id, data) => api.put(`/events/${id}/`, data),
  deleteEvent: (id) => api.delete(`/events/${id}/`),
  getAttendees: (id) => api.get(`/events/${id}/attendees/`),
  rsvp: (id, data) => api.post(`/events/${id}/rsvp/`, data),
  exportICS: (id) => api.get(`/events/${id}/export-ics/`, { responseType: 'blob' }),
};

export default api;