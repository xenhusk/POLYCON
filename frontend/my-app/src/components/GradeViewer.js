import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import "./gradeViewer.css";
import API_URL from '../apiConfig';

const GradeViewer = () => {
  const [grades, setGrades] = useState([]);
  const [filteredGrades, setFilteredGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState({ type: "", content: "" });
  const [schoolYear, setSchoolYear] = useState("");
  const [semester, setSemester] = useState("");
  const [period, setPeriod] = useState("");
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [courseFilter, setCourseFilter] = useState("");
  const [gradeFilter, setGradeFilter] = useState("");
  const [remarksFilter, setRemarksFilter] = useState("");

  const studentID = localStorage.getItem("studentID");

  useEffect(() => {
    const fetchLatestFilter = async () => {
      try {
        const response = await fetch(`${API_URL}/semester/get_latest_filter`);
        if (response.ok) {
          const data = await response.json();
          setSchoolYear(data.school_year);
          setSemester(data.semester);
        }
      } catch (error) {
        console.error('Error fetching latest filter:', error);
      }
    };

    fetchLatestFilter();
    if (!studentID) {
      setError("Student ID not found. Please log in again.");
      setLoading(false);
      return;
    }

    fetchGrades();
  }, [studentID]);

  useEffect(() => {
    if (!studentID) {
      setError("Student ID not found. Please log in again.");
      setLoading(false);
      return;
    }

    fetchGrades();
  }, [studentID, schoolYear, semester, period]);

  // Filter grades based on search criteria
  useEffect(() => {
    let filtered = grades;

    if (courseFilter) {
      filtered = filtered.filter(grade => 
        grade.courseID.toLowerCase().includes(courseFilter.toLowerCase()) ||
        grade.courseName.toLowerCase().includes(courseFilter.toLowerCase())
      );
    }

    if (gradeFilter) {
      filtered = filtered.filter(grade => 
        grade.grade.toString().includes(gradeFilter)
      );
    }

    if (remarksFilter) {
      filtered = filtered.filter(grade => 
        grade.remarks && grade.remarks.toLowerCase().includes(remarksFilter.toLowerCase())
      );
    }

    setFilteredGrades(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  }, [grades, courseFilter, gradeFilter, remarksFilter]);

  const fetchGrades = async () => {
    // Generate a unique cache key based on filters and studentID
    const cacheKey = `gradesCache_${studentID}_${schoolYear}_${semester}_${period}`;

    // Check if grades are already cached
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      setGrades(JSON.parse(cached));
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        studentID: studentID,
        schoolYear: schoolYear || "", 
        semester: semester || "",
         period: period || ""
      }).toString();

      const response = await fetch(`${API_URL}/grade/get_student_grades?${queryParams}`);
      const data = await response.json();

      if (response.ok) {
        setGrades(data);
        setFilteredGrades(data);
        // Cache the fetched grades
        localStorage.setItem(cacheKey, JSON.stringify(data));
        setMessage({ type: "success", content: `Loaded ${data.length} grades successfully` });
      } else {
        setError(data.error || "Failed to fetch grades.");
        setMessage({ type: "error", content: data.error || "Failed to fetch grades." });
      }
    } catch (err) {
      setError("Error fetching grades. Please try again.");
      setMessage({ type: "error", content: "Error fetching grades. Please try again." });
    }
    setLoading(false);
    
    // Clear message after 3 seconds
    setTimeout(() => setMessage({ type: "", content: "" }), 3000);
  };

  // Filter handlers
  const handleClearFilters = () => {
    setCourseFilter("");
    setGradeFilter("");
    setRemarksFilter("");
    setShowFilters(false);
  };

  // Pagination
  const totalPages = Math.ceil(filteredGrades.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentGrades = filteredGrades.slice(startIndex, endIndex);

  const goToPage = (page) => {
    setCurrentPage(page);
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden bg-gradient-to-r from-[#0065A8] via-[#057DCD] to-[#54BEFF] py-12 px-4 sm:px-6 lg:px-8"
      >
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-6"
          >
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4"
          >
            My Grades
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl sm:text-2xl text-blue-100 max-w-3xl mx-auto"
          >
            Track your academic progress and performance
          </motion.p>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Toast Message */}
        {message.content && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className={`fixed top-5 right-5 left-5 sm:left-auto sm:right-5 p-4 rounded-xl shadow-xl z-50 text-sm sm:text-base backdrop-blur-sm ${
              message.type === "success"
                ? "bg-green-500/90 text-white border border-green-400"
                : "bg-red-500/90 text-white border border-red-400"
            }`}
          >
            <div className="flex items-center gap-3">
              {message.type === "success" ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
              {message.content}
            </div>
          </motion.div>
        )}

        {/* Filter Section - Enhanced with modern card design */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-8 z-50 flex justify-center"
        >
          <div className="w-full max-w-6xl">
            {/* Filter Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 mb-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-[#0065A8] to-[#057DCD] rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800">Filter Grades</h3>
              </div>
              
              {/* Main Filter Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                {/* School Year Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    School Year
                  </label>
                  <select
                    className="w-full p-3 border-2 border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-[#0065A8] focus:border-[#0065A8] transition-all duration-200 bg-white"
                    value={schoolYear}
                    onChange={(e) => setSchoolYear(e.target.value)}
                  >
                    <option value="">All School Years</option>
                    <option value="2024-2025">2024-2025</option>
                    <option value="2023-2024">2023-2024</option>
                  </select>
                </div>

                {/* Semester Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Semester
                  </label>
                  <select
                    className="w-full p-3 border-2 border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-[#0065A8] focus:border-[#0065A8] transition-all duration-200 bg-white"
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                  >
                    <option value="">All Semesters</option>
                    <option value="1st">1st Semester</option>
                    <option value="2nd">2nd Semester</option>
                  </select>
                </div>

                {/* Period Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Period
                  </label>
                  <select
                    className="w-full p-3 border-2 border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-[#0065A8] focus:border-[#0065A8] transition-all duration-200 bg-white"
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                  >
                    <option value="">All Periods</option>
                    <option value="Prelim">Prelim</option>
                    <option value="Midterm">Midterm</option>
                    <option value="Pre-Final">Pre-Final</option>
                    <option value="Final">Final</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex-1 max-w-[140px] sm:flex-none bg-gradient-to-r from-[#0065A8] to-[#057DCD] text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 text-sm font-semibold flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
                  </svg>
                  Advanced
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleClearFilters}
                  className="flex-1 max-w-[140px] sm:flex-none bg-gradient-to-r from-gray-500 to-gray-600 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 text-sm font-semibold flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Reset
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Additional Filters Panel */}
        <div className="relative">
          {showFilters && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute left-0 right-0 sm:right-0 sm:left-auto sm:w-80 lg:w-96 mt-2 rounded-2xl shadow-2xl overflow-hidden z-40 max-h-[70vh] flex flex-col mx-2 sm:mx-0 bg-white/95 backdrop-blur-sm border border-white/20"
            >
              {/* Filter Header */}
              <div className="bg-gradient-to-r from-[#0065A8] to-[#057DCD] px-6 py-4 flex justify-between items-center flex-shrink-0">
                <h3 className="text-lg font-bold text-white">Advanced Filters</h3>
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleClearFilters}
                    className="text-white hover:text-gray-200 transition-colors p-2 rounded-lg hover:bg-white/20"
                    title="Reset filters"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowFilters(false)}
                    className="text-white hover:text-gray-200 transition-colors p-2 rounded-lg hover:bg-white/20 sm:hidden text-xl leading-5"
                    title="Close filters"
                  >
                    ×
                  </motion.button>
                </div>
              </div>

              {/* Filter Content */}
              <div className="bg-white p-6 space-y-6 overflow-y-auto">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Search Course
                  </label>
                  <input
                    type="text"
                    placeholder="Search by course code or name..."
                    value={courseFilter}
                    onChange={(e) => setCourseFilter(e.target.value)}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0065A8] focus:border-[#0065A8] transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Grade Filter
                  </label>
                  <input
                    type="text"
                    placeholder="Search by grade..."
                    value={gradeFilter}
                    onChange={(e) => setGradeFilter(e.target.value)}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0065A8] focus:border-[#0065A8] transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Remarks
                  </label>
                  <div className="max-h-40 overflow-y-auto border-2 border-gray-200 rounded-xl">
                    {["PASSED", "FAILED", "NOT ENCODED"].map((remark) => (
                      <label key={remark} className="flex items-center p-4 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors">
                        <input
                          type="radio"
                          name="remarks"
                          value={remark}
                          checked={remarksFilter === remark}
                          onChange={(e) => setRemarksFilter(e.target.value)}
                          className="mr-3 text-[#0065A8] focus:ring-[#0065A8] w-4 h-4"
                        />
                        <span className="text-sm font-medium text-gray-700">{remark}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border-2 border-red-200 text-red-700 px-6 py-4 rounded-xl mb-6 shadow-lg"
          >
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="font-semibold">{error}</span>
            </div>
          </motion.div>
        )}

        {/* Grades Table Section - Enhanced with modern design */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8 relative z-0"
        >
          {/* Mobile Card View */}
          <div className="block sm:hidden">
            <div className="max-h-[60vh] overflow-y-auto space-y-4 p-4">
              {loading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <motion.div 
                    key={index} 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 p-6 animate-pulse shadow-lg"
                  >
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </motion.div>
                ))
              ) : currentGrades.length > 0 ? (
                currentGrades.map((grade, index) => (
                  <motion.div 
                    key={grade.id} 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    className="bg-white/90 backdrop-blur-sm rounded-2xl border border-white/20 p-6 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-800 text-lg mb-1">{grade.courseName}</h3>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{grade.courseID}</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            grade.remarks === "PASSED" 
                              ? "bg-green-100 text-green-700" 
                              : grade.remarks === "FAILED"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}>
                            {grade.remarks || "NOT ENCODED"}
                          </span>
                        </div>
                      </div>
                      <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl">
                        <span className="text-gray-600 text-sm font-medium block mb-2">Grade</span>
                        <p className="font-bold text-blue-700 text-2xl">{grade.grade}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl">
                        <span className="text-gray-600 text-sm font-medium block mb-2">Credit</span>
                        <p className="font-semibold text-gray-800">3.0</p>
                      </div>
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl">
                        <span className="text-gray-600 text-sm font-medium block mb-2">Instructor</span>
                        <p className="font-semibold text-gray-800 truncate">{grade.facultyName}</p>
                      </div>
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl">
                        <span className="text-gray-600 text-sm font-medium block mb-2">Period</span>
                        <p className="font-semibold text-gray-800">{grade.period}</p>
                      </div>
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl">
                        <span className="text-gray-600 text-sm font-medium block mb-2">Semester</span>
                        <p className="font-semibold text-gray-800">{grade.semester}</p>
                      </div>
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl col-span-2">
                        <span className="text-gray-600 text-sm font-medium block mb-2">School Year</span>
                        <p className="font-semibold text-gray-800">{grade.school_year}</p>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No grades found</h3>
                  <p className="text-gray-500">Try adjusting your filter criteria</p>
                </motion.div>
              )}
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
              <div className="max-h-[60vh] overflow-y-auto">
                <table className="w-full text-center" style={{ minWidth: "900px" }}>
                  <thead className="bg-gradient-to-r from-[#0065A8] via-[#057DCD] to-[#54BEFF] text-white sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-4 text-sm font-bold min-w-[140px]">Subject Code</th>
                      <th className="px-4 py-4 text-sm font-bold min-w-[250px]">Subject Name</th>
                      <th className="px-4 py-4 text-sm font-bold min-w-[100px]">Credit</th>
                      <th className="px-4 py-4 text-sm font-bold min-w-[180px]">Instructor</th>
                      <th className="px-4 py-4 text-sm font-bold min-w-[100px]">Grade</th>
                      <th className="px-4 py-4 text-sm font-bold min-w-[140px]">Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Desktop table loading state */}
                    {loading ? (
                      Array.from({ length: 5 }).map((_, index) => (
                        <motion.tr 
                          key={index} 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.1 }}
                          className="animate-pulse border-b border-gray-100"
                        >
                          <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded mx-auto w-16"></div></td>
                          <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded mx-auto w-32"></div></td>
                          <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded mx-auto w-10"></div></td>
                          <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded mx-auto w-24"></div></td>
                          <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded mx-auto w-12"></div></td>
                          <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded mx-auto w-16"></div></td>
                        </motion.tr>
                      ))
                    ) : currentGrades.length > 0 ? (
                      currentGrades.map((grade, index) => (
                        <motion.tr 
                          key={grade.id} 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ backgroundColor: "rgba(59, 130, 246, 0.05)" }}
                          className="border-b border-gray-100 hover:bg-blue-50/50 transition-all duration-200"
                        >
                          <td className="px-4 py-4 text-sm text-gray-700 font-semibold">{grade.courseID}</td>
                          <td className="px-4 py-4 text-sm text-gray-800 font-semibold">{grade.courseName}</td>
                          <td className="px-4 py-4 text-sm text-gray-700 font-medium">3.0</td>
                          <td className="px-4 py-4 text-sm text-gray-700">{grade.facultyName}</td>
                          <td className="px-4 py-4">
                            <span className="inline-flex items-center justify-center w-12 h-8 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 font-bold rounded-lg text-sm">
                              {grade.grade}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                              grade.remarks === "PASSED" 
                                ? "bg-green-100 text-green-700" 
                                : grade.remarks === "FAILED"
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}>
                              {grade.remarks || "NOT ENCODED"}
                            </span>
                          </td>
                        </motion.tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                              </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-600 mb-2">No grades found</h3>
                            <p className="text-gray-500">Try adjusting your filter criteria</p>
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

        {/* Pagination */}
        {!loading && !error && filteredGrades.length > itemsPerPage && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4"
          >
            <div className="text-sm text-gray-600 font-medium">
              Showing {startIndex + 1}-{Math.min(endIndex, filteredGrades.length)} of {filteredGrades.length} grades
            </div>
            
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  currentPage === 1
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-[#0065A8] to-[#057DCD] text-white hover:shadow-lg"
                }`}
              >
                Previous
              </motion.button>

              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <motion.button
                      key={page}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => goToPage(page)}
                      className={`px-3 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                        currentPage === page
                          ? "bg-gradient-to-r from-[#0065A8] to-[#057DCD] text-white shadow-lg"
                          : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                      }`}
                    >
                      {page}
                    </motion.button>
                  );
                })}
                {totalPages > 5 && (
                  <>
                    <span className="px-3 py-2 text-sm text-gray-500">...</span>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => goToPage(totalPages)}
                      className={`px-3 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                        currentPage === totalPages
                          ? "bg-gradient-to-r from-[#0065A8] to-[#057DCD] text-white shadow-lg"
                          : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                      }`}
                    >
                      {totalPages}
                    </motion.button>
                  </>
                )}
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  currentPage === totalPages
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-[#0065A8] to-[#057DCD] text-white hover:shadow-lg"
                }`}
              >
                Next
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default GradeViewer;
