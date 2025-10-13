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
  // Note: selectedStudents and selectedCourse removed - now using simplified search approach
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

  // Direct search states (no modal needed)
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [availableAnalyses, setAvailableAnalyses] = useState([]);
  const [isLoadingAnalyses, setIsLoadingAnalyses] = useState(false);
  const [selectedStudentData, setSelectedStudentData] = useState(null);
  const [lastRunAnalysisId, setLastRunAnalysisId] = useState(null);

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

  // Check if basic fields are provided for the simplified interface
  const basicFieldsProvided = selectedSemester && selectedTeacher;

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

  // Note: Old runComparativeAnalysis function removed - now using simplified runAnalysis function

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

  // Note: Modal functions removed - now using direct search on page

  // Search for students
  const searchStudents = async (query) => {
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `${API_URL}/polycon-analysis/get_teacher_students?teacherID=${selectedTeacher}&schoolYear=${selectedSemester.school_year}&semester=${selectedSemester.semester}`
      );
      const students = await response.json();
      
      const filtered = students.filter(student => {
        const fullName = student.firstName && student.lastName 
          ? `${student.firstName} ${student.lastName}` 
          : student.fullName || '';
        const idNumber = student.id || student.id_number || student.idNumber || '';
        
        return (
          fullName.toLowerCase().includes(query.toLowerCase()) ||
          idNumber.toLowerCase().includes(query.toLowerCase())
        );
      });
      
      setSearchResults(filtered);
    } catch (error) {
      console.error("Error searching students:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Get available analyses for selected student
  const getAvailableAnalyses = async (student) => {
    setIsLoadingAnalyses(true);
    try {
      const response = await fetch(
        `${API_URL}/comparative/get_student_courses?student_id=${student.id}&teacher_id=${selectedTeacher}&school_year=${selectedSemester.school_year}&semester=${selectedSemester.semester}`
      );
      const courses = await response.json();
      
      // Create analysis options for each course and consultation period
      const analyses = [];
      const periods = ['Prelim', 'Midterm', 'Pre-Final']; // Exclude 'Final' as there's no period after it
      
      courses.forEach(course => {
        periods.forEach(period => {
          analyses.push({
            id: `${course.id}-${period}`,
            course: course,
            consultation_period: period,
            student: student,
            label: `${course.course_code} - ${period} Consultation Analysis`
          });
        });
      });
      
      setAvailableAnalyses(analyses);
    } catch (error) {
      console.error("Error getting available analyses:", error);
      setAvailableAnalyses([]);
    } finally {
      setIsLoadingAnalyses(false);
    }
  };

  // Run analysis for selected option
  const runAnalysis = async (analysis) => {
      setIsRunningAnalysis(true);
      
      const payload = {
      student_id: analysis.student.id,
      consultation_period: analysis.consultation_period,
      teacher_id: selectedTeacher,
      school_year: selectedSemester.school_year,
      semester: selectedSemester.semester,
    };
    
    console.log("🔍 DEBUG - Sending payload:", payload);
    console.log("🔍 DEBUG - API URL:", `${API_URL}/comparative/compare_student`);
    
    try {
      const response = await fetch(`${API_URL}/comparative/compare_student`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      console.log("🔍 DEBUG - Response status:", response.status);
      console.log("🔍 DEBUG - Response ok:", response.ok);
      
      const data = await response.json();
      console.log("🔍 DEBUG - Analysis result received:", data);
      
      // Check if the response contains an error
      if (data.error) {
        console.error("API Error:", data.error);
        showError("Analysis Failed", data.error, 5000);
        return;
      }
      
          setAnalysisResult(data);
      setConsultationPeriod(analysis.consultation_period);
      setLastRunAnalysisId(analysis.id);
      // Keep selected student and available analyses for further analysis options
      // Only clear search term and results
      setSearchTerm("");
      setSearchResults([]);
          
          showSuccess(
        "Analysis Complete!", 
        `${data.student_name} ${data.improvement_status.toLowerCase()} by ${Math.abs(data.improvement_points)} points (${Math.abs(data.improvement_percent).toFixed(1)}%) - ${data.consultation_impact}. You can select another analysis option above.`,
            6000
          );
    } catch (error) {
      console.error("Error running analysis:", error);
      showError("Analysis Failed", "Unable to process grade analysis. Please try again.", 5000);
    } finally {
          setIsRunningAnalysis(false);
    }
  };

  // Note: Old student search useEffect removed - now using simplified search

  // Note: Old useEffect hooks for complex modal removed - now using simplified search

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Section with Enhanced Design */}
      <ComparativeAnalysisHeader />

      {/* Teacher and Semester Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 px-4"
      >
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 max-w-4xl mx-auto">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Select Teacher & Semester</h3>
            <p className="text-gray-600">Choose the teacher and semester for consultation impact analysis</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Semester Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Select Semester
              </label>
              <select
                value={selectedSemester?.id || ""}
                onChange={(e) => {
                  const selectedId = parseInt(e.target.value);
                  console.log('🔍 DEBUG - Semester selection changed:', selectedId);
                  const selectedSemesterData = semesters.find(s => s.id === selectedId);
                  console.log('🔍 DEBUG - Found semester data:', selectedSemesterData);
                  if (selectedSemesterData) {
                    setSelectedSemester(selectedSemesterData);
                    console.log('🔍 DEBUG - Set selected semester:', selectedSemesterData);
                  }
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0065A8] focus:border-transparent transition-all duration-200"
              >
                <option value="">Select a semester...</option>
                {semesters.map((semester) => (
                  <option key={semester.id} value={semester.id}>
                    {semester.display_name}
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
                value={selectedTeacher}
                onChange={(e) => setSelectedTeacher(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0065A8] focus:border-transparent transition-all duration-200"
                disabled={!selectedSemester?.id}
              >
                <option value="">Select a teacher...</option>
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.fullName} ({teacher.department})
                  </option>
                ))}
              </select>
              {!selectedSemester?.id && (
                <p className="text-sm text-gray-500 mt-2">Please select a semester first</p>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Instructions when no teacher/semester selected */}
      {!basicFieldsProvided && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 px-4"
        >
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-8 max-w-4xl mx-auto text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Get Started with Consultation Impact Analysis</h3>
            <p className="text-gray-600 mb-4">
              To begin analyzing student performance and consultation impact, please:
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                <span>Select a semester from the dropdown above</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                <span>Choose a teacher who has grades in that semester</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
                <span>Search for students and run analysis</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Overall Class Metrics */}
      {overallMetrics && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 px-4"
        >
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 max-w-4xl mx-auto">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-[#0065A8] mb-2">Class Consultation Impact</h3>
              <p className="text-gray-600">Overall consultation effectiveness and student improvement metrics</p>
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
                <h4 className="text-lg font-semibold text-blue-800 mb-2">Average Grade Improvement</h4>
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
                <h4 className="text-lg font-semibold text-green-800 mb-2">Consultation Success Rate</h4>
                <p className="text-3xl font-bold text-green-900">{overallMetrics.students_improved_percent}%</p>
                <p className="text-sm text-green-700">{overallMetrics.students_improved_count} out of {overallMetrics.total_improvements_analyzed} students improved</p>
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
                <h4 className="text-lg font-semibold text-purple-800 mb-2">Students Analyzed</h4>
                <p className="text-3xl font-bold text-purple-900">{overallMetrics.total_students}</p>
                <p className="text-sm text-purple-700">{overallMetrics.students_with_consultations} received consultations</p>
              </motion.div>
              </div>
            </div>
        </motion.div>
      )}

      {/* Note: Student grades are now handled by the comparative analysis endpoint */}



      {/* Note: Consultation history is now handled by the comparative analysis endpoint */}


      {/* Direct Student Search Section */}
      {basicFieldsProvided && (
              <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 px-4"
        >
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Individual Student Analysis</h3>
              <p className="text-gray-600">Search for a student to analyze their consultation impact</p>
                </div>

            {/* Student Search */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Search for Student
              </label>
              <div className="relative">
                {selectedStudent ? (
                  // Selected student display inside input field
                  <div className="w-full px-4 py-3 pl-12 pr-12 border border-gray-300 rounded-xl bg-gradient-to-r from-[#0065A8]/10 to-[#54BEFF]/10 border-[#0065A8]/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-[#0065A8] to-[#54BEFF] rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {(() => {
                              const fullName = selectedStudent.firstName && selectedStudent.lastName 
                                ? `${selectedStudent.firstName} ${selectedStudent.lastName}` 
                                : selectedStudent.fullName || '';
                              return fullName ? fullName.split(' ').map(n => n[0]).join('').toUpperCase() : '??';
                            })()}
                          </span>
                  </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">
                            {selectedStudent.firstName && selectedStudent.lastName 
                              ? `${selectedStudent.firstName} ${selectedStudent.lastName}` 
                              : selectedStudent.fullName || 'Unknown Student'}
                          </p>
                          <p className="text-xs text-gray-600">
                            ID: {selectedStudent.id || selectedStudent.id_number || selectedStudent.idNumber || 'No ID'}
                          </p>
                  </div>
                  </div>
                      <button
                        onClick={() => {
                          setSelectedStudent(null);
                          setAvailableAnalyses([]);
                          setSearchTerm("");
                          setSearchResults([]);
                        }}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ) : (
                  // Regular search input with dropdown suggestions
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Type student name or ID..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        searchStudents(e.target.value);
                      }}
                      className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0065A8] focus:border-transparent transition-all duration-200"
                    />
                    
                    {/* Search Suggestions Dropdown */}
                    {searchTerm.length >= 2 && searchResults.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-64 overflow-y-auto">
                        {searchResults.map((student) => (
                          <motion.div
                            key={student.id || student.id_number || student.idNumber}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={{ backgroundColor: "rgba(0, 101, 168, 0.05)" }}
                            className="p-3 cursor-pointer border-b border-gray-100 last:border-b-0 hover:bg-blue-50 transition-all duration-200"
                            onClick={() => {
                              setSelectedStudent(student);
                              getAvailableAnalyses(student);
                              setSearchTerm("");
                              setSearchResults([]);
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gradient-to-r from-[#0065A8] to-[#54BEFF] rounded-full flex items-center justify-center">
                                <span className="text-white font-semibold text-xs">
                                  {(() => {
                                    const fullName = student.firstName && student.lastName 
                                      ? `${student.firstName} ${student.lastName}` 
                                      : student.fullName || '';
                                    return fullName ? fullName.split(' ').map(n => n[0]).join('').toUpperCase() : '??';
                                  })()}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 text-sm">
                                  {student.firstName && student.lastName 
                                    ? `${student.firstName} ${student.lastName}` 
                                    : student.fullName || 'Unknown Student'}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {student.id || student.id_number || student.idNumber || 'No ID'}
                                </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
                    )}

                    {/* No Results Message */}
                    {searchTerm.length >= 2 && searchResults.length === 0 && !isSearching && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 p-4">
                        <div className="flex items-center gap-3 text-gray-500">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <div>
                            <p className="text-sm font-medium">No students found</p>
                            <p className="text-xs">Try a different search term</p>
              </div>
                          </div>
              </div>
                    )}
            </div>
                )}
                
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  {isSearching ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#0065A8]"></div>
                  ) : (
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  )}
                </div>
              </div>
            </div>

            {/* Available Analyses */}
            {selectedStudent && (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-900">Available Consultation Periods</h4>
                    {analysisResult && (
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Analysis completed - Try another consultation period below</span>
                      </div>
                    )}
                  </div>
                  {isLoadingAnalyses ? (
                    <div className="text-center py-8">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#0065A8]"></div>
                      <p className="text-gray-500 mt-2">Loading available analyses...</p>
                    </div>
                  ) : availableAnalyses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {availableAnalyses.map((analysis) => {
                        const isLastRun = lastRunAnalysisId === analysis.id;
                        return (
        <motion.div 
                            key={analysis.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`p-4 border rounded-xl hover:shadow-md transition-all duration-200 cursor-pointer ${
                              isLastRun 
                                ? 'border-green-300 bg-green-50 hover:border-green-400' 
                                : 'border-gray-200 hover:border-[#0065A8]'
                            }`}
                            onClick={() => runAnalysis(analysis)}
                          >
              <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                isLastRun 
                                  ? 'bg-gradient-to-r from-green-500 to-green-600' 
                                  : 'bg-gradient-to-r from-blue-500 to-blue-600'
                              }`}>
                                {isLastRun ? (
                                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                ) : (
                                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <p className="font-medium text-gray-900">{analysis.course.course_code}</p>
                                  {isLastRun && (
                                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                                      Just Run
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600">{analysis.consultation_period} Period Impact Analysis</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {selectedSemester.school_year} - {selectedSemester.semester} Semester
                                </p>
                              </div>
                            </div>
                    </motion.div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 border border-gray-200 rounded-xl bg-gray-50">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      </div>
                      <p className="text-gray-500 text-sm">No consultation periods available</p>
                      <p className="text-gray-400 text-xs mt-1">This student may not have grades or consultation data for this semester</p>
                    </div>
                )}
              </div>
          </div>
            )}
          </div>
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
                      Consultation Impact Results
                    </h3>
                    <p className="text-gray-600 text-sm sm:text-base">
                      Analysis of student performance before and after consultation period
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Consultation Impact Analysis - Full Width */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="max-w-6xl mx-auto mb-8"
          >
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-br from-[#0065A8] via-[#057DCD] to-[#54BEFF] p-6 sm:p-8 relative overflow-hidden">
                <div className="relative flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                      Consultation Impact Analysis
                    </h3>
                    <p className="text-blue-100 text-sm sm:text-base">
                      Comprehensive analysis of consultation effectiveness and student improvement correlation
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 sm:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Consultation Status */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                      <h4 className="text-xl font-bold text-gray-900">Consultation Status</h4>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-600">Consultation Conducted:</span>
                        <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                          analysisResult.has_consultation 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {analysisResult.has_consultation ? 'Yes' : 'No'}
                        </span>
                      </div>
                      {analysisResult.has_consultation && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-600">Number of Sessions:</span>
                          <span className="text-lg font-bold text-gray-900">{analysisResult.consultation_count}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Impact Assessment */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <h4 className="text-xl font-bold text-gray-900">Impact Assessment</h4>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-600">Consultation Impact:</span>
                        <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                          analysisResult.consultation_impact === 'High Impact' 
                            ? 'bg-green-100 text-green-800'
                            : analysisResult.consultation_impact === 'Moderate Impact'
                            ? 'bg-yellow-100 text-yellow-800'
                            : analysisResult.consultation_impact === 'Low Impact'
                            ? 'bg-blue-100 text-blue-800'
                            : analysisResult.consultation_impact === 'Negative Impact'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {analysisResult.consultation_impact}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-600">Significance:</span>
                        <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                          analysisResult.correlation_analysis?.consultation_significance === 'High'
                            ? 'bg-green-100 text-green-800'
                            : analysisResult.correlation_analysis?.consultation_significance === 'Low'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {analysisResult.correlation_analysis?.consultation_significance || 'Unknown'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Effectiveness Analysis */}
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-200">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                      <h4 className="text-xl font-bold text-gray-900">Effectiveness Analysis</h4>
                    </div>
                    <div className="space-y-4">
                      <p className="text-gray-700 leading-relaxed text-sm">
                        {analysisResult.consultation_effectiveness}
                      </p>
                      {analysisResult.correlation_analysis?.consultation_to_improvement && (
                        <div className="flex items-center gap-2 text-sm text-green-700 font-medium">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>Strong correlation between consultation and improvement observed</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Performance Comparison and Visualization */}
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Performance Comparison Card */}
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
                        Performance Comparison
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

              {/* Performance Visualization Card */}
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
                        Performance Visualization
                      </h4>
                      <p className="text-red-100 text-sm sm:text-base">
                        Visual representation of grade progression
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

      {/* Note: Modal removed - now using direct search on page */}
                </div>
    </div>
  );
}

export default ComparativeAnalysis;