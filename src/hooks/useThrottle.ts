import { useRef, useCallback } from 'react';

/**
 * Custom hook to throttle function calls
 * Prevents a function from being called more than once in a specified time period
 */
export const useThrottle = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 500
): ((...args: Parameters<T>) => void) => {
  const lastRun = useRef(Date.now());

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastRun.current >= delay) {
        lastRun.current = now;
        callback(...args);
      }
    },
    [callback, delay]
  );
};

/**
 * Custom hook to debounce function calls
 * Delays execution until after a certain amount of time has passed since the last call
 */
export const useDebounceCallback = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 500
): ((...args: Parameters<T>) => void) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );
};
