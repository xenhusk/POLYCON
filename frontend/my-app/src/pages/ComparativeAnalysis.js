import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import API_URL from '../apiConfig';
import { getProfilePictureUrl } from "../utils/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from '../contexts/ToastContext';
import ComparativeAnalysisHeader from "../components/Comparative_Analysis_Header";
import ComparativeConsultationHistory from "../components/Comparative_Consultation_history";
import ComparativeAcademicEvent from "../components/Comparative_Academic_Events";
// Add Chart.js and required components
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
} from "chart.js";
import { Pie, Bar, Radar } from "react-chartjs-2";
import PerformanceRadarChart from "../components/PerformanceRadarChart";

// Register Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler
);

// CSS for hiding scrollbar
const modalStyles = `
  .modal-no-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .modal-no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`;

// Inject styles into head
if (typeof document !== 'undefined') {
  const styleElement = document.getElementById('comparative-modal-scrollbar-styles');
  if (!styleElement) {
    const style = document.createElement('style');
    style.id = 'comparative-modal-scrollbar-styles';
    style.textContent = modalStyles;
    document.head.appendChild(style);
  }
}

function ComparativeAnalysis() {
  const { showSuccess, showError, showWarning, showInfo } = useToast();
  
  // Main states for filtering
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [grades, setGrades] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isRunningAnalysis, setIsRunningAnalysis] = useState(false);
  // New states for academic events
  const [academicEvents, setAcademicEvents] = useState([]);
  const [academicEventName, setAcademicEventName] = useState("");
  const [academicEventRating, setAcademicEventRating] = useState("");

  // Modal (for all four selections) states (temporary)
  const [showSelectionModal, setShowSelectionModal] = useState(false);
  const [tempSemester, setTempSemester] = useState(null);
  const [tempTeacher, setTempTeacher] = useState("");
  const [tempStudent, setTempStudent] = useState("");
  const [tempCourse, setTempCourse] = useState("");
  const [tempStudents, setTempStudents] = useState([]); // students list for the chosen teacher
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  
  // Student search states
  const [tempStudentName, setTempStudentName] = useState("");
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedStudentData, setSelectedStudentData] = useState(null);

  // Animation variants for modal - Enhanced for mobile
  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 30 },
    },
    exit: { opacity: 0, scale: 0.8, y: 20, transition: { duration: 0.3 } },
  };

  // On mount, fetch semesters and teachers
  useEffect(() => {
    // Get the logged-in teacher's information from localStorage
    const teacherId =
      localStorage.getItem("teacherId") || localStorage.getItem("teacherID");
    const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
    const firstName = userInfo.firstName || localStorage.getItem("firstName");
    const lastName = userInfo.lastName || localStorage.getItem("lastName");

    console.log("Teacher Info:", { teacherId, firstName, lastName, userInfo });

    if (teacherId && (firstName || lastName)) {
      const teacher = {
        id: teacherId,
        fullName: `${firstName || ""} ${lastName || ""}`.trim(),
      };

      console.log("Setting teacher in ComparativeAnalysis:", teacher);
      setTeachers([teacher]);
      setTempTeacher(teacher.id);
      setSelectedTeacher(teacher.id);
    }

    // Fetch semester options
    fetch(`${API_URL}/semester/get_semester_options`)
      .then((res) => res.json())
      .then((data) => {
        setSemesters(data);
        if (data.length > 0) {
          setSelectedSemester(data[0]);
        }
      })
      .catch((err) => console.error("Error fetching semesters:", err));
  }, []);

  // When a teacher is selected in the main state, fetch the students list
  useEffect(() => {
    if (selectedTeacher && selectedSemester) {
      fetch(
        `${API_URL}/polycon-analysis/get_teacher_students?teacherID=${selectedTeacher}&schoolYear=${selectedSemester.school_year}&semester=${selectedSemester.semester}`
      )
        .then((res) => res.json())
        .then((data) => setStudents(data))
        .catch((err) => console.error("Error fetching students:", err));
    } else {
      setStudents([]);
    }
  }, [selectedTeacher, selectedSemester]);

  // Fetch grades and consultation history when all main filters are provided
  useEffect(() => {
    if (
      selectedTeacher &&
      selectedStudents.length === 1 &&
      selectedSemester &&
      selectedCourse.trim() !== ""
    ) {
      const studentId = selectedStudents[0];
      const gradeParams = new URLSearchParams({
        studentID: studentId,
        teacherID: selectedTeacher,
        schoolYear: selectedSemester.school_year,
        semester: selectedSemester.semester,
        course: selectedCourse,
      });

      fetch(
        `${API_URL}/polycon-analysis/get_grades_by_period?${gradeParams}`
      )
        .then((res) => res.json())
        .then((data) => setGrades(data))
        .catch((err) => console.error("Error fetching grades:", err));

      const sessionParams = new URLSearchParams({
        studentID: studentId,
        teacherID: selectedTeacher,
        schoolYear: selectedSemester.school_year,
        semester: selectedSemester.semester,
      });

      fetch(
        `${API_URL}/polycon-analysis/get_consultation_history?${sessionParams}`
      )
        .then((res) => res.json())
        .then((data) => setSessions(data))
        .catch((err) => console.error("Error fetching sessions:", err));
    } else {
      setGrades([]);
      setSessions([]);
    }
  }, [selectedTeacher, selectedStudents, selectedSemester, selectedCourse]);

  // When a teacher is chosen in the modal, fetch the students for that teacher
  useEffect(() => {
    if (tempTeacher) {
      fetch(
        `${API_URL}/polycon-analysis/get_teacher_students?teacherID=${tempTeacher}`
      )
        .then((res) => res.json())
        .then((data) => setTempStudents(data))
        .catch((err) => console.error("Error fetching students:", err));
    } else {
      setTempStudents([]);
    }
  }, [tempTeacher]);

  // When all modal temporary fields (except course) are set, fetch available courses
  useEffect(() => {
    if (showSelectionModal && tempTeacher && tempStudent && tempSemester) {
      const params = new URLSearchParams({
        studentID: tempStudent,
        teacherID: tempTeacher,
        schoolYear: tempSemester.school_year,
        semester: tempSemester.semester,
        course: "",
      });
      fetch(
        `${API_URL}/polycon-analysis/get_grades_by_period?${params}`
      )
        .then((res) => res.json())
        .then((data) => {
          const courses = data.map((item) => item.course);
          const uniqueCourses = [...new Set(courses)];
          setAvailableCourses(uniqueCourses);
        })
        .catch((err) =>
          console.error("Error fetching available courses:", err)
        );
    } else {
      setAvailableCourses([]);
    }
  }, [showSelectionModal, tempTeacher, tempStudent, tempSemester]);

  // When a teacher and semester are selected in the temp state, fetch their students
  useEffect(() => {
    if (tempTeacher && tempSemester) {
      setIsLoadingStudents(true);
      fetch(
        `${API_URL}/polycon-analysis/get_teacher_students?teacherID=${tempTeacher}&schoolYear=${tempSemester.school_year}&semester=${tempSemester.semester}`
      )
        .then((res) => res.json())
        .then((data) => {
          setTempStudents(Array.isArray(data) ? data : []);
          setIsLoadingStudents(false);
        })
        .catch((err) => {
          console.error("Error fetching students:", err);
          setTempStudents([]);
          setIsLoadingStudents(false);
        });
    } else {
      setTempStudents([]);
    }
  }, [tempTeacher, tempSemester]);

  // Student search functionality
  const handleStudentNameChange = async (e) => {
    const enteredName = e.target.value;
    setTempStudentName(enteredName);

    if (enteredName.length === 0) {
      setFilteredStudents([]);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/grade/search_students?name=${enteredName}`);
      const data = await response.json();
      
      // Filter students based on the selected teacher and semester
      let filteredData = Array.isArray(data) ? data : [];
      
      // If we have tempStudents from teacher/semester selection, filter to only those
      if (tempStudents.length > 0) {
        filteredData = filteredData.filter(student => 
          tempStudents.some(tempStudent => tempStudent.id === student.studentID)
        );
      }
      
      setFilteredStudents(filteredData);
    } catch (error) {
      console.error("Error searching students:", error);
      setFilteredStudents([]);
    }
  };

  const handleStudentSelect = (student) => {
    setTempStudentName(`${student.firstName || student.name || ''} ${student.lastName || ''}`.trim());
    setTempStudent(student.studentID || student.id);
    setSelectedStudentData(student);
    setFilteredStudents([]);
    setTempCourse(""); // Reset course when student changes
  };

  // Open the selection modal and initialize temporary fields from current selections (if any)
  const openSelectionModal = () => {
    setTempSemester(selectedSemester);
    setTempTeacher(selectedTeacher);
    setTempStudent(selectedStudents.length === 1 ? selectedStudents[0] : "");
    setTempCourse(selectedCourse);
    
    // Reset search states
    setTempStudentName("");
    setFilteredStudents([]);
    setSelectedStudentData(null);
    
    setShowSelectionModal(true);
  };

  // Handler when clicking "Done" in the modal
  const handleSelectionModalDone = () => {
    // Update main state with temporary selections
    setSelectedSemester(tempSemester);
    setSelectedTeacher(tempTeacher);
    setSelectedStudents([tempStudent]);
    setSelectedCourse(tempCourse);
    setShowSelectionModal(false);
  };

  // Check if all required main fields are provided to display the analysis
  const allFieldsProvided =
    selectedSemester &&
    selectedTeacher &&
    selectedStudents.length === 1 &&
    selectedCourse.trim() !== "";

  // Update function to add an academic event with a name and rating (1-5)
  const addAcademicEvent = () => {
    if (academicEventName && academicEventRating) {
      setAcademicEvents([
        ...academicEvents,
        { name: academicEventName, rating: academicEventRating },
      ]);
      setAcademicEventName("");
      setAcademicEventRating("");
    }
  };

  // New function to remove a previously added academic event
  const removeAcademicEvent = (index) => {
    const updated = academicEvents.filter((_, i) => i !== index);
    setAcademicEvents(updated);
  };

  // Function to run comparative analysis using the first grade record as sample
  const runComparativeAnalysis = () => {
    if (grades.length > 0) {
      setIsRunningAnalysis(true);
      
      // Show initial toast notification
      showInfo(
        "Starting Polycon Analysis", 
        "Analyzing student improvement patterns based on consultation quality, academic events, and grade progress...",
        8000
      );

      // Use the full grades array fetched earlier
      const payload = {
        student_id: selectedStudents[0],
        grades_by_period: grades, // send entire array of course grades
        academic_events: academicEvents,
      };
      fetch(`${API_URL}/comparative/compare_student`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
        .then((res) => res.json())
        .then((data) => {
          // Cap the normalized improvement at 0.5
          data.normalized_improvement = Math.min(
            0.5,
            data.normalized_improvement
          );
          setAnalysisResult(data);
          setIsRunningAnalysis(false);
          
          // Show success toast with improvement focus
          showSuccess(
            "Improvement Analysis Complete!", 
            "Your Polycon analysis reveals student learning progress and growth patterns over time.",
            6000
          );
        })
        .catch((err) => {
          console.error("Error running comparative analysis:", err);
          setIsRunningAnalysis(false);
          showError(
            "Analysis Failed", 
            "Unable to process improvement analysis. Please check your data and try again.",
            5000
          );
        });
    } else {
      showWarning(
        "Missing Data", 
        "Please ensure all required fields are selected before running the improvement analysis.",
        4000
      );
    }
  };

  // Function to generate colors for charts
  const generateColors = (count) => {
    const baseColors = [
      "rgba(54, 162, 235, 0.7)", // blue
      "rgba(255, 99, 132, 0.7)", // red
      "rgba(75, 192, 192, 0.7)", // green
      "rgba(255, 159, 64, 0.7)", // orange
      "rgba(153, 102, 255, 0.7)", // purple
    ];

    return Array(count)
      .fill()
      .map((_, i) => baseColors[i % baseColors.length]);
  };

  return (
    <div className="p-3 sm:p-6 bg-gradient-to-b from-white to-gray-50 min-h-screen">
      {/* Header Section with Enhanced Design */}
      <ComparativeAnalysisHeader
        openSelectionModal={openSelectionModal}
        allFieldsProvided={allFieldsProvided}
      />

      {/* Display Grades Table - Enhanced mobile responsiveness */}
      {allFieldsProvided && grades.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <h3 className="text-lg sm:text-xl font-bold text-[#0065A8]">Student Grades</h3>
            <div className="h-0.5 flex-grow ml-4 bg-gradient-to-r from-[#0065A8] to-transparent"></div>
          </div>
          
          {/* Mobile Card View */}
          <div className="block sm:hidden space-y-4">
            {grades.map((grade, idx) => (
              <div key={idx} className="bg-white rounded-xl shadow-md p-4">
                <h4 className="font-semibold text-[#0065A8] mb-3 text-center">{grade.course}</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-blue-50 rounded-lg p-3 text-center">
                    <div className="text-xs text-gray-600 mb-1">Prelim</div>
                    <div className="font-semibold text-lg">{grade.Prelim || '-'}</div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3 text-center">
                    <div className="text-xs text-gray-600 mb-1">Midterm</div>
                    <div className="font-semibold text-lg">{grade.Midterm || '-'}</div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3 text-center">
                    <div className="text-xs text-gray-600 mb-1">Pre-Final</div>
                    <div className="font-semibold text-lg">{grade["Pre-Final"] || '-'}</div>
                  </div>
                  <div className="bg-[#0065A8] text-white rounded-lg p-3 text-center">
                    <div className="text-xs text-blue-100 mb-1">Final</div>
                    <div className="font-bold text-lg">{grade.Final || '-'}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto bg-white rounded-xl shadow-md">
            <table className="min-w-full bg-white text-center">
              <thead className="bg-[#397de2] text-white">
                <tr>
                  <th className="px-4 py-3 rounded-tl-xl">Subject</th>
                  <th className="px-4 py-3">Prelim</th>
                  <th className="px-4 py-3">Midterm</th>
                  <th className="px-4 py-3">Pre-Final</th>
                  <th className="px-4 py-3 rounded-tr-xl">Final</th>
                </tr>
              </thead>
              <tbody>
                {grades.map((grade, idx) => (
                  <tr
                    key={idx}
                    className={idx % 2 === 0 ? "bg-white" : "bg-blue-50"}
                  >
                    <td className="border-b border-gray-200 px-4 py-3 font-medium">
                      {grade.course}
                    </td>
                    <td className="border-b border-gray-200 px-4 py-3">
                      {grade.Prelim}
                    </td>
                    <td className="border-b border-gray-200 px-4 py-3">
                      {grade.Midterm}
                    </td>
                    <td className="border-b border-gray-200 px-4 py-3">
                      {grade["Pre-Final"]}
                    </td>
                    <td className="border-b border-gray-200 px-4 py-3 font-semibold">
                      {grade.Final}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Consultation History Section */}
      <ComparativeConsultationHistory
        openSelectionModal={openSelectionModal}
        allFieldsProvided={allFieldsProvided}
        sessions={sessions}
      />

      {/* New Section for Academic Events */}
      <ComparativeAcademicEvent
        allFieldsProvided={allFieldsProvided}
        academicEventName={academicEventName}
        setAcademicEventName={setAcademicEventName}
        academicEventRating={academicEventRating}
        setAcademicEventRating={setAcademicEventRating}
        addAcademicEvent={addAcademicEvent}
        removeAcademicEvent={removeAcademicEvent}
        academicEvents={academicEvents}
      />

      {/* Enhanced Run Analysis Button */}
      {allFieldsProvided && grades.length > 0 && (
        <div className="mb-10 text-center px-4">
          <button
            onClick={runComparativeAnalysis}
            disabled={isRunningAnalysis}
            className={`w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 ${
              isRunningAnalysis 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-[#00D1B2] hover:bg-opacity-90 transform hover:scale-105'
            } text-white rounded-lg transition shadow-md duration-300 font-medium flex items-center justify-center mx-auto text-sm sm:text-base`}
          >
            {isRunningAnalysis ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white flex-shrink-0"
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
                <span>Analyzing Improvement...</span>
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2 flex-shrink-0"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm2 10a1 1 0 10-2 0v3a1 1 0 102 0v-3zm4-1a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1zm-2-8a1 1 0 00-1 1v.01a1 1 0 002 0V4a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Run Improvement Analysis</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Analysis Results Section - Enhanced mobile responsiveness */}
      {analysisResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-12 mb-16 px-2 sm:px-0"
        >
          {/* Header */}
          <motion.div
            className="relative mb-8 sm:mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="absolute inset-0 flex items-center">
              <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-[#0065A8] to-transparent opacity-30"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-6 sm:px-8 py-3 rounded-full shadow-sm">
                <h3 className="text-2xl sm:text-3xl font-bold text-[#0065A8]">
                  Improvement Analysis Results
                </h3>
              </span>
            </div>
          </motion.div>

          {/* Cards Grid - Enhanced mobile layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Student Improvement Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.01 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 transition-all duration-300"
            >
              <div className="bg-gradient-to-r from-[#397de2] to-[#54BEFF] p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-0">
                  <div className="flex-1">
                    <h4 className="text-xl sm:text-2xl font-bold text-white">
                      Student Improvement
                    </h4>
                    <p className="text-blue-100 mt-1 text-sm">
                      Learning Progress & Growth Analysis
                    </p>
                  </div>
                  <span
                    className={`px-3 sm:px-4 py-2 rounded-full text-white text-xs sm:text-sm font-medium whitespace-nowrap ${
                      analysisResult.rating === "Excellent"
                        ? "bg-gradient-to-r from-green-500 to-green-400"
                        : analysisResult.rating === "Very Good"
                        ? "bg-gradient-to-r from-[#00D1B2] to-[#00B4B4]"
                        : analysisResult.rating === "Good"
                        ? "bg-gradient-to-r from-blue-500 to-blue-400"
                        : analysisResult.rating === "Satisfactory"
                        ? "bg-gradient-to-r from-yellow-500 to-yellow-400"
                        : "bg-gradient-to-r from-red-500 to-red-400"
                    }`}
                  >
                    {analysisResult.rating}
                  </span>
                </div>
              </div>

              {/* Student Info & Performance Metrics */}
              <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-xl p-3 sm:p-4 text-center sm:text-left">
                    <p className="text-xs sm:text-sm text-gray-500">Student ID</p>
                    <p className="text-base sm:text-lg font-semibold text-gray-800">
                      {analysisResult.student_id}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 sm:p-4 text-center sm:text-right">
                    <p className="text-xs sm:text-sm text-gray-500">Overall Score</p>
                    <p className="text-xl sm:text-2xl font-bold text-[#397de2]">
                      {(analysisResult.overall_score * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>

                {/* Improvement Progress Bars */}
                <div className="space-y-3 sm:space-y-4">
                  {/* Add Overall Factor Bar */}
                  <div className="bg-purple-50 rounded-xl p-3 sm:p-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-xs sm:text-sm font-medium text-purple-700">
                        Overall Factor
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-purple-700">
                        {(analysisResult.overall_score * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="relative h-2 bg-purple-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: `${analysisResult.overall_score * 100}%`,
                        }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="absolute h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full"
                      />
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-xl p-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-blue-700">
                        Baseline Factor
                      </span>
                      <span className="text-sm font-bold text-blue-700">
                        {analysisResult.baseline_factor}
                      </span>
                    </div>
                    <div className="relative h-2 bg-blue-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: `${analysisResult.baseline_factor * 75}%`,
                        }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="absolute h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full"
                      />
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-xl p-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-green-700">
                        Consistency Factor
                      </span>
                      <span className="text-sm font-bold text-green-700">
                        {analysisResult.consistency_factor}
                      </span>
                    </div>
                    <div className="relative h-2 bg-green-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: `${analysisResult.consistency_factor * 100}%`,
                        }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="absolute h-full bg-gradient-to-r from-green-600 to-green-400 rounded-full"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Grade Progression Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.01 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100"
            >
              <div className="bg-gradient-to-r from-[#fc6969] to-[#ff8f8f] p-6">
                <h4 className="text-2xl font-bold text-white">
                  Grade Progression
                </h4>
                <p className="text-red-100 mt-1 text-sm">
                  Term-by-Term Progress
                </p>
              </div>
              <div className="p-6">
                <div className="mb-6">
                  <Bar
                    data={{
                      labels: ["Prelim", "Midterm", "Pre-Finals", "Finals"],
                      datasets: [
                        {
                          label: "Grade",
                          data: [
                            analysisResult.grades.prelim,
                            analysisResult.grades.midterm,
                            analysisResult.grades.prefinals,
                            analysisResult.grades.finals,
                          ],
                          backgroundColor: [
                            "#397de2",
                            "#54BEFF",
                            "#fc6969",
                            "#00D1B2",
                          ],
                          borderRadius: 8,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: { display: false },
                        tooltip: {
                          backgroundColor: "rgba(0, 0, 0, 0.8)",
                          padding: 12,
                          titleColor: "#fff",
                          bodyColor: "#fff",
                          cornerRadius: 8,
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: false,
                          min: Math.max(
                            0,
                            Math.min(
                              parseFloat(analysisResult.grades.prelim),
                              parseFloat(analysisResult.grades.midterm),
                              parseFloat(analysisResult.grades.prefinals),
                              parseFloat(analysisResult.grades.finals)
                            ) - 5
                          ),
                          grid: {
                            display: true,
                            color: "rgba(0, 0, 0, 0.05)",
                          },
                        },
                        x: {
                          grid: { display: false },
                        },
                      },
                    }}
                  />
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className="text-gray-600 mb-2">Grade Improvement</p>
                  <p
                    className={`text-2xl font-bold ${
                      analysisResult.grade_improvement > 0
                        ? "text-green-600"
                        : analysisResult.grade_improvement < 0
                        ? "text-red-600"
                        : "text-gray-600"
                    }`}
                  >
                    {analysisResult.grade_improvement > 0 ? "+" : ""}
                    {analysisResult.grade_improvement} points
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Academic Events Impact Card */}
            {analysisResult.academic_events?.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.01 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100"
              >
                <div className="bg-gradient-to-r from-[#00D1B2] to-[#00B4B4] p-6">
                  <h4 className="text-2xl font-bold text-white">
                    Academic Events Impact
                  </h4>
                  <p className="text-teal-100 mt-1 text-sm">
                    Event Participation Analysis
                  </p>
                </div>
                <div className="p-6">
                  <div className="h-[400px] w-full flex items-center justify-center">
                    <div className="w-[300px] h-[300px]">
                      <Pie
                        data={{
                          labels: analysisResult.academic_events.map(
                            (event) =>
                              event.name ||
                              `Event ${
                                analysisResult.academic_events.indexOf(event) +
                                1
                              }`
                          ),
                          datasets: [
                            {
                              data: analysisResult.academic_events.map(
                                (event) => event.rating
                              ),
                              backgroundColor: generateColors(
                                analysisResult.academic_events.length
                              ),
                              borderWidth: 1,
                            },
                          ],
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: true,
                          plugins: {
                            legend: {
                              position: "bottom",
                              labels: {
                                padding: 20,
                                usePointStyle: true,
                                font: { size: 11 },
                              },
                            },
                          },
                        }}
                      />
                    </div>
                  </div>
                  <div className="mt-6 bg-teal-50 rounded-xl p-4 text-center">
                    <p className="text-teal-800 font-medium mb-1">
                      Average Impact Rating
                    </p>
                    <p className="text-2xl font-bold text-teal-600">
                      {(analysisResult.average_event_impact * 5).toFixed(1)}/5
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Performance Metrics Radar Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.01 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100"
            >
              <div className="bg-gradient-to-r from-[#0065A8] to-[#54BEFF] p-6">
                <h4 className="text-2xl font-bold text-white">
                  Improvement Metrics
                </h4>
                <p className="text-blue-100 mt-1 text-sm">
                  Comprehensive Learning Progress Analysis
                </p>
              </div>
              <div className="p-6">
                <div className="h-[420px] w-full p-1 flex items-center justify-center">
                  <PerformanceRadarChart
                    metricsData={{
                      normalizedImprovement:
                        analysisResult.normalized_improvement,
                      averageEventImpact: analysisResult.average_event_impact,
                      consultationQuality: analysisResult.consultation_quality,
                    }}
                  />
                </div>
                <div className="mt-6 bg-blue-50 rounded-xl p-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-sm text-blue-600 mb-1">Improvement</p>
                      <p className="font-bold text-blue-700">
                        {(analysisResult.normalized_improvement * 100).toFixed(
                          0
                        )}
                        %
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-blue-600 mb-1">Event Impact</p>
                      <p className="font-bold text-blue-700">
                        {(analysisResult.average_event_impact * 100).toFixed(0)}
                        %
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-blue-600 mb-1">Consultation</p>
                      <p className="font-bold text-blue-700">
                        {(analysisResult.consultation_quality * 100).toFixed(0)}
                        %
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Overall performance card - with improved naming and description */}
            {/* <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="bg-[#0065A8] text-white p-4">
                <h4 className="text-xl font-semibold">Academic Effectiveness Index</h4>
              </div>
              <div className="p-6 text-center">
                <div className="mb-4">
                  <p className="text-3xl font-bold">{(analysisResult.overall_score * 100).toFixed(0)}%</p>
                  <p className="text-sm text-gray-500 mt-1">Combined measure of grade improvement, academic engagement, and consultation effectiveness</p>
                </div>
                  <div className="grid grid-cols-3 gap-2 mt-4">
                  <div className="text-center">
                    <p className="text-xs font-medium text-gray-500">Grade Factor</p>
                    <p className="font-bold text-[#397de2]">{analysisResult.academic_events && Array.isArray(analysisResult.academic_events) && analysisResult.academic_events.length > 0 ? '45%' : '65%'}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-medium text-gray-500">Events Factor</p>
                    <p className="font-bold text-[#fc6969]">{analysisResult.academic_events && Array.isArray(analysisResult.academic_events) && analysisResult.academic_events.length > 0 ? '30%' : '0%'}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-medium text-gray-500">Consultation Factor</p>
                    <p className="font-bold text-[#00D1B2]">{analysisResult.academic_events && Array.isArray(analysisResult.academic_events) && analysisResult.academic_events.length > 0 ? '25%' : '35%'}</p>
                  </div>
                </div>
              </div>
            </div> */}
          </div>

          {/* Recommendations Section
          <div className="mt-8 bg-white rounded-xl shadow-md overflow-hidden">
            <div className="bg-[#0065A8] text-white p-4">
              <h4 className="text-xl font-semibold">Recommendations</h4>
            </div>
            <div className="p-6">
              {analysisResult.recommendations ? (
                <ul className="space-y-3">
                  {analysisResult.recommendations.map((recommendation, index) => (
                    <li key={index} className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#0065A8] mt-0.5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">{recommendation}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-4 bg-gray-50 rounded-lg">
                  {analysisResult.rating === "Excellent" && (
                    <p className="text-gray-700">Congratulations on excellent improvement! Continue with your current learning strategies, and consider mentoring other students to further enhance your growth.</p>
                  )}
                  {analysisResult.rating === "Very Good" && (
                    <p className="text-gray-700">You're showing great improvement! Focus on maintaining consistency and explore more advanced concepts to accelerate your learning journey.</p>
                  )}
                  {analysisResult.rating === "Good" && (
                    <p className="text-gray-700">You're doing well! Focus on maintaining consistency and identify opportunities for further improvement in specific areas.</p>
                  )}
                  {analysisResult.rating === "Satisfactory" && (
                    <p className="text-gray-700">You're on the right track. Consider increasing participation in relevant academic events and seeking additional support in challenging topics.</p>
                  )}
                  {analysisResult.rating === "Needs Improvement" && (
                    <p className="text-gray-700">Schedule regular consultations with your instructor to address specific challenges. Consider supplementary learning resources and structured study plans.</p>
                  )}
                </div>
              )}
            </div>
          </div> */}
        </motion.div>
      )}

      {/* Selection Modal - Enhanced with search and profile photos */}
      {showSelectionModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
          onClick={() => setShowSelectionModal(false)}
        >
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {/* Modal Header */}
            <div className="bg-[#0065A8] px-6 py-4 flex justify-between items-center sticky top-0 z-10">
              <h2 className="text-lg font-semibold text-white">
                Select Analysis Options
              </h2>
              <button
                onClick={() => setShowSelectionModal(false)}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Semester Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Semester *
                </label>
                <select
                  className="w-full px-3 py-2 border-2 border-[#0065A8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#54BEFF] text-sm"
                  value={
                    tempSemester
                      ? `${tempSemester.school_year}|${tempSemester.semester}`
                      : ""
                  }
                  onChange={(e) => {
                    const sem = semesters.find(
                      (s) => `${s.school_year}|${s.semester}` === e.target.value
                    );
                    setTempSemester(sem);
                    setTempStudent("");
                    setTempStudentName("");
                    setSelectedStudentData(null);
                    setFilteredStudents([]);
                    setTempCourse("");
                  }}
                >
                  <option value="">Select a semester</option>
                  {semesters.map((sem, idx) => (
                    <option
                      key={idx}
                      value={`${sem.school_year}|${sem.semester}`}
                    >
                      {sem.school_year} - {sem.semester} Semester
                    </option>
                  ))}
                </select>
              </div>

              {/* Teacher Display */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teacher *
                </label>
                <div className="w-full px-3 py-2 border-2 border-[#0065A8] rounded-lg bg-gray-50 text-sm">
                  {teachers[0]?.fullName || "Loading..."}
                </div>
              </div>

              {/* Student Search with Profile Photos */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Student *
                </label>
                
                {/* Selected Student Display */}
                {tempStudent && selectedStudentData && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 border-2 border-[#0065A8] rounded-lg mb-2">
                    <img
                      src={getProfilePictureUrl(
                        selectedStudentData.profilePicture, 
                        selectedStudentData.firstName || selectedStudentData.name || 'Student'
                      )}
                      alt={`${selectedStudentData.firstName || selectedStudentData.name || ''} ${selectedStudentData.lastName || ''}`.trim()}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {`${selectedStudentData.firstName || selectedStudentData.name || ''} ${selectedStudentData.lastName || ''}`.trim()}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {selectedStudentData.studentID || selectedStudentData.id}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setTempStudentName("");
                        setTempStudent("");
                        setSelectedStudentData(null);
                        setTempCourse("");
                      }}
                      className="text-red-500 hover:text-red-700 text-sm font-medium"
                    >
                      Remove
                    </button>
                  </div>
                )}
                
                {/* Search Input - Only show when no student is selected */}
                {!tempStudent && (
                  <input
                    type="text"
                    placeholder="Search student by name..."
                    value={tempStudentName}
                    onChange={handleStudentNameChange}
                    disabled={!tempSemester || !tempTeacher}
                    className="w-full border-2 border-[#0065A8] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#54BEFF] disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
                  />
                )}

                {/* Search Results Dropdown */}
                {!tempStudent && filteredStudents.length > 0 && (
                  <ul className="absolute z-[110] bg-white border border-gray-300 rounded-lg mt-1 max-h-40 overflow-y-auto w-full shadow-lg">
                    {filteredStudents.map((student) => (
                      <li
                        key={student.studentID || student.id}
                        onClick={() => handleStudentSelect(student)}
                        className="px-3 py-2 cursor-pointer hover:bg-gray-100 text-sm flex items-center gap-3"
                      >
                        <img
                          src={getProfilePictureUrl(
                            student.profilePicture, 
                            student.firstName || student.name || 'Student'
                          )}
                          alt={`${student.firstName || student.name || ''} ${student.lastName || ''}`.trim()}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div>
                          <div className="font-medium">
                            {`${student.firstName || student.name || ''} ${student.lastName || ''}`.trim()}
                          </div>
                          <div className="text-xs text-gray-500">
                            ID: {student.studentID || student.id}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Loading message */}
                {isLoadingStudents && (
                  <div className="text-sm text-gray-500 mt-2">
                    Loading students...
                  </div>
                )}
              </div>

              {/* Course Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Course *
                </label>
                <select
                  className="w-full px-3 py-2 border-2 border-[#0065A8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#54BEFF] text-sm"
                  value={tempCourse}
                  onChange={(e) => setTempCourse(e.target.value)}
                  disabled={!tempStudent || availableCourses.length === 0}
                >
                  <option value="">Select a course</option>
                  {availableCourses.map((course, index) => (
                    <option key={index} value={course}>
                      {course}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex mt-4">
              <button
                onClick={handleSelectionModalDone}
                disabled={!(tempSemester && tempTeacher && tempStudent && tempCourse)}
                className={`flex-1 py-3 sm:py-4 text-center justify-center rounded-bl-xl transition-colors flex items-center gap-2 text-xs sm:text-sm font-medium ${
                  tempSemester && tempTeacher && tempStudent && tempCourse
                    ? 'bg-[#0065A8] hover:bg-[#54BEFF] text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Apply Selection
              </button>
              <button
                onClick={() => setShowSelectionModal(false)}
                className="flex-1 py-3 sm:py-4 text-gray-700 bg-gray-100 rounded-br-xl hover:bg-gray-200 transition-colors text-xs sm:text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default ComparativeAnalysis;
