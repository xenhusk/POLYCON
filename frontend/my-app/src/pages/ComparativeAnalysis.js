import React, { useState, useEffect } from 'react';
import { getProfilePictureUrl } from '../utils/utils';
import { motion, AnimatePresence } from 'framer-motion';
// Add Chart.js and required components
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, RadialLinearScale, PointElement, LineElement, Filler } from 'chart.js';
import { Pie, Bar, Radar } from 'react-chartjs-2';

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
      .then(data => setAnalysisResult(data))
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
    <div className="p-6 bg-white">
      <div className="mb-6 text-center">
        <h2 className="text-3xl font-bold text-[#0065A8]">Comparative Analysis</h2>
      </div>

      {/* Button to open the selection modal */}
      <div className="mb-6 text-center">
        <button 
          onClick={openSelectionModal}
          className="px-4 py-2 bg-[#0065A8] text-white rounded-lg hover:bg-[#54BEFF] transition"
        >
          Select Analysis Options
        </button>
      </div>

      {/* Prompt if not all fields are provided */}
      {!allFieldsProvided && (
        <div className="text-center text-gray-500 my-8">
          Please select a semester, teacher, student, and course to view the analysis.
        </div>
      )}

      {/* Display Grades Table */}
      {allFieldsProvided && grades.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xl font-bold mb-3 text-[#0065A8]">Grades</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white text-center table-fixed">
              <thead className="bg-[#057DCD] text-white">
                <tr>
                  <th className="border px-4 py-3">Subject</th>
                  <th className="border px-4 py-3">Prelim</th>
                  <th className="border px-4 py-3">Midterm</th>
                  <th className="border px-4 py-3">Pre-Final</th>
                  <th className="border px-4 py-3">Final</th>
                </tr>
              </thead>
              <tbody>
                {grades.map((grade, idx) => (
                  <tr key={idx} className="hover:bg-[#DBF1FF]">
                    <td className="border px-4 py-3">{grade.course}</td>
                    <td className="border px-4 py-3">{grade.Prelim}</td>
                    <td className="border px-4 py-3">{grade.Midterm}</td>
                    <td className="border px-4 py-3">{grade['Pre-Final']}</td>
                    <td className="border px-4 py-3">{grade.Final}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Display Consultation History */}
      {allFieldsProvided && sessions.length > 0 && (
        <div>
          <h3 className="text-xl font-bold mb-3 text-[#0065A8]">Consultation History</h3>
          <div className="space-y-4">
            {sessions.map((session, idx) => (
              <div 
                key={idx} 
                className="bg-white rounded-lg p-4 shadow hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-[#0065A8]"
              >
                <div className="flex justify-between mb-2">
                  <span className="font-bold">Date: {new Date(session.session_date).toLocaleDateString()}</span>
                  <span>Teacher: {session.teacher_name || "Unknown"}</span>
                </div>
                <p><strong>Student:</strong> {session.student_name || "Unknown"}</p>
                <p><strong>Concern:</strong> {session.concern}</p>
                <p><strong>Outcome:</strong> {session.outcome}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Section for Academic Events */}
      {allFieldsProvided && (
        <div className="mb-6">
          <h3 className="text-xl font-bold mb-3 text-[#0065A8]">Academic Events</h3>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={academicEventName}
              onChange={(e) => setAcademicEventName(e.target.value)}
              placeholder="Enter event name"
              className="px-3 py-2 border rounded-lg focus:outline-none"
            />
            <input
              type="number"
              min="1"
              max="5"
              value={academicEventRating}
              onChange={(e) => setAcademicEventRating(e.target.value)}
              placeholder="Rating (1-5)"
              className="px-3 py-2 border rounded-lg focus:outline-none"
            />
            <button 
              onClick={addAcademicEvent}
              className="px-4 py-2 bg-[#0065A8] text-white rounded-lg hover:bg-[#54BEFF] transition"
            >
              Add Event
            </button>
          </div>
          {academicEvents.length > 0 && (
            <ul className="mt-4 list-disc pl-5">
              {academicEvents.map((event, index) => (
                <li key={index} className="flex items-center space-x-2">
                  <span>{event.name} – Rating: {event.rating}</span>
                  <button
                    onClick={() => removeAcademicEvent(index)}
                    className="text-red-500 text-sm"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {allFieldsProvided && grades.length > 0 && (
        <div className="mt-6 text-center">
          <button 
            onClick={runComparativeAnalysis}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition"
          >
            Run Comparative Analysis
          </button>
        </div>
      )}

      {analysisResult && (
        <div className="mt-6">
          <h3 className="text-2xl font-bold mb-4 text-center text-[#0065A8]">Analysis Results</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Info Card */}
            <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-[#0065A8]">
              <h4 className="text-xl font-semibold mb-3">Student Performance</h4>
              <div className="space-y-2">
                <p><strong>Student ID:</strong> {analysisResult.student_id}</p>
                <div className="flex items-center">
                  <strong>Rating:</strong>
                  <span className={`ml-2 px-3 py-1 rounded-full text-white ${
                    analysisResult.rating === "Excellent" ? "bg-green-500" :
                    analysisResult.rating === "Good" ? "bg-blue-500" :
                    analysisResult.rating === "Average" ? "bg-yellow-500" :
                    "bg-red-500"
                  }`}>
                    {analysisResult.rating}
                  </span>
                </div>
                <p><strong>Overall Score:</strong> {analysisResult.overall_score * 100}%</p>
              </div>
              
              {/* Progress Bar for Overall Score */}
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div 
                    className={`h-4 rounded-full ${
                      analysisResult.overall_score >= 0.7 ? "bg-green-500" :
                      analysisResult.overall_score >= 0.5 ? "bg-blue-500" :
                      analysisResult.overall_score >= 0.3 ? "bg-yellow-500" :
                      "bg-red-500"
                    }`}
                    style={{ width: `${analysisResult.overall_score * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
            {/* Grade Improvement Card */}
            <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-[#0065A8]">
              <h4 className="text-xl font-semibold mb-3">Grade Progression</h4>
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
                      backgroundColor: generateColors(4)
                    }
                  ]
                }}
                options={{
                  responsive: true,
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
              <div className="mt-3 text-center">
                <p><strong>Improvement:</strong> {analysisResult.grade_improvement > 0 ? "+" : ""}{analysisResult.grade_improvement} points</p>
              </div>
            </div>
            
            {/* Academic Events Impact */}
            {analysisResult.academic_events?.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-[#0065A8]">
                <h4 className="text-xl font-semibold mb-3">Academic Events Impact</h4>
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
                      }
                    }
                  }}
                />
                <div className="mt-3 text-center">
                  <p><strong>Average Impact:</strong> {analysisResult.average_event_impact * 5}/5</p>
                </div>
              </div>
            )}
            
            {/* Performance Metrics Radar */}
            <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-[#0065A8]">
              <h4 className="text-xl font-semibold mb-3">Performance Metrics</h4>
              <Radar
                data={{
                  labels: ['Grade Improvement', 'Academic Events', 'Overall Score'],
                  datasets: [
                    {
                      label: 'Student Performance',
                      data: [
                        analysisResult.normalized_improvement,
                        analysisResult.average_event_impact,
                        analysisResult.overall_score
                      ],
                      backgroundColor: 'rgba(54, 162, 235, 0.2)',
                      borderColor: 'rgb(54, 162, 235)',
                      pointBackgroundColor: 'rgb(54, 162, 235)',
                      pointBorderColor: '#fff',
                      pointHoverBackgroundColor: '#fff',
                      pointHoverBorderColor: 'rgb(54, 162, 235)'
                    }
                  ]
                }}
                options={{
                  scales: {
                    r: {
                      angleLines: {
                        display: true
                      },
                      suggestedMin: 0,
                      suggestedMax: 1
                    }
                  }
                }}
              />
            </div>
          </div>
          
          {/* Recommendations Section */}
          <div className="mt-6 bg-white rounded-xl shadow-md p-6 border-t-4 border-[#0065A8]">
            <h4 className="text-xl font-semibold mb-3">Recommendations</h4>
            <div className="p-4 bg-gray-50 rounded-lg">
              {analysisResult.rating === "Excellent" && (
                <p>Congratulations on an excellent performance! Continue with your current strategies, and consider mentoring other students.</p>
              )}
              {analysisResult.rating === "Good" && (
                <p>You're doing well! Focus on maintaining consistency and identify opportunities for further improvement in specific areas.</p>
              )}
              {analysisResult.rating === "Average" && (
                <p>You're on the right track. Consider increasing participation in relevant academic events and seeking additional support in challenging topics.</p>
              )}
              {analysisResult.rating === "Needs Improvement" && (
                <p>Schedule regular consultations with your instructor to address specific challenges. Consider supplementary learning resources and structured study plans.</p>
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
