import axios from 'axios';

// Resolve the API base URL at runtime so the Vercel bundle can reach the
// Railway backend without needing a rebuild when the backend URL changes.
// Priority:
//   1. Build-time env var (REACT_APP_API_URL) — explicit override always wins
//   2. localhost in development
//   3. Railway production URL when running on any non-localhost origin
const resolveBaseURL = () => {
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  if (process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost') {
    return 'http://localhost:5000';
  }
  return 'https://palmberry-production.up.railway.app';
};

// Create axios instance
const api = axios.create({
  baseURL: resolveBaseURL(),
  timeout: 15000, // Increased timeout for production stability
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor - Add token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Prevent infinite redirect loops
      if (window.location.pathname !== '/admin/login' && window.location.pathname !== '/') {
        // Clear all auth-related data
        const keysToRemove = ['token', 'adminToken', 'user', 'adminUser'];
        keysToRemove.forEach(key => localStorage.removeItem(key));
        
        // Use replace instead of href to prevent back-button loops
        window.location.replace('/');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
