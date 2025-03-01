import { QueryClient } from 'react-query';

// Track API request counts for monitoring
export const apiRequestCounter = {
  count: 0,
  endpoints: {},
  reset: () => {
    apiRequestCounter.count = 0;
    apiRequestCounter.endpoints = {};
  },
  increment: (url) => {
    apiRequestCounter.count++;
    const endpoint = url.split('?')[0]; // Strip query params
    apiRequestCounter.endpoints[endpoint] = (apiRequestCounter.endpoints[endpoint] || 0) + 1;
  },
  log: () => {
    console.log(`Total API calls: ${apiRequestCounter.count}`);
    console.log('Endpoints:', apiRequestCounter.endpoints);
  }
};

// Function to track API calls
export const trackApiCall = (url) => {
  apiRequestCounter.increment(url);
  return url;
};

// Create a client with aggressive caching
export const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        refetchOnMount: false, // Don't refetch when component mounts
        refetchOnReconnect: true,
        retry: 1,
        staleTime: 1000 * 60 * 10, // 10 minutes
        cacheTime: 1000 * 60 * 30, // 30 minutes
        // Track API calls with an onSuccess callback
        onSuccess: (data, variables, context) => {
          if (context?.url) {
            console.debug(`🟢 Fetched (or used cache): ${context.url}`);
          }
        }
      },
    },
  });
};

// Create the client instance
export const queryClient = createQueryClient();
