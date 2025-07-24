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
    <div className="w-full mx-auto p-2 sm:p-4 lg:p-6 bg-white fade-in overflow-x-hidden">
      {/* Toast Message */}
      {message.content && (
        <div
          className={`fixed top-5 right-5 left-5 sm:left-auto sm:right-5 p-3 sm:p-4 rounded-lg shadow-lg z-50 text-sm sm:text-base ${
            message.type === "success"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {message.content}
        </div>
      )}

      <div className="w-full mx-auto p-2 sm:p-4 bg-white mt-2 sm:mt-4 flex flex-col justify-center">
        {/* Centered Page Title */}
        <div className="flex justify-center items-center mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0065A8] fade-in delay-100 text-center">
            My Grades
          </h2>
        </div>

        {/* Filter Section */}
        <div className="mt-4 fade-in delay-200 z-50 flex justify-center">
          <div className="flex flex-col gap-3 w-full max-w-4xl">
            {/* Main Filter Row */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch sm:items-end">
              {/* School Year Filter */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  School Year
                </label>
                <select
                  className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#0065A8] focus:border-[#0065A8] transition-all duration-200"
                  value={schoolYear}
                  onChange={(e) => setSchoolYear(e.target.value)}
                >
                  <option value="">All School Years</option>
                  <option value="2024-2025">2024-2025</option>
                  <option value="2023-2024">2023-2024</option>
                </select>
              </div>

              {/* Semester Filter */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Semester
                </label>
                <select
                  className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#0065A8] focus:border-[#0065A8] transition-all duration-200"
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                >
                  <option value="">All Semesters</option>
                  <option value="1st">1st Semester</option>
                  <option value="2nd">2nd Semester</option>
                </select>
              </div>

              {/* Period Filter */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Period
                </label>
                <select
                  className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#0065A8] focus:border-[#0065A8] transition-all duration-200"
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

              {/* Filter Button */}
              <div className="flex gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex-1 max-w-[120px] sm:flex-none bg-[#0065A8] text-white px-4 sm:px-6 py-3 rounded-lg shadow-md hover:bg-[#004d7a] transition text-sm flex items-center justify-center"
                >
                  <svg className="w-4 h-4 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
                  </svg>
                  <span className="hidden sm:inline">Filter</span>
                </button>

                <button
                  onClick={handleClearFilters}
                  className="flex-1 max-w-[120px] sm:flex-none bg-gray-500 text-white px-4 sm:px-6 py-3 rounded-lg shadow-md hover:bg-gray-400 transition text-sm flex items-center justify-center"
                >
                  <svg className="w-4 h-4 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span className="text-xs sm:text-sm">Reset</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Filters Panel */}
        <div className="relative">
          {showFilters && (
            <div className="absolute left-0 right-0 sm:right-0 sm:left-auto sm:w-80 lg:w-96 mt-1 rounded-xl shadow-2xl overflow-hidden z-40 max-h-[70vh] flex flex-col mx-2 sm:mx-0">
              {/* Filter Header */}
              <div className="bg-[#0065A8] px-4 py-3 flex justify-between items-center flex-shrink-0">
                <h3 className="text-lg font-semibold text-white">FILTERS</h3>
                <div className="flex gap-2">
                  <button
                    onClick={handleClearFilters}
                    className="text-white hover:text-gray-200 transition-transform hover:scale-110 p-1"
                    title="Reset filters"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="text-white hover:text-gray-200 transition-transform hover:scale-110 p-1 sm:hidden text-xl leading-5"
                    title="Close filters"
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* Filter Content */}
              <div className="bg-white p-4 md:p-6 space-y-4 overflow-y-auto">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search Course
                  </label>
                  <input
                    type="text"
                    placeholder="Search by course code or name..."
                    value={courseFilter}
                    onChange={(e) => setCourseFilter(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0065A8] focus:border-[#0065A8]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Grade Filter
                  </label>
                  <input
                    type="text"
                    placeholder="Search by grade..."
                    value={gradeFilter}
                    onChange={(e) => setGradeFilter(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0065A8] focus:border-[#0065A8]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Remarks
                  </label>
                  <div className="max-h-32 sm:max-h-40 overflow-y-auto border-2 border-[#0065A8] rounded-lg">
                    {["PASSED", "FAILED", "NOT ENCODED"].map((remark) => (
                      <label key={remark} className="flex items-center p-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0">
                        <input
                          type="radio"
                          name="remarks"
                          value={remark}
                          checked={remarksFilter === remark}
                          onChange={(e) => setRemarksFilter(e.target.value)}
                          className="mr-2 text-[#0065A8] focus:ring-[#0065A8]"
                        />
                        <span className="text-sm">{remark}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          </div>
        )}

        {/* Table Section - Enhanced mobile responsiveness */}
        <div className="mt-4 shadow-md overflow-hidden rounded-lg fade-in delay-300 relative z-0">
          {/* Mobile Card View */}
          <div className="block sm:hidden">
            <div className="max-h-[60vh] overflow-y-auto space-y-3 p-4">
              {loading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="bg-white rounded-lg border p-4 animate-pulse">
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                ))
              ) : currentGrades.length > 0 ? (
                currentGrades.map((grade) => (
                  <div key={grade.id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-md hover:shadow-lg transition-shadow duration-300">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-800 text-sm">{grade.courseName}</h3>
                        <p className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md inline-block mt-1">{grade.courseID}</p>
                      </div>
                      <div className="bg-blue-50 p-2 rounded-lg">
                        <span className="text-gray-500 text-xs block mb-1">Grade:</span>
                        <p className="font-bold text-blue-600">{grade.grade}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="bg-gray-50 p-2 rounded-lg">
                        <span className="text-gray-500 block mb-1">Credit:</span>
                        <p className="font-medium text-gray-800">3.0</p>
                      </div>
                      <div className="bg-gray-50 p-2 rounded-lg">
                        <span className="text-gray-500 block mb-1">Instructor:</span>
                        <p className="font-medium text-gray-800 truncate">{grade.facultyName}</p>
                      </div>
                      <div className="bg-gray-50 p-2 rounded-lg">
                        <span className="text-gray-500 block mb-1">Period:</span>
                        <p className="font-medium text-gray-800">{grade.period}</p>
                      </div>
                      <div className="bg-gray-50 p-2 rounded-lg">
                        <span className="text-gray-500 block mb-1">Semester:</span>
                        <p className="font-medium text-gray-800">{grade.semester}</p>
                      </div>
                      <div className="bg-gray-50 p-2 rounded-lg">
                        <span className="text-gray-500 block mb-1">School Year:</span>
                        <p className="font-medium text-gray-800">{grade.school_year}</p>
                      </div>
                      <div className="bg-gray-50 p-2 rounded-lg">
                        <span className="text-gray-500 block mb-1">Remarks:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          grade.remarks === "PASSED" 
                            ? "bg-green-100 text-green-800" 
                            : "bg-red-100 text-red-800"
                        }`}>
                          {grade.remarks || "NOT ENCODED"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No grades found
                </div>
              )}
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto">
            <div className="max-h-[320px] overflow-y-auto">
              <table className="w-full bg-white text-center shadow-sm rounded-lg overflow-hidden" style={{ minWidth: "800px" }}>
                <thead className="bg-gradient-to-r from-[#0065A8] to-[#0077BE] text-white sticky top-0 z-10">
                  <tr className="border-b border-blue-700">
                    <th className="px-2 lg:px-4 py-3 text-xs lg:text-sm font-semibold min-w-[120px] lg:min-w-[140px]">Subject Code</th>
                    <th className="px-2 lg:px-4 py-3 text-xs lg:text-sm font-semibold min-w-[200px] lg:min-w-[250px]">Subject Name</th>
                    <th className="px-2 lg:px-4 py-3 text-xs lg:text-sm font-semibold min-w-[80px] lg:min-w-[100px]">Credit</th>
                    <th className="px-2 lg:px-4 py-3 text-xs lg:text-sm font-semibold min-w-[140px] lg:min-w-[180px]">Instructor</th>
                    <th className="px-2 lg:px-4 py-3 text-xs lg:text-sm font-semibold min-w-[80px] lg:min-w-[100px]">Grade</th>
                    <th className="px-2 lg:px-4 py-3 text-xs lg:text-sm font-semibold min-w-[120px] lg:min-w-[140px]">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Desktop table loading state */}
                  {loading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <tr key={index} className="animate-pulse border-b">
                        <td className="px-2 lg:px-4 py-3"><div className="h-4 bg-gray-200 rounded mx-auto w-16"></div></td>
                        <td className="px-2 lg:px-4 py-3"><div className="h-4 bg-gray-200 rounded mx-auto w-32"></div></td>
                        <td className="px-2 lg:px-4 py-3"><div className="h-4 bg-gray-200 rounded mx-auto w-10"></div></td>
                        <td className="px-2 lg:px-4 py-3"><div className="h-4 bg-gray-200 rounded mx-auto w-24"></div></td>
                        <td className="px-2 lg:px-4 py-3"><div className="h-4 bg-gray-200 rounded mx-auto w-12"></div></td>
                        <td className="px-2 lg:px-4 py-3"><div className="h-4 bg-gray-200 rounded mx-auto w-16"></div></td>
                      </tr>
                    ))
                  ) : currentGrades.length > 0 ? (
                    currentGrades.map((grade) => (
                      <tr key={grade.id} className="border-b border-gray-200 hover:bg-blue-50 transition-colors duration-200 align-middle">
                        <td className="px-2 lg:px-4 py-3 text-xs lg:text-sm text-gray-700 font-medium">{grade.courseID}</td>
                        <td className="px-2 lg:px-4 py-3 text-xs lg:text-sm text-gray-800 font-medium">{grade.courseName}</td>
                        <td className="px-2 lg:px-4 py-3 text-xs lg:text-sm text-gray-700">3.0</td>
                        <td className="px-2 lg:px-4 py-3 text-xs lg:text-sm text-gray-700">{grade.facultyName}</td>
                        <td className="px-2 lg:px-4 py-3 text-xs lg:text-sm font-bold text-blue-600 bg-blue-50 rounded-md mx-1">{grade.grade}</td>
                        <td className="px-2 lg:px-4 py-3 text-xs lg:text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            grade.remarks === "PASSED" 
                              ? "bg-green-100 text-green-800" 
                              : "bg-red-100 text-red-800"
                          }`}>
                            {grade.remarks || "NOT ENCODED"}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-2 lg:px-4 py-8 text-center text-gray-500">
                        No grades found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Pagination */}
        {!loading && !error && filteredGrades.length > itemsPerPage && (
          <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
            <div className="text-sm text-gray-600">
              Showing {startIndex + 1}-{Math.min(endIndex, filteredGrades.length)} of {filteredGrades.length} grades
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                Previous
              </button>

              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => goToPage(page)}
                      className={`px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                        currentPage === page
                          ? 'bg-[#0065A8] text-white'
                          : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                {totalPages > 5 && (
                  <>
                    <span className="px-3 py-2 text-sm text-gray-500">...</span>
                    <button
                      onClick={() => goToPage(totalPages)}
                      className={`px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                        currentPage === totalPages
                          ? 'bg-[#0065A8] text-white'
                          : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {totalPages}
                    </button>
                  </>
                )}
              </div>

              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GradeViewer;
