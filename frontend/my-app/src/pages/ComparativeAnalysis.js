import React, { useState, useEffect } from 'react';
import { getProfilePictureUrl } from '../utils/utils';
import { motion, AnimatePresence } from 'framer-motion';

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
