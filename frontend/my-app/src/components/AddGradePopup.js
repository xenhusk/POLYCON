import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import API_URL from '../apiConfig';

// Add Grade icon SVG
const AddGradeIcon = () => (
  <svg width="100%" height="100%" viewBox="0 0 18 22" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14.4998 6.63V4C14.4998 2 13.4998 1 11.4998 1H6.49977C4.49977 1 3.49977 2 3.49977 4V6.56M1.25977 10.02V14.99C1.25977 16.81 1.25977 16.81 2.97977 17.97L7.70977 20.7C8.41977 21.11 9.57977 21.11 10.2898 20.7L15.0198 17.97C16.7398 16.81 16.7398 16.81 16.7398 14.99V10.02C16.7398 8.2 16.7398 8.2 15.0198 7.04L10.2898 4.31C9.57977 3.9 8.41977 3.9 7.70977 4.31L2.97977 7.04C1.25977 8.2 1.25977 8.2 1.25977 10.02ZM9.62977 9.99L10.1998 10.88C10.2898 11.02 10.4898 11.16 10.6398 11.2L11.6598 11.46C12.2898 11.62 12.4598 12.16 12.0498 12.66L11.3798 13.47C11.2798 13.6 11.1998 13.83 11.2098 13.99L11.2698 15.04C11.3098 15.69 10.8498 16.02 10.2498 15.78L9.26977 15.39C9.11977 15.33 8.86977 15.33 8.71977 15.39L7.73977 15.78C7.13977 16.02 6.67977 15.68 6.71977 15.04L6.77976 13.99C6.78976 13.83 6.70976 13.59 6.60976 13.47L5.93976 12.66C5.52976 12.16 5.69976 11.62 6.32976 11.46L7.34977 11.2C7.50977 11.16 7.70977 11.01 7.78977 10.88L8.35977 9.99C8.71977 9.45 9.27977 9.45 9.62977 9.99Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30
    }
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: { duration: 0.2 }
  }
};

const AddGradePopup = () => {
  const [showModal, setShowModal] = useState(false);
  const [isActive, setIsActive] = useState(null);
  const [AddGradeClicked, setAddGradeClicked] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [message, setMessage] = useState({ type: "", content: "" });
  
  // Form states
  const [studentID, setStudentID] = useState("");
  const [studentName, setStudentName] = useState("");
  const [courseID, setCourseID] = useState("");
  const [courseName, setCourseName] = useState("");
  const [grade, setGrade] = useState("");
  const [period, setPeriod] = useState("");
  const [schoolYear, setSchoolYear] = useState("2024-2025");
  const [semester, setSemester] = useState("");
  const [facultyID, setFacultyID] = useState("");
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedGradeID, setSelectedGradeID] = useState(null);
  
  const userRole = localStorage.getItem('userRole');
  const location = useLocation();
  const email = localStorage.getItem('userEmail');

  // Move fetchInitialData here to avoid "Cannot access before initialization" error
  const fetchInitialData = async () => {
    try {
      const teacherID = localStorage.getItem("teacherID");
      
      // Fetch courses for this teacher
      const coursesResponse = await fetch(`${API_URL}/course/get_courses?facultyID=${teacherID}`);
      const coursesData = await coursesResponse.json();
      setCourses(Array.isArray(coursesData.courses) ? coursesData.courses : []);
      
      // Fetch students
      const studentsResponse = await fetch(`${API_URL}/grade/get_students`);
      const studentsData = await studentsResponse.json();
      setStudents(Array.isArray(studentsData) ? studentsData : []);
      
      // Get latest semester defaults
      const semesterResponse = await fetch(`${API_URL}/semester/get_latest_filter`);
      if (semesterResponse.ok) {
        const data = await semesterResponse.json();
        setSchoolYear(data.school_year);
        setSemester(data.semester);
      }
    } catch (error) {
      console.error("Error fetching initial data:", error);
    }
  };

  // Add window resize listener
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialize faculty ID and fetch data
  useEffect(() => {
    const storedTeacherID = localStorage.getItem("teacherID");
    if (storedTeacherID) {
      setFacultyID(storedTeacherID);
    }

    // Fetch initial data (courses and students)
    if (userRole === 'faculty') {
      fetchInitialData();
    }
  }, [userRole]);

  // Check if user is faculty and active
  useEffect(() => {
    if (userRole === 'faculty' && email) {
      fetch(`${API_URL}/user/get_user?email=${encodeURIComponent(email)}`)
        .then(res => res.json())
        .then(data => {
          setIsActive(data.isActive);
        })
        .catch(err => {
          console.error("Error fetching user isActive:", err);
          setIsActive(false);
        });
    }
  }, [userRole, email]);

  // Show popup only if user is faculty AND isActive is true
  if (userRole !== 'faculty' || isActive !== true || location.pathname.includes('/session')) {
    return null;
  }

  const handleStudentNameChange = async (e) => {
    const enteredName = e.target.value;
    setStudentName(enteredName);

    if (enteredName.length === 0) {
      setFilteredStudents([]);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/grade/search_students?name=${enteredName}`);
      const data = await response.json();
      setFilteredStudents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error searching students:", error);
      setFilteredStudents([]);
    }
  };

  const handleStudentSelect = (student) => {
    setStudentName(student.name);
    setStudentID(student.studentID);
    setFilteredStudents([]);
  };

  const handleSchoolYearChange = (e) => {
    let input = e.target.value;
    input = input.replace(/[^0-9-]/g, "");
    const match = input.match(/^20\d{2}-20\d{2}$/);

    if (input.length <= 9) {
      setSchoolYear(input);
    }

    if (input.length === 9 && !match) {
      setMessage({ type: "error", content: "Invalid format! Use YYYY-YYYY (e.g., 2024-2025)" });
      setTimeout(() => setMessage({ type: "", content: "" }), 3000);
      setSchoolYear("2024-2025");
    }
  };

  const determineRemarks = (grade) => {
    if (grade === "") return "NOT ENCODED";
    return parseFloat(grade) >= 75 ? "PASSED" : "FAILED";
  };

  const handleSubmitGrade = async () => {
    if (!studentID || !courseID || !grade || !period || !schoolYear || !semester || !facultyID) {
      setMessage({ type: "error", content: "All fields are required" });
      setTimeout(() => setMessage({ type: "", content: "" }), 3000);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/grade/add_grade`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentID,
          courseID,
          facultyID,
          grade,
          period,
          remarks: determineRemarks(grade),
          school_year: schoolYear,
          semester,
        }),
      });
      const result = await response.json();

      if (response.ok) {
        setMessage({ type: "success", content: "Grade added successfully" });
        // Reset form
        setStudentID("");
        setStudentName("");
        setCourseID("");
        setGrade("");
        setPeriod("");
        setSelectedGradeID(null);
        
        setTimeout(() => {
          setShowModal(false);
          setMessage({ type: "", content: "" });
        }, 2000);
      } else {
        setMessage({ type: "error", content: "Failed to add grade: " + result.error });
      }
    } catch (error) {
      console.error("Error adding grade:", error);
      setMessage({ type: "error", content: "Error adding grade" });
    }
    setTimeout(() => setMessage({ type: "", content: "" }), 3000);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    // Reset form when closing
    setStudentID("");
    setStudentName("");
    setCourseID("");
    setGrade("");
    setPeriod("");
    setSelectedGradeID(null);
    setMessage({ type: "", content: "" });
  };

  // Calculate button size based on screen size
  const buttonSize = windowWidth < 640 ? 'w-12 h-12' : 'w-14 h-14';
  const iconSize = windowWidth < 640 ? 'scale-75' : 'scale-100';

  return (
    <>
      {/* Floating Action Button - Now without fixed positioning */}
      <button
        onClick={() => {
          console.log("AddGrade button clicked!"); // Debug log
          setAddGradeClicked(true);
          setTimeout(() => setAddGradeClicked(false), 200);
          setShowModal(true);
        }}
        className={`${buttonSize} rounded-full bg-[#fc6969] hover:bg-[#ff7b7b] 
                  flex items-center justify-center shadow-lg transform hover:scale-110 
                  transition-all duration-300 ease-in-out
                  ${AddGradeClicked ? "scale-90" : "scale-100"}`} 
        title="Add Grade"
      >
        <div className={`w-8 h-8 ${iconSize}`}>
          <AddGradeIcon />
        </div>
      </button>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed bg-black/60 backdrop-blur-md flex items-center justify-center z-[9999] p-4" style={{ 
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            margin: 0,
            padding: '1rem'
          }}>
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="bg-[#fc6969] px-6 py-4 flex justify-between items-center sticky top-0 z-10">
                <h2 className="text-lg font-semibold text-white">
                  {selectedGradeID ? "Edit Grade" : "Add New Grade"}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-white hover:text-gray-200 text-xl font-bold w-8 h-8 flex items-center justify-center"
                >
                  ×
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-4">
                {/* Message Display */}
                {message.content && (
                  <div className={`p-3 rounded-lg text-sm ${
                    message.type === "success" 
                      ? "bg-green-100 text-green-700" 
                      : "bg-red-100 text-red-700"
                  }`}>
                    {message.content}
                  </div>
                )}

                {/* Student Name Input */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Student Name *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter student name"
                    value={studentName}
                    onChange={handleStudentNameChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#fc6969] focus:border-transparent"
                  />
                  {filteredStudents.length > 0 && (
                    <ul className="absolute z-[110] bg-white border border-gray-300 rounded-lg mt-1 max-h-40 overflow-y-auto w-full shadow-lg">
                      {filteredStudents.map((student) => (
                        <li
                          key={student.studentID}
                          onClick={() => handleStudentSelect(student)}
                          className="px-3 py-2 cursor-pointer hover:bg-gray-100 text-sm"
                        >
                          {student.name}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Course Select */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course *
                  </label>
                  <select
                    value={courseID}
                    onChange={(e) => {
                      const selectedCourse = courses.find(c => c.courseID === e.target.value);
                      setCourseID(e.target.value);
                      setCourseName(selectedCourse?.courseName || '');
                    }}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#fc6969] focus:border-transparent"
                  >
                    <option value="">Select Course</option>
                    {courses.map((course) => (
                      <option key={course.courseID} value={course.courseID}>
                        {`${course.code} - ${course.courseName}`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Grade and Period Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Grade *
                    </label>
                    <input
                      type="number"
                      placeholder="Enter grade"
                      min="0"
                      max="100"
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#fc6969] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Period *
                    </label>
                    <select
                      value={period}
                      onChange={(e) => setPeriod(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#fc6969] focus:border-transparent"
                    >
                      <option value="">Select Period</option>
                      <option value="Prelim">Prelim</option>
                      <option value="Midterm">Midterm</option>
                      <option value="Pre-Final">Pre-Final</option>
                      <option value="Final">Final</option>
                    </select>
                  </div>
                </div>

                {/* Semester and School Year Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Semester *
                    </label>
                    <select
                      value={semester}
                      onChange={(e) => setSemester(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#fc6969] focus:border-transparent"
                    >
                      <option value="">Select Semester</option>
                      <option value="1st">1st</option>
                      <option value="2nd">2nd</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      School Year *
                    </label>
                    <input
                      type="text"
                      placeholder="YYYY-YYYY"
                      value={schoolYear}
                      onChange={handleSchoolYearChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#fc6969] focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSubmitGrade}
                    className="flex-1 px-4 py-2 rounded-lg text-white shadow-md transition bg-[#fc6969] hover:bg-[#ff7b7b]"
                  >
                    Add Grade
                  </button>
                  <button
                    onClick={handleCloseModal}
                    className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-400 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AddGradePopup;
