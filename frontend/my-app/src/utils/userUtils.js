/**
 * Utility functions for handling user identification and roles
 */

/**
 * Gets the appropriate user ID based on the user's role
 * @returns {Object} Object containing userId, studentId, teacherId, adminId, and role
 */
export const getUserIdentifiers = () => {
  // Check all possible localStorage keys for user identification
  const userId = localStorage.getItem("userId") || 
                localStorage.getItem("userID") || 
                localStorage.getItem("user_id") || 
                localStorage.getItem("id");
                
  // Check all possible localStorage keys for student identification - CASE SENSITIVITY FIX
  const studentId = localStorage.getItem("studentID") || 
                   localStorage.getItem("studentId") || 
                   localStorage.getItem("student_id");
  
  // IMMEDIATE FIX: If we found studentId but it's not in both locations, fix it
  if (studentId) {
    if (!localStorage.getItem("studentID")) {
      localStorage.setItem("studentID", studentId);
      console.log("Fixed missing studentID by copying from studentId:", studentId);
    }
    if (!localStorage.getItem("studentId")) {
      localStorage.setItem("studentId", studentId);
      console.log("Fixed missing studentId by copying from studentID:", studentId);
    }
  }
  
  // Check all possible localStorage keys for teacher identification
  const teacherId = localStorage.getItem("teacherID") || 
                   localStorage.getItem("teacherId") || 
                   localStorage.getItem("teacher_id") || 
                   localStorage.getItem("facultyID") || 
                   localStorage.getItem("facultyId");
  
  // Check for admin ID
  const adminId = localStorage.getItem("adminID") || 
                 localStorage.getItem("adminId") || 
                 localStorage.getItem("admin_id");
  
  // Get role with fallback to student
  const role = localStorage.getItem("userRole") || 
              localStorage.getItem("role") || 
              "student";
  
  // If we have a userId but no specific role ID, use userId as the role-specific ID
  let effectiveStudentId = studentId;
  let effectiveTeacherId = teacherId;
  let effectiveAdminId = adminId;
  
  if (userId && role === "student" && !effectiveStudentId) {
    effectiveStudentId = userId;
    localStorage.setItem("studentID", userId); // Fix missing studentID
    localStorage.setItem("studentId", userId); // Fix missing studentId
    console.log("Using userId as studentId:", userId);
  }
  
  if (userId && role === "faculty" && !effectiveTeacherId) {
    effectiveTeacherId = userId;
    console.log("Using userId as teacherId:", userId);
  }
  
  if (userId && role === "admin" && !effectiveAdminId) {
    effectiveAdminId = userId;
    console.log("Using userId as adminId:", userId);
  }
  
  // Log all IDs to help with debugging
  console.log("User identifiers:", {
    userId,
    studentId: effectiveStudentId,
    teacherId: effectiveTeacherId,
    adminId: effectiveAdminId,
    role
  });
  
  return {
    userId,
    studentId: effectiveStudentId,
    teacherId: effectiveTeacherId,
    adminId: effectiveAdminId,
    role
  };
};

/**
 * Checks if the necessary IDs are available for the current operation
 * @param {string} operation - The operation being performed (e.g., "booking")
 * @returns {Object} Object containing isValid and errorMessage
 */
export const validateUserForOperation = (operation) => {
  const { userId, studentId, teacherId, adminId, role } = getUserIdentifiers();
  
  // For booking operations
  if (operation === "booking") {
    if (role === "student" && !studentId) {
      console.error("Student ID not found for booking operation");
      return {
        isValid: false,
        errorMessage: "Student ID not found. Please log in again."
      };
    }
    
    if (role === "faculty" && !teacherId) {
      console.error("Teacher ID not found for booking operation");
      return {
        isValid: false,
        errorMessage: "Teacher ID not found. Please log in again."
      };
    }
    
    if (role === "admin" && !adminId && !userId) {
      console.error("Admin ID not found for booking operation");
      return {
        isValid: false,
        errorMessage: "Admin ID not found. Please log in again."
      };
    }
  }
  
  return {
    isValid: true,
    errorMessage: ""
  };
};

/**
 * Force-sets user IDs in localStorage as a fallback mechanism
 * @param {Object} ids - Object containing userId, studentId, teacherId
 */
export const setUserIdentifiers = (ids) => {
  const { userId, studentId, teacherId, role } = ids;
  
  if (userId) localStorage.setItem("userId", userId);
  if (studentId) localStorage.setItem("studentID", studentId);
  if (teacherId) localStorage.setItem("teacherID", teacherId);
  if (role) localStorage.setItem("userRole", role);
  
  console.log("User identifiers set in localStorage:", ids);
};
