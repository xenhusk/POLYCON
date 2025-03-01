/**
 * Utility functions for ensuring data persistence across page reloads
 */

/**
 * Ensures critical user IDs are preserved in localStorage
 * Call this function on app initialization and after data fetching
 */
export const ensureUserIdPersistence = () => {
  // Get all possible IDs from localStorage
  const userId = localStorage.getItem("userId");
  const userID = localStorage.getItem("userID");
  const studentId = localStorage.getItem("studentId");
  const studentID = localStorage.getItem("studentID");
  const teacherId = localStorage.getItem("teacherId");
  const teacherID = localStorage.getItem("teacherID");
  const email = localStorage.getItem("email");
  const userEmail = localStorage.getItem("userEmail");
  const role = localStorage.getItem("userRole");
  
  console.log("Ensuring ID persistence - Current values:", {
    userId, userID, studentId, studentID, teacherId, teacherID, role
  });
  
  // First, make sure user ID is consistent
  if (userId && userId !== "undefined" && !userID) localStorage.setItem("userID", userId);
  if (userID && userID !== "undefined" && !userId) localStorage.setItem("userId", userID);
  
  // Next, ensure email is consistent
  if (email && email !== "undefined" && !userEmail) localStorage.setItem("userEmail", email);
  if (userEmail && userEmail !== "undefined" && !email) localStorage.setItem("email", userEmail);

  // If we have any student ID, ensure both variants exist
  if (studentId && studentId !== "undefined" && !studentID) {
    localStorage.setItem("studentID", studentId);
    console.log("Fixed missing studentID from studentId:", studentId);
  }
  if (studentID && studentID !== "undefined" && !studentId) {
    localStorage.setItem("studentId", studentID);
    console.log("Fixed missing studentId from studentID:", studentID);
  }
  
  // If we have any teacher ID, ensure both variants exist
  if (teacherId && teacherId !== "undefined" && !teacherID) localStorage.setItem("teacherID", teacherId);
  if (teacherID && teacherID !== "undefined" && !teacherId) localStorage.setItem("teacherId", teacherID);
  
  // If we know the role but don't have role-specific IDs, use userId as fallback
  const effectiveUserId = userId || userID;
  if (effectiveUserId && role === "student" && !studentId && !studentID) {
    localStorage.setItem("studentId", effectiveUserId);
    localStorage.setItem("studentID", effectiveUserId);
    console.log("Using userId as studentId/studentID:", effectiveUserId);
  }
  
  if (effectiveUserId && role === "faculty" && !teacherId && !teacherID) {
    localStorage.setItem("teacherId", effectiveUserId);
    localStorage.setItem("teacherID", effectiveUserId);
    console.log("Using userId as teacherId/teacherID:", effectiveUserId);
  }

  // Make sure isAuthenticated is set if we have user data
  if ((userId || userID || userEmail || email) && !localStorage.getItem("isAuthenticated")) {
    localStorage.setItem("isAuthenticated", "true");
  }

  // Final verification log
  console.log("ID persistence ensured - Updated values:", {
    userId: localStorage.getItem("userId"),
    userID: localStorage.getItem("userID"),
    studentId: localStorage.getItem("studentId"),
    studentID: localStorage.getItem("studentID"),
    teacherId: localStorage.getItem("teacherId"),
    teacherID: localStorage.getItem("teacherID"),
    role: localStorage.getItem("userRole"),
    isAuthenticated: localStorage.getItem("isAuthenticated")
  });
};

/**
 * Automatically recovers user IDs from the server using email
 * This should be called on app initialization if IDs are missing
 */
export const recoverUserIds = async () => {
  const email = localStorage.getItem("email") || localStorage.getItem("userEmail");
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  
  // Only recover if we have an email and we're logged in
  if (!email || !isAuthenticated) {
    console.log("Not recovering IDs: No email or not authenticated");
    return false;
  }
  
  try {
    console.log("Attempting to recover user IDs for email:", email);
    
    // First get the role
    const roleResponse = await fetch(`http://localhost:5001/account/get_user_role?email=${encodeURIComponent(email)}`);
    const roleData = await roleResponse.json();
    
    if (roleData.role) {
      localStorage.setItem("userRole", roleData.role);
      
      // Now get the user details
      const userResponse = await fetch(`http://localhost:5001/user/get_user?email=${encodeURIComponent(email)}`);
      const userData = await userResponse.json();
      
      if (userData && userData.id) {
        // Store user ID
        localStorage.setItem("userId", userData.id);
        localStorage.setItem("userID", userData.id);
        
        // Store role-specific IDs
        if (roleData.role === "student") {
          localStorage.setItem("studentId", userData.id);
          localStorage.setItem("studentID", userData.id);
        } else if (roleData.role === "faculty") {
          localStorage.setItem("teacherId", userData.id);
          localStorage.setItem("teacherID", userData.id);
          localStorage.setItem("facultyID", userData.id);
        } else if (roleData.role === "admin") {
          localStorage.setItem("adminId", userData.id);
          localStorage.setItem("adminID", userData.id);
        }
        
        console.log("Successfully recovered user IDs:", {
          userId: userData.id,
          role: roleData.role
        });
        
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error("Error recovering user IDs:", error);
    return false;
  }
};
