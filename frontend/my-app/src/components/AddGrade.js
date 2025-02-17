import React, { useState, useEffect } from 'react';
import { ReactComponent as DeleteIcon } from './icons/delete.svg';
import { ReactComponent as EditIcon } from './icons/Edit.svg';
import { ReactComponent as FilterIcon } from './icons/FilterAdd.svg';

export default function AddGrade() {
  const [studentID, setStudentID] = useState('');
  const [studentName, setStudentName] = useState('');
  const [courseID, setCourseID] = useState('');
  const [grade, setGrade] = useState('');
  const [grades, setGrades] = useState([]);
  const [period, setPeriod] = useState('');
  const [schoolYear, setSchoolYear] = useState('2024-2025');
  const [semester, setSemester] = useState('');
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [facultyID, setFacultyID] = useState('');
  const [selectedGradeID, setSelectedGradeID] = useState(null); // For editing
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [showFilters, setShowFilters] = useState(false); // Controls filter visibility
  const [filteredGrades, setFilteredGrades] = useState([]); // Stores filtered grades
  const [selectedPeriods, setSelectedPeriods] = useState([]); // Selected periods for filtering
  const [courseFilter, setCourseFilter] = useState(''); // Course filter input
  const [filteredCourses, setFilteredCourses] = useState([]); // Filtered courses for predictive dropdown
  const [schoolYearFilter, setSchoolYearFilter] = useState(''); // School year filter input
  const [semesterFilter, setSemesterFilter] = useState(''); // Semester filter input
  

  // NEW: States for filtering by student names (Google Docs style)
  const [filterStudentQuery, setFilterStudentQuery] = useState('');
  const [selectedFilterStudents, setSelectedFilterStudents] = useState([]);
  const [filterStudentSuggestions, setFilterStudentSuggestions] = useState([]);

  useEffect(() => {
    const storedTeacherID = localStorage.getItem('teacherID');
    if (storedTeacherID) {
      setFacultyID(storedTeacherID); // Set the facultyID dynamically
    }
    fetchInitialData();
  }, []);

  useEffect(() => {
    const uniqueSchoolYears = [...new Set(grades.map(grade => grade.school_year))];
    setUniqueSchoolYears(uniqueSchoolYears);
  }, [grades]);
  
  // Add state for unique school years
  const [uniqueSchoolYears, setUniqueSchoolYears] = useState([]);

  const fetchInitialData = async () => {
    try {
      const cachedStudents = localStorage.getItem('students');
      const cachedGrades = localStorage.getItem('grades');
      const cachedCourses = localStorage.getItem('courses');

      if (cachedStudents && cachedGrades && cachedCourses) {
        setStudents(JSON.parse(cachedStudents));
        setGrades(JSON.parse(cachedGrades));
        setFilteredGrades(JSON.parse(cachedGrades));
        setCourses(JSON.parse(cachedCourses));
      } else {
        const [studentsResponse, gradesResponse, coursesResponse] = await Promise.all([
          fetch('http://localhost:5001/grade/get_students'),
          fetch(`http://localhost:5001/grade/get_grades?facultyID=${localStorage.getItem('teacherID')}`),
          fetch(`http://localhost:5001/course/get_courses?facultyID=${localStorage.getItem('teacherID')}`)
        ]);

        const studentsData = await studentsResponse.json();
        const gradesData = await gradesResponse.json();
        const coursesData = await coursesResponse.json();

        setStudents(Array.isArray(studentsData) ? studentsData : []);
        setGrades(Array.isArray(gradesData) ? gradesData : []);
        setFilteredGrades(Array.isArray(gradesData) ? gradesData : []);
        setCourses(Array.isArray(coursesData.courses) ? coursesData.courses : []);

        localStorage.setItem('students', JSON.stringify(studentsData));
        localStorage.setItem('grades', JSON.stringify(gradesData));
        localStorage.setItem('courses', JSON.stringify(coursesData.courses));
      }
    } catch (error) {
      console.error('Error fetching initial data:', error);
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
        setGrades(prevGrades => prevGrades.filter(grade => grade.id !== gradeDocID));
        localStorage.setItem('grades', JSON.stringify(grades.filter(grade => grade.id !== gradeDocID)));
        applyFilters(); // Reapply filters after deletion
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
        const updatedGrades = grades.map(grade => grade.id === selectedGradeID ? { ...grade, studentID, courseID, grade, period, school_year: schoolYear, semester } : grade);
        setGrades(updatedGrades);
        localStorage.setItem('grades', JSON.stringify(updatedGrades));
        handleCancelEdit();
        applyFilters(); // Reapply filters after update
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
        const newGrade = { id: result.gradeID, studentID, studentName, courseID, courseName: courses.find(course => course.courseID === courseID)?.courseName, grade, period, school_year: schoolYear, semester, remarks: determineRemarks(grade) };
        const updatedGrades = [...grades, newGrade];
        setGrades(updatedGrades);
        localStorage.setItem('grades', JSON.stringify(updatedGrades));
        applyFilters(); // Reapply filters after adding
      } else {
        alert('❌ Failed to add grade: ' + result.error);
      }
    } catch (error) {
      console.error('❌ Error adding grade:', error);
    }
  };

  // Filter Handlers
  const handlePeriodFilterChange = (period) => {
    setSelectedPeriods((prevSelectedPeriods) => {
      const updatedPeriods = prevSelectedPeriods.includes(period)
        ? prevSelectedPeriods.filter((p) => p !== period)
        : [...prevSelectedPeriods, period];
      applyFilters(updatedPeriods, courseFilter, schoolYearFilter, semesterFilter, selectedFilterStudents);
      return updatedPeriods;
    });
  };
  
  const applyFilters = (periods = selectedPeriods, course = courseFilter, schoolYear = schoolYearFilter, semester = semesterFilter, students = selectedFilterStudents) => {
    let filtered = grades;
  
    // Filter by period
    if (periods.length > 0) {
      filtered = filtered.filter((grade) => periods.includes(grade.period));
    }
  
    // Filter by course
    if (course) {
      filtered = filtered.filter((grade) =>
        grade.courseName.toLowerCase().includes(course.toLowerCase())
      );
    }
  
    // Filter by school year
    if (schoolYear) {
      filtered = filtered.filter((grade) => grade.school_year === schoolYear);
    }
  
    // Filter by semester
    if (semester) {
      filtered = filtered.filter((grade) => grade.semester === semester);
    }
  
    // Filter by selected student names
    if (students.length > 0) {
      filtered = filtered.filter((grade) =>
        students.some(student =>
          grade.studentName.toLowerCase() === student.name.toLowerCase()
        )
      );
    }
  
    setFilteredGrades(filtered);
  };

  const handleCourseFilterChange = (e) => {
    const input = e.target.value;
    setCourseFilter(input);
    applyFilters(selectedPeriods, input, schoolYearFilter, semesterFilter, selectedFilterStudents);
  };
  
  const handleSchoolYearFilterChange = (e) => {
    const input = e.target.value;
    setSchoolYearFilter(input);
    applyFilters(selectedPeriods, courseFilter, input, semesterFilter, selectedFilterStudents);
  };
  
  const handleSemesterFilterChange = (e) => {
    const input = e.target.value;
    setSemesterFilter(input);
    applyFilters(selectedPeriods, courseFilter, schoolYearFilter, input, selectedFilterStudents);
  };

  // NEW: Handler for filter student query input
  const handleFilterStudentQueryChange = async (e) => {
    const query = e.target.value;
    setFilterStudentQuery(query);
    if (query.length === 0) {
      setFilterStudentSuggestions([]);
      return;
    }
    try {
      const response = await fetch(`http://localhost:5001/grade/search_students?name=${query}`);
      const data = await response.json();
      const suggestions = (Array.isArray(data) ? data : []).filter(student => 
        !selectedFilterStudents.some(s => s.studentID === student.studentID)
      );
      setFilterStudentSuggestions(suggestions);
    } catch (error) {
      console.error("Error searching filter students:", error);
      setFilterStudentSuggestions([]);
    }
  };

  // NEW: Handler to add a student to the filter list
  const handleSelectFilterStudent = (student) => {
    setSelectedFilterStudents(prev => [...prev, student]);
    setFilterStudentQuery('');
    setFilterStudentSuggestions([]);
  };

  // NEW: Handler to remove a selected student from filter list
  const handleRemoveFilterStudent = (studentID) => {
    setSelectedFilterStudents(prev => prev.filter(s => s.studentID !== studentID));
  };
  return (
<div className="max-w-9xl mx-auto p-6 bg-white">
  <div className="max-w-9xl mx-auto p-4 bg-white mt-6">
    <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
      {selectedGradeID ? "Edit Grade" : "Add Grade"}
    </h2>
    {/* NEW: Multi-Select Students Filter */}
    <div className="mt-4">
      <div className="flex items-center justify-center space-x-2 w-full">
        <div className="relative w-[400px] border border-gray-300 rounded-lg px-3 py-2 shadow-md flex flex-wrap items-center min-h-[42px]">
          {/* Display Selected Students Inside the Input Field */}
          {selectedFilterStudents.map(student => (
            <div 
              key={student.studentID} 
              className="bg-gray-200 text-gray-700 px-2 py-1 mr-2 mb-1 rounded flex items-center"
            >
              {student.name}
              <span 
                onClick={() => handleRemoveFilterStudent(student.studentID)} 
                className="ml-2 cursor-pointer text-gray-500 hover:text-gray-700"
              >
                ×
              </span>
            </div>
          ))}
          
          {/* Search Input (Fixed Width) */}
          <input 
            type="text"
            value={filterStudentQuery}
            onChange={handleFilterStudentQueryChange}
            placeholder="Search by Name"
            className="border-none focus:ring-0 outline-none w-[150px]"
          />

          {/* Dropdown Suggestions Below Input Field */}
          {filterStudentSuggestions.length > 0 && (
            <ul className="absolute left-0 right-0 bg-white text-black border border-gray-300 rounded-lg mt-1 max-h-40 overflow-y-auto shadow-lg z-10">
              {filterStudentSuggestions.map(student => (
                <li 
                  key={student.studentID} 
                  onClick={() => handleSelectFilterStudent(student)}
                  className="px-4 py-2 cursor-pointer hover:bg-gray-200"
                >
                  {student.name}
                </li>
              ))}
            </ul>
          )}
        </div>
        {/* Search Button */}
        <button 
          onClick={applyFilters} 
          className="bg-blue-500 text-white px-6 py-2 rounded-lg shadow-md hover:bg-blue-600 transition"
        >
          Search
        </button>

        {/* Filter Button (Circular Icon) */}
        <button 
          onClick={() => setShowFilters(!showFilters)} 
          className="bg-blue-500 text-white p-3 rounded-full shadow-md flex items-center justify-center hover:bg-blue-600 transition"
        >
          <FilterIcon className="w-5 h-5" />
        </button>
      </div>
    </div>

{/* Wrap filters and table in a relative container */}
<div className="relative">
  {showFilters && (
    <div className="absolute right-20 mt-2 mr-60 w-64 bg-blue-500 bg-opacity-95 text-white p-4 rounded-lg shadow-lg z-100">
      <h3 className="text-xl font-bold">FILTERS</h3>

      {/* Period Filter */}
      <div className="mt-4">
        <label className="font-semibold">Period</label>
        <div className="mt-2">
          {['Prelim', 'Midterm', 'Pre-Final', 'Final'].map((period) => (
            <label key={period} className="block">
              <input
                type="checkbox"
                value={period}
                checked={selectedPeriods.includes(period)}
                onChange={() => handlePeriodFilterChange(period)}
                className="mr-2"
              />
              {period}
            </label>
          ))}
        </div>
      </div>

      {/* Course Filter */}
      <div className="mt-4">
        <label className="font-semibold">Course</label>
        <input
          type="text"
          value={courseFilter}
          onChange={(e) => {
            handleCourseFilterChange(e);
            applyFilters();
          }}
          placeholder="Search Course"
          className="block w-full p-2 mt-1 border border-gray-300 text-black rounded"
        />
        {courseFilter && (
          <ul className="absolute z-10 bg-white border border-gray-300 rounded-lg mt-1 max-h-40 overflow-y-auto w-full shadow-md">
            {filteredCourses.map((course) => (
              <li
                key={course.courseID}
                onClick={() => {
                  setCourseFilter(course.courseName);
                  setFilteredCourses([]);
                  applyFilters();
                }}
                className="px-3 py-2 cursor-pointer hover:bg-gray-200"
              >
                {course.courseName}
              </li>
            ))}
          </ul>
        )}
      </div>

        {/* School Year Filter */}
        <div className="mt-4">
          <label className="font-semibold">School Year</label>
          <select
            value={schoolYearFilter}
            onChange={handleSchoolYearFilterChange}
            className="block w-full p-2 mt-1 border border-gray-300 text-black rounded"
          >
            <option value="">All School Years</option>
            {uniqueSchoolYears.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      {/* Semester Filter */}
      <div className="mt-4">
        <label className="font-semibold">Semester</label>
        <select
          value={semesterFilter}
          onChange={
            handleSemesterFilterChange
          }
          className="block w-full p-2 mt-1 border border-gray-300 text-black rounded"
        >
          <option value="">All Semesters</option>
          <option value="1st">1st</option>
          <option value="2nd">2nd</option>
        </select>
      </div>
    </div>
  )}
</div>

{/* Scrollable Table with Modern UI */}
<div className="mt-4 shadow-md rounded-lg overflow-hidden">
  <div className="overflow-x-auto">
  <table className="w-full bg-white text-center">
      <thead className="bg-gray-100 text-gray-700">
        <tr className="border-b">
        <th className="px-4 py-3 w-[150px] min-w-[120px]">Student ID</th>
          <th className="px-4 py-3 w-[200px] min-w-[180px]">Student Name</th>
          <th className="px-4 py-3 w-[350px] min-w-[200px]">Course</th>
          <th className="px-4 py-3 w-[140px] min-w-[100px]">Grade</th>
          <th className="px-4 py-3 w-[150px] min-w-[120px]">Period</th>
          <th className="px-4 py-3 w-[180px] min-w-[150px]">School Year</th>
          <th className="px-4 py-3 w-[120px] min-w-[100px]">Semester</th>
          <th className="px-4 py-3 w-[160px] min-w-[140px]">Remarks</th>
          <th className="px-4 py-3 pr-7 w-[100px] min-w-[80px] text-center">Actions</th>
        </tr>
      </thead>
    </table>
  </div>

  {/* Scrollable Table Body */}
  <div className="max-h-80 overflow-y-scroll">
      <table className="w-full bg-white text-center">
        <tbody>
        {grades.length === 0 ? (
          <tr>
            <td colSpan="9" className="px-6 py-4 text-center text-gray-500">Loading, please wait...</td>
          </tr>
        ) : (
          filteredGrades.length > 0 ? (
            filteredGrades.map((grade) => (
              <tr key={grade.gradeID} className="border-b hover:bg-gray-100 align-middle">
                <td className="px-4 py-3 w-[150px] min-w-[120px]">{grade.studentID}</td>
                <td className="px-4 py-3 w-[200px] min-w-[180px]">{grade.studentName}</td>
                <td className="px-4 py-3 w-[350px] min-w-[200px]">{grade.courseName}</td>
                <td className="px-4 py-3 w-[140px] min-w-[100px]">{grade.grade}</td>
                <td className="px-4 py-3 w-[150px] min-w-[120px]">{grade.period}</td>
                <td className="px-4 py-3 w-[180px] min-w-[150px]">{grade.school_year}</td>
                <td className="px-4 py-3 w-[120px] min-w-[100px]">{grade.semester}</td>
                <td className={`px-4 py-3 w-[160px] min-w-[140px] ${grade.remarks === 'PASSED' ? 'text-green-500' : 'text-red-500'}`}>
                  {grade.remarks}
                </td>
                <td className="align-middle px-4 py-3 w-[100px] min-w-[80px] space-x-3">
                  <div className="flex items-center justify-center h-full space-x-3">
                    <button onClick={() => handleEditGrade(grade)} className="mx-2 text-gray-500 hover:text-gray-700 inline-block">
                      <EditIcon className="w-5 h-5 inline-block" />
                    </button>
                    <button onClick={() => handleDeleteGrade(grade?.id)} className="mx-2 text-gray-500 hover:text-gray-700 inline-block">
                      <DeleteIcon className="w-5 h-5 inline-block" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="9" className="px-6 py-4 text-center text-gray-500">No grades found</td>
            </tr>
          )
        )}
      </tbody>
    </table>
  </div>
</div>
</div>

<div className="fixed-content">
 {/* Add / Edit Grade Form */}
<div className="t-6 mr-6 ml-6 shadow-md rounded-lg p-2 bg-white">
  <div className="flex items-center justify-between space-x-4">
    {/* Student Name Input */}
    <div className="relative flex-grow">
      <input 
        type="text" 
        placeholder="Student Name" 
        value={studentName} 
        onChange={handleStudentNameChange} 
        className=" rounded-lg px-4 py-2 w-full outline-none focus:ring focus:ring-blue-300 focus:border-blue-500"
      />
      {filteredStudents.length > 0 && (
        <ul className="absolute z-10 bg-white border border-gray-300 rounded-lg mt-1 max-h-40 overflow-y-auto w-full shadow-lg">
          {filteredStudents.map((student) => (
            <li 
              key={student.studentID} 
              onClick={() => handleStudentSelect(student)} 
              className="px-4 py-2 cursor-pointer hover:bg-gray-200"
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
      className=" rounded-lg px-4 py-2 w-[200px] focus:ring focus:ring-blue-300 focus:border-blue-500"
    >
      <option value="">Course</option>
      {courses.map((course) => (
        <option key={course.courseID} value={course.courseID}>{course.courseName}</option>
      ))}
    </select>

    {/* Semester Selection */}
    <select 
      value={semester} 
      onChange={(e) => setSemester(e.target.value)} 
      className=" rounded-lg px-4 py-2 w-[200px] focus:ring focus:ring-blue-300 focus:border-blue-500"
    >
      <option value="">Semester</option>
      <option value="1st">1st</option>
      <option value="2nd">2nd</option>
    </select>

    {/* Period Selection */}
    <select 
      value={period} 
      onChange={(e) => setPeriod(e.target.value)} 
      className=" rounded-lg px-4 py-2 w-[200px] focus:ring focus:ring-blue-300 focus:border-blue-500"
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
      className="rounded-lg px-4 py-2 w-[150px] text-center focus:ring focus:ring-blue-300 focus:border-blue-500"
    />

    {/* School Year Selection */}
    <input 
      type="text" 
      placeholder="YYYY-YYYY" 
      value={schoolYear} 
      onChange={(e) => handleSchoolYearChange(e)} 
      className="rounded-lg px-4 py-2 w-[200px] text-center focus:ring focus:ring-blue-300 focus:border-blue-500"
    />

    {/* Submit / Update Button */}
    <button 
      onClick={selectedGradeID ? handleUpdateGrade : handleSubmitGrade} 
      className={`px-4 py-2 rounded-lg text-white shadow-md ${selectedGradeID ? 'bg-yellow-500' : 'bg-blue-500 hover:bg-blue-600 transition duration-300'}`}
    >
      {selectedGradeID ? "Update" : "Submit"}
    </button>

    {/* Cancel Button (Only if Editing) */}
    {selectedGradeID && (
      <button 
        onClick={handleCancelEdit} 
        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg shadow-md transition duration-300"
      >
        Cancel
      </button>
    )}
  </div>
</div>
</div>

    </div>
  );
}