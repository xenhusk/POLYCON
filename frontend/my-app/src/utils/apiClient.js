import { QueryClient } from 'react-query';

const abortControllers = new Map();
const cache = new Map();
const CACHE_TIME = 5000; // milliseconds

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: CACHE_TIME,
      cacheTime: 10 * 60 * 1000,
      retry: false,
      refetchOnWindowFocus: false,
      refetchOnMount: false
    }
  }
});

const apiClient = {
  fetch: async (url, options = {}) => {
    const cacheKey = `${url}-${JSON.stringify(options)}`;

    // Return cached response if recent
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TIME) {
      return cached.data;
    }

    // Abort previous identical request, if any
    if (abortControllers.has(cacheKey)) {
      abortControllers.get(cacheKey).abort();
    }

    // Create a new abort controller for the request
    const controller = new AbortController();
    abortControllers.set(cacheKey, controller);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      // Cache the response
      cache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    } catch (error) {
      if (error.name === 'AbortError') return null;
      throw error;
    } finally {
      abortControllers.delete(cacheKey);
    }
  },
    // Grouped endpoints for bookings
  bookings: {
    getStudentBookings: () => {
      const studentID = localStorage.getItem('studentID');
      return apiClient.fetch(`http://localhost:5001/bookings/get_bookings?role=student&idNumber=${studentID}`);
    },
    getTeacherBookings: () => {
      const teacherID = localStorage.getItem('teacherID');
      return apiClient.fetch(`http://localhost:5001/bookings/get_bookings?role=faculty&idNumber=${teacherID}`);
    },
    // ...add more endpoints as needed
  },
  consultations: {
    getHistory: (role, userID) => {
      // Use idNumber parameter only since that's what the backend needs
      return apiClient.fetch(
        `http://localhost:5001/consultation/get_history?role=${role}&idNumber=${userID}`
      );
    }
  }
};

export default apiClient;
