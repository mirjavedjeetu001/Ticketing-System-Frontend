import { useEffect, useRef, useState } from 'react';

// Global cache to store data and prevent duplicate requests
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  promise?: Promise<T>;
}

class RequestCache {
  private cache = new Map<string, CacheEntry<any>>();
  private pendingRequests = new Map<string, Promise<any>>();
  private defaultTTL = 30000; // 30 seconds

  getCacheKey(url: string, params?: any): string {
    return `${url}:${JSON.stringify(params || {})}`;
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check if cache is still valid
    const now = Date.now();
    if (now - entry.timestamp < this.defaultTTL) {
      return entry.data as T;
    }

    // Cache expired, remove it
    this.cache.delete(key);
    return null;
  }

  set<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  getPendingRequest<T>(key: string): Promise<T> | null {
    return this.pendingRequests.get(key) || null;
  }

  setPendingRequest<T>(key: string, promise: Promise<T>): void {
    this.pendingRequests.set(key, promise);
    
    // Clean up after promise resolves
    promise.finally(() => {
      this.pendingRequests.delete(key);
    });
  }

  clear(): void {
    this.cache.clear();
    this.pendingRequests.clear();
  }

  clearByPattern(pattern: string): void {
    const keysToDelete: string[] = [];
    this.cache.forEach((_, key) => {
      if (key.includes(pattern)) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach(key => this.cache.delete(key));
  }
}

// Singleton instance
export const requestCache = new RequestCache();

// Hook to use cached API requests
export function useCachedRequest<T>(
  fetcher: () => Promise<T>,
  cacheKey: string,
  deps: any[] = []
): {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
} {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const hasFetched = useRef(false);

  const fetchData = async () => {
    // Check cache first
    const cachedData = requestCache.get<T>(cacheKey);
    if (cachedData) {
      setData(cachedData);
      setLoading(false);
      return;
    }

    // Check if there's already a pending request
    const pendingRequest = requestCache.getPendingRequest<T>(cacheKey);
    if (pendingRequest) {
      try {
        const result = await pendingRequest;
        setData(result);
        setLoading(false);
        return;
      } catch (err) {
        setError(err as Error);
        setLoading(false);
        return;
      }
    }

    // Make new request
    setLoading(true);
    setError(null);

    try {
      const promise = fetcher();
      requestCache.setPendingRequest(cacheKey, promise);
      
      const result = await promise;
      requestCache.set(cacheKey, result);
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchData();
    }
  }, deps);

  const refetch = async () => {
    requestCache.clearByPattern(cacheKey);
    hasFetched.current = false;
    await fetchData();
  };

  return { data, loading, error, refetch };
}
