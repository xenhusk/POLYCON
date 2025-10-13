import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import API_URL from '../apiConfig';
import { getProfilePictureUrl } from "../utils/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from '../contexts/ToastContext';
import ComparativeAnalysisHeader from "../components/Comparative_Analysis_Header";
import ComparativeConsultationHistory from "../components/Comparative_Consultation_history";
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
} from "chart.js";
import { Pie, Bar } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
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
  // Consultation period selector
  const [consultationPeriod, setConsultationPeriod] = useState("Prelim");
  // Overall metrics for the class
  const [overallMetrics, setOverallMetrics] = useState(null);

  // Modal (for all four selections) states (temporary)
  const [showSelectionModal, setShowSelectionModal] = useState(false);
  const [tempSemester, setTempSemester] = useState(null);
  const [tempTeacher, setTempTeacher] = useState("");
  const [tempStudent, setTempStudent] = useState("");
  const [tempCourse, setTempCourse] = useState("");
  const [tempStudents, setTempStudents] = useState([]); // students list for the chosen teacher
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [tempCourses, setTempCourses] = useState([]); // courses list for the chosen student
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  
  // Student search states
  const [tempStudentName, setTempStudentName] = useState("");
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedStudentData, setSelectedStudentData] = useState(null);
  const [isStudentSearching, setIsStudentSearching] = useState(false);

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
    const loadTeacherData = async () => {
    // Get the logged-in teacher's information from localStorage
    const teacherId =
      localStorage.getItem("teacherId") || localStorage.getItem("teacherID");
      const userEmail = localStorage.getItem("userEmail") || localStorage.getItem("email");

      console.log("🔍 DEBUG - Teacher Info:", { teacherId, userEmail });

      if (teacherId && userEmail) {
        try {
          // Fetch user data directly from the API, similar to how Sidebar does it
          const response = await fetch(`${API_URL}/user/get_user?email=${userEmail}`);
          const userData = await response.json();
          
          console.log("🔍 DEBUG - Fetched user data:", userData);

          if (userData && userData.firstName && userData.lastName) {
      const teacher = {
        id: teacherId,
              fullName: `${userData.firstName} ${userData.lastName}`,
      };

            console.log("✅ Setting teacher in ComparativeAnalysis:", teacher);
      setTeachers([teacher]);
      setTempTeacher(teacher.id);
      setSelectedTeacher(teacher.id);
            return true;
          }
        } catch (error) {
          console.error("❌ Error fetching user data:", error);
        }
      }
      return false;
    };

    // Try to load teacher data
    loadTeacherData();

    // Debug localStorage values
    console.log("🔍 DEBUG - localStorage values:");
    console.log("  - teacherId:", localStorage.getItem('teacherId'));
    console.log("  - userEmail:", localStorage.getItem('userEmail'));
    console.log("  - userInfo:", localStorage.getItem('userInfo'));

    // Fetch semester options
    fetch(`${API_URL}/semester/get_semester_options`)
      .then((res) => res.json())
      .then((data) => {
        console.log("🔍 DEBUG - Fetched semesters:", data);
        setSemesters(data);
        if (data.length > 0) {
          // Default to 2024-2025 1st semester since that's where the test data is
          const defaultSemester = data.find(s => s.school_year === '2024-2025' && s.semester === '1st') || data[0];
          setSelectedSemester(defaultSemester);
          console.log("🔍 DEBUG - Default semester set to:", defaultSemester);
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

  // Fetch overall metrics when teacher and semester are selected
  useEffect(() => {
    fetchOverallMetrics();
  }, [selectedTeacher, selectedSemester]);

  // Note: We no longer need to fetch grades and sessions separately
  // The new comparative analysis endpoint handles all the data processing

  // Check if all required fields are provided
  const allFieldsProvided =
    selectedSemester &&
      selectedTeacher &&
      selectedStudents.length === 1 &&
    selectedCourse.trim() !== "";

  // Function to fetch overall metrics for the class
  const fetchOverallMetrics = () => {
    if (selectedTeacher && selectedSemester) {
      const params = new URLSearchParams({
        teacher_id: selectedTeacher,
        school_year: selectedSemester.school_year,
        semester: selectedSemester.semester,
      });

      fetch(`${API_URL}/comparative/overall_metrics?${params}`)
        .then((res) => res.json())
        .then((data) => {
          console.log("🔍 DEBUG - Overall metrics received:", data);
          setOverallMetrics(data);
        })
        .catch((err) => console.error("Error fetching overall metrics:", err));
    }
  };

  // Function to run comparative analysis
  const runComparativeAnalysis = () => {
    if (selectedStudents.length > 0 && selectedTeacher && selectedSemester && consultationPeriod) {
      setIsRunningAnalysis(true);
      
      // Show initial toast notification
      showInfo(
        "Starting Grade Analysis", 
        "Analyzing student grade improvement after consultation...",
        5000
      );

      const payload = {
        student_id: selectedStudents[0],
        consultation_period: consultationPeriod,
        teacher_id: selectedTeacher,
        school_year: selectedSemester.school_year,
        semester: selectedSemester.semester,
      };
      
      fetch(`${API_URL}/comparative/compare_student`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log("🔍 DEBUG - Analysis result received:", data);
          setAnalysisResult(data);
          setIsRunningAnalysis(false);
          
          // Show success toast
          showSuccess(
            "Grade Analysis Complete!", 
            `Student ${data.improvement_status.toLowerCase()} by ${Math.abs(data.improvement_points)} points (${Math.abs(data.improvement_percent).toFixed(1)}%)`,
            6000
          );
        })
        .catch((err) => {
          console.error("Error running comparative analysis:", err);
          setIsRunningAnalysis(false);
          showError(
            "Analysis Failed", 
            "Unable to process grade analysis. Please check your data and try again.",
            5000
          );
        });
    } else {
      showWarning(
        "Missing Data", 
        "Please ensure all required fields are selected before running the analysis.",
        4000
      );
    }
  };

  // Function to generate colors for charts
  const generateColors = (count) => {
    const baseColors = [
      "rgba(54, 162, 235, 0.7)", // blue
      "rgba(255, 99, 132, 0.7)", // red
      "rgba(255, 205, 86, 0.7)", // yellow
      "rgba(75, 192, 192, 0.7)", // teal
      "rgba(153, 102, 255, 0.7)", // purple
    ];
    return baseColors.slice(0, count);
  };

  // Modal functions
  const openSelectionModal = () => {
    setTempSemester(selectedSemester);
    setTempTeacher(selectedTeacher);
    setTempStudent(selectedStudents.length > 0 ? selectedStudents[0] : "");
    setTempCourse(selectedCourse);
    setShowSelectionModal(true);
  };

  const closeSelectionModal = () => {
    setShowSelectionModal(false);
    setTempSemester(null);
    setTempTeacher("");
    setTempStudent("");
    setTempCourse("");
    setTempStudents([]);
    setTempStudentName("");
    setFilteredStudents([]);
    setSelectedStudentData(null);
    setIsStudentSearching(false);
  };

  const applySelection = () => {
    if (tempSemester && tempTeacher && tempStudent && tempCourse) {
      setSelectedSemester(tempSemester);
      setSelectedTeacher(tempTeacher);
      setSelectedStudents([tempStudent]);
      setSelectedCourse(tempCourse);
      setSelectedStudentData(
        students.find((s) => s.id_number === tempStudent) || null
      );
      closeSelectionModal();
    }
  };

  // Student search functionality - only show results when actively searching
  useEffect(() => {
    const trimmedSearch = tempStudentName.trim();
    
    if (trimmedSearch === "") {
      // No search term - clear results and stop searching
      setFilteredStudents([]);
      setIsStudentSearching(false);
    } else {
      // User is searching - show filtered results
      setIsStudentSearching(true);
            const filtered = tempStudents.filter((student) => {
              const fullName = student.firstName && student.lastName 
                ? `${student.firstName} ${student.lastName}` 
                : student.fullName || '';
              const idNumber = student.id || student.id_number || student.idNumber || '';
              
              return (
                fullName.toLowerCase().includes(trimmedSearch.toLowerCase()) ||
                idNumber.toLowerCase().includes(trimmedSearch.toLowerCase())
              );
            });
      setFilteredStudents(filtered);
    }
  }, [tempStudentName, tempStudents]);

  // Fetch students when teacher is selected in modal
  useEffect(() => {
    if (showSelectionModal && tempTeacher && tempSemester) {
      setIsLoadingStudents(true);
      fetch(
        `${API_URL}/polycon-analysis/get_teacher_students?teacherID=${tempTeacher}&schoolYear=${tempSemester.school_year}&semester=${tempSemester.semester}`
      )
        .then((res) => res.json())
        .then((data) => {
          console.log("🔍 DEBUG - Students data:", data);
          setTempStudents(data);
          setFilteredStudents(data);
          setIsLoadingStudents(false);
        })
        .catch((err) => {
          console.error("Error fetching students:", err);
          setIsLoadingStudents(false);
        });
    }
  }, [showSelectionModal, tempTeacher, tempSemester]);

  // Fetch courses for selected student
  useEffect(() => {
    if (tempStudent && tempTeacher && tempSemester) {
      setIsLoadingCourses(true);
      const url = `${API_URL}/comparative/get_student_courses?student_id=${tempStudent}&teacher_id=${tempTeacher}&school_year=${tempSemester.school_year}&semester=${tempSemester.semester}`;
      console.log("🔍 DEBUG - Fetching courses with URL:", url);
      console.log("🔍 DEBUG - tempStudent:", tempStudent, "tempTeacher:", tempTeacher, "tempSemester:", tempSemester);
      
      fetch(url)
        .then((res) => res.json())
        .then((data) => {
          console.log("🔍 DEBUG - Courses API response:", data);
          if (data.error) {
            console.error("Error fetching courses:", data.error);
            setTempCourses([]);
          } else {
            setTempCourses(data);
            if (data.length === 0) {
              console.log("🔍 DEBUG - No courses found. This might be because:");
              console.log("  - The student doesn't have grades with this teacher in this semester");
              console.log("  - Try selecting a different semester (2024-2025 1st has test data)");
              console.log("  - Try selecting Bob Williams (S2024002) who has ED101 with David Paul Desuyo");
            }
          }
          setIsLoadingCourses(false);
        })
        .catch((err) => {
          console.error("Error fetching courses:", err);
          setTempCourses([]);
          setIsLoadingCourses(false);
        });
    } else {
      setTempCourses([]);
    }
  }, [tempStudent, tempTeacher, tempSemester]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Section with Enhanced Design */}
      <ComparativeAnalysisHeader
        openSelectionModal={openSelectionModal}
        allFieldsProvided={allFieldsProvided}
      />

      {/* Overall Class Metrics */}
      {overallMetrics && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 px-4"
        >
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 max-w-4xl mx-auto">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-[#0065A8] mb-2">Class Performance Overview</h3>
              <p className="text-gray-600">Overall improvement statistics for this semester</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 text-center border border-blue-200"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                <h4 className="text-lg font-semibold text-blue-800 mb-2">Average Improvement</h4>
                <p className="text-3xl font-bold text-blue-900">
                  {overallMetrics.average_improvement_points > 0 ? '+' : ''}{overallMetrics.average_improvement_points}
                </p>
                <p className="text-sm text-blue-700">points ({overallMetrics.average_improvement_percent > 0 ? '+' : ''}{overallMetrics.average_improvement_percent}%)</p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 text-center border border-green-200"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  </div>
                <h4 className="text-lg font-semibold text-green-800 mb-2">Students Improved</h4>
                <p className="text-3xl font-bold text-green-900">{overallMetrics.students_improved_percent}%</p>
                <p className="text-sm text-green-700">{overallMetrics.students_improved_count} out of {overallMetrics.total_improvements_analyzed} students</p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 text-center border border-purple-200"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-purple-800 mb-2">Total Students</h4>
                <p className="text-3xl font-bold text-purple-900">{overallMetrics.total_students}</p>
                <p className="text-sm text-purple-700">{overallMetrics.students_with_consultations} with consultations</p>
              </motion.div>
                  </div>
                </div>
              </motion.div>
      )}

      {/* Note: Student grades are now handled by the comparative analysis endpoint */}



      {/* Note: Consultation history is now handled by the comparative analysis endpoint */}

      {/* Consultation Period Selector */}
      {allFieldsProvided && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 px-4"
        >
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
              Select Consultation Period
            </h3>
            <p className="text-gray-600 text-sm mb-6 text-center">
              Choose which period the consultation occurred in to compare grades before and after
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {['Prelim', 'Midterm', 'Pre-Final', 'Final'].map((period) => (
                <motion.button
                  key={period}
                  onClick={() => setConsultationPeriod(period)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                    consultationPeriod === period
                      ? 'bg-gradient-to-r from-[#0065A8] to-[#54BEFF] text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {period}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Enhanced Run Analysis Button */}
      {allFieldsProvided && consultationPeriod && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center px-4"
        >
          <div className="relative inline-block">
            <motion.button
              onClick={runComparativeAnalysis}
              disabled={isRunningAnalysis}
              whileHover={!isRunningAnalysis ? { scale: 1.05, y: -2 } : {}}
              whileTap={!isRunningAnalysis ? { scale: 0.98 } : {}}
              className={`relative w-full sm:w-auto px-8 sm:px-12 py-4 sm:py-5 ${
                isRunningAnalysis 
                  ? 'bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-[#00D1B2] to-[#00B4B4] hover:from-[#00B4B4] hover:to-[#00A0A0]'
              } text-white rounded-2xl transition-all duration-300 font-semibold flex items-center justify-center mx-auto text-base sm:text-lg shadow-xl border border-white/20 backdrop-blur-sm`}
            >
              {/* Button Content */}
              <div className="flex items-center gap-3">
                {isRunningAnalysis ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-6 h-6 border-3 border-white border-t-transparent rounded-full"
                    ></motion.div>
                    <span>Analyzing Improvement...</span>
                  </>
                ) : (
                  <>
                    <motion.div
                      whileHover={{ rotate: 15 }}
                      transition={{ duration: 0.2 }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm2 10a1 1 0 10-2 0v3a1 1 0 102 0v-3zm4-1a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1zm-2-8a1 1 0 00-1 1v.01a1 1 0 002 0V4a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </motion.div>
                    <span>Run Grade Analysis</span>
                    <motion.div
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </motion.div>
                  </>
                )}
              </div>
            </motion.button>
          </div>
          
          {/* Analysis Description */}
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-4 text-sm text-gray-600 max-w-md mx-auto"
          >
            Generate simple grade improvement analysis based on consultation period
          </motion.p>
        </motion.div>
      )}

      {/* Simple Grade Comparison Results */}
      {analysisResult && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-16 mb-20 px-2 sm:px-0"
        >
          {/* Header */}
          <motion.div
            className="relative mb-12 sm:mb-16"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
          >
            <div className="absolute inset-0 flex items-center">
              <div className="h-1 w-full bg-gradient-to-r from-transparent via-[#0065A8] to-transparent opacity-20"></div>
            </div>
            <div className="relative flex justify-center">
              <div className="bg-white px-8 sm:px-12 py-6 rounded-3xl shadow-xl border border-gray-100 backdrop-blur-sm">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-[#0065A8] to-[#54BEFF] rounded-full flex items-center justify-center shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <h3 className="text-3xl sm:text-4xl font-bold text-[#0065A8] mb-2">
                      Grade Improvement Analysis
                    </h3>
                    <p className="text-gray-600 text-sm sm:text-base">
                      Student performance comparison before and after consultation
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Simple Grade Comparison */}
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Student Grade Comparison Card */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.02, y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 transition-all duration-500 hover:shadow-2xl"
            >
              <div className="bg-gradient-to-br from-[#397de2] via-[#54BEFF] to-[#0065A8] p-6 sm:p-8 relative overflow-hidden">
                  <div className="relative flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                    <div>
                      <h4 className="text-2xl sm:text-3xl font-bold text-white">
                        Grade Comparison
                      </h4>
                    <p className="text-blue-100 text-sm sm:text-base">
                        {analysisResult.before_period} → {analysisResult.after_period}
                    </p>
                  </div>
                </div>
              </div>

                {/* Grade Comparison Content */}
                <div className="p-6 sm:p-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                      className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 text-center border border-gray-200"
                  >
                      <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                        <p className="text-sm font-medium text-gray-600">Before ({analysisResult.before_period})</p>
                    </div>
                      <p className="text-4xl font-bold text-gray-800">
                        {analysisResult.before_grade}
                    </p>
                  </motion.div>
                    
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                      className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 text-center border border-blue-200"
                  >
                      <div className="flex items-center justify-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-[#0065A8] to-[#54BEFF] rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                        <p className="text-sm font-medium text-blue-600">After ({analysisResult.after_period})</p>
                    </div>
                      <p className="text-4xl font-bold text-[#0065A8]">
                        {analysisResult.after_grade}
                    </p>
                  </motion.div>
                </div>

                  {/* Improvement Summary */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className={`rounded-2xl p-6 text-center ${
                      analysisResult.improvement_status === 'Improved' 
                        ? 'bg-gradient-to-br from-green-50 to-green-100 border border-green-200'
                        : analysisResult.improvement_status === 'Declined'
                        ? 'bg-gradient-to-br from-red-50 to-red-100 border border-red-200'
                        : 'bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-3 mb-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        analysisResult.improvement_status === 'Improved' 
                          ? 'bg-gradient-to-r from-green-500 to-green-600'
                          : analysisResult.improvement_status === 'Declined'
                          ? 'bg-gradient-to-r from-red-500 to-red-600'
                          : 'bg-gradient-to-r from-gray-500 to-gray-600'
                      }`}>
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          {analysisResult.improvement_status === 'Improved' ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                          ) : analysisResult.improvement_status === 'Declined' ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          )}
                          </svg>
                        </div>
                      <p className={`text-sm font-medium ${
                        analysisResult.improvement_status === 'Improved' 
                          ? 'text-green-600'
                          : analysisResult.improvement_status === 'Declined'
                          ? 'text-red-600'
                          : 'text-gray-600'
                      }`}>
                        {analysisResult.improvement_status}
                      </p>
                      </div>
                    <p className={`text-3xl font-bold ${
                      analysisResult.improvement_status === 'Improved' 
                        ? 'text-green-800'
                        : analysisResult.improvement_status === 'Declined'
                        ? 'text-red-800'
                        : 'text-gray-800'
                    }`}>
                      {analysisResult.improvement_points > 0 ? '+' : ''}{analysisResult.improvement_points} points
                    </p>
                    <p className={`text-sm mt-2 ${
                      analysisResult.improvement_status === 'Improved' 
                        ? 'text-green-700'
                        : analysisResult.improvement_status === 'Declined'
                        ? 'text-red-700'
                        : 'text-gray-700'
                    }`}>
                      ({analysisResult.improvement_percent > 0 ? '+' : ''}{analysisResult.improvement_percent}%)
                    </p>
                  </motion.div>
                    </div>
                  </motion.div>

              {/* Simple Bar Chart Card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.02, y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 transition-all duration-500 hover:shadow-2xl"
            >
              <div className="bg-gradient-to-br from-[#fc6969] via-[#ff8f8f] to-[#ff6b6b] p-6 sm:p-8 relative overflow-hidden">
                <div className="relative flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-2xl sm:text-3xl font-bold text-white">
                      Grade Progression
                    </h4>
                      <p className="text-red-100 text-sm sm:text-base">
                        Visual comparison of grades
                    </p>
                  </div>
                </div>
              </div>
                
              <div className="p-6 sm:p-8">
                  <div className="h-64 w-full">
                    <Bar
                      data={{
                        labels: [analysisResult.before_period, analysisResult.after_period],
                        datasets: [
                          {
                            label: "Grade",
                            data: [analysisResult.before_grade, analysisResult.after_grade],
                            backgroundColor: [
                              "#6B7280",
                              "#0065A8",
                            ],
                            borderRadius: 12,
                            borderSkipped: false,
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { display: false },
                          tooltip: {
                            backgroundColor: "rgba(0, 0, 0, 0.9)",
                            padding: 16,
                            titleColor: "#fff",
                            bodyColor: "#fff",
                            cornerRadius: 12,
                            titleFont: { size: 14, weight: 'bold' },
                            bodyFont: { size: 13 },
                          },
                        },
                        scales: {
                          y: {
                            beginAtZero: false,
                            min: Math.max(0, Math.min(analysisResult.before_grade, analysisResult.after_grade) - 10),
                            max: Math.min(100, Math.max(analysisResult.before_grade, analysisResult.after_grade) + 10),
                            grid: {
                              color: "rgba(0, 0, 0, 0.1)",
                            },
                            ticks: {
                              color: "#6B7280",
                              font: { size: 12 },
                            },
                          },
                          x: {
                            grid: {
                              display: false,
                            },
                            ticks: {
                              color: "#6B7280",
                              font: { size: 12, weight: 'bold' },
                            },
                          },
                        },
                      }}
                    />
                  </div>
                    </div>
                </motion.div>
              </div>
                </div>
        </motion.div>
      )}

      {/* Selection Modal - Enhanced with modern design */}
      {showSelectionModal && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4"
          onClick={() => setShowSelectionModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-white/20"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#0065A8] via-[#057DCD] to-[#54BEFF] px-8 py-6 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    Analysis Configuration
                  </h2>
                  <p className="text-blue-100 text-sm">
                    Select your analysis parameters
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowSelectionModal(false)}
                className="text-white hover:text-gray-200 transition-colors p-2 rounded-lg hover:bg-white/20"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>
            </div>

            {/* Modal Content */}
            <div className="p-8 overflow-y-auto max-h-[calc(90vh-200px)] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              <div className="space-y-6">
              {/* Semester Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Select Semester
                </label>
                <select
                    value={tempSemester ? `${tempSemester.school_year}-${tempSemester.semester}` : ""}
                  onChange={(e) => {
                      console.log("🔍 DEBUG - Semester dropdown changed:", e.target.value);
                      const [schoolYear, semester] = e.target.value.split('-');
                      const selectedSem = semesters.find(s => s.school_year === schoolYear && s.semester === semester);
                      console.log("🔍 DEBUG - Selected semester:", selectedSem);
                      setTempSemester(selectedSem);
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0065A8] focus:border-transparent transition-all duration-200"
                  >
                    <option value="">Choose a semester</option>
                    {semesters.map((semester) => (
                      <option key={`${semester.school_year}-${semester.semester}`} value={`${semester.school_year}-${semester.semester}`}>
                        {semester.school_year} - {semester.semester}
                    </option>
                  ))}
                </select>
                  </div>

                {/* Teacher Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Select Teacher
                  </label>
                  <select
                    value={tempTeacher}
                    onChange={(e) => setTempTeacher(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0065A8] focus:border-transparent transition-all duration-200"
                  >
                    <option value="">Choose a teacher</option>
                    {teachers.map((teacher) => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.fullName}
                      </option>
                    ))}
                  </select>
                  </div>

                {/* Student Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Select Student
                  </label>
                  <div className="space-y-3">
                    <div className="min-h-[45px] flex items-center gap-2 border-2 border-[#0065A8] rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-[#54BEFF]">
                      {tempStudent && tempStudents.find(s => (s.id || s.id_number || s.idNumber) === tempStudent) ? (
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-[#0065A8] to-[#54BEFF] rounded-full flex items-center justify-center">
                              <span className="text-white font-semibold text-sm">
                                {(() => {
                                  const student = tempStudents.find(s => (s.id || s.id_number || s.idNumber) === tempStudent);
                                  const fullName = student?.firstName && student?.lastName 
                                    ? `${student.firstName} ${student.lastName}` 
                                    : student?.fullName || '';
                                  return fullName ? fullName.split(' ').map(n => n[0]).join('').toUpperCase() : '??';
                                })()}
                              </span>
                      </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {(() => {
                                  const student = tempStudents.find(s => (s.id || s.id_number || s.idNumber) === tempStudent);
                                  return student?.firstName && student?.lastName 
                                    ? `${student.firstName} ${student.lastName}` 
                                    : student?.fullName || 'Unknown Student';
                                })()}
                              </p>
                              <p className="text-sm text-gray-500">
                                {(() => {
                                  const student = tempStudents.find(s => (s.id || s.id_number || s.idNumber) === tempStudent);
                                  return student?.id || student?.id_number || student?.idNumber || 'No ID';
                                })()}
                              </p>
                      </div>
                    </div>
                          <button
                      onClick={() => {
                        setTempStudent("");
                              setTempStudentName("");
                              setTempCourses([]);
                      }}
                            className="text-gray-400 hover:text-red-500 transition-colors p-1"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                          </button>
                        </div>
                      ) : (
                    <input
                      type="text"
                          placeholder="Search students..."
                      value={tempStudentName}
                          onChange={(e) => setTempStudentName(e.target.value)}
                          className="flex-1 outline-none bg-transparent text-sm"
                        />
                      )}
                    </div>
                    {isLoadingStudents ? (
                      <div className="text-center py-8">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#0065A8]"></div>
                        <p className="text-gray-500 mt-2">Loading students...</p>
                      </div>
                    ) : !isStudentSearching ? (
                      <div className="text-center py-8 border border-gray-200 rounded-xl bg-gray-50">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                        <p className="text-gray-500 text-sm">Start typing to search for students</p>
                        <p className="text-gray-400 text-xs mt-1">Search by name or student ID</p>
                  </div>
                    ) : filteredStudents.length === 0 ? (
                      <div className="text-center py-8 border border-gray-200 rounded-xl bg-gray-50">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <p className="text-gray-500 text-sm">No students found</p>
                        <p className="text-gray-400 text-xs mt-1">Try a different search term</p>
                      </div>
                    ) : (
                      <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-xl">
                        {filteredStudents.map((student) => (
                          <motion.div
                            key={student.id || student.id_number || student.idNumber}
                            whileHover={{ backgroundColor: "rgba(0, 101, 168, 0.05)" }}
                            className={`p-3 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                              tempStudent === (student.id || student.id_number || student.idNumber) ? 'bg-[#0065A8]/10 border-l-4 border-l-[#0065A8]' : ''
                            }`}
                            onClick={() => {
                              setTempStudent(student.id || student.id_number || student.idNumber);
                              setTempStudentName(""); // Clear search field when student is selected
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-[#0065A8] to-[#54BEFF] rounded-full flex items-center justify-center">
                                <span className="text-white font-semibold text-sm">
                                  {(() => {
                                    const fullName = student.firstName && student.lastName 
                                      ? `${student.firstName} ${student.lastName}` 
                                      : student.fullName || '';
                                    return fullName ? fullName.split(' ').map(n => n[0]).join('').toUpperCase() : '??';
                                  })()}
                                </span>
                          </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {student.firstName && student.lastName 
                        ? `${student.firstName} ${student.lastName}` 
                        : student.fullName || 'Unknown Student'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {student.id || student.id_number || student.idNumber || 'No ID'}
                    </p>
                          </div>
                        </div>
                          </motion.div>
                        ))}
                  </div>
                )}
                  </div>
                </div>

              {/* Course Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Select Course
                </label>
                <select
                  value={tempCourse}
                  onChange={(e) => setTempCourse(e.target.value)}
                    disabled={!tempStudent || isLoadingCourses}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0065A8] focus:border-transparent transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {!tempStudent 
                        ? "Select a student first" 
                        : isLoadingCourses 
                          ? "Loading courses..." 
                          : "Choose a course"}
                    </option>
                    {tempCourses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.course_code} - {course.course_name}
                    </option>
                  ))}
                </select>
                  {tempStudent && tempCourses.length === 0 && !isLoadingCourses && (
                    <p className="text-sm text-gray-500 mt-2">
                      No courses found for this student with the selected teacher and semester.
                    </p>
                  )}
                </div>

                {/* Consultation Period Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Consultation Period
                  </label>
                  <select
                    value={consultationPeriod}
                    onChange={(e) => setConsultationPeriod(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0065A8] focus:border-transparent transition-all duration-200"
                  >
                    <option value="Prelim">Prelim</option>
                    <option value="Midterm">Midterm</option>
                    <option value="Pre-Final">Pre-Final</option>
                    <option value="Final">Final</option>
                  </select>
                  <p className="text-sm text-gray-500 mt-2">
                    Select the period when the consultation occurred. The analysis will compare grades before and after this period.
                  </p>
                </div>
              </div>
              
              {/* Scroll indicator */}
              <div className="text-center py-4">
                <div className="inline-flex items-center text-sm text-gray-400">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                  Scroll down to see Apply button
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-8 py-6 bg-gray-50 border-t border-gray-200 flex justify-end gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={closeSelectionModal}
                className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors font-medium"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={applySelection}
                disabled={!tempSemester || !tempTeacher || !tempStudent || !tempCourse}
                className={`px-8 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  tempSemester && tempTeacher && tempStudent && tempCourse
                    ? 'bg-gradient-to-r from-[#0065A8] to-[#54BEFF] text-white hover:from-[#0056A3] hover:to-[#4A9EFF] shadow-lg'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Apply Selection
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
      </div>
    </div>
  );
}

export default ComparativeAnalysis;