import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { toast } from 'react-hot-toast';

// Request cache to prevent duplicate requests
interface CacheEntry {
  data: any;
  timestamp: number;
  expiresIn: number;
}

const requestCache = new Map<string, CacheEntry>();
const CACHE_DURATION = 30000; // 30 seconds cache (increased from 5s)
const pendingRequests = new Map<string, Promise<any>>();

// Request throttling variables
const requestQueue = new Map<string, number>();
const REQUEST_DELAY = 500; // 500ms between requests (increased from 300ms)
const MAX_RETRIES = 2; // Reduced retries
const RETRY_DELAY = 2000; // Start with 2 seconds (increased from 1s)

// Function to generate cache key
const getCacheKey = (config: InternalAxiosRequestConfig): string => {
  const { method, url, params } = config;
  return `${method}:${url}:${JSON.stringify(params || {})}`;
};

// Function to check cache
const checkCache = (key: string): any | null => {
  const entry = requestCache.get(key);
  if (entry && Date.now() - entry.timestamp < entry.expiresIn) {
    return entry.data;
  }
  requestCache.delete(key);
  return null;
};

// Function to set cache
const setCache = (key: string, data: any, expiresIn: number = CACHE_DURATION): void => {
  requestCache.set(key, {
    data,
    timestamp: Date.now(),
    expiresIn
  });
};

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

// Request interceptor to add auth token, check cache, and throttle requests
api.interceptors.request.use(
  async (config) => {
    // Only cache GET requests
    if (config.method?.toLowerCase() === 'get') {
      const cacheKey = getCacheKey(config);
      const cachedData = checkCache(cacheKey);
      
      // If we have cached data, return it immediately
      if (cachedData) {
        return Promise.reject({
          config,
          response: { data: cachedData, status: 200 },
          isCached: true
        });
      }
      
      // Check if there's already a pending request for this exact endpoint + params
      const pendingKey = cacheKey;
      if (pendingRequests.has(pendingKey)) {
        // Wait for the existing request instead of making a new one
        try {
          const result = await pendingRequests.get(pendingKey);
          return Promise.reject({
            config,
            response: { data: result, status: 200 },
            isCached: true
          });
        } catch (err) {
          // If the pending request fails, allow this one to proceed
          pendingRequests.delete(pendingKey);
        }
      }
    }
    
    // Throttle requests to prevent rate limiting
    const url = config.url || '';
    await throttleRequest(url);
    
    // Handle FormData - remove Content-Type header to let browser set it with boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
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

// Response interceptor for error handling and caching
api.interceptors.response.use(
  (response) => {
    // Cache successful GET requests
    if (response.config.method?.toLowerCase() === 'get') {
      const cacheKey = getCacheKey(response.config);
      setCache(cacheKey, response.data);
      
      // Clear pending request
      pendingRequests.delete(cacheKey);
    }
    return response;
  },
  (error: any) => {
    // Handle cached responses
    if (error.isCached) {
      return Promise.resolve(error.response);
    }
    
    // Handle pending requests (deduplicate)
    if (error.isPending) {
      return Promise.reject(new Error('Duplicate request prevented'));
    }
    
    // Clear pending request on error
    if (error.config) {
      const cacheKey = getCacheKey(error.config);
      pendingRequests.delete(cacheKey);
    }
    
    // Handle different error types
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // Unauthorized - remove token and redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
            toast.error('Session expired. Please login again.');
          }
          break;
        
        case 403:
          toast.error('You do not have permission to perform this action.');
          break;
        
        case 404:
          // Only show error for non-silent 404s
          if (!error.config?.silent) {
            toast.error('Resource not found.');
          }
          break;
        
        case 422:
        case 400:
          // Validation errors
          const message = (data as any)?.message || 'Validation error';
          toast.error(message);
          break;
        
        case 429:
          // Rate limiting - implement exponential backoff
          const retryCount = error.config?.retryCount || 0;
          if (retryCount < MAX_RETRIES) {
            const delay = RETRY_DELAY * Math.pow(2, retryCount); // Exponential backoff
            toast.error(`Too many requests. Retrying in ${delay / 1000}s...`);
            
            return new Promise((resolve) => {
              setTimeout(() => {
                error.config.retryCount = retryCount + 1;
                resolve(api.request(error.config!));
              }, delay);
            });
          } else {
            toast.error('Too many requests. Please wait a moment and try again.');
          }
          break;
        
        case 500:
          toast.error('Internal server error. Please try again later.');
          break;
        
        default:
          const errorMessage = (data as any)?.message || 'An unexpected error occurred';
          if (!error.config?.silent) {
            toast.error(errorMessage);
          }
      }
    } else if (error.request) {
      // Network error
      if (!error.config?.silent) {
        toast.error('Network error. Please check your connection.');
      }
    } else if (error.message && error.message !== 'Duplicate request prevented') {
      // Other error
      toast.error('An unexpected error occurred.');
    }
    
    return Promise.reject(error);
  }
);

export default api;