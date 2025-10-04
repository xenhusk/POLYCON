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
  
  // Use primary identifier: prefer idNumber, then userId, then id
  const primaryId = (userData.idNumber || userData.userId || userData.id) || null;
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
  if (role === "admin") {
    const adminIdentifier = userData.adminId || primaryId;
    if (adminIdentifier) {
      localStorage.setItem("adminID", adminIdentifier);
      localStorage.setItem("adminId", adminIdentifier);
    }
  }
  
  console.log("Auth data stored successfully for role:", role);
};

/**
 * Clears all authentication data from localStorage
 */
export const clearUserAuth = () => {
  const authKeys = [
    "userEmail", "email", "userRole", "isAuthenticated",
    "userId", "userID", "studentID", "studentId", 
    "teacherID", "teacherId", "facultyID", "adminID", "adminId",
    "userInfo", "userDbId", "isEnrolled"
  ];
  
  authKeys.forEach(key => {
    localStorage.removeItem(key);
  });
  
  console.log("All authentication data cleared");
};

/**
 * Checks if user is authenticated
 * @returns {boolean} - True if user is authenticated
 */
export const isAuthenticated = () => {
  const hasUserEmail = !!localStorage.getItem("userEmail");
  const isAuthFlag = localStorage.getItem("isAuthenticated") === "true";
  return hasUserEmail || isAuthFlag;
};

/**
 * Gets the current user's role
 * @returns {string|null} - User role or null if not authenticated
 */
export const getUserRole = () => {
  if (!isAuthenticated()) return null;
  return localStorage.getItem("userRole");
};

/**
 * Gets the current user's email
 * @returns {string|null} - User email or null if not authenticated
 */
export const getUserEmail = () => {
  if (!isAuthenticated()) return null;
  return localStorage.getItem("userEmail");
};

/**
 * Checks if user has a specific role
 * @param {string|string[]} roles - Role(s) to check for
 * @returns {boolean} - True if user has the specified role(s)
 */
export const hasRole = (roles) => {
  if (!isAuthenticated()) return false;
  
  const userRole = getUserRole();
  if (!userRole) return false;
  
  if (Array.isArray(roles)) {
    return roles.includes(userRole);
  }
  
  return userRole === roles;
};

/**
 * Gets the appropriate redirect path based on user role
 * @returns {string} - Redirect path for the user's role
 */
export const getRoleBasedRedirect = () => {
  const role = getUserRole();
  
  const roleRedirects = {
    'student': '/dashboard',
    'faculty': '/home-teacher',
    'admin': '/homeadmin'
  };
  
  return roleRedirects[role] || '/dashboard';
};

/**
 * Logs out the user by clearing auth data
 */
export const logout = () => {
  clearUserAuth();
  // Redirect to home page
  window.location.href = '/';
};