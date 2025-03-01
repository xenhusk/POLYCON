import { useQuery } from 'react-query';
import { useGlobalState } from '../context/GlobalStateContext';

const fetchGrades = async ({ studentId, schoolYear = '', semester = '', period = '' }) => {
  if (!studentId) return [];
  
  const response = await fetch(`http://localhost:5001/grade/get_student_grades?studentID=${studentId}&schoolYear=${schoolYear}&semester=${semester}&period=${period}`);
  if (!response.ok) throw new Error('Failed to fetch grades');
  return response.json();
};

export const useGrades = (studentId, schoolYear = '', semester = '', period = '') => {
  const { globalState, updateState } = useGlobalState();
  
  return useQuery(
    ['grades', studentId, schoolYear, semester, period], 
    () => fetchGrades({ studentId, schoolYear, semester, period }), 
    {
      enabled: !!studentId,
      staleTime: 10 * 60 * 1000, // 10 minutes
      onSuccess: (data) => {
        updateState('grades', data);
      },
      initialData: () => {
        return globalState.grades || undefined;
      }
    }
  );
};
