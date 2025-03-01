import { useState, useEffect, useCallback } from 'react';
import { useSocket } from './useSocket';

/**
 * A hook that fetches data and sets up real-time updates via socket
 * 
 * @param {string} url - The URL to fetch data from
 * @param {string} socketEvent - The socket event to listen for updates
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
  
  // Connect to socket
  const { isConnected, on, off } = useSocket('http://localhost:5001');

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

  // Set up real-time updates
  useEffect(() => {
    if (isConnected && enabled && socketEvent) {
      console.log(`Setting up listener for ${socketEvent}`);
      
      const handleUpdate = (updateData) => {
        console.log(`${socketEvent} update received:`, updateData);
        fetchData();
      };
      
      on(socketEvent, handleUpdate);
      
      return () => {
        console.log(`Removing listener for ${socketEvent}`);
        off(socketEvent, handleUpdate);
      };
    }
  }, [isConnected, socketEvent, on, off, fetchData, enabled]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData
  };
}
