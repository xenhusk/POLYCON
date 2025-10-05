import React, { useEffect, useState, useRef } from "react";
import { createPortal } from 'react-dom';
import { useNavigate } from "react-router-dom";
import { ReactComponent as FilterIcon } from "./icons/FilterAdd.svg";
import { ReactComponent as EditIcon } from "./icons/Edit.svg";
import { ReactComponent as DeleteIcon } from "./icons/delete.svg";
import { motion, AnimatePresence } from "framer-motion";
import { ReactComponent as RedoIcon } from './icons/redo.svg'; // Add this import
import './transitions.css';
import API_URL from '../apiConfig';

export default function Courses() {
  const userRole = localStorage.getItem('userRole');
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [courseID, setCourseID] = useState(""); // This should be for the course code, not the integer PK
  const [courseName, setCourseName] = useState("");
  const [credits, setCredits] = useState("");
  const [department, setDepartment] = useState("");
  const [selectedPrograms, setSelectedPrograms] = useState([]);
  const [editing, setEditing] = useState(false);
  const navigate = useNavigate();
  const [filteredPrograms, setFilteredPrograms] = useState([]); // Filtered programs for selected department
  const [filteredCourses, setFilteredCourses] = useState([]); // Stores filtered courses
  const [selectedDepartment, setSelectedDepartment] = useState(""); // Selected department for filtering
  const [showFilters, setShowFilters] = useState(false); // Controls filter visibility
  const [filterSelectedPrograms, setFilterSelectedPrograms] = useState([]); // Programs selected in filter
  const [courseFilter, setCourseFilter] = useState(""); // Course filter input
  const [showProgramModal, setShowProgramModal] = useState(false);
  const [selectedDepartmentPrograms, setSelectedDepartmentPrograms] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editCourse, setEditCourse] = useState(null);
  const filterRef = useRef(null);
  const modalRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", content: "" });
  const [isAddLoading, setIsAddLoading] = useState(false);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [isCourseLoading, setIsCourseLoading] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);
  const [FilterClicked, setFilterClicked] = useState(false);
  const [SearchClicked, setSearchClicked] = useState(false);
  const [AddClicked, setAddClicked] = useState(false);
  const [CancelClicked, setCancelClicked] = useState(false);
  const [SaveClicked, setSaveClicked] = useState(false);
  const [EditClicked, setEditClicked] = useState(false);
  const [DeleteClicked, setDeleteClicked] = useState(false);
  // All hooks must be at the top, before any conditional returns
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  const PolyconLogo = require('./icons/Polycon.svg').ReactComponent;

  // All useEffect hooks must be called unconditionally at the top level
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowProgramModal(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [modalRef]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilters(false); // Only hide the filter panel, don't reset filters
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [filterRef]);

  // Consistent blocking message and logout button for admin on mobile/tabl

  // Add these animation variants before your component
  const modalVariants = {
    hidden: {
      opacity: 0,
      scale: 0.95,
      y: 20,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.8, // Changed scale for stronger exit effect
      y: 20,
      transition: {
        duration: 0.3, // Extended duration for smoother fade
      },
    },
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

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [modalRef]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilters(false); // Only hide the filter panel, don't reset filters
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [filterRef]); // Remove dependencies that reset filters

  const fetchInitialData = async () => {
    setIsCourseLoading(true);
    try {
      const [coursesResponse, departmentsResponse, programsResponse] =
        await Promise.all([
          fetch(`${API_URL}/course/get_courses`),
          fetch(`${API_URL}/course/get_departments`),
          fetch(`${API_URL}/course/get_programs`),
        ]);
      const coursesData = await coursesResponse.json();
      const departmentsData = await departmentsResponse.json();
      const programsData = await programsResponse.json();

      setCourses(coursesData.courses || []);
      setFilteredCourses(coursesData.courses || []);
      setDepartments(departmentsData);
      setPrograms(programsData);

      localStorage.setItem("courses", JSON.stringify(coursesData.courses));
      localStorage.setItem("departments", JSON.stringify(departmentsData));
      localStorage.setItem("programs", JSON.stringify(programsData));
    } catch (error) {
      console.error("Error fetching initial data:", error);
    } finally {
      setIsCourseLoading(false);
    }
  };

  const handleDepartmentClick = (departmentId) => {
    // departmentId is the department's integer id (from PostgreSQL)
    const departmentPrograms = programs.filter(
      (prog) => String(prog.departmentID) === String(departmentId)
    );
    setSelectedDepartmentPrograms(departmentPrograms);
    setShowProgramModal(true);
  };

  const closeProgramModal = () => {
    setShowProgramModal(false);
    setSelectedDepartmentPrograms([]);
  };

  const handleSaveCourse = async () => {
    setIsAddLoading(true);
    setMessage({ type: "", content: "" });
    try {
      const payload = {
        courseName,
        code: courseID, // Use courseID as the course code string
        credits: parseInt(credits, 10),
        department: parseInt(department, 10),
        program: selectedPrograms.length > 0 ? selectedPrograms.map((id) => parseInt(id, 10)) : undefined,
      };
      // Remove undefined fields (especially program if empty)
      Object.keys(payload).forEach(key => payload[key] === undefined || payload[key] === null || payload[key] === "" ? delete payload[key] : null);
      const response = await fetch(`${API_URL}/course/add_course`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage({ type: "success", content: data.message });
        resetForm();
        fetchInitialData();
      } else {
        setMessage({ type: "error", content: data.error });
      }
    } catch (error) {
      setMessage({ type: "error", content: error.message });
    } finally {
      setIsAddLoading(false);
    }
  };

  const handleEdit = (course) => {
    setEditCourse({ ...course });
    // Convert department name to its ID for editing
    const deptObj = departments.find((d) => d.name === course.department);
    if (deptObj) {
      setDepartment(deptObj.id);
      const departmentPrograms = programs.filter(
        (prog) => prog.departmentID === deptObj.id
      );
      setFilteredPrograms(departmentPrograms);
      setSelectedDepartmentPrograms(departmentPrograms);
      // Find and set the IDs of programs that are already selected
      const selectedProgramIds = departmentPrograms
        .filter((prog) => course.program.includes(prog.name))
        .map((prog) => prog.id);
      setSelectedPrograms(selectedProgramIds);
    } else {
      setDepartment("");
      setFilteredPrograms([]);
      setSelectedDepartmentPrograms([]);
      setSelectedPrograms([]);
    }
    setShowEditModal(true);
  };

  const handleDelete = async (courseID) => {
    setMessage({
      type: "warning",
      content: (
        <div className="flex items-center justify-between">
          <span>Are you sure you want to delete this course?</span>
          <div className="flex gap-2">
            <button
              onClick={async () => {
                try {
                  const response = await fetch(
                    `${API_URL}/course/delete_course/${courseID}`,
                    { method: "DELETE" }
                  );
                  if (response.ok) {
                    await fetchInitialData();
                    setMessage({ type: "success", content: "Course deleted successfully" });
                  } else {
                    setMessage({ type: "error", content: "Failed to delete course" });
                  }
                } catch (error) {
                  setMessage({ type: "error", content: "Error deleting course" });
                }
                setTimeout(() => setMessage({ type: "", content: "" }), 3000);
              }}
              className="bg-red-500 text-white px-3 py-1 ml-3 rounded hover:bg-red-600"
            >
              Delete
            </button>
            <button
              onClick={() => setMessage({ type: "", content: "" })}
              className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      ),
    });
  };

  const resetForm = () => {
    setCourseID("");
    setCourseName("");
    setCredits("");
    setDepartment("");
    setSelectedPrograms([]);
    setFilteredPrograms([]);
    setEditing(false);
    setShowEditModal(false); // Hide edit modal after reset
  };

  const applyFilters = () => {
    setIsFiltering(true);
    
    setTimeout(() => {
      let filtered = courses;

      // Text filter
      if (courseFilter) {
        filtered = filtered.filter((course) =>
          course.courseName.toLowerCase().includes(courseFilter.toLowerCase())
        );
      }

      // Department filter (selectedDepartment holds the department NAME)
      if (selectedDepartment) {
        filtered = filtered.filter((course) => course.department === selectedDepartment);
      }

      // Program filter (filterSelectedPrograms holds program IDs; map to names to compare against course.program[])
      if (filterSelectedPrograms.length > 0) {
        const selectedProgramNames = programs
          .filter((prog) => filterSelectedPrograms.includes(prog.id))
          .map((prog) => prog.name);

        if (selectedProgramNames.length > 0) {
          filtered = filtered.filter((course) =>
            Array.isArray(course.program) &&
            selectedProgramNames.every((progName) => course.program.includes(progName))
          );
        }
      }

      setFilteredCourses(filtered);
      setIsFiltering(false);
    }, 500);
  };

  const handleCourseFilterChange = (e) => {
    const input = e.target.value;
    setCourseFilter(input);
    applyFilters();
  };

  // Add new reset filters function
  const handleResetFilters = () => {
    setSelectedDepartment("");
    setFilterSelectedPrograms([]);
    setFilteredPrograms([]);
    setFilteredCourses(courses);
  };

  const handleDepartmentFilterChange = (e) => {
    const selectedDeptName = e.target.value;
    setSelectedDepartment(selectedDeptName);

    // Find department ID using name, then stage the list of programs for UI only
    const selectedDept = departments.find((dept) => dept.name === selectedDeptName);
    const selectedDeptId = selectedDept ? selectedDept.id : null;

    if (selectedDeptId) {
      const departmentPrograms = programs.filter((prog) => prog.departmentID === selectedDeptId);
      setFilteredPrograms(departmentPrograms);
    } else {
      setFilteredPrograms([]);
    }
    // Do NOT update table here; will apply on Apply Filters
  };
  
  const handleProgramFilterChange = (programId) => {
    const updatedPrograms = filterSelectedPrograms.includes(programId)
      ? filterSelectedPrograms.filter((id) => id !== programId)
      : [...filterSelectedPrograms, programId];

    // Stage selection only; do not update table until Apply Filters
    setFilterSelectedPrograms(updatedPrograms);
  };
  
  const handleProgramChange = (programId) => {
    if (selectedPrograms.includes(programId)) {
      setSelectedPrograms(selectedPrograms.filter((id) => id !== programId));
    } else {
      setSelectedPrograms([...selectedPrograms, programId]);
    }
  };
  
  const handleEditSave = async () => {
    setIsEditLoading(true);
    setMessage({ type: "", content: "" });
    try {
      if (!editCourse) return;
      const payload = {
        courseName: editCourse.courseName,
        code: editCourse.code || courseID,
        credits: parseInt(editCourse.credits, 10),
        department: parseInt(department, 10),
        program: selectedPrograms.length > 0 ? selectedPrograms.map((id) => parseInt(id, 10)) : undefined,
      };
      Object.keys(payload).forEach(key => payload[key] === undefined || payload[key] === null || payload[key] === "" ? delete payload[key] : null);
      const response = await fetch(`${API_URL}/course/edit_course/${editCourse.courseID}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage({ type: "success", content: data.message });
        setShowEditModal(false);
        setEditCourse(null);
        fetchInitialData();
      } else {
        setMessage({ type: "error", content: data.error });
      }
    } catch (error) {
      setMessage({ type: "error", content: error.message });
    } finally {
      setIsEditLoading(false);
    }
  };

  if (userRole === 'admin' && isMobile) {
    return (
      <div className="flex flex-col pt-10 items-center min-h-screen w-screen bg-[#005B98]">
        <PolyconLogo style={{ height: '200px', width: 'auto', marginBottom: '24px' }} />
        <h3 className="text-2xl font-bold text-white mb-4 mx-9 text-center">Faculty Portal Unavailable on Mobile/Tablet</h3>
        <p className="text-white mb-6 mx-9 text-center">For security and usability, please use a desktop or laptop to access admin features.</p>
        <button
          className="bg-[#057DCD] text-white px-6 py-2 rounded-lg shadow-md hover:bg-[#54BEFF] transition"
          onClick={() => {
            localStorage.clear();
            window.location.href = "/";
          }}
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative py-16 overflow-hidden"
      >
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#057DCD] via-[#046bb8] to-[#034a94]" />
        <div className="absolute inset-0 bg-black bg-opacity-20" />
        
        {/* Floating Elements */}
        <motion.div
          animate={{ 
            y: [0, -20, 0],
            rotate: [0, 5, 0]
          }}
          transition={{ 
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-10 left-10 w-20 h-20 bg-blue-400 rounded-full opacity-20"
        />
        <motion.div
          animate={{ 
            y: [0, 30, 0],
            rotate: [0, -5, 0]
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-10 right-10 w-32 h-32 bg-blue-300 rounded-full opacity-15"
        />
        <motion.div
          animate={{ 
            y: [0, -15, 0],
            x: [0, 10, 0]
          }}
          transition={{ 
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/2 right-1/4 w-16 h-16 bg-blue-200 rounded-full opacity-25"
        />

        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
              Course Management
            </h1>
            
            <p className="text-lg text-blue-100 max-w-2xl mx-auto">
              Manage and organize academic courses across departments and programs
            </p>
          </motion.div>
        </div>
      </motion.section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" style={{ overflow: 'visible' }}>
        {/* Updated toast message display */}
      {message.content && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className={`fixed top-5 right-5 left-5 sm:left-auto sm:right-5 p-4 rounded-xl shadow-xl z-50 text-sm sm:text-base backdrop-blur-sm ${
            message.type === "success"
                ? "bg-green-500/90 text-white border border-green-400"
              : message.type === "warning"
                ? "bg-yellow-500/90 text-white border border-yellow-400"
                : "bg-red-500/90 text-white border border-red-400"
            }`}
          >
            <div className="flex items-center gap-3">
              {message.type === "success" ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : message.type === "warning" ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
          {typeof message.content === 'string' ? message.content : message.content}
        </div>
          </motion.div>
        )}

        {/* Search and Filter Section - Enhanced with modern card design */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-8 flex justify-center"
          style={{ zIndex: 10 }}
        >
          <div className="w-full max-w-6xl">
            {/* Search Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 mb-6 relative" style={{ zIndex: 11, overflow: 'visible' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-[#0065A8] to-[#057DCD] rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800">Search Courses</h3>
              </div>
              
              <div className="relative w-full" style={{ zIndex: 12 }}>
                <div className="bg-white border-2 border-gray-200 rounded-xl px-4 py-3 shadow-sm flex items-center min-h-[50px] w-full gap-2 hover:border-[#0065A8] transition-colors">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
            <input
              type="text"
              value={courseFilter}
              onChange={handleCourseFilterChange}
                    placeholder="Search courses by name..."
                    className="w-full pl-12 pr-4 py-3 bg-transparent border-none focus:ring-0 outline-none text-gray-700 placeholder-gray-400"
            />
          </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAddModal(true)}
                className={`flex-1 max-w-[200px] sm:flex-none bg-gradient-to-r from-[#0065A8] to-[#057DCD] text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 text-sm font-semibold flex items-center justify-center gap-2
                  ${AddClicked ? "scale-90" : "scale-100"}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Course
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setFilterClicked(true);
              setTimeout(() => setFilterClicked(false), 300); 
                  setShowFilters(!showFilters);
                }}
                className={`w-14 h-12 sm:w-auto bg-gradient-to-r from-[#057DCD] to-[#54BEFF] text-white px-4 sm:px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 font-semibold
              ${FilterClicked ? "scale-90" : "scale-100"}`}
          >
            <FilterIcon className="w-5 h-5" />
                <span className="hidden sm:inline">Filter</span>
              </motion.button>
        </div>
      </div>
        </motion.div>

      {showFilters && createPortal(
        <div className="fixed bg-black/60 backdrop-blur-md flex items-center justify-center p-4" style={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          margin: 0,
          padding: '1rem',
          zIndex: 9999
        }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto border border-gray-100"
               onClick={(e) => e.stopPropagation()}
               style={{
                 scrollbarWidth: 'none',
                 msOverflowStyle: 'none',
                 zIndex: 9999
               }}>
            {/* Modern Filter Header */}
            <div className="bg-gradient-to-r from-[#0065A8] to-[#057DCD] px-6 py-6 flex justify-between items-center sticky top-0 z-10">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-white">
                Course Filters
              </h2>
              </div>
              <button
                onClick={handleResetFilters}
                className="text-white hover:text-gray-200 transition-colors p-2 hover:bg-white/10 rounded-full"
                title="Reset filters"
              >
                <RedoIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6"
                 style={{
                   scrollbarWidth: 'none',
                   msOverflowStyle: 'none'
                 }}>
              {/* Modern Department Filter */}
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-[#0065A8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <label className="font-semibold text-gray-800 text-sm">
                  Department
                </label>
                </div>
                <select
                  value={selectedDepartment}
                  onChange={handleDepartmentFilterChange}
                  className="w-full px-4 py-3 bg-gradient-to-r from-gray-50 to-blue-50 border-2 border-[#0065A8]/20 rounded-xl text-sm font-medium text-gray-800 cursor-pointer transition-all duration-300 focus:outline-none focus:border-[#0065A8] focus:ring-2 focus:ring-[#0065A8]/20 focus:bg-white hover:border-[#057DCD] appearance-none shadow-sm"
                >
                  <option value="">All Departments</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.name}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Modern Programs Filter */}
              {selectedDepartment && (
                <div className="space-y-3">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-[#0065A8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <label className="font-semibold text-gray-800 text-sm">
                    Programs
                  </label>
                  </div>
                  <div className="max-h-40 overflow-y-auto border-2 border-[#0065A8]/20 rounded-xl bg-gradient-to-r from-gray-50 to-green-50">
                    {filteredPrograms.length > 0 ? (
                      filteredPrograms.map((prog) => (
                        <div key={prog.id} className="px-3 py-2">
                          <label className={`flex items-center p-3 rounded-xl transition-all duration-300 cursor-pointer
                            ${filterSelectedPrograms.includes(prog.id)
                              ? "bg-gradient-to-r from-[#0065A8] to-[#057DCD] text-white shadow-md"
                              : "hover:bg-gradient-to-r hover:from-[#0065A8]/10 hover:to-[#057DCD]/10 hover:text-[#0065A8]"}`}
                          >
                            <input
                              type="checkbox"
                              value={prog.id}
                              checked={filterSelectedPrograms.includes(prog.id)}
                              onChange={() => handleProgramFilterChange(prog.id)}
                              className="mr-3 h-4 w-4 accent-[#0065A8] border-gray-300 rounded
                              checked:bg-[#0065A8] checked:hover:bg-[#057DCD]"
                            />
                            <span className={`font-medium text-sm ${
                              filterSelectedPrograms.includes(prog.id)
                              ? "text-white"
                                : "text-gray-700"
                            }`}>
                              {prog.name}
                            </span>
                          </label>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-6 text-gray-500 text-center font-medium">No programs found</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modern Filter Buttons */}
            <div className="flex gap-3 p-6 pt-0">
              <button
                onClick={() => {
                  setFilterClicked(true);
                  setTimeout(() => {
                    setFilterClicked(false);
                    applyFilters();
                    setShowFilters(false);
                  }, 300);
                }}
                className={`flex-1 py-4 bg-gradient-to-r from-[#0065A8] to-[#057DCD] hover:from-[#057DCD] hover:to-[#0065A8] text-white text-center justify-center transition-all duration-300 flex items-center gap-2 text-sm font-semibold rounded-xl shadow-lg hover:shadow-xl ${
                  FilterClicked ? "scale-95" : "scale-100"
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                </svg>
                Apply Filters
              </button>
              <button
                onClick={() => {
                  setCancelClicked(true);
                  setTimeout(() => {
                    setCancelClicked(false);
                    setShowFilters(false);
                  }, 300);
                }}
                className={`flex-1 py-4 text-gray-700 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 transition-all duration-300 text-sm font-semibold rounded-xl shadow-md hover:shadow-lg ${
                  CancelClicked ? "scale-95" : "scale-100"
                }`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {showAddModal && createPortal(
        <div className="fixed bg-black/60 backdrop-blur-md flex items-center justify-center p-4" style={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          margin: 0,
          padding: '1rem',
          zIndex: 9999
        }}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
               onClick={(e) => e.stopPropagation()}
               style={{
                 scrollbarWidth: 'none',
                 msOverflowStyle: 'none',
                 zIndex: 9999
               }}>
            {/* Modern Add Course Modal Header */}
            <div className="bg-gradient-to-r from-[#0065A8] to-[#057DCD] px-6 py-6 flex justify-between items-center sticky top-0 z-10">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-white">
                Add New Course
              </h2>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-white hover:text-gray-200 transition-colors p-2 hover:bg-white/10 rounded-full"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6"
                 style={{
                   scrollbarWidth: 'none',
                   msOverflowStyle: 'none'
                 }}>
              {/* Course Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Course Code"
                  value={courseID}
                  onChange={(e) => setCourseID(e.target.value)}
                  className="w-full border-2 border-[#0065A8] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#54BEFF]"
                />
              </div>

              {/* Course Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Course Name"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
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
                  placeholder="Credits"
                  value={credits}
                  onChange={(e) => setCredits(e.target.value)}
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
                    setSelectedDepartment(deptId);
                    if (deptId) {
                      const departmentPrograms = programs.filter(
                        (prog) => String(prog.departmentID) === String(deptId)
                      );
                      setSelectedDepartmentPrograms(departmentPrograms);
                    } else {
                      setSelectedDepartmentPrograms([]);
                      setSelectedPrograms([]);
                    }
                  }}
                  className="w-full border-2 border-[#0065A8] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#54BEFF]"
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Programs */}
              {department && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Programs <span className="text-red-500">*</span>
                  </label>
                  <div className="h-[20vh] overflow-y-auto border-2 border-[#0065A8] rounded-lg px-3 pt-2">
                    {selectedDepartmentPrograms.length > 0 ? (
                      selectedDepartmentPrograms.map((prog) => (
                        <div key={prog.id} className="mb-2">
                          <label
                            className={`flex items-center p-2 rounded-lg transition-colors duration-200
                            ${selectedPrograms.includes(prog.id)
                                ? "bg-[#0065A8] text-white hover:bg-[#54BEFF]"
                                : "hover:bg-[#54BEFF] hover:text-white"
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
                            <span
                              className={`${
                                selectedPrograms.includes(prog.id)
                                  ? "text-white"
                                  : "text-gray-700"
                              }`}
                            >
                              {prog.name || prog.programName}
                            </span>
                          </label>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-gray-500 text-center">No programs found</div>
                    )}
                  </div>
                </div>
              )}

              {/* Message display */}
              {message.content && (
                <div
                  className={`p-3 rounded-lg ${
                    message.type === "success"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {message.content}
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="flex mt-4">
              <button
                onClick={() => {
                  setAddClicked(true);
                  setTimeout(() => {
                    setAddClicked(false);
                    handleSaveCourse();
                    setShowAddModal(false);
                  }, 300);
                }}
                disabled={isAddLoading}
                className={`flex-1 py-3 sm:py-4 bg-[#0065A8] hover:bg-[#54BEFF] text-white text-center justify-center transition-colors flex items-center gap-2 text-xs sm:text-sm font-medium
                ${isAddLoading ? "opacity-50 cursor-not-allowed" : ""} 
                ${AddClicked ? "scale-90" : "scale-100"}`}
              >
                {isAddLoading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>Adding...</span>
                  </>
                ) : (
                  <span>Add Course</span>
                )}
              </button>
              <button
                onClick={() => {
                  setCancelClicked(true);
                  setTimeout(() => {
                    setCancelClicked(false);
                    setShowAddModal(false);
                  }, 300);
                }}
                className={`flex-1 py-3 sm:py-4 text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors text-xs sm:text-sm font-medium ${
                  CancelClicked ? "scale-90" : "scale-100"
                }`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
        {/* Courses Table Section - Enhanced with modern design */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8 relative"
          style={{ zIndex: 1 }}
        >
          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
              <div className="max-h-[60vh] overflow-y-auto">
                <table className="w-full text-center" style={{ minWidth: "900px" }}>
                  <thead className="bg-gradient-to-r from-[#0065A8] via-[#057DCD] to-[#54BEFF] text-white sticky top-0" style={{ zIndex: 10 }}>
                    <tr>
                      <th className="px-4 py-4 text-sm font-bold min-w-[120px]">Code</th>
                      <th className="px-4 py-4 text-sm font-bold min-w-[180px]">Course Name</th>
                      <th className="px-4 py-4 text-sm font-bold min-w-[100px]">Credits</th>
                      <th className="px-4 py-4 text-sm font-bold min-w-[150px]">Department</th>
                      <th className="px-4 py-4 text-sm font-bold min-w-[200px]">Program</th>
                      <th className="px-4 py-4 text-sm font-bold min-w-[120px] text-center">Actions</th>
                </tr>
              </thead>

                <tbody>
                    {/* Desktop table loading state */}
                  {(isCourseLoading || isFiltering) ? (
                    Array.from({ length: 5 }).map((_, index) => (
                        <motion.tr 
                          key={index} 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.1 }}
                          className="animate-pulse border-b border-gray-100"
                        >
                          <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded mx-auto w-16"></div></td>
                          <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded mx-auto w-24"></div></td>
                          <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded mx-auto w-12"></div></td>
                          <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded mx-auto w-20"></div></td>
                          <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded mx-auto w-28"></div></td>
                          <td className="px-4 py-4">
                            <div className="flex justify-center space-x-2">
                              <div className="h-8 w-8 bg-gray-300 rounded-lg"></div>
                              <div className="h-8 w-8 bg-gray-300 rounded-lg"></div>
                          </div>
                        </td>
                        </motion.tr>
                      ))
                    ) : filteredCourses.length > 0 ? (
                      filteredCourses.map((course, index) => (
                        <motion.tr 
                        key={course.courseID}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ backgroundColor: "rgba(59, 130, 246, 0.05)" }}
                          className="border-b border-gray-100 hover:bg-blue-50/50 transition-all duration-200"
                        >
                          <td className="px-4 py-4 text-sm text-gray-700 font-semibold">
                            {course.code}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-800 font-semibold">{course.courseName}</td>
                          <td className="px-4 py-4">
                            <span className="inline-flex items-center justify-center w-12 h-8 bg-gradient-to-r from-green-100 to-green-200 text-green-800 font-bold rounded-lg text-sm">
                              {course.credits}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-700">{course.department}</td>
                          <td className="px-4 py-4 text-sm text-gray-700">
                          {course.program && course.program.length > 0 
                            ? course.program.join(", ")
                              : <span className="text-gray-500 italic">No programs</span>
                          }
                        </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="text-gray-400 hover:text-blue-600 hover:bg-blue-100 p-2 rounded-lg transition-all duration-200"
                              onClick={() => {
                                setEditClicked(true);
                                setTimeout(() => setEditClicked(false), 300);
                                  handleEdit(course);
                                }}
                                title="Edit course"
                            >
                              <EditIcon className="w-5 h-5" />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="text-gray-400 hover:text-red-600 hover:bg-red-100 p-2 rounded-lg transition-all duration-200"
                                onClick={() => { 
                                  setDeleteClicked(true);
                                setTimeout(() => setDeleteClicked(false), 300);
                                  handleDelete(course.courseID);
                                }}
                                title="Delete course"
                            >
                              <DeleteIcon className="w-5 h-5" />
                              </motion.button>
                          </div>
                        </td>
                        </motion.tr>
                    ))
                  ) : (
                    <tr>
                        <td colSpan="6" className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-600 mb-2">No courses found</h3>
                            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
                          </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        </motion.div>
      </div>
      ):
      )

      {showEditModal && editCourse && createPortal(
        <div className="fixed bg-black/60 backdrop-blur-md flex items-center justify-center p-4" style={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          margin: 0,
          padding: '1rem',
          zIndex: 9999
        }}>
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              zIndex: 9999
            }}
          >
            {/* Modern Edit Course Modal Header */}
            <div className="bg-gradient-to-r from-[#0065A8] to-[#057DCD] px-6 py-6 flex justify-between items-center sticky top-0 z-10">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-white">
                Edit Course
              </h2>
              </div>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditCourse(null);
                }}
                className="text-white hover:text-gray-200 transition-colors p-2 hover:bg-white/10 rounded-full"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6"
                 style={{
                   scrollbarWidth: 'none',
                   msOverflowStyle: 'none'
                 }}>
              {/* Course Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editCourse.code}
                  onChange={(e) =>
                    setEditCourse({
                      ...editCourse,
                      code: e.target.value,
                    })
                  }
                  className="w-full border-2 border-[#0065A8] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#54BEFF]"
                />
              </div>
              {/* Course Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editCourse.courseName}
                  onChange={(e) =>
                    setEditCourse({
                      ...editCourse,
                      courseName: e.target.value,
                    })
                  }
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
                  onChange={(e) =>
                    setEditCourse({
                      ...editCourse,
                      credits: e.target.value,
                    })
                  }
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
                    const deptId = parseInt(e.target.value, 10);
                    setDepartment(deptId);
                    // Update the list of programs for the selected department
                    const deptProgs = programs.filter((prog) => prog.departmentID === deptId);
                    setSelectedDepartmentPrograms(deptProgs);
                    // Reset selected programs to only those that belong to the new department
                    setSelectedPrograms([]);
                  }}
                  className="w-full border-2 border-[#0065A8] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#54BEFF]"
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Programs */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Programs <span className="text-red-500">*</span>
                </label>
                <div className="h-[20vh] overflow-y-auto border-2 border-[#0065A8] rounded-lg px-3 pt-2">
                  {selectedDepartmentPrograms.length > 0 ? (
                    selectedDepartmentPrograms.map((prog) => (
                      <div key={prog.id} className="mb-2">
                        <label
                          className={`flex items-center p-2 rounded-lg transition-colors duration-200
                          ${selectedPrograms.includes(prog.id)
                              ? "bg-[#0065A8] text-white hover:bg-[#54BEFF]"
                              : "hover:bg-[#54BEFF] text-white"
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
                          <span
                            className={`${
                              selectedPrograms.includes(prog.id)
                                ? "text-white"
                                : "text-gray-700"
                            }`}
                          >
                            {prog.name}
                          </span>
                        </label>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-gray-500 text-center">No programs found</div>
                  )}
                </div>
              </div>

              {/* Message display */}
              {message.content && (
                <div
                  className={`p-3 rounded-lg ${
                    message.type === "success"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {message.content}
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="flex mt-4">
              <button
                onClick={() => {
                  setSaveClicked(true); 
                  setTimeout(() => {setSaveClicked(false); 
                    setTimeout(() => { handleEditSave();
                    }, 500);
                  }, 200);
                }}
                disabled={isEditLoading}
                className={`flex-1 py-3 sm:py-4 bg-[#0065A8] hover:bg-[#54BEFF] text-white text-center justify-center transition-colors flex items-center gap-2 text-xs sm:text-sm font-medium
                ${isEditLoading ? "opacity-50 cursor-not-allowed" : ""} 
                ${SaveClicked ? "scale-90" : "scale-100"}`}
              >
                {isEditLoading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save Changes</span>
                )}
              </button>
              <button
                onClick={() => {
                  setCancelClicked(true); 
                  setTimeout(() => { setCancelClicked(false); 
                    setTimeout(() => setEditCourse(null), 
                    500);
                  }, 200);
                }}
                className={`flex-1 py-3 sm:py-4 text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors text-xs sm:text-sm font-medium
                  ${CancelClicked ? "scale-90" : "scale-100"}`}
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>,
        document.body
      )}
    </div>
  );
}

