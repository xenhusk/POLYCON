import React, { useState, useEffect } from 'react';
import { getProfilePictureUrl } from '../utils/utils';
import { motion, AnimatePresence } from 'framer-motion';
// Add Chart.js and required components
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, RadialLinearScale, PointElement, LineElement, Filler } from 'chart.js';
import { Pie, Bar, Radar } from 'react-chartjs-2';
import PerformanceRadarChart from '../components/PerformanceRadarChart';

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
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
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
  const [tempTeacher, setTempTeacher] = useState('');
  const [tempStudent, setTempStudent] = useState('');
  const [tempCourse, setTempCourse] = useState('');
  const [tempStudents, setTempStudents] = useState([]); // students list for the chosen teacher

  // Animation variants for modal
  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
    exit: { opacity: 0, scale: 0.8, y: 20, transition: { duration: 0.3 } }
  };

  // On mount, fetch semesters and teachers
  useEffect(() => {
    // Fetch semester options
    fetch('http://localhost:5001/semester/get_semester_options')
      .then(res => res.json())
      .then(data => {
        setSemesters(data);
        if (data.length > 0) {
          // Optionally, you can preselect the latest semester
          setSelectedSemester(data[0]);
        }
      })
      .catch(err => console.error('Error fetching semesters:', err));

    // Fetch all teachers for dropdown
    fetch('http://localhost:5001/bookings/get_teachers')
      .then(res => res.json())
      .then(data => setTeachers(data))
      .catch(err => console.error('Error fetching teachers:', err));
  }, []);

  // When a teacher is selected in the main state, fetch the students list
  useEffect(() => {
    if (selectedTeacher) {
      fetch(`http://localhost:5001/polycon-analysis/get_teacher_students?teacherID=${selectedTeacher}`)
        .then(res => res.json())
        .then(data => setStudents(data))
        .catch(err => console.error('Error fetching students:', err));
    }
  }, [selectedTeacher]);

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
        course: selectedCourse
      });
  
      fetch(`http://localhost:5001/polycon-analysis/get_grades_by_period?${gradeParams}`)
        .then(res => res.json())
        .then(data => setGrades(data))
        .catch(err => console.error('Error fetching grades:', err));
  
      const sessionParams = new URLSearchParams({
        studentID: studentId,
        teacherID: selectedTeacher,
        schoolYear: selectedSemester.school_year,
        semester: selectedSemester.semester
      });
      
      fetch(`http://localhost:5001/polycon-analysis/get_consultation_history?${sessionParams}`)
        .then(res => res.json())
        .then(data => setSessions(data))
        .catch(err => console.error('Error fetching sessions:', err));
    } else {
      setGrades([]);
      setSessions([]);
    }
  }, [selectedTeacher, selectedStudents, selectedSemester, selectedCourse]);

  // When a teacher is chosen in the modal, fetch the students for that teacher
  useEffect(() => {
    if (tempTeacher) {
      fetch(`http://localhost:5001/polycon-analysis/get_teacher_students?teacherID=${tempTeacher}`)
        .then(res => res.json())
        .then(data => setTempStudents(data))
        .catch(err => console.error('Error fetching students:', err));
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
        course: ""
      });
      fetch(`http://localhost:5001/polycon-analysis/get_grades_by_period?${params}`)
        .then(res => res.json())
        .then(data => {
          const courses = data.map(item => item.course);
          const uniqueCourses = [...new Set(courses)];
          setAvailableCourses(uniqueCourses);
        })
        .catch(err => console.error('Error fetching available courses:', err));
    } else {
      setAvailableCourses([]);
    }
  }, [showSelectionModal, tempTeacher, tempStudent, tempSemester]);

  // Open the selection modal and initialize temporary fields from current selections (if any)
  const openSelectionModal = () => {
    setTempSemester(selectedSemester);
    setTempTeacher(selectedTeacher);
    setTempStudent(selectedStudents.length === 1 ? selectedStudents[0] : '');
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
    selectedSemester && selectedTeacher && selectedStudents.length === 1 && selectedCourse.trim() !== "";

  // Update function to add an academic event with a name and rating (1-5)
  const addAcademicEvent = () => {
    if (academicEventName && academicEventRating) {
      setAcademicEvents([...academicEvents, { name: academicEventName, rating: academicEventRating }]);
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
      const grade = grades[0]; // Using first grade record
      const payload = {
        student_id: selectedStudents[0],
        grades: {
          prelim: grade.Prelim,
          midterm: grade.Midterm,
          prefinals: grade['Pre-Final'],
          finals: grade.Final
        },
        academic_events: academicEvents
      };
      fetch('http://localhost:5001/comparative/compare_student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      .then(res => res.json())
      .then(data => {
        // Cap the normalized improvement at 0.5
        data.normalized_improvement = Math.min(0.5, data.normalized_improvement);
        setAnalysisResult(data);
      })
      .catch(err => console.error('Error running comparative analysis:', err));
    }
  };

  // Function to generate colors for charts
  const generateColors = (count) => {
    const baseColors = [
      'rgba(54, 162, 235, 0.7)', // blue
      'rgba(255, 99, 132, 0.7)', // red
      'rgba(75, 192, 192, 0.7)', // green
      'rgba(255, 159, 64, 0.7)', // orange
      'rgba(153, 102, 255, 0.7)', // purple
    ];
    
    return Array(count).fill().map((_, i) => baseColors[i % baseColors.length]);
  };

  return (
    <div className="p-6 bg-gradient-to-b from-white to-gray-50 min-h-screen">
      <div className="mb-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-[#0065A8]">Comparative Analysis</h2>
        <p className="text-gray-500 mt-2">Analyze student performance and academic progress</p>
      </div>

      {/* Button to open the selection modal */}
      <div className="mb-8 text-center">
        <button 
          onClick={openSelectionModal}
          className="px-6 py-3 bg-[#0065A8] text-white rounded-lg hover:bg-[#54BEFF] transition-all transform hover:scale-105 duration-300 shadow-md"
        >
          <span className="flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Select Analysis Options
          </span>
        </button>
      </div>

      {/* Prompt if not all fields are provided */}
      {!allFieldsProvided && (
        <div className="text-center text-gray-500 my-10 p-8 bg-white rounded-xl shadow-sm border border-gray-100">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-[#0065A8] mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-lg">Please select a semester, teacher, student, and course to view the analysis.</p>
        </div>
      )}

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
                  <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-blue-50"}>
                    <td className="border-b border-gray-200 px-4 py-3 font-medium">{grade.course}</td>
                    <td className="border-b border-gray-200 px-4 py-3">{grade.Prelim}</td>
                    <td className="border-b border-gray-200 px-4 py-3">{grade.Midterm}</td>
                    <td className="border-b border-gray-200 px-4 py-3">{grade['Pre-Final']}</td>
                    <td className="border-b border-gray-200 px-4 py-3 font-semibold">{grade.Final}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Display Consultation History */}
      {allFieldsProvided && sessions.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <h3 className="text-xl font-bold text-[#0065A8]">Consultation History</h3>
            <div className="h-0.5 flex-grow ml-4 bg-gradient-to-r from-[#0065A8] to-transparent"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sessions.map((session, idx) => (
              <div 
                key={idx} 
                className="bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition-shadow transform hover:-translate-y-1 duration-300 border-l-4 border-[#397de2]"
              >
                <div className="flex justify-between mb-3">
                  <span className="font-bold text-[#0065A8]">{new Date(session.session_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  <span className="text-sm text-gray-500">Teacher: {session.teacher_name || "Unknown"}</span>
                </div>
                <p className="text-gray-700 mb-2"><span className="font-semibold">Student:</span> {session.student_name || "Unknown"}</p>
                <p className="text-gray-700 mb-2"><span className="font-semibold">Concern:</span> {session.concern}</p>
                <p className="text-gray-700"><span className="font-semibold">Outcome:</span> {session.outcome}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Section for Academic Events */}
      {allFieldsProvided && (
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <h3 className="text-xl font-bold text-[#0065A8]">Academic Events</h3>
            <div className="h-0.5 flex-grow ml-4 bg-gradient-to-r from-[#0065A8] to-transparent"></div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                value={academicEventName}
                onChange={(e) => setAcademicEventName(e.target.value)}
                placeholder="Enter event name"
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0065A8] focus:border-transparent col-span-2"
              />
              <div className="flex space-x-2">
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={academicEventRating}
                  onChange={(e) => setAcademicEventRating(e.target.value)}
                  placeholder="Rating (1-5)"
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0065A8] focus:border-transparent w-24"
                />
                <button 
                  onClick={addAcademicEvent}
                  className="flex-grow px-4 py-2 bg-[#0065A8] text-white rounded-lg hover:bg-[#54BEFF] transition-colors"
                >
                  Add Event
                </button>
              </div>
            </div>

            {academicEvents.length > 0 && (
              <div className="mt-6">
                <h4 className="font-semibold text-gray-700 mb-3">Added Events:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {academicEvents.map((event, index) => (
                    <div key={index} className="flex items-center justify-between bg-blue-50 p-3 rounded-lg">
                      <div>
                        <span className="font-medium">{event.name}</span>
                        <div className="flex items-center mt-1">
                          <span className="text-sm text-gray-600">Rating:</span>
                          <div className="ml-2 flex">
                            {[...Array(5)].map((_, i) => (
                              <svg key={i} xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${i < event.rating ? 'text-yellow-400' : 'text-gray-300'}`} viewBox="0 0 20 20" fill="currentColor">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => removeAcademicEvent(index)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {academicEvents.length === 0 && (
              <div className="mt-6 text-center text-gray-500 p-4 border border-dashed border-gray-300 rounded-lg">
                <p>No academic events added yet. Add events to include them in your analysis.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {allFieldsProvided && grades.length > 0 && (
        <div className="mb-10 text-center">
          <button 
            onClick={runComparativeAnalysis}
            className="px-6 py-3 bg-[#00D1B2] text-white rounded-lg hover:bg-opacity-90 transition shadow-md transform hover:scale-105 duration-300 font-medium flex items-center mx-auto"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm2 10a1 1 0 10-2 0v3a1 1 0 102 0v-3zm4-1a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1zm-2-8a1 1 0 00-1 1v.01a1 1 0 002 0V4a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Run Comparative Analysis
          </button>
        </div>
      )}

      {analysisResult && (
        <div className="mt-8 mb-12">
          <div className="flex items-center mb-6">
            <div className="h-0.5 flex-grow mr-4 bg-gradient-to-l from-[#0065A8] to-transparent"></div>
            <h3 className="text-2xl font-bold text-center text-[#0065A8]">Analysis Results</h3>
            <div className="h-0.5 flex-grow ml-4 bg-gradient-to-r from-[#0065A8] to-transparent"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Basic Info Card */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="bg-[#397de2] text-white p-4">
                <h4 className="text-xl font-semibold">Student Performance</h4>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-gray-700"><span className="font-semibold">Student ID:</span> {analysisResult.student_id}</p>
                  <div className="flex items-center">
                    <span className="text-gray-700 mr-2">Rating:</span>
                    <span className={`px-3 py-1 rounded-full text-white text-sm font-medium ${
                      analysisResult.rating === "Excellent" ? "bg-green-500" :
                      analysisResult.rating === "Very Good" ? "bg-[#00D1B2]" :
                      analysisResult.rating === "Good" ? "bg-blue-500" :
                      analysisResult.rating === "Satisfactory" ? "bg-yellow-500" :
                      "bg-red-500"
                    }`}>
                      {analysisResult.rating}
                    </span>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-700 font-medium">Overall Score</span>
                    <span className="text-gray-700 font-medium">{(analysisResult.overall_score * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full ${
                        analysisResult.overall_score >= 0.8 ? "bg-green-500" :
                        analysisResult.overall_score >= 0.65 ? "bg-[#00D1B2]" :
                        analysisResult.overall_score >= 0.5 ? "bg-blue-500" :
                        analysisResult.overall_score >= 0.35 ? "bg-yellow-500" :
                        "bg-red-500"
                      }`}
                      style={{ width: `${analysisResult.overall_score * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div className="pt-2">
                  <h5 className="font-semibold text-gray-700 mb-2">Performance Factors</h5>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Baseline Factor</span>
                        <span>{analysisResult.baseline_factor}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-[#397de2] h-2 rounded-full" style={{ width: `${analysisResult.baseline_factor * 75}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Consistency Factor</span>
                        <span>{analysisResult.consistency_factor}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-[#397de2] h-2 rounded-full" style={{ width: `${analysisResult.consistency_factor * 100}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Grade Improvement Card */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="bg-[#fc6969] text-white p-4">
                <h4 className="text-xl font-semibold">Grade Progression</h4>
              </div>
              <div className="p-6">
                <Bar 
                  data={{
                    labels: ['Prelim', 'Midterm', 'Pre-Finals', 'Finals'],
                    datasets: [
                      {
                        label: 'Grade',
                        data: [
                          analysisResult.grades.prelim,
                          analysisResult.grades.midterm,
                          analysisResult.grades.prefinals,
                          analysisResult.grades.finals
                        ],
                        backgroundColor: ['#397de2', '#54BEFF', '#fc6969', '#00D1B2']
                      }
                    ]
                  }}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        display: false
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: false,
                        min: Math.max(0, Math.min(
                          parseFloat(analysisResult.grades.prelim),
                          parseFloat(analysisResult.grades.midterm),
                          parseFloat(analysisResult.grades.prefinals),
                          parseFloat(analysisResult.grades.finals)
                        ) - 5)
                      }
                    }
                  }}
                />
                <div className="mt-4 text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg font-semibold">
                    <span className="text-gray-700">Grade Improvement: </span>
                    <span className={analysisResult.grade_improvement > 0 ? "text-green-600" : analysisResult.grade_improvement < 0 ? "text-red-600" : "text-gray-600"}>
                      {analysisResult.grade_improvement > 0 ? "+" : ""}{analysisResult.grade_improvement} points
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Academic Events Impact */}
            {analysisResult.academic_events?.length > 0 && (
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="bg-[#00D1B2] text-white p-4">
                  <h4 className="text-xl font-semibold">Academic Events Impact</h4>
                </div>
                <div className="p-6">
                  <Pie 
                    data={{
                      labels: analysisResult.academic_events.map(event => event.name || `Event ${analysisResult.academic_events.indexOf(event) + 1}`),
                      datasets: [
                        {
                          data: analysisResult.academic_events.map(event => event.rating),
                          backgroundColor: generateColors(analysisResult.academic_events.length),
                          borderWidth: 1
                        }
                      ]
                    }}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: {
                          position: 'bottom',
                          labels: {
                            padding: 20,
                            usePointStyle: true,
                            font: {
                              size: 11
                            }
                          }
                        }
                      }
                    }}
                  />
                  <div className="mt-4 text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg font-semibold text-[#00D1B2]">
                      Average Impact: {(analysisResult.average_event_impact * 5).toFixed(1)}/5
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Performance Metrics Radar */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="bg-[#0065A8] text-white p-4">
                <h4 className="text-xl font-semibold">Performance Metrics</h4>
              </div>
              <div className="p-6">
                <PerformanceRadarChart 
                  metricsData={{
                    normalizedImprovement: analysisResult.normalized_improvement,
                    averageEventImpact: analysisResult.average_event_impact,
                    consultationQuality: analysisResult.consultation_quality
                  }}
                />
              </div>
            </div>
          </div>
          
          {/* Recommendations Section */}
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
          </div>
        </div>
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
              <h2 className="text-xl font-semibold mb-4 text-[#0065A8]">Select Analysis Options</h2>

              {/* Semester Dropdown */}
              <div className="mb-4">
                <label className="block text-gray-700 mb-1">Select Semester:</label>
                <select 
                  className="w-full px-3 py-2 border-2 border-[#0065A8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#54BEFF]"
                  value={tempSemester ? `${tempSemester.school_year}|${tempSemester.semester}` : ''}
                  onChange={(e) => {
                    const sem = semesters.find(s => `${s.school_year}|${s.semester}` === e.target.value);
                    setTempSemester(sem);
                  }}
                >
                  <option value="">Select a semester</option>
                  {semesters.map((sem, idx) => (
                    <option key={idx} value={`${sem.school_year}|${sem.semester}`}>
                      {sem.school_year} - {sem.semester} Semester
                    </option>
                  ))}
                </select>
              </div>

              {/* Teacher Dropdown */}
              <div className="mb-4">
                <label className="block text-gray-700 mb-1">Select Teacher:</label>
                <select 
                  className="w-full px-3 py-2 border-2 border-[#0065A8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#54BEFF]"
                  value={tempTeacher}
                  onChange={(e) => {
                    setTempTeacher(e.target.value);
                    setTempStudent(''); // reset student when teacher changes
                    setTempCourse('');  // reset course as well
                  }}
                >
                  <option value="">Select a teacher</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.firstName} {teacher.lastName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Student Dropdown */}
              <div className="mb-4">
                <label className="block text-gray-700 mb-1">Select Student:</label>
                <select 
                  className="w-full px-3 py-2 border-2 border-[#0065A8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#54BEFF]"
                  value={tempStudent}
                  onChange={(e) => {
                    setTempStudent(e.target.value);
                    setTempCourse('');
                  }}
                  disabled={!tempTeacher || tempStudents.length === 0}
                >
                  <option value="">Select a student</option>
                  {tempStudents.map(student => (
                    <option key={student.id} value={student.id}>
                      {student.firstName} {student.lastName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Course Dropdown */}
              <div className="mb-4">
                <label className="block text-gray-700 mb-1">Select Course:</label>
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
                  disabled={!(tempSemester && tempTeacher && tempStudent && tempCourse)}
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
