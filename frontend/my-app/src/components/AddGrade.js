import React, { useState, useEffect } from 'react';

export default function AddGrade() {
  const [studentID, setStudentID] = useState('');
  const [studentName, setStudentName] = useState('');
  const [courseID, setCourseID] = useState('');
  const [facultyID, setFacultyID] = useState('FACULTY_001'); // Replace with actual faculty ID
  const [grade, setGrade] = useState('');
  const [period, setPeriod] = useState('');
  const [schoolYear, setSchoolYear] = useState('2024-2025');
  const [semester, setSemester] = useState('');
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);

  useEffect(() => {
    fetchStudents();
    fetchCourses();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await fetch('http://localhost:5001/grade/get_students');
      const data = await response.json();
      setStudents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching students:', error);
      setStudents([]);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await fetch('http://localhost:5001/course/get_courses');
      const data = await response.json();
      setCourses(data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const handleStudentChange = (e) => {
    const selectedID = e.target.value;
    setStudentID(selectedID);
    const selectedStudent = students.find(student => student.studentID === selectedID);
    setStudentName(selectedStudent ? selectedStudent.name : '');
  };

  const handleStudentNameChange = (e) => {
    const enteredName = e.target.value;
    setStudentName(enteredName);
    const matchedStudents = students.filter(student => 
      student.name.toLowerCase().includes(enteredName.toLowerCase())
    );
    setFilteredStudents(matchedStudents);
  };

  const handleStudentSelect = (student) => {
    setStudentName(student.name);
    setStudentID(student.studentID);
    setFilteredStudents([]);
  };

  const determineRemarks = (grade) => {
    if (grade === '') return 'NOT ENCODED';
    return parseFloat(grade) >= 75 ? 'PASSED' : 'FAILED';
  };

  const handleSubmitGrade = async () => {
    if (!studentID || !courseID || !grade || !period || !schoolYear || !semester) {
      alert('All fields are required');
      return;
    }

    try {
      const response = await fetch('http://localhost:5001/grade/add_grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentID,
          courseID,
          facultyID,
          grade,
          period,
          remarks: determineRemarks(grade),
          school_year: schoolYear,
          semester
        })
      });

      if (response.ok) {
        alert('Grade added successfully');
        setStudentID('');
        setStudentName('');
        setCourseID('');
        setGrade('');
        setPeriod('');
        setSchoolYear('2024-2025');
        setSemester('');
      } else {
        alert('Failed to add grade');
      }
    } catch (error) {
      console.error('Error adding grade:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold text-center text-gray-800">Add Grade</h2>
      <div className="grid grid-cols-3 gap-4">
        <div className="relative">
          <input 
            type="text" 
            placeholder="Student Name" 
            value={studentName} 
            onChange={handleStudentNameChange} 
            className="border border-gray-300 rounded-lg px-3 py-2" 
          />
          {filteredStudents.length > 0 && (
            <ul className="absolute z-10 bg-white border border-gray-300 rounded-lg mt-1 max-h-40 overflow-y-auto">
              {filteredStudents.map((student) => (
                <li 
                  key={student.studentID} 
                  onClick={() => handleStudentSelect(student)} 
                  className="px-3 py-2 cursor-pointer hover:bg-gray-200"
                >
                  {student.name}
                </li>
              ))}
            </ul>
          )}
        </div>
        <select value={courseID} onChange={(e) => setCourseID(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2">
          <option value="">Select Course</option>
          {courses.map((course) => (
            <option key={course.courseID} value={course.courseID}>{course.courseName}</option>
          ))}
        </select>
        <input type="number" placeholder="Grade" value={grade} onChange={(e) => setGrade(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2" />
        <select value={period} onChange={(e) => setPeriod(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2">
          <option value="">Select Period</option>
          <option value="Prelim">Prelim</option>
          <option value="Midterm">Midterm</option>
          <option value="Pre-Final">Pre-Final</option>
          <option value="Final">Final</option>
        </select>
        <input type="text" value={determineRemarks(grade)} readOnly className={`border border-gray-300 rounded-lg px-3 py-2 bg-gray-100 text-center ${determineRemarks(grade) === 'PASSED' ? 'text-green-500' : 'text-red-500'}`} />
        <input type="text" placeholder="School Year" value={schoolYear} onChange={(e) => setSchoolYear(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2" />
        <select value={semester} onChange={(e) => setSemester(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2">
          <option value="">Select Semester</option>
          <option value="1st">1st</option>
          <option value="2nd">2nd</option>
        </select>
      </div>
      <button onClick={handleSubmitGrade} className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">Submit Grade</button>
    </div>
  );
}
