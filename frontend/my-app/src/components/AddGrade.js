import React, { useState, useEffect } from 'react';


export default function AddGrade() {
  const [studentID, setStudentID] = useState('');
  const [studentName, setStudentName] = useState('');
  const [courseID, setCourseID] = useState('');
  const [grade, setGrade] = useState('');
  const [term, setTerm] = useState('');
  const [quarter, setQuarter] = useState('');
  const [program, setProgram] = useState('');
  const [period, setPeriod] = useState('');
  const [schoolYear, setSchoolYear] = useState('2024-2025');
  const [semester, setSemester] = useState('');
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [facultyID, setFacultyID] = useState('');

  const [filteredStudents, setFilteredStudents] = useState([]);

  useEffect(() => {
    const storedTeacherID = localStorage.getItem('teacherID');
  if (storedTeacherID) {
    setFacultyID(storedTeacherID); // Set the facultyID dynamically
  }
    fetchStudents();
    fetchCourses();
  }, []);

  const fetchFacultyID = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user')); // Assuming user info is stored here after login
      if (!user || !user.email) {
        console.error("No logged-in user found.");
        return;
      }
      const response = await fetch(`http://localhost:5001/users/get_faculty?email=${user.email}`);
    const data = await response.json();
    
    if (data && data.facultyID) {
      setFacultyID(data.facultyID);
    } else {
      console.error("Faculty ID not found.");
    }
  } catch (error) {
    console.error("Error fetching faculty ID:", error);
  }};

  const fetchStudents = async () => {
    try {
      const response = await fetch('http://localhost:5001/grade/get_students');
      const data = await response.json();
      setStudents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await fetch('http://localhost:5001/course/get_courses');
      const data = await response.json();
      setCourses(Array.isArray(data.courses) ? data.courses : []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const handleStudentNameChange = async (e) => {
    const enteredName = e.target.value;
    setStudentName(enteredName);
  
    if (enteredName.length === 0) {
      setFilteredStudents([]);
      return;
    }
  
    try {
      const response = await fetch(`http://localhost:5001/grade/search_students?name=${enteredName}`);
      const data = await response.json();
      setFilteredStudents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error searching students:", error);
      setFilteredStudents([]);
    }
  };
  
  

  const handleStudentSelect = (student) => {
    setStudentName(student.name);
    setStudentID(student.studentID);
    setFilteredStudents([]); // Hide dropdown after selection
  };

  const determineRemarks = (grade) => {
    if (grade === '') return 'NOT ENCODED';
    return parseFloat(grade) >= 75 ? 'PASSED' : 'FAILED';
  };

  const handleSubmitGrade = async () => {
    if (!studentID || !courseID || !grade || !period || !schoolYear || !semester || !facultyID) {
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
          facultyID, // Now dynamically fetched
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
    <div className="max-w-5xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold text-center text-gray-800">Class Record</h2>
      
      {/* Filter Inputs */}
      <div className="grid grid-cols-5 gap-4 mt-4">
        <input type="text" placeholder="Period" value={period} onChange={(e) => setPeriod(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 w-full" />
        <input type="text" placeholder="Semester" value={semester} onChange={(e) => setSemester(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 w-full" />
        <input type="text" placeholder="School Year" value={schoolYear} onChange={(e) => setSchoolYear(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 w-full" />
        <input type="text" placeholder="Program" value={program} onChange={(e) => setProgram(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 w-full" />
        <select value={courseID} onChange={(e) => setCourseID(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 w-full">
          <option value="">Select Course</option>
          {courses.map((course) => (
            <option key={course.courseID} value={course.courseID}>{course.courseName}</option>
          ))}
        </select>
      </div>
      
      {/* View Button */}
      <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">View</button>
      
      {/* Class Record Table */}
      <div className="overflow-x-auto mt-6">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-4 py-2">STUDENT ID</th>
              <th className="border px-4 py-2">STUDENT NAME</th>
              <th className="border px-4 py-2">PROGRAM</th>
              <th className="border px-4 py-2">COURSE</th>
              <th className="border px-4 py-2">CREDIT</th>
              <th className="border px-4 py-2">SECTION</th>
              <th className="border px-4 py-2">GRADE</th>
              <th className="border px-4 py-2">REMARKS</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.studentID} className="text-center">
                <td className="border px-4 py-2">{student.studentID}</td>
                <td className="border px-4 py-2">{student.name}</td>
                <td className="border px-4 py-2">{student.program || 'Unknown Program'}</td>
                <td className="border px-4 py-2">{student.courseName || 'Unknown Course'}</td>
                <td className="border px-4 py-2">3.0</td>
                <td className="border px-4 py-2">3A</td>
                <td className="border px-4 py-2">NA</td>
                <td className="border px-4 py-2 bg-gray-100 text-gray-600">NOT ENCODED</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold text-center text-gray-800">Add Grade</h2>
      <div className="grid grid-cols-3 gap-4">
        {/* Student Name Search Field */}
        <div className="relative">
          <input 
            type="text" 
            placeholder="Student Name" 
            value={studentName} 
            onChange={handleStudentNameChange} 
            className="border border-gray-300 rounded-lg px-3 py-2 w-full"
          />
          {filteredStudents.length > 0 && (
            <ul className="absolute z-10 bg-white border border-gray-300 rounded-lg mt-1 max-h-40 overflow-y-auto w-full shadow-md">
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

        {/* Course Selection */}
        <select 
          value={courseID} 
          onChange={(e) => setCourseID(e.target.value)} 
          className="border border-gray-300 rounded-lg px-3 py-2 w-full"
        >
          <option value="">Select Course</option>
          {courses.map((course) => (
            <option key={course.courseID} value={course.courseID}>{course.courseName}</option>
          ))}
        </select>

        {/* Grade Input */}
        <input 
          type="number" 
          placeholder="Grade" 
          value={grade} 
          onChange={(e) => setGrade(e.target.value)} 
          className="border border-gray-300 rounded-lg px-3 py-2 w-full"
        />

        {/* Period Selection */}
        <select 
          value={period} 
          onChange={(e) => setPeriod(e.target.value)} 
          className="border border-gray-300 rounded-lg px-3 py-2 w-full"
        >
          <option value="">Select Period</option>
          <option value="Prelim">Prelim</option>
          <option value="Midterm">Midterm</option>
          <option value="Pre-Final">Pre-Final</option>
          <option value="Final">Final</option>
        </select>

        {/* Remarks Display */}
        <input 
          type="text" 
          value={determineRemarks(grade)} 
          readOnly 
          className={`border border-gray-300 rounded-lg px-3 py-2 w-full bg-gray-100 text-center ${
            determineRemarks(grade) === 'PASSED' ? 'text-green-500' : 'text-red-500'
          }`}
        />

        {/* Semester Selection */}
        <select 
          value={semester} 
          onChange={(e) => setSemester(e.target.value)} 
          className="border border-gray-300 rounded-lg px-3 py-2 w-full"
        >
          <option value="">Select Semester</option>
          <option value="1st">1st</option>
          <option value="2nd">2nd</option>
        </select>
      </div>

      {/* Submit Button */}
      <button 
        onClick={handleSubmitGrade} 
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
      >
        Submit Grade
      </button>

      
      </div>
    </div>
  );
}
