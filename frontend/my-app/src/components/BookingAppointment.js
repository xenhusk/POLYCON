import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getProfilePictureUrl, getDisplayProgram } from "../utils/utils";
import { getUserIdentifiers, validateUserForOperation } from "../utils/userUtils";
import { useQueryClient } from "react-query";
import { motion } from "framer-motion";

function BookingAppointment({ closeModal, role: propRole }) {
  const queryClient = useQueryClient();
  // Get user identification from the utility function
  const { userId, studentId, teacherId, role: userRole } = getUserIdentifiers();
  // Determine role setup - prefer props, then use the utility result
  const role = propRole || userRole || "student";
  const navigate = useNavigate();
  const location = useLocation();

  // IMMEDIATE FIX: Fix case inconsistency with studentId/studentID
  useEffect(() => {
    // This specifically fixes the issue you're seeing
    if (role === "student") {
      const lowercaseId = localStorage.getItem("studentId");
      if (lowercaseId && !localStorage.getItem("studentID")) {
        localStorage.setItem("studentID", lowercaseId);
        console.log("BookingAppointment: Fixed case inconsistency - copied studentId to studentID");
      }
    }
  }, [role]);

  // Add mobile detection
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  
  // Add resize listener for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Replace full lists with search result state
  const [searchTerm, setSearchTerm] = useState("");
  // --- Modified: selectedStudents now holds full student objects ---
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [studentResults, setStudentResults] = useState([]);

  const [teacherSearchTerm, setTeacherSearchTerm] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [selectedTeacherName, setSelectedTeacherName] = useState("");
  const [selectedTeacherProfile, setSelectedTeacherProfile] = useState("");
  const [teacherResults, setTeacherResults] = useState([]);

  // Additional teacher states
  const [schedule, setSchedule] = useState("");
  const [venue, setVenue] = useState("");
  const [teacherID, setTeacherID] = useState(teacherId || "");

  // Student-specific state - FIXED: Check both casing variations
  const [studentID, setStudentID] = useState(
    studentId || 
    localStorage.getItem("studentID") || 
    localStorage.getItem("studentId") || 
    ""
  );

  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const searchTimeout = useRef(null);
  const [isStudentInputFocused, setIsStudentInputFocused] = useState(false);
  const [isTeacherInputFocused, setIsTeacherInputFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", content: "" });
  const [isStudentSearchLoading, setIsStudentSearchLoading] = useState(false);
  const [isTeacherSearchLoading, setIsTeacherSearchLoading] = useState(false);
  const [isFellowStudentSearchLoading, setIsFellowStudentSearchLoading] = useState(false);
  const [SubmitBookingClicked, setSubmitBookingClicked] = useState(false);
  const [CancelClicked, setCancelClicked] = useState(false);
  const [enrollmentMessage, setEnrollmentMessage] = useState("");

  // Check for ID validation issues on component mount with specific error for studentID case issue
  useEffect(() => {
    const { isValid, errorMessage } = validateUserForOperation("booking");
    if (!isValid) {
      setMessage({
        type: "error",
        content: errorMessage
      });
      
      // Special handling for student case issue
      if (role === "student" && localStorage.getItem("studentId") && !localStorage.getItem("studentID")) {
        localStorage.setItem("studentID", localStorage.getItem("studentId"));
        console.log("Fixed studentID case inconsistency during validation");
      }
    }
  }, []);

  // Debounced search function
  const debouncedSearch = (term) => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    
    // Set both loading states to ensure UI shows loading properly
    setIsStudentSearchLoading(true);
    setIsFellowStudentSearchLoading(true);
    setEnrollmentMessage("");
    
    searchTimeout.current = setTimeout(async () => {
      try {
        console.log(`Fetching students for search term: "${term}"`);
        const res = await fetch(
          `http://localhost:5001/search/students?query=${encodeURIComponent(
            term.toLowerCase()
          )}&page=${page}`
        );
        const data = await res.json();
        
        console.log("Student search response:", data);
        
        if (data.error) {
          console.error("Search error:", data.error);
          setEnrollmentMessage("Error fetching students. Please try again.");
          setStudentResults([]);
          setHasMore(false);
        } else if (data.results) {
          // Log search results for debugging
          console.log(`Found ${data.results.length} students matching "${term}"`);
          
          if (data.results.length === 0 && term.length > 2) {
            setEnrollmentMessage("No enrolled students found matching your search.");
          }
          
          setStudentResults(
            page === 0 ? data.results : [...studentResults, ...data.results]
          );
          setHasMore(data.hasMore);
        } else {
          setStudentResults([]);
          setHasMore(false);
        }
      } catch (error) {
        console.error("Search error:", error);
        setStudentResults([]);
        setHasMore(false);
        setEnrollmentMessage("Network error. Please try again.");
      } finally {
        // Clear both loading states
        setIsStudentSearchLoading(false);
        setIsFellowStudentSearchLoading(false);
      }
    }, 200);
  };

  // Handle search input change (unchanged logic)
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setPage(0); // Reset pagination when search term changes
    setIsStudentSearchLoading(true);
    debouncedSearch(value);
  };

  // Load more results when scrolling
  const loadMore = () => {
    if (hasMore) {
      setPage((prev) => prev + 1);
      debouncedSearch(searchTerm);
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, []);

  // Fetch search results for teachers on teacherSearchTerm change
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        setIsTeacherSearchLoading(true);
        const res = await fetch(
          `http://localhost:5001/search/teachers?query=${encodeURIComponent(
            teacherSearchTerm.toLowerCase()
          )}`
        );
        const data = await res.json();
        if (data.results) {
          setTeacherResults(data.results);
        } else {
          setTeacherResults([]);
        }
      } catch (error) {
        console.error("Teacher search error:", error);
        setTeacherResults([]);
      } finally {
        setIsTeacherSearchLoading(false);
      }
    };

    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    if (teacherSearchTerm) {
      searchTimeout.current = setTimeout(() => {
        fetchTeachers();
      }, 200);
    }

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [teacherSearchTerm]);

  // NEW: Helper function to check if booking quota is exceeded.
  const isBookingOverQuota = () => {
    const selectedCount = selectedStudents.length;
    // For student users, include the booking student in the count.
    return role === "student" ? selectedCount + 1 > 4 : selectedCount > 4;
  };

  // Validation function to check for enrolled students in selection
  const validateStudentSelection = (students) => {
    return students.every(student => student.isEnrolled !== false);
  };

  async function submitBooking() {
    // Add specific logging for this issue
    if (role === "student") {
      console.log("Student booking attempt with IDs:", {
        studentId: localStorage.getItem("studentId"),
        studentID: localStorage.getItem("studentID"),
        componentStateID: studentID
      });
      
      // Final failsafe fix
      if (!studentID && localStorage.getItem("studentId")) {
        const id = localStorage.getItem("studentId");
        setStudentID(id); // Now this will work correctly
        console.log("Last-minute fix: Setting studentID from studentId:", id);
      }
    }
    
    // First validate user IDs
    const { isValid, errorMessage } = validateUserForOperation("booking");
    if (!isValid) {
      setMessage({
        type: "error",
        content: errorMessage
      });
      return;
    }
    
    // Check if all selected students are enrolled
    if (!validateStudentSelection(selectedStudents)) {
      setMessage({
        type: "error",
        content: "Some selected students are not enrolled. Please remove them before proceeding."
      });
      return;
    }
    
    if (role === "faculty") {
      // Validate required fields: teacherID, at least one student, schedule, and venue must be provided.
      if (!teacherID || selectedStudents.length === 0 || !schedule || !venue) {
        setMessage({
          type: "error",
          content: "Please fill in all required fields.",
        });
        return;
      }

      setIsLoading(true);
      // Build payload using the required fields.
      const bookingData = {
        teacherID,
        // --- Modified: extract student IDs from the selected student objects ---
        studentIDs: selectedStudents.map((s) => s.id),
        schedule,
        venue,
        createdBy: teacherID,
      };
      console.log("Faculty bookingData:", bookingData);
      try {
        const response = await fetch(
          "http://localhost:5001/bookings/create_booking",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(bookingData),
          }
        );

        if (response.ok) {
          // Force refresh of appointments data
          queryClient.invalidateQueries("studentAppointments");
          queryClient.invalidateQueries("teacherAppointments");
          setMessage({
            type: "success",
            content: "Appointment booked successfully!",
          });
          setTimeout(() => {
            if (typeof closeModal === "function") closeModal();
          }, 1500);
        } else {
          const errorData = await response.json();
          setMessage({
            type: "error",
            content: errorData.error || "Failed to book appointment.",
          });
        }
      } catch (error) {
        console.error("Error booking appointment:", error);
        setMessage({
          type: "error",
          content: "Network error. Please try again.",
        });
      } finally {
        setIsLoading(false);
      }
    } else {
      // Validate required fields: selectedTeacher and studentID must be provided.
      if (!studentID || !selectedTeacher) {
        setMessage({
          type: "error",
          content: "Please fill in all required fields.",
        });
        return;
      }

      setIsLoading(true);
      
      // Create array of student IDs for the booking payload
      const studentIDsArray = [studentID];
      
      // Only add fellow students if any are selected
      if (selectedStudents.length > 0) {
        // Log selected students for debugging
        console.log("Selected fellow students:", selectedStudents);
        // Get all fellow student IDs and add them to the array
        const fellowStudentIds = selectedStudents.map(s => s.id);
        studentIDsArray.push(...fellowStudentIds);
      }
      
      // Build payload with required keys.
      const bookingData = {
        teacherID: selectedTeacher,
        studentIDs: studentIDsArray,
        schedule, // use the schedule state value
        venue,    // use the venue state value
        createdBy: studentID,
      };
      
      console.log("Student booking payload:", bookingData);
      
      try {
        const response = await fetch(
          "http://localhost:5001/bookings/create_booking",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(bookingData),
          }
        );
        if (response.ok) {
          // Force refresh of appointments data
          queryClient.invalidateQueries("studentAppointments");
          queryClient.invalidateQueries("teacherAppointments");
          setMessage({
            type: "success",
            content: "Appointment request sent successfully!",
          });
          setTimeout(() => {
            if (typeof closeModal === "function") closeModal();
          }, 1500);
        } else {
          const errorData = await response.json();
          setMessage({
            type: "error",
            content: errorData.error || "Failed to request appointment.",
          });
        }
      } catch (error) {
        console.error("Error requesting appointment:", error);
        setMessage({
          type: "error",
          content: "Network error. Please try again.",
        });
      } finally {
        setIsLoading(false);
      }
    }
  }

  // Add this function to show enrollment messages without Material UI
  const renderEnrollmentMessage = () => {
    if (!enrollmentMessage) return null;
    
    return (
      <div className="mt-1 text-sm text-amber-600">
        {enrollmentMessage}
      </div>
    );
  };
  // Import the getDisplayProgram function from utils
  // This is now imported from utils.js at the top of the file

  return (
    <div className="pt-2 sm:pt-4 px-2 sm:px-4">
      {role === "faculty" ? (
        <>
          {/* Teacher's Form - Made Responsive */}
          <div className="space-y-4 sm:space-y-6 mb-8">
            {/* Student Selection */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Students <span className="text-red-500">*</span> <span className="text-xs text-gray-500">(Only enrolled students can be added)</span>
              </label>
              <div className="min-h-[45px] flex flex-wrap items-center gap-1 sm:gap-2 border-2 border-[#397de2] rounded-lg px-2 sm:px-3 py-2 focus-within:ring-2 focus-within:ring-[#54BEFF]">
                {selectedStudents.map((student) => (
                  <div
                    key={student.id}
                    className="bg-[#397de2] text-white px-1 sm:px-2 py-1 rounded-full flex items-center gap-1 sm:gap-2 text-xs sm:text-sm mb-1"
                  >
                    <img
                      src={getProfilePictureUrl(student.profile_picture, `${student.firstName} ${student.lastName}`)}
                      alt={`${student.firstName} ${student.lastName}`}
                      className="w-4 h-4 sm:w-5 sm:h-5 rounded-full"
                    />
                    <span className="max-w-[100px] sm:max-w-full truncate">
                      {student.firstName} {student.lastName}
                    </span>
                    <button
                      onClick={() =>
                        setSelectedStudents(
                          selectedStudents.filter((s) => s.id !== student.id)
                        )
                      }
                      className="hover:text-red-300 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  onFocus={() => setIsStudentInputFocused(true)}
                  onBlur={() =>
                    setTimeout(() => setIsStudentInputFocused(false), 200)
                  }
                  placeholder={isMobile ? "Search..." : "Search students..."}
                  className="flex-1 min-w-[80px] outline-none bg-transparent text-sm"
                />
              </div>
              {/* Student Search Results Dropdown - Made Responsive */}
              {isStudentInputFocused && (
                <ul className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 sm:max-h-60 overflow-y-auto">
                  {isStudentSearchLoading ? (
                    Array.from({ length: 3 }).map((_, index) => (
                      <li
                        key={index}
                        className="px-2 sm:px-4 py-2 flex items-center gap-2 sm:gap-3 animate-pulse"
                      >
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-200 rounded-full"></div>
                        <div className="flex flex-col">
                          <div className="w-24 sm:w-32 h-3 sm:h-4 bg-gray-200 rounded"></div>
                          <div className="w-16 sm:w-24 h-2 sm:h-3 bg-gray-100 rounded mt-1"></div>
                        </div>
                      </li>
                    ))
                  ) : studentResults.length === 0 ? (
                    <li className="px-2 sm:px-4 py-2 text-center text-gray-500 text-xs sm:text-sm">
                      No students found
                    </li>
                  ) : (
                    studentResults
                      .filter(
                        (student) =>
                          !selectedStudents.some((s) => s.id === student.id)
                      )
                      .map((student) => (
                        <li
                          key={student.id}
                          onMouseDown={() => {
                            setSelectedStudents([...selectedStudents, student]);
                            setSearchTerm("");
                          }}
                          className="px-2 sm:px-4 py-2 hover:bg-gray-50 flex items-center gap-2 sm:gap-3 cursor-pointer"
                        >
                          <img
                            src={getProfilePictureUrl(student.profile_picture, `${student.firstName} ${student.lastName}`)}
                            alt={`${student.firstName} ${student.lastName}`}
                            className="w-6 h-6 sm:w-8 sm:h-8 rounded-full"
                          />
                          <div>
                            <div className="font-medium text-xs sm:text-sm">
                              {student.firstName} {student.lastName}
                            </div>
                            <div className="text-xs text-gray-500">
                              {getDisplayProgram(student)} • {student.year_section || 'Unknown Section'}
                            </div>
                          </div>
                        </li>
                      ))
                  )}
                </ul>
              )}
              {/* Add enrollment message display */}
              {renderEnrollmentMessage()}
            </div>

            {/* Schedule Selection - Made Responsive */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Schedule <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={schedule}
                onChange={(e) => setSchedule(e.target.value)}
                className="w-full border-2 border-[#397de2] rounded-lg px-2 sm:px-3 py-2 sm:py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#54BEFF]"
              />
            </div>

            {/* Venue Input - Made Responsive */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Venue <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder={isMobile ? "Room number" : "Enter venue (e.g., Room 101)"}
                className="w-full border-2 border-[#397de2] rounded-lg px-2 sm:px-3 py-2 sm:py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#54BEFF]"
              />
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Student's Form - Made Responsive */}
          <div className="space-y-4 sm:space-y-6 mb-12">
            {/* Teacher Selection */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Teacher <span className="text-red-500">*</span>
              </label>
              <div className="min-h-[45px] flex items-center gap-1 sm:gap-2 border-2 border-[#397de2] rounded-lg px-2 sm:px-3 py-2 focus-within:ring-2 focus-within:ring-[#54BEFF]">
                {selectedTeacher && !teacherSearchTerm ? (
                  <div className="bg-[#397de2] text-white px-2 py-1 rounded-full flex items-center gap-2 text-xs sm:text-sm">
                    <img
                      src={getProfilePictureUrl(selectedTeacherProfile, selectedTeacherName)}
                      alt={selectedTeacherName || 'Teacher'}
                      className="w-4 h-4 sm:w-5 sm:h-5 rounded-full"
                    />
                    <span className="max-w-[120px] sm:max-w-full truncate">{selectedTeacherName}</span>
                    <button
                      onClick={() => {
                        setSelectedTeacher("");
                        setSelectedTeacherName("");
                        setSelectedTeacherProfile("");
                      }}
                      className="hover:text-red-300 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <input
                    type="text"
                    value={teacherSearchTerm}
                    onChange={(e) => {
                      setTeacherSearchTerm(e.target.value);
                      setSelectedTeacher("");
                      setSelectedTeacherName("");
                      setSelectedTeacherProfile("");
                    }}
                    onFocus={() => setIsTeacherInputFocused(true)}
                    onBlur={() =>
                      setTimeout(() => setIsTeacherInputFocused(false), 200)
                    }
                    placeholder={isMobile ? "Search..." : "Search for a teacher..."}
                    className="flex-1 outline-none bg-transparent text-sm"
                  />
                )}
              </div>

              {/* Teacher Search Results Dropdown - Made Responsive */}
              {isTeacherInputFocused && (
                <ul className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 sm:max-h-60 overflow-y-auto">
                  {isTeacherSearchLoading ? (
                    Array.from({ length: 3 }).map((_, index) => (
                      <li
                        key={index}
                        className="px-2 sm:px-4 py-2 flex items-center gap-2 sm:gap-3 animate-pulse"
                      >
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-200 rounded-full"></div>
                        <div className="flex flex-col">
                          <div className="w-24 sm:w-32 h-3 sm:h-4 bg-gray-200 rounded"></div>
                          <div className="w-16 sm:w-24 h-2 sm:h-3 bg-gray-100 rounded mt-1"></div>
                        </div>
                      </li>
                    ))
                  ) : teacherResults.length === 0 ? (
                    <li className="px-2 sm:px-4 py-2 text-center text-gray-500 text-xs sm:text-sm">
                      No teachers found
                    </li>
                  ) : (
                    teacherResults.map((teacher) => (
                      <li
                        key={teacher.id}
                        onMouseDown={() => {
                          setSelectedTeacher(teacher.id);
                          setSelectedTeacherName(
                            `${teacher.firstName} ${teacher.lastName}`
                          );
                          setSelectedTeacherProfile(teacher.profile_picture);
                          setTeacherSearchTerm("");
                          setIsTeacherInputFocused(false);
                        }}
                        className="px-2 sm:px-4 py-2 hover:bg-gray-50 flex items-center gap-2 sm:gap-3 cursor-pointer"
                      >
                        <img
                          src={getProfilePictureUrl(teacher.profile_picture, `${teacher.firstName} ${teacher.lastName}`)}
                          alt={`${teacher.firstName} ${teacher.lastName}`}
                          className="w-6 h-6 sm:w-8 sm:h-8 rounded-full"
                        />
                        <div>
                          <div className="font-medium text-xs sm:text-sm">
                            {teacher.firstName} {teacher.lastName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {teacher.department}
                          </div>
                        </div>
                      </li>
                    ))
                  )}
                </ul>
              )}
            </div>

            {/* Fellow Students Selection (Optional) - Made Responsive */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Fellow Students (Optional) <span className="text-xs text-gray-500">(Only enrolled students can be added)</span>
              </label>
              <div className="min-h-[45px] flex flex-wrap items-center gap-1 sm:gap-2 border-2 border-[#397de2] rounded-lg px-2 sm:px-3 py-2 focus-within:ring-2 focus-within:ring-[#54BEFF]">
                {selectedStudents.map((student) => (
                  <div
                    key={student.id}
                    className="bg-[#397de2] text-white px-1 sm:px-2 py-1 rounded-full flex items-center gap-1 sm:gap-2 text-xs sm:text-sm mb-1"
                  >
                    <img
                      src={getProfilePictureUrl(student.profile_picture, `${student.firstName} ${student.lastName}`)}
                      alt={`${student.firstName} ${student.lastName}`}
                      className="w-4 h-4 sm:w-5 sm:h-5 rounded-full"
                    />
                    <span className="max-w-[100px] sm:max-w-full truncate">
                      {student.firstName} {student.lastName}
                    </span>
                    <button
                      onClick={() =>
                        setSelectedStudents(
                          selectedStudents.filter((s) => s.id !== student.id)
                        )
                      }
                      className="hover:text-red-300 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setIsFellowStudentSearchLoading(true);
                    setPage(0); // Reset pagination when search term changes
                    debouncedSearch(e.target.value);
                  }}
                  onFocus={() => {
                    setIsStudentInputFocused(true);
                    // If we have a search term but no results yet, trigger the search again
                    if (searchTerm && studentResults.length === 0) {
                      debouncedSearch(searchTerm);
                    }
                  }}
                  onBlur={() =>
                    setTimeout(() => setIsStudentInputFocused(false), 200)
                  }
                  placeholder={isMobile ? "Search..." : "Search fellow students..."}
                  className="flex-1 min-w-[80px] outline-none bg-transparent text-sm"
                />
              </div>

              {/* Fellow Student Search Results Dropdown - Made Responsive */}
              {isStudentInputFocused && role === "student" && (
                <ul className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 sm:max-h-60 overflow-y-auto">
                  {isFellowStudentSearchLoading ? (
                    // 🚀 Loading Skeleton for Fellow Students
                    Array.from({ length: 3 }).map((_, index) => (
                      <li
                        key={index}
                        className="px-2 sm:px-4 py-2 flex items-center gap-2 sm:gap-3 animate-pulse"
                      >
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-200 rounded-full"></div>
                        <div className="flex flex-col">
                          <div className="w-24 sm:w-32 h-3 sm:h-4 bg-gray-200 rounded"></div>
                          <div className="w-16 sm:w-24 h-2 sm:h-3 bg-gray-100 rounded mt-1"></div>
                        </div>
                      </li>
                    ))
                  ) : studentResults.length === 0 ? (
                    <li className="px-2 sm:px-4 py-2 text-center text-gray-500 text-xs sm:text-sm">
                      No students found
                    </li>
                  ) : (
                    studentResults
                      .filter(
                        (student) =>
                          // Add filter to exclude the current student from results
                          student.id !== studentID && 
                          !selectedStudents.some((s) => s.id === student.id)
                      )
                      .map((student) => (
                        <li
                          key={student.id}
                          onMouseDown={() => {
                            // Log selected student for debugging
                            console.log("Adding fellow student:", student);
                            setSelectedStudents([...selectedStudents, student]);
                            setSearchTerm("");
                          }}
                          className="px-2 sm:px-4 py-2 hover:bg-gray-50 flex items-center gap-2 sm:gap-3 cursor-pointer"
                        >
                          <img
                            src={getProfilePictureUrl(student.profile_picture, `${student.firstName} ${student.lastName}`)}
                            alt={`${student.firstName} ${student.lastName}`}
                            className="w-6 h-6 sm:w-8 sm:h-8 rounded-full"
                          />
                          <div>
                            <div className="font-medium text-xs sm:text-sm">
                              {student.firstName} {student.lastName}
                            </div>
                            <div className="text-xs text-gray-500">
                              {getDisplayProgram(student)} • {student.year_section || 'Unknown Section'}
                            </div>
                          </div>
                        </li>
                      ))
                  )}
                </ul>
              )}
              {/* Add enrollment message display */}
              {renderEnrollmentMessage()}
            </div>

            {/* NEW: Schedule Selection for Student */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Schedule <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={schedule}
                onChange={(e) => setSchedule(e.target.value)}
                className="w-full border-2 border-[#397de2] rounded-lg px-2 sm:px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#54BEFF]"
              />
            </div>

            {/* NEW: Venue Selection for Student */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Venue <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder={isMobile ? "Room number" : "Enter venue (e.g., Room 101)"}
                className="w-full border-2 border-[#397de2] rounded-lg px-2 sm:px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#54BEFF]"
              />
            </div>
          </div>
        </>
      )}

      {/* Message display - Made Responsive */}
      {message.content && (
        <div
          className={` p-2 sm:p-3 rounded-lg text-xs sm:text-sm ${
            message.type === "success"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {message.content}
        </div>
      )}

      {/* Submit Button - Made Taller */}
      <div className="relative h-[6vh] md:h-[8vh]">
        <div className="mt-2 p-2 sm:p-3">
          {isBookingOverQuota() && (
            <div className="text-red-500 text-xs sm:text-sm rounded-lg">
              Warning: You have exceeded the maximum number of 4 students per
              consultation.
            </div>
          )}
        </div>
        <div className="absolute bottom-[0vh] left-[0%] right-[0%] -mx-10">
          <div className="flex">
            <button
              onClick={() =>{
                setSubmitBookingClicked(true);
                setTimeout(() =>{ setSubmitBookingClicked(false);
                  setTimeout(() => submitBooking(), 500);
                }, 200);
              }}
              disabled={isBookingOverQuota() || isLoading}
              className={`${
                isBookingOverQuota() || isLoading
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              } bg-[#397de2] hover:bg-[#54BEFF] text-white flex-1 py-4 sm:py-6 md:py-4 rounded-bl-lg justify-center transition-colors flex items-center text-xs sm:text-sm
              ${SubmitBookingClicked ? "scale-100" : "scale-100"}`}
            >
            {isLoading ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 sm:h-5 sm:w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span className="ml-2">Processing...</span>
                </>
              ) : (
                <span>
                  {role === "faculty" ? "Book Appointment" : "Request Appointment"}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                setCancelClicked(true);
                setTimeout(() => {
                  setCancelClicked(false);
                  setTimeout(() => closeModal(), 500);
                }, 200);
              }}
              className={`flex-1 py-4 sm:py-6 md:py-4 text-gray-700 bg-gray-100 rounded-br-lg hover:bg-gray-200 transition-colors text-xs sm:text-sm
                ${CancelClicked ? "scale-100" : "scale-100"}`}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookingAppointment;
