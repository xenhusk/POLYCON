import { useState, useEffect, useCallback } from 'react';
import { useActionButtonData } from '../context/ActionButtonDataContext';
import API_URL from '../apiConfig';

/**
 * Custom hook for efficient search with prefetched data
 * Falls back to API calls only when needed
 */
export const useEfficientSearch = (searchType = 'students') => {
  const { studentsData, teachersData, isPrefetching } = useActionButtonData();
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastQuery, setLastQuery] = useState('');

  // Get the appropriate prefetched data
  const prefetchedData = searchType === 'students' ? studentsData : teachersData;

  const searchData = useCallback(async (query = '', page = 0) => {
    const trimmedQuery = query.trim().toLowerCase();
    
    // If query is empty or very short, return empty results
    if (trimmedQuery.length === 0) {
      setSearchResults([]);
      setLastQuery('');
      return { results: [], hasMore: false };
    }

    // Check if we can use prefetched data for this search
    const canUsePrefetchedData = prefetchedData.length > 0 && (
      trimmedQuery.length <= 2 || // Short queries work well with prefetched data
      prefetchedData.length >= 50  // Large prefetched dataset likely has what we need
    );

    if (canUsePrefetchedData) {
      // Use prefetched data for local filtering
      console.log(`EfficientSearch: Using prefetched data for ${searchType} search: "${trimmedQuery}"`);
      
      const filtered = prefetchedData.filter(item => {
        const fullName = `${item.firstName} ${item.lastName}`.toLowerCase();
        const email = (item.email || '').toLowerCase();
        const id = (item.id || '').toString().toLowerCase();
        
        return fullName.includes(trimmedQuery) || 
               email.includes(trimmedQuery) || 
               id.includes(trimmedQuery);
      });

      // Simulate pagination for consistency
      const pageSize = 20;
      const startIndex = page * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedResults = filtered.slice(startIndex, endIndex);
      
      setSearchResults(page === 0 ? paginatedResults : [...searchResults, ...paginatedResults]);
      setLastQuery(trimmedQuery);
      
      return {
        results: paginatedResults,
        hasMore: endIndex < filtered.length,
        total: filtered.length
      };
    }

    // Fall back to API call for complex queries or when prefetched data is insufficient
    console.log(`EfficientSearch: Making API call for ${searchType} search: "${trimmedQuery}"`);
    console.log('EfficientSearch: Using API URL:', API_URL);
    setIsLoading(true);
    
    try {
      const endpoint = searchType === 'students' 
        ? `${API_URL}/search/students?query=${encodeURIComponent(trimmedQuery)}&page=${page}`
        : `${API_URL}/search/teachers?query=${encodeURIComponent(trimmedQuery)}&page=${page}`;
      
      const response = await fetch(endpoint);
      const data = await response.json();
      
      // Handle both response formats: direct array or object with results property
      let results, hasMore, total;
      
      if (Array.isArray(data)) {
        // API returns direct array
        results = data;
        hasMore = false; // Assuming no pagination for direct array responses
        total = data.length;
      } else if (data.results) {
        // API returns object with results property
        results = data.results;
        hasMore = data.hasMore || false;
        total = data.total || data.results.length;
      } else {
        results = [];
        hasMore = false;
        total = 0;
      }
      
      console.log(`EfficientSearch: API response processed - ${results.length} results found`);
      
      setSearchResults(page === 0 ? results : [...searchResults, ...results]);
      setLastQuery(trimmedQuery);
      return {
        results: results,
        hasMore: hasMore,
        total: total
      };
    } catch (error) {
      console.error(`EfficientSearch: API call failed for ${searchType}:`, error);
      return { results: [], hasMore: false, total: 0 };
    } finally {
      setIsLoading(false);
    }
  }, [searchType, prefetchedData, searchResults]);

  // Reset results when switching search types
  useEffect(() => {
    setSearchResults([]);
    setLastQuery('');
  }, [searchType]);

  return {
    searchResults,
    isLoading: isLoading || isPrefetching,
    searchData,
    lastQuery,
    clearResults: () => {
      setSearchResults([]);
      setLastQuery('');
    },
    hasPrefetchedData: prefetchedData.length > 0
  };
};

export default useEfficientSearch;
