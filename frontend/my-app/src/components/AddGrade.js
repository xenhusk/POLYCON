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
  console.log("🟡 Edit Button Clicked for Grade:", grade); // Debugging log
  setSelectedGradeID(grade.id);  // Ensure we're setting the correct grade ID
  setStudentID(grade.studentID);
  setStudentName(grade.studentName);
  setCourseID(grade.courseID);
  setGrade(grade.grade);
  setPeriod(grade.period);
  setSchoolYear(grade.school_year);
  setSemester(grade.semester);
};


const handleCancelEdit = () => {
  console.log("🔴 Cancel Edit Clicked - Resetting Form"); // Debugging log
  setSelectedGradeID(null); // This will revert to "Submit Grade"
  setStudentID('');
  setStudentName('');
  setCourseID('');
  setGrade('');
  setPeriod('');
  setSchoolYear('2024-2025');
  setSemester('');
};

  
  const handleUpdateGrade = async () => {
    console.log("🟡 Edit Grade Button Clicked"); // Debugging log
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

        const result = await response.json();
        console.log("📨 API Response:", result); // Debugging log

        if (response.ok) {
            alert('✅ Grade updated successfully');
            handleCancelEdit();
            fetchGrades();
        } else {
            alert('❌ Failed to update grade: ' + result.error);
        }
    } catch (error) {
        console.error('❌ Error updating grade:', error);
    }
};

const handleSchoolYearChange = (e) => {
  let input = e.target.value;

  // Allow only numbers and dash (-)
  input = input.replace(/[^0-9-]/g, '');

  // Ensure the format is 20XX-20XX
  const match = input.match(/^20\d{2}-20\d{2}$/);
  
  if (input.length <= 9) {
      setSchoolYear(input);
  }

  if (input.length === 9 && !match) {
      alert("❌ Invalid format! Use YYYY-YYYY (e.g., 2024-2025)");
      setSchoolYear("2024-2025"); // Reset to default if incorrect
  }
};



// Ensure the edit form appears correct

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
    console.log("🔵 Submit Grade Button Clicked"); // Debugging log
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

        const result = await response.json();
        console.log("📨 API Response:", result); // Debugging log

        if (response.ok) {
            alert('✅ Grade added successfully');
            fetchGrades();
        } else {
            alert('❌ Failed to add grade: ' + result.error);
        }
    } catch (error) {
        console.error('❌ Error adding grade:', error);
    }
};


  
  return (
    <div className="max-w-9xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <div className="max-w-9xl mx-auto p-4 bg-white mt-6">
    <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
        {selectedGradeID ? "Edit Grade" : "Add Grade"}
    </h2>
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

    <div className="mt-6">

    <div className="grid grid-cols-7 gap-2 items-center">
        {/* Student Name Input */}
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

        {/* Semester Selection */}
        <select 
            value={semester} 
            onChange={(e) => setSemester(e.target.value)} 
            className="border border-gray-300 rounded-lg px-3 py-2 w-full"
        >
            <option value="">Semester</option>
            <option value="1st">1st</option>
            <option value="2nd">2nd</option>
        </select>

        {/* Period Selection */}
        <select 
            value={period} 
            onChange={(e) => setPeriod(e.target.value)} 
            className="border border-gray-300 rounded-lg px-3 py-2 w-full"
        >
            <option value="">Period</option>
            <option value="Prelim">Prelim</option>
            <option value="Midterm">Midterm</option>
            <option value="Pre-Final">Pre-Final</option>
            <option value="Final">Final</option>
        </select>

        {/* Grade Input */}
        <input 
            type="number" 
            placeholder="Grade" 
            value={grade} 
            onChange={(e) => setGrade(e.target.value)} 
            className="border border-gray-300 rounded-lg px-3 py-2 w-full"
        />
        
        {/* School Year Selection (New) */}
        {/* Editable School Year Input (20XX-20XX) */}
        <input 
            type="text" 
            placeholder="YYYY-YYYY" 
            value={schoolYear} 
            onChange={(e) => handleSchoolYearChange(e)} 
            className="border border-gray-300 rounded-lg px-3 py-2 w-full text-center"
        />

        {/* Submit or Update Button */}
        <div className="flex items-center space-x-2">
            <button 
                onClick={selectedGradeID ? handleUpdateGrade : handleSubmitGrade} 
                className={`px-2 py-2 rounded text-white ${selectedGradeID ? 'bg-yellow-500' : 'bg-blue-500'}`}
            >
                {selectedGradeID ? "Update Grade" : "Submit Grade"}
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
</div>


 
</div>

  );
}