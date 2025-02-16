import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ReactComponent as FilterIcon } from './icons/FilterAdd.svg';
import { ReactComponent as EditIcon } from './icons/Edit.svg';
import { ReactComponent as DeleteIcon } from './icons/delete.svg';

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [courseID, setCourseID] = useState('');
  const [courseName, setCourseName] = useState('');
  const [credits, setCredits] = useState('');
  const [department, setDepartment] = useState('');
  const [selectedPrograms, setSelectedPrograms] = useState([]);
  const [editing, setEditing] = useState(false);
  const navigate = useNavigate();
  const [filteredPrograms, setFilteredPrograms] = useState([]); // Filtered programs for selected department
  const [filteredCourses, setFilteredCourses] = useState([]); // Stores filtered courses
  const [selectedDepartment, setSelectedDepartment] = useState(''); // Selected department for filtering
  const [showFilters, setShowFilters] = useState(false); // Controls filter visibility
  const [filterSelectedPrograms, setFilterSelectedPrograms] = useState([]); // Programs selected in filter
  const [courseFilter, setCourseFilter] = useState(''); // Course filter input
  const filterRef = useRef(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilters(false);
        setSelectedDepartment('');
        setFilteredPrograms([]);
        setFilteredCourses(courses);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [filterRef, courses]);

  const fetchInitialData = async () => {
    try {
      const cachedCourses = localStorage.getItem('courses');
      const cachedDepartments = localStorage.getItem('departments');
      const cachedPrograms = localStorage.getItem('programs');

      if (cachedCourses && cachedDepartments && cachedPrograms) {
        const coursesData = JSON.parse(cachedCourses);
        const departmentsData = JSON.parse(cachedDepartments);
        const programsData = JSON.parse(cachedPrograms);

        setCourses(coursesData);
        setFilteredCourses(coursesData);
        setDepartments(departmentsData);
        setPrograms(programsData);
      } else {
        const [coursesResponse, departmentsResponse, programsResponse] = await Promise.all([
          fetch('http://localhost:5001/course/get_courses'),
          fetch('http://localhost:5001/course/get_departments'),
          fetch('http://localhost:5001/course/get_programs')
        ]);

        const coursesData = await coursesResponse.json();
        const departmentsData = await departmentsResponse.json();
        const programsData = await programsResponse.json();


        setCourses(coursesData.courses || []);
        setFilteredCourses(coursesData.courses || []);
        setDepartments(departmentsData);
        setPrograms(programsData);

        localStorage.setItem('courses', JSON.stringify(coursesData.courses));
        localStorage.setItem('departments', JSON.stringify(departmentsData));
        localStorage.setItem('programs', JSON.stringify(programsData));
      }
    } catch (error) {
      console.error('Error fetching initial data:', error);
    }
  };

  const handleDepartmentFilterChange = (e) => {
    const selectedDeptName = e.target.value;
    setSelectedDepartment(selectedDeptName);

    // Find department ID using name
    const selectedDept = departments.find((dept) => dept.name === selectedDeptName);
    const selectedDeptId = selectedDept ? selectedDept.id : null;

    // Get programs belonging to the selected department
    if (selectedDeptId) {
      const departmentPrograms = programs.filter((prog) => prog.departmentID === selectedDeptId);
      setFilteredPrograms(departmentPrograms);
    } else {
      setFilteredPrograms([]);
    }

    // Filter courses based on selected department
    const filtered = selectedDeptName
      ? courses.filter((course) => course.department === selectedDeptName)
      : courses;
    setFilteredCourses(filtered);
  };

  const handleProgramFilterChange = (programId) => {
    const updatedPrograms = filterSelectedPrograms.includes(programId)
      ? filterSelectedPrograms.filter((id) => id !== programId) // Remove if already selected
      : [...filterSelectedPrograms, programId]; // Add if not selected

    setFilterSelectedPrograms(updatedPrograms);

    // Filter courses based on selected programs
    const selectedProgramNames = programs
      .filter((prog) => updatedPrograms.includes(prog.id))
      .map((prog) => prog.name);

    const filtered = selectedProgramNames.length > 0
      ? courses.filter((course) =>
          selectedProgramNames.every((progName) => course.program.includes(progName))
        )
      : courses;

    setFilteredCourses(filtered);
  };

  const handleDepartmentChange = (e) => {
    const selectedDepartment = e.target.value;
    setDepartment(selectedDepartment);

    // Filter programs based on extracted department ID
    const departmentPrograms = programs.filter(prog => prog.departmentID === selectedDepartment);
    setFilteredPrograms(departmentPrograms);
    setSelectedPrograms([]); // Reset selected programs when department changes
  };

  const handleProgramChange = (programId) => {
    if (selectedPrograms.includes(programId)) {
      setSelectedPrograms(selectedPrograms.filter((id) => id !== programId));
    } else {
      setSelectedPrograms([...selectedPrograms, programId]);
    }
  };

  const handleSaveCourse = async () => {
    if (!courseID || !courseName || !credits || !department || selectedPrograms.length === 0) {
      alert('All fields are required');
      return;
    }
    try {
      const endpoint = editing 
        ? `http://localhost:5001/course/edit_course/${courseID}` 
        : `http://localhost:5001/course/add_course`;
      const method = editing ? 'PUT' : 'POST';
  
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseID, courseName, credits, department, program: selectedPrograms })
      });
  
      if (response.ok) {
        alert(editing ? 'Course updated successfully' : 'Course added successfully');
  
        // **Convert department ID to department name**
        const departmentName = departments.find(d => d.id === department)?.name || department;
        
        // **Convert program IDs to program names**
        const programNames = selectedPrograms.map(progId => {
          const program = programs.find(p => p.id === progId);
          return program ? program.name : progId;
        });
  
        const newCourse = { 
          courseID, 
          courseName, 
          credits, 
          department: departmentName,  // ✅ Store department as name
          program: programNames  // ✅ Store program as names
        };
  
        const updatedCourses = editing 
          ? courses.map(course => course.courseID === courseID ? newCourse : course)
          : [...courses, newCourse];
  
        setCourses(updatedCourses);
        setFilteredCourses(updatedCourses);
        localStorage.setItem('courses', JSON.stringify(updatedCourses));
        resetForm();
      } else {
        alert('Failed to save course');
      }
    } catch (error) {
      console.error('Error saving course:', error);
    }
  };
  

  const handleEdit = (course) => {
    setCourseID(course.courseID);
    setCourseName(course.courseName);
    setCredits(course.credits);

    // Find department ID from the selected course
    const departmentId = departments.find(d => d.name === course.department)?.id || "";
    setDepartment(departmentId);

    // Filter programs based on selected department
    const relatedPrograms = programs.filter(prog => prog.departmentId === departmentId);
    setFilteredPrograms(relatedPrograms); // Set only relevant programs

    // Select programs related to the course
    const selectedProgramIds = relatedPrograms
        .filter(p => course.program.includes(p.name))
        .map(p => p.id);

    setSelectedPrograms(selectedProgramIds);

    setEditing(true);
  };

  const handleDelete = async (courseID) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this course?");
    if (!confirmDelete) return;

    try {
      const response = await fetch(`http://localhost:5001/course/delete_course/${courseID}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Course deleted successfully');
        const updatedCourses = courses.filter(course => course.courseID !== courseID);
        setCourses(updatedCourses);
        setFilteredCourses(updatedCourses);
        localStorage.setItem('courses', JSON.stringify(updatedCourses));
      } else {
        alert('Failed to delete course');
      }
    } catch (error) {
      console.error('Error deleting course:', error);
    }
  };

  const resetForm = () => {
    setCourseID('');
    setCourseName('');
    setCredits('');
    setDepartment('');
    setSelectedPrograms([]);
    setFilteredPrograms([]);
    setEditing(false);
  };

  const applyFilters = () => {
    let filtered = courses;

    // Filter by course name
    if (courseFilter) {
      filtered = filtered.filter((course) =>
        course.courseName.toLowerCase().includes(courseFilter.toLowerCase())
      );
    }

    setFilteredCourses(filtered);
  };

  const handleCourseFilterChange = (e) => {
    const input = e.target.value;
    setCourseFilter(input);
    applyFilters();
  };

  return (
    <div className=" items-center mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl mt-10 font-bold text-center text-gray-800">Courses</h2>

      <div className="flex items-center justify-center space-x-2 w-full mt-4">
        <div className="relative w-[400px] border border-gray-300 rounded-lg px-3 py-2 shadow-md flex flex-wrap items-center min-h-[42px]">
          <input 
            type="text"
            value={courseFilter}
            onChange={handleCourseFilterChange}
            placeholder="Search by Course Name"
            className="border-none focus:ring-0 outline-none w-[100%]"
          />
        </div>
        <button 
          onClick={applyFilters} 
          className="bg-blue-500 text-white px-6 py-2 rounded-lg shadow-md hover:bg-blue-600 transition"
        >
          Search
        </button>
        <button 
          onClick={() => setShowFilters(!showFilters)} 
          className="bg-blue-500 text-white p-3 rounded-full shadow-md flex items-center justify-center hover:bg-blue-600 transition"
        >
          <FilterIcon className="w-5 h-5" />
        </button>
      </div>

      {showFilters && (
        <div ref={filterRef} className="absolute right-[23rem] mt-2 mx-auto w-64 bg-blue-500 bg-opacity-95 text-white p-4 rounded-lg shadow-lg z-100">
          <h3 className="text-xl font-bold">FILTERS</h3>

          {/* Department Filter */}
          <div className="mt-4">
            <label className="font-semibold">Department</label>
            <select
              value={selectedDepartment}
              onChange={handleDepartmentFilterChange}
              className="block w-full p-2 mt-1 border border-gray-300 text-black rounded"
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.name}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          {/* Program Filter (Only show relevant programs for selected department) */}
          {filteredPrograms.length > 0 && (
            <div className="mt-4">
              <label className="font-semibold">Programs</label>
              <div className="mt-2">
                {filteredPrograms.map((prog) => (
                  <label key={prog.id} className="block">
                    <input
                      type="checkbox"
                      value={prog.id}
                      checked={filterSelectedPrograms.includes(prog.id)}
                      onChange={() => handleProgramFilterChange(prog.id)}
                      className="mr-2"
                    />
                    {prog.name}
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-4 shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full bg-white text-center">
            <thead className="bg-gray-100 text-gray-700">
              <tr className="border-b">
                <th className="px-4 py-3 w-[150px] min-w-[120px]">ID</th>
                <th className="px-4 py-3 w-[200px] min-w-[180px]">Course Name</th>
                <th className="px-4 py-3 w-[100px] min-w-[80px]">Credits</th>
                <th className="px-4 py-3 w-[200px] min-w-[180px]">Department</th>
                <th className="px-4 py-3 w-[200px] min-w-[180px]">Program</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
          </table>
        </div>

        <div className="max-h-80 overflow-y-scroll">
          <table className="w-full bg-white text-center">
            <tbody>
              {filteredCourses.length > 0 ? (
                filteredCourses.map((course) => (
                  <tr key={course.courseID} className="border-b hover:bg-gray-100 h-[50px] align-middle">
                    <td className="px-4 py-3 w-[150px] min-w-[120px]">{course.courseID}</td>
                    <td className="px-4 py-3 w-[200px] min-w-[180px]">{course.courseName}</td>
                    <td className="px-4 py-3 w-[100px] min-w-[80px]">{course.credits}</td>
                    <td className="px-4 py-3 w-[200px] min-w-[180px]">{course.department}</td>
                    <td className="px-4 py-3 w-[200px] min-w-[180px]">{course.program.join(', ')}</td>
                    <td className="px-4 py-3 flex justify-center space-x-3 align-middle">
                      <button onClick={() => handleEdit(course)} className="text-gray-500 hover:text-gray-700">
                        <EditIcon className="w-5 h-5" />
                      </button>
                      <button onClick={() => handleDelete(course.courseID)} className="text-gray-500 hover:text-gray-700">
                        <DeleteIcon className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">No courses found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 mt-6">
        {/* Course ID */}
        <input 
          type="text" 
          placeholder="Course ID" 
          value={courseID} 
          onChange={(e) => setCourseID(e.target.value)} 
          className="border border-gray-300 rounded-lg px-3 py-2 w-40" 
          disabled={editing} 
        />

        {/* Course Name */}
        <input 
          type="text" 
          placeholder="Course Name" 
          value={courseName} 
          onChange={(e) => setCourseName(e.target.value)} 
          className="border border-gray-300 rounded-lg px-3 py-2 w-60" 
        />

        {/* Credits */}
        <input 
          type="text" 
          placeholder="Credits" 
          value={credits} 
          onChange={(e) => setCredits(e.target.value)} 
          className="border border-gray-300 rounded-lg px-3 py-2 w-32" 
        />

        {/* Department Selection */}
        <select 
          value={department} 
          onChange={handleDepartmentChange} 
          className="border border-gray-300 rounded-lg px-3 py-2 w-48"
        >
          <option value="">Select Department</option>
          {departments.map((dept) => (
            <option key={dept.id} value={dept.id}>{dept.name}</option>
          ))}
        </select>

        {/* Programs Selection - Show only if department is selected */}
        {department && filteredPrograms.length > 0 && (
          <div className="border border-gray-200 rounded-lg p-2 x-2">
            <div className="flex flex-wrap gap-4">
              {filteredPrograms.map((prog) => (
                <label key={prog.id} className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    value={prog.id} 
                    checked={selectedPrograms.includes(prog.id)} 
                    onChange={() => handleProgramChange(prog.id)}
                  />
                  <span className="ml-2">{prog.name || "Unnamed Program"}</span>  {/* Ensure the name is shown */}
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Submit and Cancel Buttons */}
        <div className="flex items-center space-x-2">
        <button 
          onClick={handleSaveCourse} 
          className={`px-4 py-2 rounded-lg ${editing ? 'bg-yellow-500 text-' : 'bg-blue-500 text-white'}`}
        >
          {editing ? 'UPDATE' : 'ADD'}
        </button>
          {editing && (
            <button 
              onClick={resetForm} 
              className="bg-gray-500 text-white px-4 py-2 rounded-lg"
            >
              CANCEL
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
