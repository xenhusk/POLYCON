import { useQuery } from 'react-query';
import { useGlobalState } from '../context/GlobalStateContext';

const fetchCourses = async () => {
  const response = await fetch('import API_URL from '../apiConfig';

// ... other imports

// ... component code

L5: const response = await fetch(`${API_URL}/course/get_courses`);/course/get_courses');
  if (!response.ok) throw new Error('Failed to fetch courses');
  return response.json();
};

export const useCourses = () => {
  const { globalState, updateState } = useGlobalState();
  
  return useQuery(
    ['courses'], 
    fetchCourses, 
    {
      staleTime: 60 * 60 * 1000, // 60 minutes - courses don't change often
      onSuccess: (data) => {
        updateState('courses', data);
      },
      initialData: () => {
        return globalState.courses || undefined;
      }
    }
  );
};
