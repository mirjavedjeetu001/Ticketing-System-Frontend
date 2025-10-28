import axios, { AxiosInstance, AxiosError } from 'axios';
import { toast } from 'react-hot-toast';

// Request throttling variables
const requestQueue = new Map<string, number>();
const MAX_REQUESTS_PER_SECOND = 5;
const REQUEST_DELAY = 200; // 200ms between requests

// Function to throttle requests
const throttleRequest = (url: string): Promise<void> => {
  return new Promise((resolve) => {
    const now = Date.now();
    const lastRequest = requestQueue.get(url) || 0;
    const timeDiff = now - lastRequest;
    
    if (timeDiff < REQUEST_DELAY) {
      setTimeout(() => {
        requestQueue.set(url, Date.now());
        resolve();
      }, REQUEST_DELAY - timeDiff);
    } else {
      requestQueue.set(url, now);
      resolve();
    }
  });
};

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  timeout: 15000, // Increased timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token and throttle requests
api.interceptors.request.use(
  async (config) => {
    // Throttle requests to prevent rate limiting
    const url = config.url || '';
    await throttleRequest(url);
    
    const token = localStorage.getItem('token');
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
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    // Handle different error types
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // Unauthorized - remove token and redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          toast.error('Session expired. Please login again.');
          break;
        
        case 403:
          toast.error('You do not have permission to perform this action.');
          break;
        
        case 404:
          toast.error('Resource not found.');
          break;
        
        case 422:
        case 400:
          // Validation errors
          const message = (data as any)?.message || 'Validation error';
          toast.error(message);
          break;
        
        case 429:
          // Rate limiting - retry after delay
          toast.error('Too many requests. Please wait a moment and try again.');
          return new Promise((resolve) => {
            setTimeout(() => {
              resolve(api.request(error.config!));
            }, 2000); // Wait 2 seconds before retry
          });
        
        case 500:
          toast.error('Internal server error. Please try again later.');
          break;
        
        default:
          const errorMessage = (data as any)?.message || 'An unexpected error occurred';
          toast.error(errorMessage);
      }
    } else if (error.request) {
      // Network error
      toast.error('Network error. Please check your connection.');
    } else {
      // Other error
      toast.error('An unexpected error occurred.');
    }
    
    return Promise.reject(error);
  }
);

export default api;