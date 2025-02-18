import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ReactComponent as FilterIcon } from './icons/FilterAdd.svg';
import { ReactComponent as EditIcon } from './icons/Edit.svg';
import { ReactComponent as DeleteIcon } from './icons/delete.svg';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [showProgramModal, setShowProgramModal] = useState(false);
  const [selectedDepartmentPrograms, setSelectedDepartmentPrograms] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editCourse, setEditCourse] = useState(null);
  const filterRef = useRef(null);
  const modalRef = useRef(null);

  // Add these animation variants before your component
  const modalVariants = {
    hidden: { 
      opacity: 0,
      scale: 0.95,
      y: 20
    },
    visible: { 
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: 20,
      transition: {
        duration: 0.2
      }
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowProgramModal(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [modalRef]);

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

  const handleDepartmentClick = (departmentId) => {
    const departmentPrograms = programs.filter(prog => prog.departmentID === departmentId);
    setSelectedDepartmentPrograms(departmentPrograms);
    setShowProgramModal(true);
  };

  const closeProgramModal = () => {
    setShowProgramModal(false);
    setSelectedDepartmentPrograms([]);
  };
  // Add this new function for handling edit save
const handleEditSave = async () => {
  if (!editCourse || !editCourse.courseID || !editCourse.courseName || 
      !editCourse.credits || !department || !selectedPrograms.length) {
    alert('All fields are required');
    return;
  }

  try {
    const response = await fetch(`http://localhost:5001/course/edit_course/${editCourse.courseID}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        courseID: editCourse.courseID,
        courseName: editCourse.courseName,
        credits: editCourse.credits,
        department: department,
        program: selectedPrograms
      })
    });

    if (response.ok) {
      // Convert department ID to name and program IDs to names
      const departmentName = departments.find(d => d.id === department)?.name || department;
      const programNames = selectedPrograms.map(progId => {
        const program = programs.find(p => p.id === progId);
        return program ? program.name : progId;
      });

      const updatedCourse = {
        courseID: editCourse.courseID,
        courseName: editCourse.courseName,
        credits: editCourse.credits,
        department: departmentName,
        program: programNames
      };

      // Update the courses state
      const updatedCourses = courses.map(course => 
        course.courseID === editCourse.courseID ? updatedCourse : course
      );

      setCourses(updatedCourses);
      setFilteredCourses(updatedCourses);
      localStorage.setItem('courses', JSON.stringify(updatedCourses));
      
      alert('Course updated successfully');
      setShowEditModal(false);
      setEditCourse(null);
      resetForm();
    } else {
      alert('Failed to update course');
    }
  } catch (error) {
    console.error('Error updating course:', error);
    alert('Error updating course');
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
    // Use different values based on editing mode
    const cID = editing ? editCourse.courseID : courseID;
    const cName = editing ? editCourse.courseName : courseName;
    const cCredits = editing ? editCourse.credits : credits;
    const cDepartment = department; // This should be set to the selected department id
    const cPrograms = selectedPrograms; // Array of selected program ids
  
    // Debug log to check what values you have
    console.log({ cID, cName, cCredits, cDepartment, cPrograms });
  
    if (!cID || !cName || !cCredits || !cDepartment || cPrograms.length === 0) {
      alert('All fields are required');
      return;
    }
    
    try {
      const endpoint = editing 
        ? `http://localhost:5001/course/edit_course/${cID}` 
        : `http://localhost:5001/course/add_course`;
      const method = editing ? 'PUT' : 'POST';
    
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseID: cID, courseName: cName, credits: cCredits, department: cDepartment, program: cPrograms })
      });
    
      if (response.ok) {
        alert(editing ? 'Course updated successfully' : 'Course added successfully');
    
        // Convert department ID to department name and program IDs to names
        const departmentName = departments.find(d => d.id === cDepartment)?.name || cDepartment;
        const programNames = cPrograms.map(progId => {
          const program = programs.find(p => p.id === progId);
          return program ? program.name : progId;
        });
    
        const newCourse = { 
          courseID: cID, 
          courseName: cName, 
          credits: cCredits, 
          department: departmentName,  // store department as name
          program: programNames         // store programs as names
        };
    
        const updatedCourses = editing
          ? courses.map(course => course.courseID === cID ? newCourse : course)
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
    setEditCourse({ ...course });
    
    // Convert department name to its ID for editing if needed
    const deptObj = departments.find((d) => d.name === course.department);
    if (deptObj) {
      setDepartment(deptObj.id);
      const relatedPrograms = programs.filter((prog) => prog.departmentID === deptObj.id);
      setFilteredPrograms(relatedPrograms);
      const selectedProgramIds = relatedPrograms
        .filter((p) => course.program.includes(p.name))
        .map((p) => p.id);
      setSelectedPrograms(selectedProgramIds);
    } else {
      setDepartment('');
      setFilteredPrograms([]);
      setSelectedPrograms([]);
    }
    
    setShowEditModal(true);
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
    setShowEditModal(false); // Hide edit modal after reset
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
    <div className=" items-center mx-auto p-6 bg-white">
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
          className="bg-[#057DCD] text-white px-6 py-2 rounded-lg shadow-md hover:bg-blue-600 transition"
        >
          Search
        </button>
        <button 
          onClick={() => setShowFilters(!showFilters)} 
          className="bg-[#057DCD] text-white p-3 rounded-full shadow-md flex items-center justify-center hover:bg-blue-600 transition"
        >
          <FilterIcon className="w-5 h-5" />
        </button>
      </div>

      {showFilters && (
  <div ref={filterRef} className="absolute right-[23rem] mt-2 mx-auto w-80 bg-white rounded-xl shadow-2xl overflow-hidden z-40 bg-opacity-80">
    {/* Header */}
    <div className="bg-[#0065A8] px-6 py-4">
      <h3 className="text-xl font-semibold text-white">FILTERS</h3>
    </div>

    {/* Filter Content */}
    <div className="p-6 space-y-4 bg-opacity-80">
      {/* Department Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 bg-opacity-80">
          Department
        </label>
        <select
          value={selectedDepartment}
          onChange={handleDepartmentFilterChange}
          className="w-full border-2 border-[#0065A8] rounded-lg px-3 py-2 text-gray-700
                     focus:outline-none focus:ring-2 focus:ring-[#54BEFF]"
        >
          <option value="">All Departments</option>
          {departments.map((dept) => (
            <option key={dept.id} value={dept.name}>
              {dept.name}
            </option>
          ))}
        </select>
      </div>

      {/* Programs Filter */}
      {filteredPrograms.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Programs
          </label>
          <div className="max-h-40 overflow-y-auto border-2 border-[#0065A8] rounded-lg">
            {filteredPrograms.map((prog) => (
              <div key={prog.id} className="px-2 py-1">
                <label className={`flex items-center p-2 rounded-lg transition-colors duration-200
                  ${filterSelectedPrograms.includes(prog.id) 
                    ? 'bg-[#0065A8] text-white' 
                    : 'hover:bg-[#54BEFF] text-white'
                  }`}
                >
                  <input
                    type="checkbox"
                    value={prog.id}
                    checked={filterSelectedPrograms.includes(prog.id)}
                    onChange={() => handleProgramFilterChange(prog.id)}
                      className="mr-3 h-4 w-4 accent-[#0065A8] border-gray-300 rounded 
             checked:bg-[#0065A8] checked:hover:bg-[#54BEFF] "
                  />
                  <span className={filterSelectedPrograms.includes(prog.id) 
                    ? 'text-white' 
                    : 'text-gray-700'
                  }>
                    {prog.name}
                  </span>
                </label>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  </div>
)}
<div className="flex justify-center w-full">
  <div className="mt-4 shadow-md rounded-lg overflow-hidden w-[70%] mx-auto">
    <div className="overflow-x-auto">
      <table className="w-full bg-white text-center table-fixed">
        {/* Fixed Table Header */}
        <thead className="bg-[#057DCD] text-white top-0 z-10">
          <tr className="border-b">
            <th className="py-3 ">ID</th>
            <th className=" py-3  ">Course Name</th>
            <th className=" py-3  ">Credits</th>
            <th className="py-3  ">Department</th>
            <th className=" py-3 ">Program</th>
            <th className=" py-3  text-center">Actions</th>
          </tr>
        </thead>
      </table>
      
      {/* Scrollable Table Body */}
      <div className="max-h-80 overflow-y-auto">
        <table className="w-full bg-white text-center table-fixed">
        <tbody>
          {courses.length === 0 ? (
            <tr>
              <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                Loading, please wait...
              </td>
            </tr>
          ) : filteredCourses.length > 0 ? (
            filteredCourses.map((course) => (
              <tr key={course.courseID} className="border-b hover:bg-[#DBF1FF] h-[50px] align-middle">
                <td className="px-4 py-3">{course.courseID}</td>
                <td className="px-4 py-3">{course.courseName}</td>
                <td className="px-4 py-3">{course.credits}</td>
                <td className="px-4 py-3">{course.department}</td>
                <td className="px-4 py-3">{course.program.join(', ')}</td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center space-x-3">
                    <button
                      onClick={() => handleEdit(course)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <EditIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(course.courseID)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <DeleteIcon className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                No courses found
              </td>
            </tr>
          )}
        </tbody>
        </table>
      </div>
    </div>
  </div>
</div>

      
<div className="flex justify-center w-full">
  <div className="relative mt-6 shadow-md rounded-lg p-1 bg-white">
    <div className="flex flex-wrap items-center gap-4 justify-center">
      {/* Course ID */}
      <input 
        type="text" 
        placeholder="Course ID" 
        value={courseID} 
        onChange={(e) => setCourseID(e.target.value)} 
        className="rounded-lg px-4 py-2 outline-none focus:ring focus:ring-blue-500 focus:border-blue-500" 
        disabled={editing} 
      />

      {/* Course Name */}
      <input 
        type="text" 
        placeholder="Course Name" 
        value={courseName} 
        onChange={(e) => setCourseName(e.target.value)} 
        className="rounded-lg px-3 py-2 w-60 outline-none focus:ring focus:ring-blue-500 focus:border-blue-500" 
      />

      {/* Credits */}
      <input 
        type="text" 
        placeholder="Credits" 
        value={credits} 
        onChange={(e) => setCredits(e.target.value)} 
        className="rounded-lg px-3 py-2 w-32 outline-none focus:ring focus:ring-blue-500 focus:border-blue-500" 
      />

      {/* Department Selection */}
      <select
        value={selectedDepartment}
        onChange={(e) => {
          setSelectedDepartment(e.target.value);
          setDepartment(e.target.value); // Update department state for validation
          handleDepartmentClick(e.target.value);
        }}
        className="block p-2 outline-none focus:ring focus:ring-blue-500 focus:border-blue-500 text-black rounded-lg"
      >
        <option value="">Select Department</option>
        {departments.map((dept) => (
          <option key={dept.id} value={dept.id}>{dept.name}</option>
        ))}
      </select>
           {/* Program Modal */}
           {showProgramModal && (
        <div className="absolute right-[3.5rem] bottom-[4rem] mt-2 w-64 bg-blue-500 bg-opacity-95 text-white p-4 rounded-lg shadow-lg z-50">
          <div ref={modalRef}>
            <h3 className="text-xl font-bold mb-4">Programs</h3>
            <div className="max-h-60 overflow-y-auto">
              {selectedDepartmentPrograms.map((prog) => (
                <div key={prog.id} className="mb-1">
                  <label
                    className={`block p-2 rounded-lg transition-colors duration-200 ${
                      selectedPrograms.includes(prog.id) ? 'bg-white text-black' : 'hover:bg-white hover:text-black'
                    }`}
                  >
                    <input
                      type="checkbox"
                      value={prog.id}
                      checked={selectedPrograms.includes(prog.id)}
                      onChange={() => handleProgramChange(prog.id)}
                      className="mr-2"
                    />
                    {prog.name}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
{showEditModal && editCourse && (
  <AnimatePresence>
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="bg-white rounded-xl shadow-2xl w-[40rem] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-[#0065A8] px-8 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-white">Edit Course</h2>
          <button
            onClick={() => { setShowEditModal(false); setEditCourse(null); }}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

      {/* Modal Body */}
      <div className="p-8 mx-3 space-y-6 bg-white rounded-b-lg">

        {/* Course Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Course Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={editCourse.courseName}
            onChange={(e) => setEditCourse({ ...editCourse, courseName: e.target.value })}
            className="w-full border-2 border-[#0065A8] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#54BEFF]"
          />
        </div>

        {/* Credits */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Credits <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={editCourse.credits}
            onChange={(e) => setEditCourse({ ...editCourse, credits: e.target.value })}
            className="w-full border-2 border-[#0065A8] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#54BEFF]"
          />
        </div>

        {/* Department */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Department <span className="text-red-500">*</span>
          </label>
          <select
            value={department}
            onChange={(e) => {
              const deptId = e.target.value;
              setDepartment(deptId);
              const deptProgs = programs.filter(prog => prog.departmentID === deptId);
              setSelectedDepartmentPrograms(deptProgs);
            }}
            className="w-full border-2 border-[#0065A8] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#54BEFF]"
          >
            <option value="">Select Department</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>{dept.name}</option>
            ))}
          </select>
        </div>

        {/* Programs */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Programs <span className="text-red-500">*</span>
          </label>
<div className="max-h-40 overflow-y-auto border-2 border-[#0065A8] rounded-lg px-3 pt-2">
  {selectedDepartmentPrograms.map((prog) => (
    <div key={prog.id} className="mb-2">
      <label 
        className={`flex items-center p-2 rounded-lg transition-colors duration-200
           ${selectedPrograms.includes(prog.id) 
            ? 'bg-[#0065A8] text-white hover:bg-[#54BEFF]' 
            : 'hover:bg-[#54BEFF] text-white'
          }`}
      >
<input
  type="checkbox"
  value={prog.id}
  checked={selectedPrograms.includes(prog.id)}
  onChange={() => handleProgramChange(prog.id)}
  className="mr-3 h-4 w-4 accent-[#0065A8] border-gray-300 rounded 
             checked:bg-[#0065A8] checked:hover:bg-[#54BEFF] "
/>
        <span className={`${selectedPrograms.includes(prog.id) ? 'text-white' : 'text-gray-700'}`}>
          {prog.name}
        </span>
      </label>
    </div>
  ))}
</div>
        </div>
      </div>

      {/* Buttons */}
      <div className="px-6 py-4 flex justify-end space-x-4 bg-white rounded-b-lg">
        <button
          onClick={handleEditSave}
          className="bg-[#0065A8] hover:bg-[#54BEFF] text-white px-4 py-2 rounded-lg transition-colors"
        >
          Save Changes
        </button>
        <button
          onClick={() => { setShowEditModal(false); setEditCourse(null); }}
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Cancel
        </button>
      </div>
  </motion.div>
  </div>
</AnimatePresence>

)}



      {/* Submit and Cancel Buttons */}
      <div className="flex items-center space-x-2">
        <button 
          onClick={handleSaveCourse} 
          className={`px-4 py-2 rounded-lg bg-[#057DCD] text-white hover:bg-blue-500`}
        >
          ADD
        </button>
      </div>
    </div>
  </div>
</div>
      </div>
  );
}
