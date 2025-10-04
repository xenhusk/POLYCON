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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Section with Enhanced Design */}
      <ComparativeAnalysisHeader
        openSelectionModal={openSelectionModal}
        allFieldsProvided={allFieldsProvided}
      />

      {/* Enhanced Student Grades Section */}
      {allFieldsProvided && grades.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          {/* Section Header with Enhanced Design */}
          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-[#0065A8] to-transparent opacity-30"></div>
            </div>
            <div className="relative flex items-center justify-center">
              <div className="bg-white px-8 py-4 rounded-2xl shadow-lg border border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#0065A8] to-[#54BEFF] rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-[#0065A8]">Student Grades</h3>
                    <p className="text-sm text-gray-600">Academic performance across all terms</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Enhanced Mobile Card View */}
          <div className="block sm:hidden space-y-6">
            {grades.map((grade, idx) => (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300"
              >
                <div className="text-center mb-6">
                  <h4 className="text-xl font-bold text-[#0065A8] mb-2">{grade.course}</h4>
                  <div className="h-1 w-16 bg-gradient-to-r from-[#0065A8] to-[#54BEFF] rounded-full mx-auto"></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center border border-blue-200">
                    <div className="text-xs font-medium text-blue-600 mb-2 uppercase tracking-wide">Prelim</div>
                    <div className="text-2xl font-bold text-blue-800">{grade.Prelim || '-'}</div>
                  </div>
                  <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-4 text-center border border-indigo-200">
                    <div className="text-xs font-medium text-indigo-600 mb-2 uppercase tracking-wide">Midterm</div>
                    <div className="text-2xl font-bold text-indigo-800">{grade.Midterm || '-'}</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 text-center border border-purple-200">
                    <div className="text-xs font-medium text-purple-600 mb-2 uppercase tracking-wide">Pre-Final</div>
                    <div className="text-2xl font-bold text-purple-800">{grade["Pre-Final"] || '-'}</div>
                  </div>
                  <div className="bg-gradient-to-br from-[#0065A8] to-[#54BEFF] text-white rounded-xl p-4 text-center shadow-lg">
                    <div className="text-xs font-medium text-blue-100 mb-2 uppercase tracking-wide">Final</div>
                    <div className="text-2xl font-bold">{grade.Final || '-'}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Enhanced Desktop Table View */}
          <div className="hidden sm:block">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
              <div className="bg-gradient-to-r from-[#0065A8] to-[#54BEFF] px-6 py-4">
                <h4 className="text-lg font-semibold text-white">Grade Summary</h4>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Subject</th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Prelim</th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Midterm</th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Pre-Final</th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Final</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {grades.map((grade, idx) => (
                      <motion.tr
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className={idx % 2 === 0 ? "bg-white hover:bg-gray-50" : "bg-gray-50 hover:bg-gray-100"}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-gradient-to-r from-[#0065A8] to-[#54BEFF] rounded-full mr-3"></div>
                            <span className="text-sm font-medium text-gray-900">{grade.course}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                            {grade.Prelim || '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                            {grade.Midterm || '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                            {grade["Pre-Final"] || '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-gradient-to-r from-[#0065A8] to-[#54BEFF] text-white shadow-sm">
                            {grade.Final || '-'}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </motion.div>
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
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center px-4"
        >
          <div className="relative inline-block">
            {/* Background Glow Effect */}
            <div className={`absolute inset-0 rounded-2xl blur-lg transition-all duration-500 ${
              isRunningAnalysis 
                ? 'bg-gradient-to-r from-gray-400 to-gray-500 opacity-30' 
                : 'bg-gradient-to-r from-[#00D1B2] to-[#00B4B4] opacity-40'
            }`}></div>
            
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
                    <span>Run Improvement Analysis</span>
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
            Generate comprehensive improvement insights based on grade progression, consultation quality, and academic events
          </motion.p>
        </motion.div>
      )}

      {/* Enhanced Analysis Results Section */}
      {analysisResult && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-16 mb-20 px-2 sm:px-0"
        >
          {/* Enhanced Header */}
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
                      Improvement Analysis Results
                    </h3>
                    <p className="text-gray-600 text-sm sm:text-base">
                      Comprehensive learning progress and growth insights
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Enhanced Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
            {/* Student Improvement Card */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.02, y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 transition-all duration-500 hover:shadow-2xl"
            >
              <div className="bg-gradient-to-br from-[#397de2] via-[#54BEFF] to-[#0065A8] p-6 sm:p-8 relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-16 translate-x-16"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-12 -translate-x-12"></div>
                </div>
                
                <div className="relative flex flex-col sm:flex-row items-start justify-between gap-4 sm:gap-0">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                      </div>
                      <h4 className="text-2xl sm:text-3xl font-bold text-white">
                        Student Improvement
                      </h4>
                    </div>
                    <p className="text-blue-100 text-sm sm:text-base">
                      Learning Progress & Growth Analysis
                    </p>
                  </div>
                  <motion.span
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.5, type: "spring" }}
                    className={`px-4 sm:px-6 py-3 rounded-2xl text-white text-sm sm:text-base font-semibold whitespace-nowrap shadow-lg ${
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
                  </motion.span>
                </div>
              </div>

              {/* Enhanced Student Info & Performance Metrics */}
              <div className="p-6 sm:p-8 space-y-6 sm:space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-4 sm:p-6 text-center sm:text-left border border-gray-200 hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-[#0065A8] rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <p className="text-sm font-medium text-gray-600">Student ID</p>
                    </div>
                    <p className="text-lg sm:text-xl font-bold text-gray-800">
                      {analysisResult.student_id}
                    </p>
                  </motion.div>
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4 sm:p-6 text-center sm:text-right border border-blue-200 hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex items-center justify-end gap-3 mb-3">
                      <p className="text-sm font-medium text-blue-600">Overall Score</p>
                      <div className="w-8 h-8 bg-gradient-to-r from-[#0065A8] to-[#54BEFF] rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                    </div>
                    <p className="text-2xl sm:text-3xl font-bold text-[#0065A8]">
                      {(analysisResult.overall_score * 100).toFixed(0)}%
                    </p>
                  </motion.div>
                </div>

                {/* Enhanced Improvement Progress Bars */}
                <div className="space-y-6">
                  {/* Overall Factor Bar */}
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 }}
                    className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-5 sm:p-6 border border-purple-200 hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </div>
                        <span className="text-sm sm:text-base font-semibold text-purple-700">
                          Overall Factor
                        </span>
                      </div>
                      <span className="text-lg sm:text-xl font-bold text-purple-800">
                        {(analysisResult.overall_score * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="relative h-3 bg-purple-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: `${analysisResult.overall_score * 100}%`,
                        }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="absolute h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full shadow-sm"
                      />
                    </div>
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.9 }}
                    className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-5 sm:p-6 border border-blue-200 hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                        <span className="text-sm sm:text-base font-semibold text-blue-700">
                          Baseline Factor
                        </span>
                      </div>
                      <span className="text-lg sm:text-xl font-bold text-blue-800">
                        {analysisResult.baseline_factor}
                      </span>
                    </div>
                    <div className="relative h-3 bg-blue-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: `${analysisResult.baseline_factor * 75}%`,
                        }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="absolute h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full shadow-sm"
                      />
                    </div>
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.0 }}
                    className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-5 sm:p-6 border border-green-200 hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <span className="text-sm sm:text-base font-semibold text-green-700">
                          Consistency Factor
                        </span>
                      </div>
                      <span className="text-lg sm:text-xl font-bold text-green-800">
                        {analysisResult.consistency_factor}
                      </span>
                    </div>
                    <div className="relative h-3 bg-green-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: `${analysisResult.consistency_factor * 100}%`,
                        }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="absolute h-full bg-gradient-to-r from-green-600 to-green-400 rounded-full shadow-sm"
                      />
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Enhanced Grade Progression Card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.02, y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 transition-all duration-500 hover:shadow-2xl"
            >
              <div className="bg-gradient-to-br from-[#fc6969] via-[#ff8f8f] to-[#ff6b6b] p-6 sm:p-8 relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-y-16 -translate-x-16"></div>
                  <div className="absolute bottom-0 right-0 w-24 h-24 bg-white rounded-full translate-y-12 translate-x-12"></div>
                </div>
                
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
                    <p className="text-red-100 mt-1 text-sm sm:text-base">
                      Term-by-Term Progress Analysis
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-6 sm:p-8">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mb-8"
                >
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-4 sm:p-6 border border-gray-200">
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
                              color: "rgba(0, 0, 0, 0.08)",
                              lineWidth: 1,
                            },
                            ticks: {
                              font: { size: 12 },
                              color: "#6B7280",
                            },
                          },
                          x: {
                            grid: { display: false },
                            ticks: {
                              font: { size: 12, weight: 'bold' },
                              color: "#374151",
                            },
                          },
                        },
                      }}
                    />
                  </div>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                  className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 sm:p-8 text-center border border-gray-200 hover:shadow-md transition-all duration-300"
                >
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      analysisResult.grade_improvement > 0
                        ? "bg-gradient-to-r from-green-500 to-green-600"
                        : analysisResult.grade_improvement < 0
                        ? "bg-gradient-to-r from-red-500 to-red-600"
                        : "bg-gradient-to-r from-gray-500 to-gray-600"
                    }`}>
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {analysisResult.grade_improvement > 0 ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                        ) : analysisResult.grade_improvement < 0 ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        )}
                      </svg>
                    </div>
                    <p className="text-lg font-semibold text-gray-700">Grade Improvement</p>
                  </div>
                  <p
                    className={`text-3xl sm:text-4xl font-bold ${
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
                  <p className="text-sm text-gray-500 mt-2">
                    {analysisResult.grade_improvement > 0 
                      ? "Positive improvement trend" 
                      : analysisResult.grade_improvement < 0 
                      ? "Needs attention" 
                      : "Stable performance"}
                  </p>
                </motion.div>
              </div>
            </motion.div>

            {/* Enhanced Academic Events Impact Card */}
            {analysisResult.academic_events?.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02, y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 transition-all duration-500 hover:shadow-2xl"
              >
                <div className="bg-gradient-to-br from-[#00D1B2] via-[#00B4B4] to-[#00A0A0] p-6 sm:p-8 relative overflow-hidden">
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-16 translate-x-16"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-12 -translate-x-12"></div>
                  </div>
                  
                  <div className="relative flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-2xl sm:text-3xl font-bold text-white">
                        Academic Events Impact
                      </h4>
                      <p className="text-teal-100 mt-1 text-sm sm:text-base">
                        Event Participation Analysis
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-6 sm:p-8">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="h-[400px] w-full flex items-center justify-center mb-8"
                  >
                    <div className="w-[300px] h-[300px] bg-gradient-to-br from-teal-50 to-teal-100 rounded-2xl p-4 border border-teal-200">
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
                              borderWidth: 2,
                              borderColor: "#ffffff",
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
                                font: { size: 12, weight: 'bold' },
                                color: '#374151',
                              },
                            },
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
                        }}
                      />
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-2xl p-6 sm:p-8 text-center border border-teal-200 hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex items-center justify-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-[#00D1B2] to-[#00B4B4] rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                      </div>
                      <p className="text-lg font-semibold text-teal-800">Average Impact Rating</p>
                    </div>
                    <p className="text-3xl sm:text-4xl font-bold text-teal-600 mb-2">
                      {(analysisResult.average_event_impact * 5).toFixed(1)}/5
                    </p>
                    <p className="text-sm text-teal-600">
                      {analysisResult.academic_events.length} event{analysisResult.academic_events.length !== 1 ? 's' : ''} analyzed
                    </p>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {/* Enhanced Performance Metrics Radar Card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.02, y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 transition-all duration-500 hover:shadow-2xl"
            >
              <div className="bg-gradient-to-br from-[#0065A8] via-[#54BEFF] to-[#397de2] p-6 sm:p-8 relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-y-16 -translate-x-16"></div>
                  <div className="absolute bottom-0 right-0 w-24 h-24 bg-white rounded-full translate-y-12 translate-x-12"></div>
                </div>
                
                <div className="relative flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-2xl sm:text-3xl font-bold text-white">
                      Improvement Metrics
                    </h4>
                    <p className="text-blue-100 mt-1 text-sm sm:text-base">
                      Comprehensive Learning Progress Analysis
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-6 sm:p-8">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="min-h-[420px] w-full p-4 flex items-center justify-center mb-8"
                >
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200 w-full min-h-[400px] flex flex-col items-center justify-center">
                    <PerformanceRadarChart
                      metricsData={{
                        normalizedImprovement:
                          analysisResult.normalized_improvement,
                        averageEventImpact: analysisResult.average_event_impact,
                        consultationQuality: analysisResult.consultation_quality,
                      }}
                    />
                  </div>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 sm:p-8 border border-blue-200 hover:shadow-md transition-all duration-300"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300"
                    >
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                      </div>
                      <p className="text-sm font-semibold text-blue-600 mb-2">Improvement</p>
                      <p className="text-2xl font-bold text-blue-700">
                        {(analysisResult.normalized_improvement * 100).toFixed(0)}%
                      </p>
                    </motion.div>
                    
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 }}
                      className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300"
                    >
                      <div className="w-12 h-12 bg-gradient-to-r from-[#00D1B2] to-[#00B4B4] rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      </div>
                      <p className="text-sm font-semibold text-teal-600 mb-2">Event Impact</p>
                      <p className="text-2xl font-bold text-teal-700">
                        {(analysisResult.average_event_impact * 100).toFixed(0)}%
                      </p>
                    </motion.div>
                    
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 }}
                      className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300"
                    >
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                      <p className="text-sm font-semibold text-purple-600 mb-2">Consultation</p>
                      <p className="text-2xl font-bold text-purple-700">
                        {(analysisResult.consultation_quality * 100).toFixed(0)}%
                      </p>
                    </motion.div>
                  </div>
                </motion.div>
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

            {/* Modal Body */}
            <div className="p-8 space-y-8 max-h-[60vh] overflow-y-auto">
              {/* Semester Selection */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-white/20"
              >
                <label className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <div className="w-6 h-6 bg-gradient-to-r from-[#0065A8] to-[#057DCD] rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  Select Semester *
                </label>
                <select
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0065A8] focus:border-[#0065A8] transition-all duration-200 bg-white shadow-sm"
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
              </motion.div>

              {/* Teacher Display */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-white/20"
              >
                <label className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <div className="w-6 h-6 bg-gradient-to-r from-[#057DCD] to-[#54BEFF] rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  Teacher *
                </label>
                <div className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 font-medium shadow-sm">
                  {teachers[0]?.fullName || "Loading..."}
                </div>
              </motion.div>

              {/* Student Search with Profile Photos */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="relative bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-white/20"
                style={{ zIndex: 100 }}
              >
                <label className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <div className="w-6 h-6 bg-gradient-to-r from-[#54BEFF] to-[#0065A8] rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  Select Student *
                </label>
                
                {/* Selected Student Display */}
                {tempStudent && selectedStudentData && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-xl mb-4 shadow-sm"
                  >
                    <img
                      src={getProfilePictureUrl(
                        selectedStudentData.profilePicture, 
                        selectedStudentData.firstName || selectedStudentData.name || 'Student'
                      )}
                      alt={`${selectedStudentData.firstName || selectedStudentData.name || ''} ${selectedStudentData.lastName || ''}`.trim()}
                      className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                    />
                    <div className="flex-1">
                      <div className="font-bold text-gray-900">
                        {`${selectedStudentData.firstName || selectedStudentData.name || ''} ${selectedStudentData.lastName || ''}`.trim()}
                      </div>
                      <div className="text-sm text-gray-600">
                        ID: {selectedStudentData.studentID || selectedStudentData.id}
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      type="button"
                      onClick={() => {
                        setTempStudentName("");
                        setTempStudent("");
                        setSelectedStudentData(null);
                        setTempCourse("");
                      }}
                      className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </motion.button>
                  </motion.div>
                )}
                
                {/* Search Input - Only show when no student is selected */}
                {!tempStudent && (
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search student by name..."
                      value={tempStudentName}
                      onChange={handleStudentNameChange}
                      disabled={!tempSemester || !tempTeacher}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#0065A8] focus:border-[#0065A8] disabled:bg-gray-100 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                )}

                {/* Search Results Dropdown */}
                {!tempStudent && filteredStudents.length > 0 && (
                  <motion.ul 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute z-[9999] bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl mt-2 max-h-48 overflow-y-auto w-full shadow-xl"
                    style={{ 
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      marginTop: '0.5rem',
                      zIndex: 9999
                    }}
                  >
                    {filteredStudents.map((student, index) => (
                      <motion.li
                        key={student.studentID || student.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => handleStudentSelect(student)}
                        className="px-4 py-3 cursor-pointer hover:bg-blue-50 text-sm flex items-center gap-3 transition-colors border-b border-gray-100 last:border-b-0"
                      >
                        <img
                          src={getProfilePictureUrl(
                            student.profilePicture, 
                            student.firstName || student.name || 'Student'
                          )}
                          alt={`${student.firstName || student.name || ''} ${student.lastName || ''}`.trim()}
                          className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                        />
                        <div className="flex-1">
                          <div className="font-semibold text-gray-800">
                            {`${student.firstName || student.name || ''} ${student.lastName || ''}`.trim()}
                          </div>
                          <div className="text-xs text-gray-500">
                            ID: {student.studentID || student.id}
                          </div>
                        </div>
                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </motion.li>
                    ))}
                  </motion.ul>
                )}

                {/* Loading message */}
                {isLoadingStudents && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 mt-3">
                    <div className="w-4 h-4 border-2 border-[#0065A8] border-t-transparent rounded-full animate-spin"></div>
                    Loading students...
                  </div>
                )}
              </motion.div>

              {/* Course Selection */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-white/20"
                style={{ zIndex: 10 }}
              >
                <label className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <div className="w-6 h-6 bg-gradient-to-r from-[#0065A8] to-[#057DCD] rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  Select Course *
                </label>
                <select
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0065A8] focus:border-[#0065A8] transition-all duration-200 bg-white shadow-sm"
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
              </motion.div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 flex gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSelectionModalDone}
                disabled={!(tempSemester && tempTeacher && tempStudent && tempCourse)}
                className={`flex-1 py-4 text-center justify-center rounded-xl transition-all duration-200 flex items-center gap-3 text-sm font-semibold shadow-lg ${
                  tempSemester && tempTeacher && tempStudent && tempCourse
                    ? 'bg-gradient-to-r from-[#0065A8] to-[#057DCD] hover:shadow-xl text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Apply Selection
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowSelectionModal(false)}
                className="flex-1 py-4 text-gray-700 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 text-sm font-semibold shadow-lg flex items-center justify-center gap-3"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancel
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

