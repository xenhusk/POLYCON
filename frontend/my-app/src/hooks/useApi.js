import { useRef, useCallback } from 'react';

export const useApi = () => {
  const abortControllerRef = useRef({});
  const requestCache = useRef({});

  const fetchWithControl = useCallback(async (url, options = {}) => {
    const cacheKey = `${url}-${JSON.stringify(options)}`;

    // Cancel previous request with same key if it exists
    if (abortControllerRef.current[cacheKey]) {
      abortControllerRef.current[cacheKey].abort();
    }

    // Check cache for recent responses
    const cachedResponse = requestCache.current[cacheKey];
    if (cachedResponse && Date.now() - cachedResponse.timestamp < 5000) {
      return cachedResponse.data;
    }

    // Create new abort controller for this request
    abortControllerRef.current[cacheKey] = new AbortController();
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: abortControllerRef.current[cacheKey].signal
      });
      
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();

      // Cache the response
      requestCache.current[cacheKey] = {
        data,
        timestamp: Date.now()
      };

      return data;
    } catch (error) {
      if (error.name === 'AbortError') {
        return null;
      }
      throw error;
    } finally {
      // Cleanup abort controller
      delete abortControllerRef.current[cacheKey];
    }
  }, []);

  return { fetch: fetchWithControl };
};
