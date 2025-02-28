import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getProfilePictureUrl } from "../utils/utils";
import { useQueryClient } from "react-query";
import { motion } from "framer-motion"; // Add this import

function BookingAppointment({ closeModal, role: propRole }) {
  const queryClient = useQueryClient();
  // Determine role setup
  const role = propRole || localStorage.getItem("userRole") || "student";
  const navigate = useNavigate();
  const location = useLocation();

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
  const [teacherID, setTeacherID] = useState(
    localStorage.getItem("teacherID") || ""
  );

  // Student-specific state
  const [studentID, setStudentID] = useState(
    localStorage.getItem("studentID") || ""
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

  // Debounced search function
  const debouncedSearch = (term) => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    setIsStudentSearchLoading(true);
    searchTimeout.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `http://localhost:5001/search/students?query=${encodeURIComponent(
            term.toLowerCase()
          )}&page=${page}`
        );
        const data = await res.json();
        if (data.results) {
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
      } finally {
        setIsStudentSearchLoading(false);
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

  async function submitBooking() {
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
      // Build payload with required keys.
      const bookingData = {
        teacherID: selectedTeacher,
        // --- Modified: include studentID plus IDs from selected student objects ---
        studentIDs: [studentID, ...selectedStudents.map((s) => s.id)],
        schedule: "",
        venue: "",
        createdBy: studentID,
      };
      console.log("Student bookingData:", bookingData);
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

  return (
    <div className="pt-4 pr-4 pl-4">
      {role === "faculty" ? (
        <>
          {/* Teacher's Form */}
          <div className="space-y-6">
            {/* Student Selection */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Students <span className="text-red-500">*</span>
              </label>
              <div className="min-h-[45px] flex flex-wrap items-center gap-2 border-2 border-[#397de2] rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-[#54BEFF]">
                {selectedStudents.map((student) => (
                  <div
                    key={student.id}
                    className="bg-[#397de2] text-white px-2 py-1 rounded-full flex items-center gap-2 text-sm"
                  >
                    <img
                      src={getProfilePictureUrl(student.profile_picture)}
                      alt="Profile"
                      className="w-5 h-5 rounded-full"
                    />
                    <span>
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
                  placeholder="Search students..."
                  className="flex-1 min-w-[120px] outline-none bg-transparent"
                />
              </div>
              {/* Student Search Results Dropdown */}
              {isStudentInputFocused && (
                <ul className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {isStudentSearchLoading ? (
                    // 🚀 Loading Skeleton for Student Search
                    Array.from({ length: 3 }).map((_, index) => (
                      <li
                        key={index}
                        className="px-4 py-2 flex items-center gap-3 animate-pulse"
                      >
                        <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                        <div className="flex flex-col">
                          <div className="w-32 h-4 bg-gray-200 rounded"></div>
                          <div className="w-24 h-3 bg-gray-100 rounded mt-1"></div>
                        </div>
                      </li>
                    ))
                  ) : studentResults.length === 0 ? (
                    <li className="px-4 py-2 text-center text-gray-500">
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
                          className="px-4 py-2 hover:bg-gray-50 flex items-center gap-3 cursor-pointer"
                        >
                          <img
                            src={getProfilePictureUrl(student.profile_picture)}
                            alt="Profile"
                            className="w-8 h-8 rounded-full"
                          />
                          <div>
                            <div className="font-medium">
                              {student.firstName} {student.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {student.program} • {student.year_section}
                            </div>
                          </div>
                        </li>
                      ))
                  )}
                </ul>
              )}
            </div>

            {/* Schedule Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Schedule <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={schedule}
                onChange={(e) => setSchedule(e.target.value)}
                className="w-full border-2 border-[#397de2] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#54BEFF]"
              />
            </div>

            {/* Venue Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Venue <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="Enter venue (e.g., Room 101)"
                className="w-full border-2 border-[#397de2] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#54BEFF]"
              />
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Student's Form */}
          <div className="space-y-6">
            {/* Teacher Selection */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teacher <span className="text-red-500">*</span>
              </label>
              <div className="min-h-[45px] flex items-center gap-2 border-2 border-[#397de2] rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-[#54BEFF]">
                {selectedTeacher && !teacherSearchTerm ? (
                  <div className="bg-[#397de2] text-white px-2 py-1 rounded-full flex items-center gap-2 text-sm">
                    <img
                      src={getProfilePictureUrl(selectedTeacherProfile)}
                      alt="Teacher"
                      className="w-5 h-5 rounded-full"
                    />
                    <span>{selectedTeacherName}</span>
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
                    placeholder="Search for a teacher..."
                    className="flex-1 outline-none bg-transparent"
                  />
                )}
              </div>

              {/* Teacher Search Results Dropdown */}
              {isTeacherInputFocused && (
                <ul className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {isTeacherSearchLoading ? (
                    // 🚀 Loading Skeleton for Teacher Search
                    Array.from({ length: 3 }).map((_, index) => (
                      <li
                        key={index}
                        className="px-4 py-2 flex items-center gap-3 animate-pulse"
                      >
                        <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                        <div className="flex flex-col">
                          <div className="w-32 h-4 bg-gray-200 rounded"></div>
                          <div className="w-24 h-3 bg-gray-100 rounded mt-1"></div>
                        </div>
                      </li>
                    ))
                  ) : teacherResults.length === 0 ? (
                    <li className="px-4 py-2 text-center text-gray-500">
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
                        className="px-4 py-2 hover:bg-gray-50 flex items-center gap-3 cursor-pointer"
                      >
                        <img
                          src={getProfilePictureUrl(teacher.profile_picture)}
                          alt="Profile"
                          className="w-8 h-8 rounded-full"
                        />
                        <div>
                          <div className="font-medium">
                            {teacher.firstName} {teacher.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {teacher.department}
                          </div>
                        </div>
                      </li>
                    ))
                  )}
                </ul>
              )}
            </div>

            {/* Fellow Students Selection (Optional) */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fellow Students (Optional)
              </label>
              <div className="min-h-[45px] flex flex-wrap items-center gap-2 border-2 border-[#397de2] rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-[#54BEFF]">
                {selectedStudents.map((student) => (
                  <div
                    key={student.id}
                    className="bg-[#397de2] text-white px-2 py-1 rounded-full flex items-center gap-2 text-sm"
                  >
                    <img
                      src={getProfilePictureUrl(student.profile_picture)}
                      alt="Profile"
                      className="w-5 h-5 rounded-full"
                    />
                    <span>
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
                    setIsFellowStudentSearchLoading(true); // 🚀 Trigger loading when typing starts
                    setPage(0); // Reset pagination when search term changes
                    debouncedSearch(e.target.value);
                  }}
                  onFocus={() => setIsStudentInputFocused(true)}
                  onBlur={() =>
                    setTimeout(() => setIsStudentInputFocused(false), 200)
                  }
                  placeholder="Search fellow students..."
                  className="flex-1 min-w-[120px] outline-none bg-transparent"
                />
              </div>

              {/* Fellow Student Search Results Dropdown */}
              {isStudentInputFocused && (
                <ul className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {isFellowStudentSearchLoading ? (
                    // 🚀 Loading Skeleton for Fellow Students
                    Array.from({ length: 3 }).map((_, index) => (
                      <li
                        key={index}
                        className="px-4 py-2 flex items-center gap-3 animate-pulse"
                      >
                        <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                        <div className="flex flex-col">
                          <div className="w-32 h-4 bg-gray-200 rounded"></div>
                          <div className="w-24 h-3 bg-gray-100 rounded mt-1"></div>
                        </div>
                      </li>
                    ))
                  ) : studentResults.length === 0 ? (
                    <li className="px-4 py-2 text-center text-gray-500">
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
                          className="px-4 py-2 hover:bg-gray-50 flex items-center gap-3 cursor-pointer"
                        >
                          <img
                            src={getProfilePictureUrl(student.profile_picture)}
                            alt="Profile"
                            className="w-8 h-8 rounded-full"
                          />
                          <div>
                            <div className="font-medium">
                              {student.firstName} {student.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {student.program} • {student.year_section}
                            </div>
                          </div>
                        </li>
                      ))
                  )}
                </ul>
              )}
            </div>
          </div>
        </>
      )}

      {/* Message display */}
      {message.content && (
        <div
          className={`mt-4 p-3 rounded-lg ${
            message.type === "success"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {message.content}
        </div>
      )}

      {/* Submit Button */}
      <div className="relative h-[10vh]">
        <div className="mt-2 p-3">
          {isBookingOverQuota() && (
            <div className="text-red-500 rounded-lg">
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
              } bg-[#397de2] hover:bg-[#54BEFF] text-white flex-1 py-4 rounded-bl-lg justify-center transition-colors flex items-center
              ${SubmitBookingClicked ? "scale-90" : "scale-100"}`}
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
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
                  <span>Processing...</span>
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
              className={`flex-1 py-4 text-gray-700 bg-gray-100 rounded-br-lg hover:bg-gray-200 transition-colors
                    ${CancelClicked ? "scale-90" : "scale-100"}
                    `}
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
