import { useQuery } from 'react-query';
import { useGlobalState } from '../context/GlobalStateContext';

const fetchConsultationHistory = async ({ userRole, userId }) => {
  if (!userRole || !userId) return [];
  
  // Use idNumber parameter only to ensure backend matches id_number correctly
  const response = await fetch(
    `import API_URL from '../apiConfig';

// ... other imports

// ... component code

L9: `${API_URL}/consultation/get_history?role=${userRole}&idNumber=${userId}`/consultation/get_history?role=${userRole}&idNumber=${userId}`
  );
  if (!response.ok) throw new Error('Failed to fetch consultation history');
  return response.json();
};

export const useConsultationHistory = (userRole, userId) => {
  const { globalState, updateState } = useGlobalState();
  
  return useQuery(
    ['consultationHistory', userRole, userId], 
    () => fetchConsultationHistory({ userRole, userId }), 
    {
      enabled: !!userRole && !!userId,
      staleTime: 5 * 60 * 1000, // 5 minutes
      onSuccess: (data) => {
        updateState('consultationHistory', data);
      },
      initialData: () => {
        return globalState.consultationHistory || undefined;
      }
    }
  );
};
