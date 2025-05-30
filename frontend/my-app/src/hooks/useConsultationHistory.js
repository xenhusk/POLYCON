import { useQuery } from 'react-query';
import { useGlobalState } from '../context/GlobalStateContext';

const fetchConsultationHistory = async ({ userRole, userId }) => {
  if (!userRole || !userId) return [];
  
  const response = await fetch(`http://localhost:5001/consultation/get_history?role=${userRole}&userID=${userId}`);
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
