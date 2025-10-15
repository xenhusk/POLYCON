import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import API_URL from '../apiConfig';
import { getProfilePictureUrl } from "../utils/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from '../contexts/ToastContext';
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
  const [runningAnalysisId, setRunningAnalysisId] = useState(null);

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

  // Fetch overall metrics when semester is selected
  useEffect(() => {
    if (selectedSemester && selectedTeacher) {
      fetchOverallMetrics();
    }
  }, [selectedSemester, selectedTeacher]);

  // Note: We no longer need to fetch grades and sessions separately
  // The new comparative analysis endpoint handles all the data processing

  // Check if basic fields are provided for the simplified interface
  // Now only depends on semester since teacher is automatically set from logged-in user
  const basicFieldsProvided = selectedSemester && selectedTeacher;

  // Function to fetch overall metrics for the class
  const fetchOverallMetrics = () => {
    // Use the logged-in teacher and selected semester
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

  // Helper function to get print-friendly status colors
  const getStatusColor = (status) => {
    switch (status) {
      case 'High': return '#2d3748'; // dark gray
      case 'Moderate': return '#4a5568'; // medium gray
      case 'Low': return '#718096'; // light gray
      case 'Negative': return '#1a202c'; // very dark gray
      default: return '#718096'; // light gray
    }
  };

  // Print function with clean, print-optimized design
  const handlePrint = () => {
    if (!analysisResult) {
      showError('No Analysis Data', 'Please run an analysis first before printing.');
      return;
    }

    // Create a clean, print-optimized document
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>POLYCON Analysis Report</title>
        <style>
          @page {
            margin: 0.75in;
            size: A4;
          }
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background: white;
            color: #000;
            line-height: 1.6;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #000;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .header h1 {
            color: #000;
            font-size: 28px;
            margin: 0 0 10px 0;
            font-weight: bold;
          }
          .header p {
            color: #333;
            font-size: 16px;
            margin: 0;
          }
          .section {
            margin-bottom: 25px;
            page-break-inside: avoid;
          }
          .section-title {
            background: #f5f5f5;
            color: #000;
            padding: 12px 16px;
            font-size: 18px;
            font-weight: bold;
            border-left: 4px solid #000;
            margin-bottom: 15px;
          }
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 20px;
          }
          .info-card {
            background: #f9f9f9;
            border: 1px solid #ccc;
            border-radius: 4px;
            padding: 15px;
          }
          .info-label {
            font-weight: bold;
            color: #333;
            font-size: 14px;
            margin-bottom: 5px;
          }
          .info-value {
            color: #000;
            font-size: 16px;
            font-weight: 500;
          }
          .status-card {
            background: ${getStatusColor(analysisResult.consultation_impact)};
            color: white;
            padding: 20px;
            border-radius: 4px;
            text-align: center;
            margin: 20px 0;
          }
          .status-title {
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .status-subtitle {
            font-size: 16px;
            opacity: 0.9;
          }
          .metrics-grid {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 15px;
            margin: 20px 0;
          }
          .metric-card {
            background: #f9f9f9;
            border: 1px solid #ccc;
            border-radius: 4px;
            padding: 15px;
            text-align: center;
          }
          .metric-value {
            font-size: 24px;
            font-weight: bold;
            color: #000;
            margin-bottom: 5px;
          }
          .metric-label {
            font-size: 14px;
            color: #333;
            font-weight: 500;
          }
          .improvement-summary {
            background: #f0f0f0;
            border: 1px solid #999;
            border-radius: 4px;
            padding: 20px;
            margin: 20px 0;
          }
          .improvement-title {
            color: #000;
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .improvement-text {
            color: #333;
            font-size: 16px;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ccc;
            text-align: center;
            color: #666;
            font-size: 14px;
          }
          @media print {
            .section {
              page-break-inside: avoid;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>POLYCON Individual Student Analysis Report</h1>
          <p>Individual Student Performance Analysis & Consultation Impact Assessment</p>
        </div>

        <div class="section">
          <div class="section-title">Analysis Overview</div>
          <div class="info-grid">
            <div class="info-card">
              <div class="info-label">Student</div>
              <div class="info-value">${analysisResult.student_name || 'N/A'}</div>
              <div class="info-label" style="margin-top: 8px;">Student ID</div>
              <div class="info-value">${analysisResult.student_id || 'N/A'}</div>
            </div>
            <div class="info-card">
              <div class="info-label">Course</div>
              <div class="info-value">${analysisResult.course_name || 'N/A'}</div>
              <div class="info-label" style="margin-top: 8px;">Course Code</div>
              <div class="info-value">${analysisResult.course_code || 'N/A'}</div>
            </div>
            <div class="info-card">
              <div class="info-label">Teacher</div>
              <div class="info-value">${analysisResult.teacher_name || 'N/A'}</div>
              <div class="info-label" style="margin-top: 8px;">Teacher ID</div>
              <div class="info-value">${analysisResult.teacher_id || 'N/A'}</div>
            </div>
            <div class="info-card">
              <div class="info-label">Analysis Period</div>
              <div class="info-value">${analysisResult.consultation_period || 'N/A'}</div>
              <div class="info-label" style="margin-top: 8px;">Semester</div>
              <div class="info-value">${analysisResult.school_year || 'N/A'} - ${analysisResult.semester || 'N/A'} Semester</div>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Individual Student Performance Metrics</div>
          <div class="metrics-grid">
            <div class="metric-card">
              <div class="metric-value">${analysisResult.before_grade ? analysisResult.before_grade.toFixed(1) : 'N/A'}</div>
              <div class="metric-label">Before Grade (${analysisResult.before_period || 'N/A'})</div>
            </div>
            <div class="metric-card">
              <div class="metric-value">${analysisResult.after_grade ? analysisResult.after_grade.toFixed(1) : 'N/A'}</div>
              <div class="metric-label">After Grade (${analysisResult.after_period || 'N/A'})</div>
            </div>
            <div class="metric-card">
              <div class="metric-value">${analysisResult.improvement_points ? (analysisResult.improvement_points > 0 ? '+' : '') + analysisResult.improvement_points.toFixed(1) : 'N/A'}</div>
              <div class="metric-label">Point Change</div>
            </div>
            <div class="metric-card">
              <div class="metric-value">${analysisResult.improvement_percent ? (analysisResult.improvement_percent > 0 ? '+' : '') + analysisResult.improvement_percent.toFixed(1) + '%' : 'N/A'}</div>
              <div class="metric-label">Percentage Change</div>
            </div>
            <div class="metric-card">
              <div class="metric-value">${analysisResult.grade_count || 'N/A'}</div>
              <div class="metric-label">Individual Grade Records</div>
            </div>
            <div class="metric-card">
              <div class="metric-value">${analysisResult.consultation_count || 'N/A'}</div>
              <div class="metric-label">Student's Consultation Sessions</div>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Improvement Summary</div>
          <div class="improvement-summary">
            <div class="improvement-title">Analysis Results</div>
            <div class="improvement-text">
              ${analysisResult.student_name || 'The student'} showed ${analysisResult.improvement_status ? analysisResult.improvement_status.toLowerCase() : 'no change'} in ${analysisResult.course_code || 'the course'} 
              with a ${analysisResult.improvement_points ? Math.abs(analysisResult.improvement_points).toFixed(1) : '0.0'} point change 
              (${analysisResult.improvement_percent ? Math.abs(analysisResult.improvement_percent).toFixed(1) : '0.0'}%) between the ${analysisResult.before_period || 'before'} and ${analysisResult.after_period || 'after'} periods. 
              The consultation impact is assessed as <strong>${analysisResult.consultation_impact || 'None'}</strong>.
            </div>
          </div>
        </div>

        <div class="footer">
          <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
          <p>POLYCON Student Performance Analysis System</p>
        </div>
      </body>
      </html>
    `);
    
    printWindow.document.close();
    
    // Wait for content to load then print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        setTimeout(() => printWindow.close(), 1000);
      }, 500);
    };
  };

  // Run analysis for selected option
  const runAnalysis = async (analysis) => {
      setIsRunningAnalysis(true);
      setRunningAnalysisId(analysis.id);
      
      const payload = {
      student_id: analysis.student.id,
      consultation_period: analysis.consultation_period,
      teacher_id: selectedTeacher,
      school_year: selectedSemester.school_year,
      semester: selectedSemester.semester,
      course_id: analysis.course.id,  // NEW: Add course_id to payload
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
        `${data.student_name} in ${data.course_code} ${data.improvement_status.toLowerCase()} by ${Math.abs(data.improvement_points)} points (${Math.abs(data.improvement_percent).toFixed(1)}%) - ${data.consultation_impact}. You can select another analysis option above.`,
            6000
          );
    } catch (error) {
      console.error("Error running analysis:", error);
      showError("Analysis Failed", "Unable to process grade analysis. Please try again.", 5000);
    } finally {
          setIsRunningAnalysis(false);
          setRunningAnalysisId(null);
    }
  };

  // Note: Old student search useEffect removed - now using simplified search

  // Note: Old useEffect hooks for complex modal removed - now using simplified search

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 font-poppins">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative py-16 overflow-hidden hero-section"
      >
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0065A8] via-[#057DCD] to-[#046bb8]" />
        <div className="absolute inset-0 bg-black bg-opacity-20" />
        
        {/* Floating Elements */}
        <motion.div
          animate={{ 
            y: [0, -20, 0],
            rotate: [0, 5, 0]
          }}
          transition={{ 
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-10 left-10 w-20 h-20 bg-blue-400 rounded-full opacity-20"
        />
        <motion.div
          animate={{ 
            y: [0, 30, 0],
            rotate: [0, -5, 0]
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-10 right-10 w-32 h-32 bg-blue-300 rounded-full opacity-15"
        />

        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
              POLYCON Analysis
            </h1>
            <p className="text-xl md:text-2xl text-blue-200 mb-2">
              Analyze student performance and consultation effectiveness
            </p>
            <p className="text-lg text-blue-100 max-w-2xl mx-auto">
              Track student improvement patterns and measure the impact of consultation sessions on academic performance
            </p>
          </motion.div>
        </div>
      </motion.section>

      <div className="container mx-auto px-4 py-8 search-interface-section">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >


      {/* Instructions when no semester selected */}
      {!selectedSemester && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
            <div className="bg-gradient-to-r from-[#0065A8] to-[#057DCD] text-white p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Get Started with POLYCON Analysis</h3>
                  <p className="text-blue-100">Follow these steps to begin your consultation impact analysis</p>
                </div>
              </div>
            </div>
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 bg-gradient-to-r from-[#0065A8] to-[#057DCD] rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold text-xl">1</span>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Select Semester</h4>
                  <p className="text-gray-600 text-sm">Choose the semester and search for students in the section below</p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold text-xl">2</span>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">View Metrics</h4>
                  <p className="text-gray-600 text-sm">Review class-wide consultation impact metrics and statistics</p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold text-xl">3</span>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Run Analysis</h4>
                  <p className="text-gray-600 text-sm">Execute individual student analysis and view detailed results</p>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Combined Semester Selection and Student Analysis Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-12"
      >
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100">
          <div className="bg-gradient-to-r from-[#0065A8] to-[#057DCD] text-white p-6 rounded-t-2xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-bold">Student Analysis & Semester Selection</h3>
                <p className="text-blue-100">Search for students and select semester for consultation impact analysis</p>
              </div>
            </div>
          </div>
          <div className="p-6">
          {/* Side by side layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative">
            {/* Student Search - Left Side */}
            <div className="relative">

            {/* Student Search */}
            <div className="mb-6 pb-4">
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
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-2xl z-[9999] max-h-64 overflow-y-auto">
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
                                  ID: {student.id || student.id_number || student.idNumber || 'No ID'} • {student.year_section || student.program || student.programName || 'Unknown Program'}
                                </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
                    )}

                    {/* No Results Message */}
                    {searchTerm.length >= 2 && searchResults.length === 0 && !isSearching && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-2xl z-[9999] p-4">
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

            </div>

            {/* Semester Selection - Right Side */}
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
          </div>

          {/* Available Analyses - Full width below the side-by-side layout */}
          {selectedStudent && (
            <div className="mt-8 pt-8 border-t-2 border-slate-300">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-slate-600 to-slate-700 rounded-full flex items-center justify-center shadow-md">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h4 className="text-2xl font-bold text-slate-800">Available Analyses</h4>
                </div>
                {analysisResult && (
                  <div className="flex items-center gap-2 text-sm bg-green-100 text-green-800 px-4 py-2 rounded-full border border-green-300">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-semibold">Analysis completed</span>
                  </div>
                )}
              </div>
              {isLoadingAnalyses ? (
                <div className="text-center py-12 bg-gradient-to-br from-slate-50 to-gray-100 rounded-2xl border-2 border-slate-200">
                  <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-slate-600"></div>
                  <p className="text-slate-700 mt-3 font-semibold">Loading available analyses...</p>
                </div>
              ) : availableAnalyses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availableAnalyses.map((analysis) => {
                    const isLastRun = lastRunAnalysisId === analysis.id;
                    const isRunning = runningAnalysisId === analysis.id;
                    return (
                      <motion.div 
                        key={analysis.id}
                        whileHover={!isRunning ? { scale: 1.02, y: -2 } : {}}
                        whileTap={!isRunning ? { scale: 0.98 } : {}}
                        className={`p-6 border-2 rounded-2xl transition-all duration-300 ${
                          isRunning
                            ? 'border-blue-400 bg-gradient-to-br from-blue-50 to-blue-100 cursor-wait'
                            : isLastRun 
                            ? 'border-green-400 bg-gradient-to-br from-green-50 to-green-100 hover:border-green-500 cursor-pointer hover:shadow-lg' 
                            : 'border-slate-300 bg-gradient-to-br from-slate-50 to-gray-100 hover:border-slate-400 cursor-pointer hover:shadow-lg'
                        }`}
                        onClick={!isRunning ? () => runAnalysis(analysis) : undefined}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md ${
                            isRunning
                              ? 'bg-gradient-to-r from-blue-600 to-blue-700'
                              : isLastRun 
                              ? 'bg-gradient-to-r from-green-600 to-green-700' 
                              : 'bg-gradient-to-r from-slate-600 to-slate-700'
                          }`}>
                            {isRunning ? (
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                            ) : isLastRun ? (
                              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            ) : (
                              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                              </svg>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <p className="font-bold text-slate-800 text-lg">{analysis.course.course_code}</p>
                              {isRunning && (
                                <span className="px-3 py-1 bg-blue-200 text-blue-900 text-xs rounded-full font-bold border border-blue-300">
                                  Running...
                                </span>
                              )}
                              {isLastRun && !isRunning && (
                                <span className="px-3 py-1 bg-green-200 text-green-900 text-xs rounded-full font-bold border border-green-300">
                                  Just Run
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-slate-700 font-semibold mb-1">{analysis.course.name}</p>
                            <p className="text-sm text-slate-600 font-medium">
                              {isRunning ? 'Running Analysis...' : `${analysis.consultation_period} Period Analysis`}
                            </p>
                            <p className="text-xs text-slate-500 mt-2 font-medium">
                              {selectedSemester.school_year} - {selectedSemester.semester} Semester
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 bg-gradient-to-br from-slate-50 to-gray-100 rounded-2xl border-2 border-slate-200">
                  <div className="w-16 h-16 bg-gradient-to-r from-slate-200 to-slate-300 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                    <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <p className="text-slate-700 text-lg font-semibold mb-2">No analyses available</p>
                  <p className="text-slate-500 text-sm">This student may not have grades or consultation data for this semester with the selected teacher</p>
                </div>
              )}
            </div>
          )}
          </div>
        </div>
      </motion.section>

      {/* Overall Class Metrics */}
      {overallMetrics && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-12"
        >
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Class Consultation Impact</h3>
                  <p className="text-emerald-100">
                    Overall consultation effectiveness and student improvement metrics for {selectedSemester?.school_year} - {selectedSemester?.semester} Semester
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6">
            
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
          </div>
        </motion.section>
      )}

      {/* Note: Student grades are now handled by the comparative analysis endpoint */}



      {/* Note: Consultation history is now handled by the comparative analysis endpoint */}



      {/* Analysis Results */}
      {analysisResult && (
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-12"
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
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-[#0065A8] to-[#54BEFF] rounded-full flex items-center justify-center shadow-lg">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-3xl sm:text-4xl font-bold text-[#0065A8] mb-2">
                        Consultation Impact Results
                      </h3>
                      <p className="text-gray-600 text-sm sm:text-base">
                        Analysis of {analysisResult.student_name}'s performance in {analysisResult.course_code} before and after {analysisResult.consultation_period} consultation period
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handlePrint}
                    className="bg-gradient-to-r from-[#0065A8] to-[#004A7C] text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center gap-2 print:hidden"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    Print Report
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Consultation Impact Analysis - Full Width */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="max-w-6xl mx-auto mb-8 analysis-results-container"
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
                      Analysis for {analysisResult.student_name} in {analysisResult.course_code} ({analysisResult.course_name})
                    </p>
                    <p className="text-blue-200 text-xs sm:text-sm mt-1">
                      {analysisResult.consultation_period} Period • {analysisResult.school_year} - {analysisResult.semester} Semester
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 sm:p-8">
                {/* Course Information Card */}
                <div className="bg-gradient-to-br from-slate-50 to-gray-100 rounded-2xl p-6 border-2 border-slate-200 mb-8 shadow-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-r from-slate-600 to-slate-700 rounded-full flex items-center justify-center shadow-md">
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-2xl font-bold text-slate-800 mb-3">Subject Analysis Details</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 text-sm">
                        <div className="bg-white rounded-lg p-3 border border-slate-200">
                          <span className="font-semibold text-slate-600 block mb-1">Course</span>
                          <span className="text-slate-800 font-medium">{analysisResult.course_name}</span>
                          <span className="text-slate-600 text-xs block mt-1">Code: {analysisResult.course_code}</span>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-slate-200">
                          <span className="font-semibold text-slate-600 block mb-1">Student</span>
                          <span className="text-slate-800 font-medium">{analysisResult.student_name}</span>
                          <span className="text-slate-600 text-xs block mt-1">ID: {analysisResult.student_id}</span>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-slate-200">
                          <span className="font-semibold text-slate-600 block mb-1">Teacher</span>
                          <span className="text-slate-800 font-medium">{analysisResult.teacher_name}</span>
                          <span className="text-slate-600 text-xs block mt-1">ID: {analysisResult.teacher_id}</span>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-slate-200">
                          <span className="font-semibold text-slate-600 block mb-1">Analysis Period</span>
                          <span className="text-slate-800 font-medium">{analysisResult.consultation_period}</span>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-slate-200">
                          <span className="font-semibold text-slate-600 block mb-1">Semester</span>
                          <span className="text-slate-800 font-medium">{analysisResult.school_year} - {analysisResult.semester} Semester</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Consultation Status */}
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border-2 border-blue-300 shadow-lg">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center shadow-md">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                      <h4 className="text-xl font-bold text-blue-900">Consultation Status</h4>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-white rounded-lg p-4 border border-blue-200">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-semibold text-blue-800">Consultation Conducted:</span>
                          <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                            analysisResult.has_consultation 
                              ? 'bg-green-200 text-green-900 border border-green-300' 
                              : 'bg-red-200 text-red-900 border border-red-300'
                          }`}>
                            {analysisResult.has_consultation ? 'Yes' : 'No'}
                          </span>
                        </div>
                      </div>
                      {analysisResult.has_consultation && (
                        <div className="bg-white rounded-lg p-4 border border-blue-200">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-semibold text-blue-800">Number of Sessions:</span>
                            <span className="text-xl font-bold text-blue-900">{analysisResult.consultation_count}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Impact Assessment */}
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border-2 border-green-300 shadow-lg">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-green-700 rounded-full flex items-center justify-center shadow-md">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <h4 className="text-xl font-bold text-green-900">Impact Assessment</h4>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-white rounded-lg p-4 border border-green-200">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-semibold text-green-800">Consultation Impact:</span>
                          <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                            analysisResult.consultation_impact === 'High' 
                              ? 'bg-green-200 text-green-900 border border-green-300'
                              : analysisResult.consultation_impact === 'Moderate'
                              ? 'bg-yellow-200 text-yellow-900 border border-yellow-300'
                              : analysisResult.consultation_impact === 'Low'
                              ? 'bg-blue-200 text-blue-900 border border-blue-300'
                              : analysisResult.consultation_impact === 'Negative'
                              ? 'bg-red-200 text-red-900 border border-red-300'
                              : 'bg-gray-200 text-gray-900 border border-gray-300'
                          }`}>
                            {analysisResult.consultation_impact || 'None'}
                          </span>
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-green-200">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-semibold text-green-800">Significance:</span>
                          <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                            analysisResult.correlation_analysis?.consultation_significance === 'High'
                              ? 'bg-green-200 text-green-900 border border-green-300'
                              : analysisResult.correlation_analysis?.consultation_significance === 'Low'
                              ? 'bg-yellow-200 text-yellow-900 border border-yellow-300'
                              : 'bg-gray-200 text-gray-900 border border-gray-300'
                          }`}>
                            {analysisResult.correlation_analysis?.consultation_significance || 'Unknown'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Effectiveness Analysis */}
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border-2 border-purple-300 shadow-lg">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-purple-700 rounded-full flex items-center justify-center shadow-md">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                      <h4 className="text-xl font-bold text-purple-900">Effectiveness Analysis</h4>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-white rounded-lg p-4 border border-purple-200">
                        <p className="text-purple-800 leading-relaxed text-sm font-medium">
                          {analysisResult.consultation_effectiveness}
                        </p>
                      </div>
                      {analysisResult.correlation_analysis?.consultation_to_improvement && (
                        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                          <div className="flex items-center gap-2 text-sm text-green-800 font-semibold">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Strong correlation between consultation and improvement observed</span>
                          </div>
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
                        {analysisResult.course_code} • {analysisResult.before_period} → {analysisResult.after_period}
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
                      className="bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl p-6 text-center border-2 border-slate-300 shadow-lg"
                    >
                      <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center shadow-md">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <p className="text-sm font-semibold text-slate-700">Before ({analysisResult.before_period})</p>
                      </div>
                      <p className="text-5xl font-bold text-slate-900">
                        {analysisResult.before_grade}
                      </p>
                    </motion.div>
                      
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 }}
                      className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl p-6 text-center border-2 border-blue-400 shadow-lg"
                    >
                      <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center shadow-md">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <p className="text-sm font-semibold text-blue-800">After ({analysisResult.after_period})</p>
                      </div>
                      <p className="text-5xl font-bold text-blue-900">
                        {analysisResult.after_grade}
                      </p>
                    </motion.div>
                  </div>

                  {/* Improvement Summary */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className={`rounded-2xl p-6 text-center border-2 shadow-lg ${
                      analysisResult.improvement_status === 'Improved' 
                        ? 'bg-gradient-to-br from-green-100 to-green-200 border-green-400'
                        : analysisResult.improvement_status === 'Declined'
                        ? 'bg-gradient-to-br from-red-100 to-red-200 border-red-400'
                        : 'bg-gradient-to-br from-gray-100 to-gray-200 border-gray-400'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-3 mb-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md ${
                        analysisResult.improvement_status === 'Improved' 
                          ? 'bg-gradient-to-r from-green-600 to-green-700'
                          : analysisResult.improvement_status === 'Declined'
                          ? 'bg-gradient-to-r from-red-600 to-red-700'
                          : 'bg-gradient-to-r from-gray-600 to-gray-700'
                      }`}>
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {analysisResult.improvement_status === 'Improved' ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        ) : analysisResult.improvement_status === 'Declined' ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        )}
                        </svg>
                      </div>
                      <p className={`text-sm font-semibold ${
                        analysisResult.improvement_status === 'Improved' 
                          ? 'text-green-800'
                          : analysisResult.improvement_status === 'Declined'
                          ? 'text-red-800'
                          : 'text-gray-800'
                      }`}>
                        {analysisResult.improvement_status}
                      </p>
                    </div>
                    <p className={`text-4xl font-bold ${
                      analysisResult.improvement_status === 'Improved' 
                        ? 'text-green-900'
                        : analysisResult.improvement_status === 'Declined'
                        ? 'text-red-900'
                        : 'text-gray-900'
                    }`}>
                      {analysisResult.improvement_points > 0 ? '+' : ''}{analysisResult.improvement_points} points
                    </p>
                    <p className={`text-sm mt-2 font-semibold ${
                      analysisResult.improvement_status === 'Improved' 
                        ? 'text-green-800'
                        : analysisResult.improvement_status === 'Declined'
                        ? 'text-red-800'
                        : 'text-gray-800'
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
                        {analysisResult.course_code} grade progression visualization
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
                            label: `${analysisResult.course_code} Grade`,
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
        </motion.section>
      )}
        </motion.div>
      </div>
    </div>
  );
}

export default ComparativeAnalysis;