import { useCallback, useRef } from 'react';

/**
 * Custom hook to debounce function calls
 * @param callback The function to debounce
 * @param delay The delay in milliseconds
 * @returns Debounced function
 */
export const useDebounce = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const timeoutRef = useRef<NodeJS.Timeout>();

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  ) as T;

  return debouncedCallback;
};

/**
 * Custom hook to throttle function calls
 * @param callback The function to throttle
 * @param delay The delay in milliseconds
 * @returns Throttled function
 */
export const useThrottle = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const lastCallRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const throttledCallback = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      const timeDiff = now - lastCallRef.current;

      if (timeDiff >= delay) {
        // Execute immediately if enough time has passed
        lastCallRef.current = now;
        callback(...args);
      } else {
        // Schedule for later
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        
        timeoutRef.current = setTimeout(() => {
          lastCallRef.current = Date.now();
          callback(...args);
        }, delay - timeDiff);
      }
    },
    [callback, delay]
  ) as T;

  return throttledCallback;
};

/**
 * Utility function to create a debounced promise-based function
 * @param fn The async function to debounce
 * @param delay The delay in milliseconds
 * @returns Debounced async function
 */
export const debounceAsync = <T extends (...args: any[]) => Promise<any>>(
  fn: T,
  delay: number
): T => {
  let timeoutId: NodeJS.Timeout;
  let latestResolve: (value: any) => void;
  let latestReject: (reason: any) => void;

  return ((...args: Parameters<T>) => {
    return new Promise((resolve, reject) => {
      latestResolve = resolve;
      latestReject = reject;

      clearTimeout(timeoutId);
      timeoutId = setTimeout(async () => {
        try {
          const result = await fn(...args);
          latestResolve(result);
        } catch (error) {
          latestReject(error);
        }
      }, delay);
    });
  }) as T;
};

export default { useDebounce, useThrottle, debounceAsync };