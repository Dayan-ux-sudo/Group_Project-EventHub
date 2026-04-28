import axios from "axios";

const API_BASE_URL = "http://localhost:8000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = localStorage.getItem("refresh_token");
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
            refresh: refreshToken,
          });
          localStorage.setItem("access_token", response.data.access);
          error.config.headers.Authorization = `Bearer ${response.data.access}`;
          return axios(error.config);
        } catch (refreshError) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          localStorage.removeItem("eventhub_user");
          window.dispatchEvent(new Event("auth-changed"));
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  },
);

export const authAPI = {
  register: (data) => api.post("/auth/register/", data),
  login: (data) => api.post("/auth/login/", data),
  getProfile: () => api.get("/auth/profile/"),
  updateProfile: (data) =>
    api.patch("/auth/profile/", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
};

export const eventsAPI = {
  getEvents: (params) => api.get("/events/", { params }),
  createEvent: (data) => api.post("/events/", data),
  getEvent: (id) => api.get(`/events/${id}/`),
  updateEvent: (id, data) => api.patch(`/events/${id}/`, data),
  deleteEvent: (id) => api.delete(`/events/${id}/`),
  getAttendees: (id) => api.get(`/events/${id}/attendees/`),
  getSchools: () => api.get("/events/schools/"),
  getOrganizerDashboard: () => api.get("/events/dashboard/"),
  getMyRegistrations: () => api.get("/events/registrations/"),
  rsvp: (id) => api.post(`/events/${id}/rsvp/`, { status: "attending" }),
  cancelRsvp: (id) => api.delete(`/events/${id}/rsvp/`),
  exportICS: (id) => api.get(`/events/${id}/export-ics/`, { responseType: "blob" }),
};

export const getStoredUser = () => {
  try {
    const raw = localStorage.getItem("eventhub_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setStoredUser = (user) => {
  localStorage.setItem("eventhub_user", JSON.stringify(user));
  window.dispatchEvent(new Event("auth-changed"));
};

export const clearStoredUser = () => {
  localStorage.removeItem("eventhub_user");
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  window.dispatchEvent(new Event("auth-changed"));
};

export default api;
