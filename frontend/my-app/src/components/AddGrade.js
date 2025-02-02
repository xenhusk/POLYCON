import React, { useState, useEffect } from 'react';


export default function AddGrade() {
  const [studentID, setStudentID] = useState('');
  const [studentName, setStudentName] = useState('');
  const [courseID, setCourseID] = useState('');
  const [grade, setGrade] = useState('');
  const [grades, setGrades] = useState('');
  const [term, setTerm] = useState('');
  const [period, setPeriod] = useState('');
  const [schoolYear, setSchoolYear] = useState('2024-2025');
  const [semester, setSemester] = useState('');
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [facultyID, setFacultyID] = useState('');
  const [selectedGradeID, setSelectedGradeID] = useState(null); // For editing
  const [filteredStudents, setFilteredStudents] = useState([]);

  useEffect(() => {
    const storedTeacherID = localStorage.getItem('teacherID');
  if (storedTeacherID) {
    setFacultyID(storedTeacherID); // Set the facultyID dynamically
  }
    fetchStudents();
    fetchGrades();
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

  const fetchGrades = async () => {
    try {
        const storedTeacherID = localStorage.getItem('teacherID'); 
        if (!storedTeacherID) return;

        const response = await fetch(`http://localhost:5001/grade/get_grades?facultyID=${storedTeacherID}`);
        const data = await response.json();

        console.log("✅ Received grades from backend:", data); // Debugging Log

        // Ensure document ID is included
        const gradesWithID = data.map(doc => ({
            id: doc.id,  // Firestore document ID
            ...doc       // Include all other fields
        }));

        setGrades(Array.isArray(gradesWithID) ? gradesWithID : []);
    } catch (error) {
        console.error('Error fetching grades:', error);
    }
};
  
  const fetchCourses = async () => {
    try {
        const storedTeacherID = localStorage.getItem('teacherID');
        if (!storedTeacherID) return;

        const response = await fetch(`http://localhost:5001/course/get_courses?facultyID=${storedTeacherID}`);
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

  const handleDeleteGrade = async (gradeDocID) => {
    if (!gradeDocID) {
        console.error("❌ No document ID provided for deletion. Ensure you are using Firestore document ID.");
        return;
    }

    if (!window.confirm("Are you sure you want to delete this grade?")) return;

    try {
        console.log("🗑️ Attempting to delete grade document with ID:", gradeDocID); // Debugging Log

        const response = await fetch('http://localhost:5001/grade/delete_grade', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ gradeID: gradeDocID }) // Pass Firestore document ID
        });

        const result = await response.json();
        console.log("Delete Response:", result); // Debugging log

        if (response.ok) {
            alert('✅ Grade deleted successfully');
            fetchGrades(); // Refresh table after deletion
        } else {
            alert('❌ Failed to delete grade: ' + result.error);
        }
    } catch (error) {
        console.error('Error deleting grade:', error);
    }
};


  const handleEditGrade = (grade) => {
    setSelectedGradeID(grade.gradeID);
    setStudentID(grade.studentID);
    setStudentName(grade.studentName);
    setCourseID(grade.courseID);
    setGrade(grade.grade);
    setPeriod(grade.period);
    setSchoolYear(grade.school_year);
    setSemester(grade.semester);
  };

  const handleCancelEdit = () => {
    setSelectedGradeID(null);
    setStudentID('');
    setStudentName('');
    setCourseID('');
    setGrade('');
    setPeriod('');
    setSchoolYear('2024-2025');
    setSemester('');
  };

  
  const handleUpdateGrade = async () => {
    if (!selectedGradeID) {
      alert('No grade selected for update');
      return;
    }

    try {
      const response = await fetch('http://localhost:5001/grade/edit_grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gradeID: selectedGradeID,
          studentID,
          courseID,
          facultyID,
          grade,
          period,
          school_year: schoolYear,
          semester
        })
      });

      if (response.ok) {
        alert('Grade updated successfully');
        handleCancelEdit();
        fetchGrades();
      } else {
        alert('Failed to update grade');
      }
    } catch (error) {
      console.error('Error updating grade:', error);
    }
  };

// Ensure the edit form appears correctly
{selectedGradeID && (
<div className="mt-6">
  <h2 className="text-xl font-bold">Edit Grade</h2>
  <input type="number" value={grade} onChange={(e) => setGrade(e.target.value)} className="border px-3 py-2 w-full" />
  <button onClick={handleUpdateGrade} className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">
    Update Grade
  </button>
</div>
)}

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
    <div className="max-w-9xl mx-auto p-6 bg-white shadow-lg rounded-lg">
    {/* Grades Table */}
    <div className="overflow-x-auto mt-6">
        <table className="min-w-full bg-white border border-gray-300 text-center">
            <thead>
                <tr className="bg-gray-100">
                    <th className="border px-4 py-2">Student ID</th>
                    <th className="border px-4 py-2">Student Name</th>
                    <th className="border px-4 py-2">Course</th>
                    <th className="border px-4 py-2">Grade</th>
                    <th className="border px-4 py-2">Period</th>
                    <th className="border px-4 py-2">School Year</th>
                    <th className="border px-4 py-2">Semester</th>
                    <th className="border px-4 py-2">Remarks</th>
                    <th className="border px-4 py-2">Actions</th>
                </tr>
            </thead>
            <tbody>
                {grades.length > 0 ? (
                    grades.map((grade) => (
                        <tr key={grade.gradeID}>
                            <td className="border px-4 py-2">{grade.studentID}</td>
                            <td className="border px-4 py-2">{grade.studentName}</td>
                            <td className="border px-4 py-2">{grade.courseName}</td>
                            <td className="border px-4 py-2">{grade.grade}</td>
                            <td className="border px-4 py-2">{grade.period}</td>
                            <td className="border px-4 py-2">{grade.school_year}</td>
                            <td className="border px-4 py-2">{grade.semester}</td>
                            <td className={`border px-4 py-2 ${grade.remarks === 'PASSED' ? 'text-green-500' : 'text-red-500'}`}>
                                {grade.remarks}
                            </td>
                            <td>
                                <button
                                    onClick={() => handleEditGrade(grade)}
                                    className="bg-yellow-500 text-white px-3 py-1 rounded mr-2"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => {
                                        console.log("🟡 Delete button clicked for document ID:", grade?.id); // Debugging Log
                                        handleDeleteGrade(grade?.id); // Use Firestore document ID
                                    }}
                                    className="bg-red-500 text-white px-3 py-1 rounded"
                                >
                                    Delete
                                </button> 

                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="9" className="border px-4 py-2 text-center">No grades found</td>
                    </tr>
                )}
            </tbody>
        </table>
    </div>

    {/* Add / Edit Grade Form */}
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-6">
        <h2 className="text-2xl font-bold text-center text-gray-800">
            {selectedGradeID ? "Edit Grade" : "Add Grade"}
        </h2>
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

        {/* Submit or Edit Button */}
        <div className="flex justify-center mt-4">
            <button 
                onClick={selectedGradeID ? handleUpdateGrade : handleSubmitGrade} 
                className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
            >
                {selectedGradeID ? "Edit Grade" : "Submit Grade"}
            </button>

            {selectedGradeID && (
                <button 
                    onClick={handleCancelEdit} 
                    className="bg-gray-500 text-white px-4 py-2 rounded"
                >
                    Cancel
                </button>
            )}
        </div>
    </div>
</div>

  );
}