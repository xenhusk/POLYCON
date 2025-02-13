import React, { useState, useEffect } from 'react';

export default function AddGrade() {
  const [studentID, setStudentID] = useState('');
  const [studentName, setStudentName] = useState('');
  const [courseID, setCourseID] = useState('');
  const [grade, setGrade] = useState('');
  const [grades, setGrades] = useState([]);
  const [term, setTerm] = useState('');
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
    const updatedPeriods = selectedPeriods.includes(period)
      ? selectedPeriods.filter((p) => p !== period)
      : [...selectedPeriods, period];
    setSelectedPeriods(updatedPeriods);
    applyFilters();
  };

  const handleCourseFilterChange = (e) => {
    const input = e.target.value;
    setCourseFilter(input);

    // Filter courses based on input
    const filtered = courses.filter((course) =>
      course.courseName.toLowerCase().includes(input.toLowerCase())
    );
    setFilteredCourses(filtered);
    applyFilters();
  };

  const handleSchoolYearFilterChange = (e) => {
    setSchoolYearFilter(e.target.value);
    applyFilters();
  };

  const handleSemesterFilterChange = (e) => {
    setSemesterFilter(e.target.value);
    applyFilters();
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

  // Update applyFilters to include filtering by selected filter students
  const applyFilters = () => {
    let filtered = grades;

    // Filter by period
    if (selectedPeriods.length > 0) {
      filtered = filtered.filter((grade) => selectedPeriods.includes(grade.period));
    }

    // Filter by course
    if (courseFilter) {
      filtered = filtered.filter((grade) =>
        grade.courseName.toLowerCase().includes(courseFilter.toLowerCase())
      );
    }

    // Filter by school year
    if (schoolYearFilter) {
      filtered = filtered.filter((grade) => grade.school_year === schoolYearFilter);
    }

    // Filter by semester
    if (semesterFilter) {
      filtered = filtered.filter((grade) => grade.semester === semesterFilter);
    }

    // NEW: Filter by selected student names; only keep grades of students in the list
    if (selectedFilterStudents.length > 0) {
      filtered = filtered.filter((grade) =>
        selectedFilterStudents.some(student =>
          grade.studentName.toLowerCase() === student.name.toLowerCase()
        )
      );
    }

    setFilteredGrades(filtered);
  };

  return (
    <div className="max-w-9xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <div className="max-w-9xl mx-auto p-4 bg-white mt-6">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
          {selectedGradeID ? "Edit Grade" : "Add Grade"}
        </h2>

        <div className="flex justify-between items-center mb-4">
          <button 
            onClick={() => setShowFilters(!showFilters)} 
            className="bg-blue-500 text-white px-4 py-2 rounded-lg"
          >
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>
        </div>

        {/* Wrap filters and table in a relative container */}
        <div className="relative">
          {showFilters && (
            <div className="absolute top-16 left-0 w-1/4 p-4 bg-blue-500 text-white rounded-lg z-50">
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
                  onChange={handleCourseFilterChange}
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
                <input
                  type="text"
                  value={schoolYearFilter}
                  onChange={handleSchoolYearFilterChange}
                  placeholder="YYYY-YYYY"
                  className="block w-full p-2 mt-1 border border-gray-300 text-black rounded"
                />
              </div>

              {/* Semester Filter */}
              <div className="mt-4">
                <label className="font-semibold">Semester</label>
                <select
                  value={semesterFilter}
                  onChange={handleSemesterFilterChange}
                  className="block w-full p-2 mt-1 border border-gray-300 text-black rounded"
                >
                  <option value="">All Semesters</option>
                  <option value="1st">1st</option>
                  <option value="2nd">2nd</option>
                </select>
              </div>

              {/* NEW: Students Filter */}
              <div className="mt-4">
                <label className="font-semibold">Students</label>
                <div className="flex flex-wrap mt-2">
                  {selectedFilterStudents.map(student => (
                    <div key={student.studentID} className="bg-gray-200 text-gray-700 px-2 py-1 mr-2 mb-2 rounded flex items-center">
                      {student.name}
                      <span onClick={() => handleRemoveFilterStudent(student.studentID)} className="ml-1 cursor-pointer">x</span>
                    </div>
                  ))}
                  <input 
                    type="text"
                    value={filterStudentQuery}
                    onChange={handleFilterStudentQueryChange}
                    placeholder="Search Students"
                    className="border border-gray-300 rounded-lg px-2 py-1"
                  />
                </div>
                {filterStudentSuggestions.length > 0 && (
                  <ul className="bg-white text-black border border-gray-300 rounded-lg mt-1 max-h-40 overflow-y-auto shadow-md">
                    {filterStudentSuggestions.map(student => (
                      <li 
                        key={student.studentID} 
                        onClick={() => handleSelectFilterStudent(student)}
                        className="px-3 py-2 cursor-pointer hover:bg-gray-200"
                      >
                        {student.name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <button 
                onClick={applyFilters} 
                className="bg-white text-blue-500 px-4 py-2 rounded-lg mt-4"
              >
                Apply Filters
              </button>
            </div>
          )}

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
                {filteredGrades.length > 0 ? (
                  filteredGrades.map((grade) => (
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