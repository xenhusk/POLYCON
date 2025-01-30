import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [courseID, setCourseID] = useState('');
  const [courseName, setCourseName] = useState('');
  const [credits, setCredits] = useState('');
  const [loading, setLoading] = useState(true); // Add loading state
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === '/courses') {
      fetchCourses();
    }
  }, [location.pathname]);

  const fetchCourses = async () => {
    try {
      const response = await fetch('http://localhost:5001/course/get_courses');
      const data = await response.json();
      setCourses(data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false); // Set loading to false after fetching
    }
  };

  const handleAddCourse = async (event) => {
    event.preventDefault(); // Prevents form submission from causing a page reload
    if (!courseID || !courseName || !credits) {
      alert('All fields are required');
      return;
    }
    try {
      const response = await fetch('http://localhost:5001/course/add_course', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseID, courseName, credits })
      });
      if (response.ok) {
        alert('Course added successfully');
        fetchCourses(); // Refresh course list without refreshing the page
        setCourseID('');
        setCourseName('');
        setCredits('');
      } else {
        alert('Failed to add course');
      }
    } catch (error) {
      console.error('Error adding course:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>; // Show loading indicator while fetching
  }

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold text-center text-gray-800">CICT Courses</h2>
      <div className="flex mb-4">
        <input type="text" placeholder="Search by Name | ID" className="w-full border border-gray-300 rounded-lg px-3 py-2" />
        <button className="ml-2 bg-blue-500 text-white px-4 py-2 rounded">SEARCH</button>
      </div>
      <table className="min-w-full bg-white border border-gray-300">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">ID</th>
            <th className="py-2 px-4 border-b">NAME</th>
            <th className="py-2 px-4 border-b">CREDITS</th>
          </tr>
        </thead>
        <tbody>
          {courses.map((course) => (
            <tr key={course.courseID}>
              <td className="py-2 px-4 border-b">{course.courseID}</td>
              <td className="py-2 px-4 border-b">{course.courseName}</td>
              <td className="py-2 px-4 border-b">{course.credits}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <form onSubmit={handleAddCourse} className="flex mt-4">
        <input type="text" placeholder="Course ID" value={courseID} onChange={(e) => setCourseID(e.target.value)} className="w-1/3 border border-gray-300 rounded-lg px-3 py-2 mr-2" />
        <input type="text" placeholder="Course Name" value={courseName} onChange={(e) => setCourseName(e.target.value)} className="w-1/3 border border-gray-300 rounded-lg px-3 py-2 mr-2" />
        <input type="text" placeholder="Credits" value={credits} onChange={(e) => setCredits(e.target.value)} className="w-1/6 border border-gray-300 rounded-lg px-3 py-2 mr-2" />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">ADD</button>
      </form>
    </div>
  );
}