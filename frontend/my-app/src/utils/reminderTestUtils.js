/**
 * Utility for creating test bookings specifically for reminder testing
 */

// Constants for test users
const TEST_STUDENT_ID = "22-2343-163"; // Specific test student ID

/**
 * Creates a booking that will trigger a reminder shortly
 * @param {Object} options - Configuration options
 * @param {string} options.type - Reminder type: '1h' or '24h'
 * @param {string} options.teacherId - Optional: Override teacher ID
 * @param {string} options.studentId - Optional: Override student ID
 * @param {boolean} options.useTestStudent - Whether to use the test student ID (default: true)
 * @returns {Promise<Object>} - Created booking data or error
 */
export const createReminderTestBooking = async (options = {}) => {
  try {
    // Get user identifiers from localStorage with extensive fallbacks
    let userId = localStorage.getItem('userId') || 
                localStorage.getItem('userID') || 
                localStorage.getItem('id');
    
    let teacherId = options.teacherId || 
                   localStorage.getItem('teacherId') || 
                   localStorage.getItem('teacherID') || 
                   localStorage.getItem('facultyId') || 
                   localStorage.getItem('facultyID');
    
    // Use test student ID if requested (default is true) or fall back to stored IDs
    const useTestStudent = options.useTestStudent !== false;
    let studentId = useTestStudent ? 
                   TEST_STUDENT_ID : 
                   (options.studentId || 
                   localStorage.getItem('studentId') || 
                   localStorage.getItem('studentID'));
    
    const userRole = localStorage.getItem('userRole') || 'student';
    
    // Log the IDs found
    console.log("Creating reminder test booking with IDs:", { 
      userId, 
      teacherId, 
      studentId, 
      userRole,
      usingTestStudent: useTestStudent 
    });
    
    // For faculty users, use userId as teacherId if teacherId is not available
    if (userRole === 'faculty' && !teacherId && userId) {
      console.log(`Using userId (${userId}) as teacherId for faculty user`);
      teacherId = userId;
    }
    
    // For student users, if not using test student, use userId as studentId if studentId is not available
    if (userRole === 'student' && !useTestStudent && !studentId && userId) {
      console.log(`Using userId (${userId}) as studentId for student user`);
      studentId = userId;
    }
    
    // Determine which IDs to use based on role
    let useTeacherId, useStudentId;
    
    if (userRole === 'faculty') {
      // Faculty creating a booking needs their own ID as teacher and at least one student
      useTeacherId = teacherId;
      
      // Always use the test student ID for faculty bookings unless explicitly disabled
      useStudentId = useTestStudent ? TEST_STUDENT_ID : (studentId || "mock-student-123");
      console.log("Faculty booking: Using teacher ID =", useTeacherId, "student ID =", useStudentId);
    } else {
      // Student creating a booking needs their own ID as student and a teacher ID
      useStudentId = useTestStudent ? TEST_STUDENT_ID : studentId;
      
      // For testing, we can use a mock teacher ID if none is available
      useTeacherId = teacherId || "mock-teacher-456";
      console.log("Student booking: Using teacher ID =", useTeacherId, "student ID =", useStudentId);
    }
    
    // Final validation
    if (!useTeacherId || !useStudentId) {
      throw new Error(`Missing required teacher or student ID: ${JSON.stringify({ useTeacherId, useStudentId, userRole })}`);
    }
    
    // Calculate target time in UTC
    const now = new Date();
    let targetTime;
    
    // Default to 1h reminder
    const reminderType = options.type || '1h';
    
    if (reminderType === '1h') {
      // For 1h reminders, create a booking exactly 1 hour from now in UTC time
      targetTime = new Date(now.getTime() + 60 * 60 * 1000);
    } else {
      // For 24h reminders, create a booking exactly 24 hours from now in UTC time
      targetTime = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    }
    
    // Format in ISO string (this will be in UTC)
    const scheduleTime = targetTime.toISOString();
    
    // Build the booking data
    const bookingData = {
      teacherID: useTeacherId,
      studentIDs: [useStudentId],
      schedule: scheduleTime,
      venue: "Test Room B303",
      createdBy: userRole === 'student' ? useStudentId : useTeacherId,
      status: "confirmed" // Important: Must be confirmed for reminders to trigger
    };
    
    console.log(`Creating ${reminderType} test booking with schedule:`, {
      utcTime: scheduleTime,
      localTime: new Date(scheduleTime).toLocaleString(),
      bookingData
    });
    
    // Send API request to create the booking
    const response = await fetch(
      "http://localhost:5001/bookings/create_booking",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData),
      }
    );
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error("Error response from server:", data);
      throw new Error(data.error || "Failed to create test booking");
    }
    
    return {
      success: true,
      bookingId: data.bookingId,
      message: `Test booking created that will trigger ${reminderType} reminder using ${useTestStudent ? 'test student' : 'regular student'}`,
      schedule: scheduleTime,
      localTime: new Date(scheduleTime).toLocaleString()
    };
  } catch (error) {
    console.error("Error creating reminder test booking:", error);
    return {
      success: false,
      error: error.message
    };
  }
};
