import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Attach JWT Bearer Token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('smartcampus_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Uniform error message extraction & session cleanup
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If token expired or rejected by server on an authenticated endpoint, purge stale local session
    if (error.response?.status === 401 && !error.config?.url?.includes('/auth/login')) {
      try {
        localStorage.removeItem('smartcampus_token');
      } catch {
        // Safe fallback in restricted environments
      }
    }

    const customMessage = error.response?.data?.message || error.message || 'An unexpected network error occurred.';
    error.userMessage = customMessage;
    return Promise.reject(error);
  }
);

export default api;

