import { useQuery } from 'react-query';
import { useGlobalState } from '../context/GlobalStateContext';

const fetchBookings = async ({ userRole, userId, status = 'confirmed' }) => {
  if (!userRole || !userId) return [];
  
  const response = await fetch(`import API_URL from '../apiConfig';

// ... other imports

// ... component code

L7: const response = await fetch(`${API_URL}/bookings/get_bookings?role=${userRole}&userID=${userId}&status=${status}`);/bookings/get_bookings?role=${userRole}&userID=${userId}&status=${status}`);
  if (!response.ok) throw new Error('Failed to fetch bookings');
  return response.json();
};

export const useBookings = (userRole, userId, status = 'confirmed') => {
  const { globalState, updateState } = useGlobalState();
  
  return useQuery(
    ['bookings', userRole, userId, status], 
    () => fetchBookings({ userRole, userId, status }), 
    {
      enabled: !!userRole && !!userId,
      staleTime: 2 * 60 * 1000, // 2 minutes
      onSuccess: (data) => {
        updateState('bookings', data);
      },
      initialData: () => {
        return globalState.bookings || undefined;
      }
    }
  );
};
