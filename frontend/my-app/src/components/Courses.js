import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [courseID, setCourseID] = useState('');
  const [courseName, setCourseName] = useState('');
  const [credits, setCredits] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await fetch('http://localhost:5001/course/get_courses');
      const data = await response.json();
      setCourses(data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const handleSaveCourse = async () => {
    if (!courseID || !courseName || !credits) {
      alert('All fields are required');
      return;
    }
    try {
      const response = await fetch(`http://localhost:5001/course/${isEditing ? 'edit_course/' + courseID : 'add_course'}`, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseID, courseName, credits })
      });
      if (response.ok) {
        alert(`Course ${isEditing ? 'updated' : 'added'} successfully`);
        fetchCourses();
        setCourseID('');
        setCourseName('');
        setCredits('');
        setIsEditing(false);
      } else {
        alert(`Failed to ${isEditing ? 'update' : 'add'} course`);
      }
    } catch (error) {
      console.error(`Error ${isEditing ? 'updating' : 'adding'} course:`, error);
    }
  };

  const handleEditCourse = (course) => {
    setCourseID(course.courseID);
    setCourseName(course.courseName);
    setCredits(course.credits);
    setIsEditing(true);
  };

  const handleDeleteCourse = async (id) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    try {
      const response = await fetch(`http://localhost:5001/course/delete_course/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        alert('Course deleted successfully');
        fetchCourses();
      } else {
        alert('Failed to delete course');
      }
    } catch (error) {
      console.error('Error deleting course:', error);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl py-8 font-bold text-center text-gray-800">CICT Courses</h2>

      <table className="min-w-full bg-white border border-gray-300 text-center">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">ID</th>
            <th className="py-2 px-4 border-b">NAME</th>
            <th className="py-2 px-4 border-b">CREDITS</th>
            <th className="py-2 px-4 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {courses.map((course) => (
            <tr key={course.courseID} className="text-center">
              <td className="py-2 px-4 border-b">{course.courseID}</td>
              <td className="py-2 px-4 border-b">{course.courseName}</td>
              <td className="py-2 px-4 border-b">{course.credits}</td>
              <td className="py-2 px-4 border-b">
                <button className="bg-yellow-500 text-white px-2 py-1 rounded-lg mr-2" onClick={() => handleEditCourse(course)}>Edit</button>
                <button className="bg-red-500 text-white px-2 py-1 rounded-lg" onClick={() => handleDeleteCourse(course.courseID)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex mt-4">
        <input type="text" placeholder="Course ID" value={courseID} onChange={(e) => setCourseID(e.target.value)} className="w-1/3 border border-gray-300 rounded-lg px-3 py-2 mr-2" />
        <input type="text" placeholder="Course Name" value={courseName} onChange={(e) => setCourseName(e.target.value)} className="w-1/3 border border-gray-300 rounded-lg px-3 py-2 mr-2" />
        <input type="text" placeholder="Credits" value={credits} onChange={(e) => setCredits(e.target.value)} className="w-1/6 border border-gray-300 rounded-lg px-3 py-2 mr-2" />
        <button onClick={handleSaveCourse} className={`bg-${isEditing ? 'green' : 'blue'}-500 text-white px-4 py-2 rounded`}>
          {isEditing ? 'UPDATE' : 'ADD'}
        </button>
      </div>
    </div>
  );
}