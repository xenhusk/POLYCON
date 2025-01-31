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

  useEffect(() => {
    fetchCourses();
    fetchDepartments();
    fetchPrograms();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await fetch('http://localhost:5001/course/get_courses');
      const data = await response.json();
      
      if (Array.isArray(data.courses)) {
        setCourses(data.courses);
      } else {
        setCourses([]);
      }
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
    setDepartment(departments.find(d => d.name === course.department)?.id || '');
    setSelectedPrograms(programs.filter(p => course.program.includes(p.name)).map(p => p.id));
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
    setEditing(false);
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold text-center text-gray-800">CICT Courses</h2>
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

      <div className="flex flex-col mt-6 gap-4">
        <input 
          type="text" 
          placeholder="Course ID" 
          value={courseID} 
          onChange={(e) => setCourseID(e.target.value)} 
          className="border border-gray-300 rounded-lg px-3 py-1" 
          disabled={editing} 
        />
        <input 
          type="text" 
          placeholder="Course Name" 
          value={courseName} 
          onChange={(e) => setCourseName(e.target.value)} 
          className="border border-gray-300 rounded-lg px-3 py-2" 
        />
        <input 
          type="text" 
          placeholder="Credits" 
          value={credits} 
          onChange={(e) => setCredits(e.target.value)} 
          className="border border-gray-300 rounded-lg px-3 py-2" 
        />
        <select 
          value={department} 
          onChange={(e) => setDepartment(e.target.value)} 
          className="border border-gray-300 rounded-lg px-3 py-2"
        >
          <option value="">Select Department</option>
          {departments.map((dept) => (
            <option key={dept.id} value={dept.id}>{dept.name}</option>
          ))}
        </select>

        <div className="border border-gray-300 rounded-lg p-3">
          <p className="font-semibold">Select Programs:</p>
          {programs.map((prog) => (
            <label key={prog.id} className="block">
              <input 
                type="checkbox" 
                value={prog.id} 
                checked={selectedPrograms.includes(prog.id)} 
                onChange={() => handleProgramChange(prog.id)}
                className="mr-2"
              />
              {prog.name}
            </label>
          ))}
        </div>

        <button onClick={handleSaveCourse} className="bg-blue-500 text-white px-4 py-2 rounded">{editing ? 'UPDATE' : 'ADD'}</button>
      </div>
    </div>
  );
}
