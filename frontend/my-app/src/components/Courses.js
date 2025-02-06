import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
  const [selectedDepartment, setSelectedDepartment] = useState(""); // Selected department for filtering


  useEffect(() => {
    fetchCourses();
    fetchDepartments();
    fetchPrograms();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await fetch('http://localhost:5001/course/get_courses');
      const data = await response.json();
      setCourses(data.courses || []);
      setFilteredCourses(data.courses || []); // Initialize filtered courses
    } catch (error) {
      console.error('Error fetching courses:', error);
      setCourses([]);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await fetch('http://localhost:5001/course/get_departments');
      const data = await response.json();
      setDepartments(data);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchPrograms = async () => {
    try {
      const response = await fetch('http://localhost:5001/course/get_programs');
      const data = await response.json();
      setPrograms(data);
    } catch (error) {
      console.error('Error fetching programs:', error);
    }
  };

  const handleDepartmentFilterChange = (e) => {
    const selectedDept = e.target.value;
    setSelectedDepartment(selectedDept);
    applyFilters(selectedDept, selectedPrograms);
  };
  const handleProgramFilterChange = (programId) => {
    const updatedPrograms = selectedPrograms.includes(programId)
      ? selectedPrograms.filter((id) => id !== programId)
      : [...selectedPrograms, programId];

    setSelectedPrograms(updatedPrograms);
    applyFilters(selectedDepartment, updatedPrograms);
  };
  const applyFilters = (dept, progList) => {
    let filtered = courses;

    if (dept) {
      filtered = filtered.filter((course) => course.department === dept);
    }

    if (progList.length > 0) {
      filtered = filtered.filter((course) =>
        course.program.some((prog) => progList.includes(prog))
      );
    }
    setFilteredCourses(filtered);
  };

  const handleDepartmentChange = (e) => {
    const selectedDepartment = e.target.value;
    setDepartment(selectedDepartment);

    // Debugging: Log the selected department
    console.log("Selected Department:", selectedDepartment);
    console.log("Programs Before Filtering:", programs);

    // Filter programs based on extracted department ID
    const departmentPrograms = programs.filter(prog => prog.departmentID === selectedDepartment);

    // Debugging: Log the filtered programs
    console.log("Filtered Programs After Selection:", departmentPrograms);

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
        fetchCourses();
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
        setCourses(courses.filter(course => course.courseID !== courseID)); // Update UI instantly
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

  return (
    <div className="max-w-9xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold text-center text-gray-800">Courses</h2>

            {/* Filter Sidebar */}
            <div className="flex">
        <div className="w-1/4 p-4 bg-blue-500 text-white rounded-lg">
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

          {/* Program Filter */}
          <div className="mt-4">
            <label className="font-semibold">Programs</label>
            <div className="mt-2">
              {programs.map((prog) => (
                <label key={prog.id} className="block">
                  <input
                    type="checkbox"
                    value={prog.id}
                    checked={selectedPrograms.includes(prog.id)}
                    onChange={() => handleProgramFilterChange(prog.id)}
                    className="mr-2"
                  />
                  {prog.name}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Table of Courses */}
        <div className="w-3/4 ml-6">
          <table className="min-w-full bg-white border border-gray-300 text-center">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">ID</th>
                <th className="py-2 px-4 border-b">NAME</th>
                <th className="py-2 px-4 border-b">CREDITS</th>
                <th className="py-2 px-4 border-b">DEPARTMENT</th>
                <th className="py-2 px-4 border-b">PROGRAM</th>
              </tr>
            </thead>
            <tbody>
              {filteredCourses.map((course) => (
                <tr key={course.courseID} className="text-center">
                  <td className="py-2 px-4 border-b">{course.courseID}</td>
                  <td className="py-2 px-4 border-b">{course.courseName}</td>
                  <td className="py-2 px-4 border-b">{course.credits}</td>
                  <td className="py-2 px-4 border-b">{course.department}</td>
                  <td className="py-2 px-4 border-b">{course.program.join(', ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <table className="min-w-full bg-white border border-gray-300 text-center">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">ID</th>
            <th className="py-2 px-4 border-b">NAME</th>
            <th className="py-2 px-4 border-b">CREDITS</th>
            <th className="py-2 px-4 border-b">DEPARTMENT</th>
            <th className="py-2 px-4 border-b">PROGRAM</th>
            <th className="py-2 px-4 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {courses.map((course) => (
            <tr key={course.courseID} className="text-center">
              <td className="py-2 px-4 border-b">{course.courseID}</td>
              <td className="py-2 px-4 border-b">{course.courseName}</td>
              <td className="py-2 px-4 border-b">{course.credits}</td>
              <td className="py-2 px-4 border-b">{course.department}</td>
              <td className="py-2 px-4 border-b">{course.program.join(', ')}</td>
              <td className="py-2 px-4 border-b">
                <button onClick={() => handleEdit(course)} className="bg-yellow-500 text-white px-2 py-1 rounded-lg mr-2">Edit</button>
                <button onClick={() => handleDelete(course.courseID)} className="bg-red-500 text-white px-2 py-1 rounded-lg">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

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





        {/* Submit Button */}
        <button 
          onClick={handleSaveCourse} 
          className="bg-blue-500 text-white px-4 py-2 rounded-lg"
        >
          {editing ? 'UPDATE' : 'ADD'}
        </button>
      </div>
    </div>
  );
}
