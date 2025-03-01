import { useState, useEffect } from 'react';

/**
 * A simple data fetching hook to use while debugging React Query issues
 */
export function useSimpleFetch(url, dependencies = []) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const result = await response.json();
        
        if (isMounted) {
          setData(result);
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          console.error("Fetch error:", err);
          setError(err.message);
          setIsLoading(false);
        }
      }
    };

    if (url) {
      fetchData();
    } else {
      setIsLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [url, ...dependencies]);

  return { data, isLoading, error, refetch: () => setIsLoading(true) };
}
