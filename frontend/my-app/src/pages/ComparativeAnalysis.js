import React, { useState, useEffect } from "react";
import { getProfilePictureUrl } from "../utils/utils";
import { motion, AnimatePresence } from "framer-motion";
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

function ComparativeAnalysis() {
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

  // Animation variants for modal
  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
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
    fetch("http://localhost:5001/semester/get_semester_options")
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
        `http://localhost:5001/polycon-analysis/get_teacher_students?teacherID=${selectedTeacher}&schoolYear=${selectedSemester.school_year}&semester=${selectedSemester.semester}`
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
        `http://localhost:5001/polycon-analysis/get_grades_by_period?${gradeParams}`
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
        `http://localhost:5001/polycon-analysis/get_consultation_history?${sessionParams}`
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
        `http://localhost:5001/polycon-analysis/get_teacher_students?teacherID=${tempTeacher}`
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
        `http://localhost:5001/polycon-analysis/get_grades_by_period?${params}`
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
        `http://localhost:5001/polycon-analysis/get_teacher_students?teacherID=${tempTeacher}&schoolYear=${tempSemester.school_year}&semester=${tempSemester.semester}`
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

  // Open the selection modal and initialize temporary fields from current selections (if any)
  const openSelectionModal = () => {
    setTempSemester(selectedSemester);
    setTempTeacher(selectedTeacher);
    setTempStudent(selectedStudents.length === 1 ? selectedStudents[0] : "");
    setTempCourse(selectedCourse);
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
      // Use the full grades array fetched earlier
      const payload = {
        student_id: selectedStudents[0],
        grades_by_period: grades, // send entire array of course grades
        academic_events: academicEvents,
      };
      fetch("http://localhost:5001/comparative/compare_student", {
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
        })
        .catch((err) =>
          console.error("Error running comparative analysis:", err)
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
    <div className="p-6 bg-gradient-to-b from-white to-gray-50 min-h-screen">
      {/* Header Section with Enhanced Design */}
      <ComparativeAnalysisHeader
        openSelectionModal={openSelectionModal}
        allFieldsProvided={allFieldsProvided}
      />

      {/* Display Grades Table */}
      {allFieldsProvided && grades.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <h3 className="text-xl font-bold text-[#0065A8]">Student Grades</h3>
            <div className="h-0.5 flex-grow ml-4 bg-gradient-to-r from-[#0065A8] to-transparent"></div>
          </div>
          <div className="overflow-x-auto bg-white rounded-xl shadow-md">
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

      {allFieldsProvided && grades.length > 0 && (
        <div className="mb-10 text-center">
          <button
            onClick={runComparativeAnalysis}
            className="px-6 py-3 bg-[#00D1B2] text-white rounded-lg hover:bg-opacity-90 transition shadow-md transform hover:scale-105 duration-300 font-medium flex items-center mx-auto"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm2 10a1 1 0 10-2 0v3a1 1 0 102 0v-3zm4-1a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1zm-2-8a1 1 0 00-1 1v.01a1 1 0 002 0V4a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            Run Polycon Analysis
          </button>
        </div>
      )}

      {/* Analysis Results Section */}
      {analysisResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-12 mb-16"
        >
          {/* Header */}
          <motion.div
            className="relative mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="absolute inset-0 flex items-center">
              <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-[#0065A8] to-transparent opacity-30"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-8 py-3 rounded-full shadow-sm">
                <h3 className="text-3xl font-bold text-[#0065A8]">
                  Analysis Results
                </h3>
              </span>
            </div>
          </motion.div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Student Performance Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.01 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 transition-all duration-300"
            >
              <div className="bg-gradient-to-r from-[#397de2] to-[#54BEFF] p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-2xl font-bold text-white">
                      Student Performance
                    </h4>
                    <p className="text-blue-100 mt-1 text-sm">
                      Academic Achievement Analysis
                    </p>
                  </div>
                  <span
                    className={`px-4 py-2 rounded-full text-white text-sm font-medium ${
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
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-sm text-gray-500">Student ID</p>
                    <p className="text-lg font-semibold text-gray-800">
                      {analysisResult.student_id}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 text-right">
                    <p className="text-sm text-gray-500">Overall Score</p>
                    <p className="text-2xl font-bold text-[#397de2]">
                      {(analysisResult.overall_score * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>

                {/* Performance Progress Bars */}
                <div className="space-y-4">
                  {/* Add Overall Factor Bar */}
                  <div className="bg-purple-50 rounded-xl p-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-purple-700">
                        Overall Factor
                      </span>
                      <span className="text-sm font-bold text-purple-700">
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
                  Term-by-Term Performance
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
                  Performance Metrics
                </h4>
                <p className="text-blue-100 mt-1 text-sm">
                  Comprehensive Performance Analysis
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
                    <p className="text-gray-700">Congratulations on an excellent performance! Continue with your current strategies, and consider mentoring other students.</p>
                  )}
                  {analysisResult.rating === "Very Good" && (
                    <p className="text-gray-700">You're performing very well! Focus on maintaining consistency and explore more advanced concepts in your studies.</p>
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

      {/* Selection Modal */}
      <AnimatePresence>
        {showSelectionModal && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowSelectionModal(false)}
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-semibold mb-4 text-[#0065A8]">
                Select Analysis Options
              </h2>

              {/* Semester Dropdown */}
              <div className="mb-4">
                <label className="block text-gray-700 mb-1">
                  Select Semester:
                </label>
                <select
                  className="w-full px-3 py-2 border-2 border-[#0065A8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#54BEFF]"
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
                    setTempStudent(""); // Clear selected student when semester changes
                    setTempCourse(""); // Clear selected course when semester changes
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
              <div className="mb-4">
                <label className="block text-gray-700 mb-1">Teacher:</label>
                <div className="w-full px-3 py-2 border-2 border-[#0065A8] rounded-lg ">
                  {teachers[0]?.fullName || "Loading..."}
                </div>
              </div>

              {/* Student Dropdown */}
              <div className="mb-4">
                <label className="block text-gray-700 mb-1">
                  Select Student:
                </label>
                <select
                  className="w-full px-3 py-2 border-2 border-[#0065A8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#54BEFF]"
                  value={tempStudent}
                  onChange={(e) => {
                    setTempStudent(e.target.value);
                    setTempCourse("");
                  }}
                  disabled={
                    !tempTeacher || !tempSemester || tempStudents.length === 0
                  }
                >
                  <option value="">Select a student</option>
                  {isLoadingStudents ? (
                    <option value="" disabled>
                      Loading students...
                    </option>
                  ) : (
                    Array.isArray(tempStudents) &&
                    tempStudents.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.firstName} {student.lastName}
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Course Dropdown */}
              <div className="mb-4">
                <label className="block text-gray-700 mb-1">
                  Select Course:
                </label>
                <select
                  className="w-full px-3 py-2 border-2 border-[#0065A8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#54BEFF]"
                  value={tempCourse}
                  onChange={(e) => setTempCourse(e.target.value)}
                  disabled={!tempStudent || availableCourses.length === 0}
                >
                  <option value="">-- Choose a course --</option>
                  {availableCourses.map((course, index) => (
                    <option key={index} value={course}>
                      {course}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end mt-4">
                <button
                  onClick={handleSelectionModalDone}
                  className="px-4 py-2 bg-[#0065A8] text-white rounded-lg hover:bg-[#54BEFF] transition"
                  disabled={
                    !(tempSemester && tempTeacher && tempStudent && tempCourse)
                  }
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ComparativeAnalysis;
