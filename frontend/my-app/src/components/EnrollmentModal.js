import React, { useState, useEffect, useRef } from "react";
import { getProfilePictureUrl } from "../utils/utils";

function EnrollmentModal({ closeModal }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [studentResults, setStudentResults] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", content: "" });
  const [EnrollClicked, setEnrollClicked] = useState(false);
  const [CancelClicked, setCancelClicked] = useState(false);
  const searchTimeout = useRef(null);
  const teacherID = localStorage.getItem("teacherID");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

  const debouncedSearch = (term) => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    setIsSearchLoading(true);
    searchTimeout.current = setTimeout(async () => {
      try {
        // Use the new enrollment_students endpoint instead of the regular students endpoint
        const res = await fetch(
          `http://localhost:5001/search/enrollment_students?query=${encodeURIComponent(
            term.toLowerCase()
          )}`
        );
        const data = await res.json();
        if (data.error) {
          console.error("Search error:", data.error);
          setStudentResults([]);
        } else {
          // The API returns an array directly, not wrapped in a results object
          setStudentResults(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Search error:", error);
        setStudentResults([]);
      } finally {
        setIsSearchLoading(false);
      }
    }, 200);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };

  const submitEnrollment = async () => {
    if (!teacherID || selectedStudents.length === 0) {
      setMessage({
        type: "error",
        content: "Please select at least one student.",
      });
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:5001/enrollment/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacherID,
          studentIDs: selectedStudents.map((s) => s.id),
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage({
          type: "success",
          content: "Students enrolled successfully!",
        });
        setTimeout(() => {
          closeModal();
        }, 1500);
      } else {
        setMessage({
          type: "error",
          content: data.error || "Enrollment failed.",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        content: "Network error. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="pt-2 sm:pt-4 px-2 md:px-4 h-44 md:h-52 flex flex-col">
      {/* Student Selection Input - Responsive */}
      <div className="relative flex-grow">
        <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
          Students <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <div className="min-h-[45px] flex flex-wrap items-center gap-1 sm:gap-2 border-2 border-[#00D1B2] rounded-lg px-2 sm:px-3 py-2 focus-within:ring-2 focus-within:ring-[#00F7D4]">
            {selectedStudents.map((student) => (
              <div
                key={student.id}
                className="bg-[#00D1B2] text-white px-1 sm:px-2 py-1 rounded-full flex items-center gap-1 sm:gap-2 text-xs sm:text-sm mb-1"
              >                <img
                  src={getProfilePictureUrl(student.profile_picture, `${student.firstName} ${student.lastName}`)}
                  alt="Profile"
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
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setTimeout(() => setIsInputFocused(false), 200)}
              placeholder={isMobile ? "Search..." : "Search students..."}
              className="flex-1 min-w-[80px] outline-none bg-transparent text-sm"
            />
          </div>

          {/* Student Search Results Dropdown - Responsive */}
          {isInputFocused && (
            <div className="absolute left-0 right-0 mt-1 z-50">
              <ul className="bg-white border border-gray-200 rounded-lg shadow-lg max-h-20 sm:max-h-20 md:max-h-28 overflow-y-auto z-50">
                {isSearchLoading ? (
                  Array.from({ length: 2}).map((_, index) => (
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
                ) : studentResults.filter(
                    (student) =>
                      !selectedStudents.some((s) => s.id === student.id) &&
                      !student.isEnrolled
                  ).length === 0 ? (
                  <li className="px-2 sm:px-4 py-2 text-center text-gray-500 text-xs sm:text-sm z-50">
                    {studentResults.length === 0
                      ? "No students found"
                      : "No available students to add"}
                  </li>
                ) : (
                  studentResults
                    .filter(
                      (student) =>
                        !selectedStudents.some((s) => s.id === student.id) &&
                        !student.isEnrolled
                    )
                    .map((student) => (
                      <li
                        key={student.id}
                        className="px-2 sm:px-4 py-2 hover:bg-gray-50 flex items-center gap-2 sm:gap-3 cursor-pointer"
                        onMouseDown={() => {
                          setSelectedStudents([...selectedStudents, student]);
                          setSearchTerm("");
                        }}
                      >                        <img
                          src={getProfilePictureUrl(student.profile_picture, `${student.firstName} ${student.lastName}`)}
                          alt="Profile"
                          className="w-6 h-6 sm:w-8 sm:h-8 rounded-full"
                        />
                        <div>
                          <div className="font-medium text-xs sm:text-sm">
                            {student.firstName} {student.lastName}
                          </div>                          <div className="text-xs text-gray-500">
                            {student.program || student.programName || 'Unknown Program'} • {student.year_section || 'Unknown Section'}
                          </div>
                        </div>
                      </li>
                    ))
                )}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="relative mt-2">
        {/* Message display - Responsive */}
        <div className="mb-[6.5vh] md:mb-[9vh]">
          {message.content && (
            <div
              className={`p-2 sm:p-3 rounded-lg text-xs sm:text-sm ${
                message.type === "success"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {message.content}
            </div>
          )}
        </div>

        {/* Button container - Updated positioning to eliminate gap */}
        <div className="absolute -bottom-1 left-0 right-0 -mx-10">
          <div className="flex">
            <button
              onClick={() => {
                setEnrollClicked(true);
                setTimeout(() => { setEnrollClicked(false);
                  setTimeout(() => submitEnrollment(), 500);
                }, 200);
              }}
              disabled={isLoading}
              className={`flex-1 py-4 sm:py-6 md:py-4 bg-[#00D1B2] hover:bg-[#00F7D4] text-white text-center justify-center rounded-bl-lg transition-colors flex items-center gap-2 text-xs sm:text-sm
              ${EnrollClicked ? "scale-100" : "scale-100"}
              ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {isLoading && (
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
              )}
              {isLoading ? "Processing..." : "Enroll Students"}
            </button>

            <button
              onClick={() => {
                setCancelClicked(true);
                setTimeout(() => { setCancelClicked(false); 
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

export default EnrollmentModal;
