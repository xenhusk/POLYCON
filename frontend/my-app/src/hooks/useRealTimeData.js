import { useState, useEffect, useCallback } from 'react';

/**
 * A hook that fetches data
 * Note: Real-time updates via Socket.IO have been removed
 * 
 * @param {string} url - The URL to fetch data from
 * @param {string} socketEvent - No longer used, kept for API compatibility
 * @param {Object} options - Additional options
 * @param {Array} options.dependencies - Dependencies to trigger refetch
 * @param {Function} options.transform - Function to transform the response data
 * @param {boolean} options.enabled - Whether to enable the fetch
 */
export function useRealTimeData(url, socketEvent, options = {}) {
  const { dependencies = [], transform = (data) => data, enabled = true } = options;
  
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to fetch data
  const fetchData = useCallback(async () => {
    if (!enabled) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const result = await response.json();
      const transformedData = transform(result);
      setData(transformedData);
      setError(null);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [url, transform, enabled]);

  // Initial fetch
  useEffect(() => {
    if (enabled) {
      fetchData();
    }
  }, [fetchData, enabled, ...dependencies]);
  // Set up polling instead of real-time updates
  useEffect(() => {
    if (enabled) {
      // Poll the API every 10 seconds to simulate real-time updates
      const intervalId = setInterval(() => {
        fetchData();
      }, 10000); // 10 seconds
      
      return () => {
        clearInterval(intervalId);
      };
    }
  }, [fetchData, enabled]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData
  };
}
