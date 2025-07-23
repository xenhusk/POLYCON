import { API_URL } from './apiConfig';
export async function fetchStudentDetails(studentID) {
  try {
    const response = await fetch(`${API_URL}/bookings/get_student_details?studentID=${studentID}`);
    const data = await response.json();
    if (response.ok) {
      return data;
    } else {
      throw new Error(data.error);
    }
  } catch (error) {
    console.error('Error fetching student details:', error);
    return { program: 'Unknown Program', year_section: 'Unknown Year/Section' };
  }
}
