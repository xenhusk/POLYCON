import { useQuery } from 'react-query';
import { useGlobalState } from '../context/GlobalStateContext';

const fetchUserData = async (email) => {
  if (!email) return null;
  
  const response = await fetch(`import API_URL from '../apiConfig';

// ... other imports

// ... component code

L7: const response = await fetch(`${API_URL}/user/get_user?email=${email}`);/user/get_user?email=${email}`);
  if (!response.ok) throw new Error('Failed to fetch user data');
  return response.json();
};

export const useUserData = (email) => {
  const { globalState, updateState } = useGlobalState();
  
  return useQuery(
    ['userData', email], 
    () => fetchUserData(email), 
    {
      enabled: !!email,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 30 * 60 * 1000, // 30 minutes
      onSuccess: (data) => {
        if (data) {
          updateState('userData', data);
        }
      },
      initialData: () => {
        // Return cached data if available
        return globalState.userData || undefined;
      }
    }
  );
};
