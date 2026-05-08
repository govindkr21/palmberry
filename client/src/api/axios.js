import axios from 'axios';

// Create axios instance
const api = axios.create({
  // In production use REACT_APP_API_URL; in development fall back to relative API paths (CRA proxy support)
  baseURL: process.env.REACT_APP_API_URL || '',
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
