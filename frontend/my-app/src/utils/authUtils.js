/**
 * Authentication utilities for consistent user identification
 */

/**
 * Stores user authentication data in localStorage with consistent keys
 * @param {Object} userData - User data from login response
 * @param {string} role - User role (student/faculty/admin)
 */
export const storeUserAuth = (userData, role) => {
  // Clear any existing auth data first
  clearUserAuth();
  
  // Always store these common values
  localStorage.setItem("userRole", role);
  localStorage.setItem("isAuthenticated", "true");
  
  // Ensure email is set
  if (userData.email) {
    localStorage.setItem("userEmail", userData.email);
    localStorage.setItem("email", userData.email);
    console.log("Setting userEmail:", userData.email);
  } else {
    console.error("Warning: No email found in userData.");
  }
  
  // Use fallback: if userData.userId is not provided, fall back to userData.id
  const primaryId = (userData.userId || userData.id) || null;
  if (primaryId) {
    localStorage.setItem("userId", primaryId);
    localStorage.setItem("userID", primaryId);
  } else {
    console.error("No valid primary user id found. Not overwriting existing ID keys.");
  }
  
  // For teacher: store teacherID if available
  if (userData.teacherId) {
    localStorage.setItem("teacherID", userData.teacherId);
    localStorage.setItem("teacherId", userData.teacherId);
    localStorage.setItem("facultyID", userData.teacherId);
  }
  
  // For student: if studentId missing, and role is student, use primaryId
  if (role === "student") {
    const studentIdentifier = userData.studentId || primaryId;
    if (studentIdentifier) {
      localStorage.setItem("studentID", studentIdentifier);
      localStorage.setItem("studentId", studentIdentifier);
    } else {
      console.error("No valid student id found. Existing student keys remain.");
    }
  }
  
  // For admin: store adminId
  if (role === "admin" && primaryId) {
    localStorage.setItem("adminID", primaryId);
    localStorage.setItem("adminId", primaryId);
  }
  
  // Store additional data
  if (userData.firstName) localStorage.setItem("firstName", userData.firstName);
  if (userData.lastName) localStorage.setItem("lastName", userData.lastName);
  if (userData.profile_picture) localStorage.setItem("profilePicture", userData.profile_picture);
  
  console.log("Auth data stored:", {
    userEmail: localStorage.getItem("userEmail"),
    userId: localStorage.getItem("userId"),
    studentId: localStorage.getItem("studentID"),
    role: localStorage.getItem("userRole")
  });
  
  // Immediate fix: sync studentId if needed
  if (role === 'student') {
    const sId = localStorage.getItem('studentId');
    if (sId && !localStorage.getItem('studentID')) {
      localStorage.setItem('studentID', sId);
      console.log("Synced studentID from studentId:", sId);
    }
  }
};

/**
 * Clears all authentication data from localStorage
 */
export const clearUserAuth = () => {
  const keysToKeep = []; // Add any keys you want to preserve during logout
  
  // Get all localStorage keys
  const keys = Object.keys(localStorage);
  
  // Remove all except those in keysToKeep
  keys.forEach(key => {
    if (!keysToKeep.includes(key)) {
      localStorage.removeItem(key);
    }
  });
};

/**
 * Checks if the user is authenticated
 * @returns {boolean} Authentication status
 */
export const isAuthenticated = () => {
  return localStorage.getItem("isAuthenticated") === "true";
};

/**
 * Gets the current user's role
 * @returns {string} User role or empty string if not authenticated
 */
export const getUserRole = () => {
  return localStorage.getItem("userRole") || "";
};
