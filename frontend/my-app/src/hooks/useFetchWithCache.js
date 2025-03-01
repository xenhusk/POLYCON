import { useQuery } from 'react-query';
import { trackApiCall } from '../utils/queryConfig';

/**
 * Custom hook to fetch data with caching
 *
 * @param {string} queryKey - Unique key for this query
 * @param {string} url - URL to fetch data from
 * @param {object} options - Additional React Query options
 * @returns {object} React Query result object
 */
export const useFetchWithCache = (queryKey, url, options = {}) => {
  const fetchData = async () => {
    // Track the API call
    const trackedUrl = trackApiCall(url);
    
    // Only proceed if URL is provided
    if (!trackedUrl) return null;
    
    const response = await fetch(trackedUrl);
    if (!response.ok) {
      throw new Error(`API call failed: ${response.status}`);
    }
    return response.json();
  };

  return useQuery(
    queryKey,
    fetchData,
    {
      // Default to not refetching on mount to prevent page nav requests
      refetchOnMount: false,
      // Add context for tracking
      context: { url },
      // Spread any custom options
      ...options
    }
  );
};
