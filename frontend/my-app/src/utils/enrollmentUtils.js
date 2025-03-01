/**
 * Utility functions for handling student enrollment status
 */

/**
 * Fetches and stores a student's enrollment status
 * @param {string} studentId - The student's ID
 * @returns {Promise<boolean>} - Promise resolving to enrollment status
 */
export const fetchAndStoreEnrollmentStatus = async (studentId) => {
  if (!studentId) {
    console.error("Cannot fetch enrollment status: No studentId provided");
    return false;
  }
  
  try {
    console.log(`Fetching enrollment status for student: ${studentId}`);
    const response = await fetch(`http://localhost:5001/enrollment/status?studentID=${studentId}`);
    
    if (!response.ok) {
      throw new Error(`Error fetching enrollment status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Enrollment status response:", data);
    
    // Store the enrollment status in localStorage - convert to string regardless of input type
    const isEnrolled = data.isEnrolled === true || data.isEnrolled === "true";
    localStorage.setItem('isEnrolled', isEnrolled ? "true" : "false");
    console.log(`Stored enrollment status in localStorage: ${isEnrolled}`);
    
    return isEnrolled;
  } catch (error) {
    console.error("Error fetching enrollment status:", error);
    return false;
  }
};

/**
 * Checks if a student is enrolled based on localStorage value
 * @returns {boolean} - Whether the student is enrolled
 */
export const isStudentEnrolled = () => {
  return localStorage.getItem('isEnrolled') === "true";
};
