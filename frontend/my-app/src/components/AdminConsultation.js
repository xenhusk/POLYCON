import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import API_URL from '../apiConfig';
import logo from '../components/icons/logo2.png';

const AdminConsultation = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [semesters, setSemesters] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState({ semester: '', school_year: '' });
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [searchTeacher, setSearchTeacher] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [userRole, setUserRole] = useState('');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  useEffect(() => {
    // Get user role from localStorage
    const role = localStorage.getItem('userRole');
    setUserRole(role || '');
  }, []);

  useEffect(() => {
    fetchSemesters();
    fetchDepartments();
    fetchLeaderboardData();
  }, []);

  const fetchSemesters = async () => {
    try {
      const response = await fetch(`${API_URL}/homeadmin/semesters`);
      if (response.ok) {
        const data = await response.json();
        setSemesters(data);
        // Set current semester as default if available
        if (data.length > 0) {
          const current = data[0]; // Assuming first is most recent
          setSelectedSemester({
            semester: current.semester,
            school_year: current.school_year
          });
        }
      }
    } catch (err) {
      console.error('Error fetching semesters:', err);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await fetch(`${API_URL}/homeadmin/teacher_departments`);
      if (response.ok) {
        const data = await response.json();
        setDepartments(data);
      }
    } catch (err) {
      console.error('Error fetching departments:', err);
    }
  };

  const fetchLeaderboardData = async (semester = null, schoolYear = null, department = null) => {
    setLoading(true);
    setError('');
    
    try {
      let url = `${API_URL}/homeadmin/teacher_leaderboard`;
      const params = new URLSearchParams();
      
      if (semester && schoolYear) {
        params.append('semester', semester);
        params.append('school_year', schoolYear);
      }
      
      if (department) {
        params.append('department', department);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Backend already provides sorted data with original_rank, no need to re-sort
      // The original_rank field maintains true ranking regardless of filters
      setLeaderboardData(data);
    } catch (err) {
      setError('Failed to fetch leaderboard data: ' + err.message);
      console.error('Error fetching leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSemesterChange = (e) => {
    const [semester, schoolYear] = e.target.value.split('|');
    setSelectedSemester({ semester, school_year: schoolYear });
    fetchLeaderboardData(semester, schoolYear, selectedDepartment);
  };

  const handleDepartmentChange = (e) => {
    const department = e.target.value;
    setSelectedDepartment(department);
    setCurrentPage(1); // Reset to first page when filtering
    fetchLeaderboardData(
      selectedSemester.semester, 
      selectedSemester.school_year, 
      department
    );
  };

  const handleSearchChange = (e) => {
    setSearchTeacher(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleTeacherClick = (teacher) => {
    setSelectedTeacher(teacher);
  };

  const closeModal = () => {
    setSelectedTeacher(null);
  };

  const handleSessionClick = (session) => {
    setSelectedSession(session);
  };

  const closeSessionModal = () => {
    setSelectedSession(null);
  };

  // Filter leaderboard data based on search term
  const filteredLeaderboardData = leaderboardData.filter(teacher => 
    teacher.teacher_name.toLowerCase().includes(searchTeacher.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredLeaderboardData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedLeaderboardData = filteredLeaderboardData.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  if (loading && leaderboardData.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 font-poppins flex items-center justify-center">
        {/* Navigation Header - Only show if user is not admin */}
        {userRole !== 'admin' && (
          <motion.nav 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute top-0 left-0 right-0 z-50"
          >
            <div className="w-full">
              <div className="bg-[#057DCD] shadow-xl">
                <div className="flex justify-between items-center h-20 px-6 max-w-7xl mx-auto">
                  {/* Logo */}
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center space-x-3"
                  >
                    <img
                      src={logo}
                      alt="POLYCON Logo"
                      className="h-14 w-14 object-contain"
                    />
                    <span className="text-white font-bold text-xl">
                      POLYCON
                    </span>
                  </motion.div>

                  {/* Navigation Items */}
                  <div className="hidden md:flex items-center space-x-8">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => window.location.href = '/'}
                      className="text-white font-medium hover:text-blue-200 transition-colors duration-200 relative group"
                    >
                      Home
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300" />
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => window.location.href = '/consultation-schedules'}
                      className="text-white font-medium hover:text-blue-200 transition-colors duration-200 relative group"
                    >
                      Consultation Schedule
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300" />
                    </motion.button>
                    
                    <span className="text-blue-200 font-medium">
                      Leaderboard
                    </span>
                  </div>

                  {/* Mobile Menu Button */}
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => window.location.href = '/'}
                    className="md:hidden text-white p-2"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.nav>
        )}

        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#057DCD] border-t-transparent mx-auto"></div>
          <p className="mt-6 text-lg text-gray-600 font-medium">Loading teacher leaderboard...</p>
        </div>
      </div>
    );
  }

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 pb-10 to-blue-50 font-poppins">
        {/* Navigation Header - Only show if user is not admin */}
        {userRole !== 'admin' && (
          <motion.nav 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative z-50"
          >
            <div className="w-full">
              <div className="bg-[#057DCD] shadow-xl">
                <div className="flex justify-between items-center h-20 px-6 max-w-7xl mx-auto">
                  {/* Logo */}
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center space-x-3"
                  >
                    <img
                      src={logo}
                      alt="POLYCON Logo"
                      className="h-14 w-14 object-contain"
                    />
                    <span className="text-white font-bold text-xl">
                      POLYCON
                    </span>
                  </motion.div>

                  {/* Navigation Items */}
                  <div className="hidden md:flex items-center space-x-8">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => window.location.href = '/'}
                      className="text-white font-medium hover:text-blue-200 transition-colors duration-200 relative group"
                    >
                      Home
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300" />
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => window.location.href = '/consultation-schedules'}
                      className="text-white font-medium hover:text-blue-200 transition-colors duration-200 relative group"
                    >
                      Consultation Schedule
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300" />
                    </motion.button>
                    
                    <span className="text-blue-200 font-medium">
                      Leaderboard
                    </span>
                  </div>

                  {/* Mobile Menu Button */}
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => window.location.href = '/'}
                    className="md:hidden text-white p-2"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.nav>
        )}

        {/* Full-width Header Section - Matching the reference image */}
        <div className="bg-gradient-to-r from-[#0065A8] to-[#057DCD] px-8 py-16 relative overflow-hidden">
          {/* Large decorative circular elements like in the reference image */}
          <div className="absolute -top-8 -left-8 w-32 h-32 bg-white/5 rounded-full opacity-30"></div>
          <div className="absolute top-1/2 -right-16 w-24 h-24 bg-white/8 rounded-full opacity-40"></div>
          <div className="absolute bottom-4 right-8 w-16 h-16 bg-white/10 rounded-full opacity-50"></div>
          
          <div className="text-center relative z-10">
            <div className="flex flex-col items-center justify-center">
              <div className="flex items-center gap-4 mb-6">
                <h2 className="text-white text-5xl font-bold text-center">
                  {userRole === 'admin' ? 'Teacher Leaderboard' : 'Public Leaderboard'}
                </h2>
                
                {/* Feedback calculation icon with tooltip and modal */}
                <div className="relative group">
                  <button
                    onClick={() => setShowFeedbackModal(true)}
                    className="w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-200 group-hover:scale-110"
                  >
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                  
                  {/* Hover tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                    How feedback is calculated
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              </div>
              
              <p className="text-white/90 text-xl max-w-4xl">
                {userRole === 'admin' 
                  ? 'Rank teachers based on performance, feedback quality, and consultation engagement' 
                  : 'Teacher rankings based on consultation activity and performance'
                }
              </p>
            </div>
          </div>
        </div>

        <div className="pt-6 pb-2 max-w-6xl mx-auto px-2 sm:px-4 lg:px-0">
            
            {/* Modern Filter Section */}
            <div className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden mb-8 mx-2 sm:mx-0">
              {/* Modern Filter Header */}
              <div className="bg-gradient-to-r from-[#0065A8] to-[#057DCD] text-white p-6">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-4">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Filter Options</h3>
                    <p className="text-white/90 text-sm">Filter by semester, department, and search teachers</p>
                  </div>
                </div>
              </div>
              
              {/* Modern Filter Content */}
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Modern Academic Period Section */}
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center mr-3">
                        <svg className="w-4 h-4 text-[#0065A8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <label htmlFor="semester-select" className="font-semibold text-gray-800 text-sm">
                        Academic Period
                      </label>
                    </div>
                    <select 
                      id="semester-select"
                      value={`${selectedSemester.semester}|${selectedSemester.school_year}`}
                      onChange={handleSemesterChange}
                      className="w-full px-4 py-3 bg-gradient-to-r from-gray-50 to-blue-50 border-2 border-[#0065A8]/20 rounded-xl text-sm font-medium text-gray-800 cursor-pointer transition-all duration-300 focus:outline-none focus:border-[#0065A8] focus:ring-2 focus:ring-[#0065A8]/20 focus:bg-white hover:border-[#057DCD] appearance-none shadow-sm"
                    >
                      <option value="|">All Semesters</option>
                      {semesters.map((sem, index) => (
                        <option 
                          key={index} 
                          value={`${sem.semester}|${sem.school_year}`}
                        >
                          {sem.semester} {sem.school_year}
                          {index === 0 ? ' (Current)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Modern Department Section */}
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg flex items-center justify-center mr-3">
                        <svg className="w-4 h-4 text-[#0065A8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <label htmlFor="department-select" className="font-semibold text-gray-800 text-sm">
                        Department
                      </label>
                    </div>
                    <select 
                      id="department-select"
                      value={selectedDepartment}
                      onChange={handleDepartmentChange}
                      className="w-full px-4 py-3 bg-gradient-to-r from-gray-50 to-green-50 border-2 border-[#0065A8]/20 rounded-xl text-sm font-medium text-gray-800 cursor-pointer transition-all duration-300 focus:outline-none focus:border-[#0065A8] focus:ring-2 focus:ring-[#0065A8]/20 focus:bg-white hover:border-[#057DCD] appearance-none shadow-sm"
                    >
                      <option value="">All Departments</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.name}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Modern Teacher Search Section */}
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center mr-3">
                        <svg className="w-4 h-4 text-[#0065A8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <label htmlFor="teacher-search" className="font-semibold text-gray-800 text-sm">
                        Search Teacher
                      </label>
                    </div>
                    <input
                      id="teacher-search"
                      type="text"
                      value={searchTeacher}
                      onChange={handleSearchChange}
                      placeholder="Enter teacher name..."
                      className="w-full px-4 py-3 bg-gradient-to-r from-gray-50 to-purple-50 border-2 border-[#0065A8]/20 rounded-xl text-sm font-medium text-gray-800 transition-all duration-300 focus:outline-none focus:border-[#0065A8] focus:ring-2 focus:ring-[#0065A8]/20 focus:bg-white hover:border-[#057DCD] shadow-sm"
                    />
                  </div>
                </div>
              </div>
            </div>


          {error && (
            <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-4 border border-red-200 text-sm">
              {error}
            </div>
          )}

          {/* Leaderboard */}
          <div className="bg-white rounded-xl shadow-lg border border-white/50 overflow-hidden mx-2 sm:mx-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="relative mb-4">
                  <div className="w-10 h-10 border-4 border-gray-200 border-t-[#0065A8] rounded-full animate-spin"></div>
                  <div className="absolute inset-0 w-10 h-10 border-4 border-transparent border-r-[#057DCD] rounded-full animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
                </div>
                <div className="text-center">
                  <p className="text-base font-semibold text-slate-700 mb-1">Updating Data...</p>
                  <p className="text-slate-500 text-xs">Fetching consultation statistics</p>
                </div>
              </div>
            ) : filteredLeaderboardData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-slate-500 text-lg font-medium mb-1">No consultation data available</p>
                <p className="text-slate-400 text-xs">
                  {searchTeacher 
                    ? `No teachers found matching "${searchTeacher}". Try adjusting your search.`
                    : 'Try selecting a different semester/department or check back later.'
                  }
                </p>
              </div>
            ) : (
              <>
                {/* Leaderboard Header */}
                <div className="bg-gradient-to-r from-[#0065A8] to-[#057DCD] text-white p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0">
                    <div className="flex items-center">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white/20 rounded-full flex items-center justify-center mr-2 sm:mr-3">
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-base sm:text-lg font-bold">Teacher Rankings</h3>
                        <p className="text-blue-100 text-xs hidden sm:block">Ranked by consultation activity</p>
                      </div>
                    </div>
                     <div className="flex items-center space-x-1 w-full sm:w-auto justify-center sm:justify-end">
                        {/* Previous Button */}
                        <button
                          onClick={handlePrevPage}
                          disabled={currentPage === 1}
                          className={`px-2 sm:px-3 py-1 rounded text-xs font-medium transition-all duration-200 ${
                            currentPage === 1 
                              ? 'bg-blue-50 text-gray-400 cursor-not-allowed' 
                              : 'bg-[#0065A8] text-white hover:bg-[#057DCD]'
                          }`}
                        >
                          <span className="hidden sm:inline">Previous</span>
                          <span className="sm:hidden">Prev</span>
                        </button>
                        
                        {/* Page Numbers - Show fewer on mobile */}
                        <div className="flex items-center space-x-1">
                          {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => {
                            let page;
                            if (totalPages <= 3) {
                              page = i + 1;
                            } else if (currentPage <= 2) {
                              page = i + 1;
                            } else if (currentPage >= totalPages - 1) {
                              page = totalPages - 2 + i;
                            } else {
                              page = currentPage - 1 + i;
                            }
                            return (
                              <button
                                key={page}
                                onClick={() => handlePageChange(page)}
                                className={`w-6 h-6 sm:w-8 sm:h-8 rounded text-xs font-medium transition-all duration-200 ${
                                  currentPage === page
                                    ? 'bg-[#0065A8] text-white'
                                    : 'bg-blue-50 text-gray-600 hover:bg-gray-300'
                                }`}
                              >
                                {page}
                              </button>
                            );
                          })}
                          {totalPages > 3 && (
                            <span className="text-white text-xs px-1">...</span>
                          )}
                        </div>
                        
                        {/* Next Button */}
                        <button
                          onClick={handleNextPage}
                          disabled={currentPage === totalPages}
                          className={`px-2 sm:px-3 py-1 rounded text-xs font-medium transition-all duration-200 ${
                            currentPage === totalPages 
                              ? 'bg-blue-50 text-gray-400 cursor-not-allowed' 
                              : 'bg-[#0065A8] text-white hover:bg-[#057DCD]'
                          }`}
                        >
                          <span className="hidden sm:inline">Next</span>
                          <span className="sm:hidden">Next</span>
                        </button>
                      </div>
                  </div>
                </div>

                {/* Leaderboard List */}
                <div className="max-h-[18.5rem] sm:max-h-[20rem] overflow-y-auto">
                  {paginatedLeaderboardData.map((teacher, index) => {
                    // Use original_rank from backend instead of calculating from pagination
                    const displayRank = teacher.original_rank || (startIndex + index + 1);
                    const isTopThree = displayRank <= 3;
                    return (
                      <div 
                        key={teacher.teacher_id} 
                        className={`
                          relative p-3 sm:p-4 border-b border-gray-100 
                          transition-all duration-300 group hover:shadow-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50
                          ${isTopThree ? 'bg-gradient-to-r from-yellow-50 to-orange-50' : 'bg-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50'}
                          ${displayRank === 1 ? 'border-l-4 border-l-yellow-400' : ''}
                          ${displayRank === 2 ? 'border-l-4 border-l-gray-400' : ''}
                          ${displayRank === 3 ? 'border-l-4 border-l-amber-600' : ''}
                          ${userRole === 'admin' ? 'cursor-pointer' : 'cursor-default'}
                          last:border-b-0
                        `}
                        onClick={() => userRole === 'admin' ? handleTeacherClick(teacher) : null}
                      >
                        {/* Mobile Layout - Stack everything vertically */}
                        <div className="flex flex-col space-y-3 md:hidden">
                          {/* Mobile Header Row - Rank and Name */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className={`
                                flex items-center justify-center w-8 h-8 rounded-full font-bold text-xs
                                ${displayRank === 1 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white shadow-lg' : ''}
                                ${displayRank === 2 ? 'bg-gradient-to-br from-gray-400 to-gray-600 text-white shadow-lg' : ''}
                                ${displayRank === 3 ? 'bg-gradient-to-br from-amber-500 to-amber-700 text-white shadow-lg' : ''}
                                ${displayRank > 3 ? 'bg-gradient-to-br from-slate-500 to-slate-700 text-white' : ''}
                              `}>
                                #{displayRank}
                              </div>
                              <div>
                                <h3 className="text-base font-bold text-slate-800 group-hover:text-[#0065A8] transition-colors">
                                  {teacher.teacher_name}
                                </h3>
                                {userRole === 'admin' && (
                                  <p className="text-slate-500 text-xs">ID: {teacher.teacher_id}</p>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {/* Mobile Stats Row */}
                          <div className="grid grid-cols-2 gap-2">
                            <div className="text-center p-2 bg-white/80 backdrop-blur-sm rounded-lg border border-gray-200 group-hover:border-blue-200 transition-colors">
                              <div className="text-sm font-bold text-[#057DCD] mb-1">{teacher.total_consultations}</div>
                              <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">Sessions</div>
                            </div>
                            <div className="text-center p-2 bg-white/80 backdrop-blur-sm rounded-lg border border-gray-200 group-hover:border-blue-200 transition-colors">
                              <div className="text-sm font-bold text-[#057DCD] mb-1">{teacher.total_students}</div>
                              <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">Students</div>
                            </div>
                          </div>
                          
                          {/* Mobile Duration Row */}
                          <div className="grid grid-cols-1 gap-2">
                            <div className="text-center p-2 bg-white/80 backdrop-blur-sm rounded-lg border border-gray-200 group-hover:border-blue-200 transition-colors">
                              <div className="text-sm font-bold text-[#057DCD] mb-1">{teacher.total_duration_formatted}</div>
                              <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">Duration</div>
                            </div>
                          </div>
                          
                          {/* Mobile Rating Row - Always show for public view */}
                          <div className="grid grid-cols-1 gap-2">
                            <div className="text-center p-2 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border border-yellow-200 group-hover:border-yellow-300 transition-colors">
                              <div className="flex items-center justify-center space-x-1 mb-1">
                                <div className="text-sm font-bold text-yellow-600">
                                  {teacher.average_rating > 0 ? teacher.average_rating.toFixed(1) : 'N/A'}
                                </div>
                                {teacher.average_rating > 0 && (
                                  <svg className="w-3 h-3 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                )}
                              </div>
                              <div className="text-xs text-yellow-600 font-medium uppercase tracking-wide">Rating</div>
                            </div>
                          </div>
                          
                          {/* Mobile Score Row */}
                          <div className="grid grid-cols-1 gap-2">
                            <div className="text-center p-2 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg border border-purple-200 group-hover:border-purple-300 transition-colors">
                              <div className="text-sm font-bold text-purple-600 mb-1">
                                {teacher.total_score || 'N/A'}
                              </div>
                              <div className="text-xs text-purple-600 font-medium uppercase tracking-wide">Total Score</div>
                            </div>
                          </div>
                        </div>

                        {/* Desktop/Tablet Layout - Horizontal layout for larger screens */}
                        <div className="hidden md:flex md:flex-col lg:flex-row md:items-start lg:items-center">
                          {/* Rank Section */}
                          <div className="flex items-center mb-3 lg:mb-0 lg:mr-4">
                            <div className={`
                              flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm
                              ${displayRank === 1 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white shadow-lg' : ''}
                              ${displayRank === 2 ? 'bg-gradient-to-br from-gray-400 to-gray-600 text-white shadow-lg' : ''}
                              ${displayRank === 3 ? 'bg-gradient-to-br from-amber-500 to-amber-700 text-white shadow-lg' : ''}
                              ${displayRank > 3 ? 'bg-gradient-to-br from-slate-500 to-slate-700 text-white' : ''}
                            `}>
                              #{displayRank}
                            </div>
                          </div>

                          {/* Teacher Info Section */}
                          <div className="flex-1 lg:mr-6 mb-3 lg:mb-0">
                            <div className="flex items-center mb-1">
                              <h3 className="text-lg font-bold text-slate-800 group-hover:text-[#0065A8] transition-colors">
                                {teacher.teacher_name}
                              </h3>
                            </div>
                            {userRole === 'admin' && (
                              <p className="text-slate-500 text-xs">Teacher ID: {teacher.teacher_id}</p>
                            )}
                          </div>

                          {/* Stats Grid */}
                          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-3 lg:mb-0 w-full lg:w-auto">
                            <div className="text-center p-2 bg-white/80 backdrop-blur-sm rounded-lg border border-gray-200 group-hover:border-blue-200 transition-colors">
                              <div className="text-lg font-bold text-[#057DCD] mb-1">{teacher.total_consultations}</div>
                              <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">Sessions</div>
                            </div>
                            <div className="text-center p-2 bg-white/80 backdrop-blur-sm rounded-lg border border-gray-200 group-hover:border-blue-200 transition-colors">
                              <div className="text-lg font-bold text-[#057DCD] mb-1">{teacher.total_students}</div>
                              <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">Students</div>
                            </div>
                            <div className="text-center p-2 bg-white/80 backdrop-blur-sm rounded-lg border border-gray-200 group-hover:border-blue-200 transition-colors">
                              <div className="text-lg font-bold text-[#057DCD] mb-1">{teacher.total_duration_formatted}</div>
                              <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">Duration</div>
                            </div>
                            <div className="text-center p-2 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border border-yellow-200 group-hover:border-yellow-300 transition-colors">
                              <div className="flex items-center justify-center space-x-1 mb-1">
                                <div className="text-lg font-bold text-yellow-600">
                                  {teacher.average_rating > 0 ? teacher.average_rating.toFixed(1) : 'N/A'}
                                </div>
                                {teacher.average_rating > 0 && (
                                  <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                )}
                              </div>
                              <div className="text-xs text-yellow-600 font-medium uppercase tracking-wide">Rating</div>
                            </div>
                            <div className="text-center p-2 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg border border-purple-200 group-hover:border-purple-300 transition-colors">
                              <div className="text-lg font-bold text-purple-600 mb-1">
                                {teacher.total_score || 'N/A'}
                              </div>
                              <div className="text-xs text-purple-600 font-medium uppercase tracking-wide">Score</div>
                            </div>
                          </div>

                          {/* Action Button for Desktop/Tablet */}
                          <div className="flex items-center lg:ml-4">
                            {userRole === 'admin' ? (
                              <div className="flex items-center text-[#057DCD] font-medium text-xs group-hover:text-[#0065A8] transition-colors">
                                <span className="mr-1">View Details</span>
                                <div className="transform group-hover:translate-x-1 transition-transform">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                  </svg>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center text-gray-400 font-medium text-xs">
                                <span className="mr-1 hidden lg:inline">View Restricted</span>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Hover Effect Overlay */}
                        <div className="absolute inset-0 border-2 border-transparent group-hover:border-[#0065A8]/20 rounded-xl transition-all duration-300 pointer-events-none"></div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>

      {/* Teacher Details Modal - Admin Only */}
      {selectedTeacher && userRole === 'admin' && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={closeModal}>
          <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#0065A8] to-[#057DCD] text-white p-6 relative">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-3xl font-bold mb-2">{selectedTeacher.teacher_name}</h2>
                  <p className="text-blue-100 text-lg">Detailed Consultation Statistics</p>
                </div>
                <button 
                  className="bg-white/20 hover:bg-white/30 border-0 text-white cursor-pointer p-2 w-10 h-10 flex items-center justify-center rounded-full transition-all duration-200 text-xl font-bold" 
                  onClick={closeModal}
                >×</button>
              </div>
              
              {/* Quick Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mt-6">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold mb-1">{selectedTeacher.total_consultations}</div>
                  <div className="text-sm text-blue-100">Total Consultations</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold mb-1">{selectedTeacher.total_students}</div>
                  <div className="text-sm text-blue-100">Students Helped</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold mb-1">{selectedTeacher.total_duration_formatted}</div>
                  <div className="text-sm text-blue-100">Total Time</div>
                </div>
                {selectedTeacher.average_rating > 0 && (
                  <div className="bg-gradient-to-br from-yellow-400/20 to-orange-400/20 backdrop-blur-sm rounded-xl p-4 text-center border border-yellow-300/30">
                    <div className="flex items-center justify-center space-x-2 mb-1">
                      <div className="text-3xl font-bold text-yellow-200">{selectedTeacher.average_rating.toFixed(1)}</div>
                      <svg className="w-6 h-6 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                    <div className="text-sm text-yellow-100">Average Rating</div>
                  </div>
                )}
                <div className="bg-gradient-to-br from-purple-400/20 to-indigo-400/20 backdrop-blur-sm rounded-xl p-4 text-center border border-purple-300/30">
                  <div className="text-3xl font-bold text-purple-200 mb-1">
                    {selectedTeacher.total_score || 'N/A'}
                  </div>
                  <div className="text-sm text-purple-100">Total Score</div>
                </div>
              </div>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-slate-800 mb-4 flex items-center">
                  <span className="w-8 h-8 bg-[#0065A8] text-white rounded-full flex items-center justify-center mr-3">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </span>
                  Consultation Sessions
                </h3>
                
                {selectedTeacher.sessions.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p className="text-slate-500 text-lg">No consultation sessions available</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {selectedTeacher.sessions.map((session, index) => (
                      <div 
                        key={session.id} 
                        className="bg-gradient-to-br from-slate-50 to-blue-50 border border-slate-200 rounded-xl p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer group"
                        onClick={() => handleSessionClick(session)}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-[#0065A8] text-white rounded-full flex items-center justify-center mr-3 text-sm font-bold">
                              {index + 1}
                            </div>
                            <div>
                              <div className="font-bold text-slate-800 text-lg">
                                {new Date(session.date).toLocaleDateString('en-US', { 
                                  weekday: 'short',
                                  month: 'short', 
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </div>
                              <div className="text-slate-500 text-sm">
                                {new Date(session.date).toLocaleTimeString('en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </div>
                            </div>
                          </div>
                          <div className="text-[#057DCD] opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-slate-600">Duration:</span>
                            <span className="text-sm font-bold text-[#057DCD] bg-blue-100 px-2 py-1 rounded-full">
                              {session.duration || 'N/A'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-slate-600">Students:</span>
                            <span className="text-sm font-bold text-[#057DCD] bg-blue-100 px-2 py-1 rounded-full">
                              {session.student_count}
                            </span>
                          </div>
                          {session.summary && (
                            <div className="mt-3 p-3 bg-white/80 rounded-lg">
                              <p className="text-sm text-slate-700 line-clamp-2">
                                {session.summary.substring(0, 80)}...
                              </p>
                              <div className="text-xs text-[#057DCD] mt-2 font-medium">Click to read full summary →</div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Session Details Modal - Admin Only */}
      {selectedSession && userRole === 'admin' && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4" onClick={closeSessionModal}>
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {/* Session Modal Header */}
            <div className="bg-gradient-to-r from-[#057DCD] to-[#54BEFF] text-white p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Consultation Session Details</h3>
                  <p className="text-blue-100">
                    {new Date(selectedSession.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })} at {new Date(selectedSession.date).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <button 
                  className="bg-white/20 hover:bg-white/30 border-0 text-white cursor-pointer p-2 w-10 h-10 flex items-center justify-center rounded-full transition-all duration-200 text-xl font-bold" 
                  onClick={closeSessionModal}
                >×</button>
              </div>
            </div>
            
            {/* Session Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[65vh]">
              {/* Session Info Cards */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
                  <div className="flex items-center mb-2">
                    <svg className="w-6 h-6 text-[#057DCD] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-semibold text-slate-700">Duration</span>
                  </div>
                  <div className="text-2xl font-bold text-[#057DCD]">{selectedSession.duration || 'Not specified'}</div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
                  <div className="flex items-center mb-2">
                    <svg className="w-6 h-6 text-[#057DCD] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span className="font-semibold text-slate-700">Students</span>
                  </div>
                  <div className="text-2xl font-bold text-[#057DCD]">{selectedSession.student_count}</div>
                </div>
              </div>
              
              {/* Session Summary */}
              {selectedSession.summary && (
                <div className="mb-6">
                  <h4 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
                    <span className="w-8 h-8 bg-[#057DCD] text-white rounded-full flex items-center justify-center mr-3">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </span>
                    Session Summary
                  </h4>
                  <div className="bg-gradient-to-br from-slate-50 to-gray-50 p-6 rounded-xl border border-slate-200">
                    <p className="text-slate-700 leading-relaxed text-base whitespace-pre-wrap">
                      {selectedSession.summary}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Feedback Calculation Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setShowFeedbackModal(false)}>
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#0065A8] to-[#057DCD] text-white p-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-4">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">How Feedback is Calculated</h2>
                    <p className="text-blue-100">Understanding the ranking system</p>
                  </div>
                </div>
                <button 
                  className="bg-white/20 hover:bg-white/30 border-0 text-white cursor-pointer p-2 w-10 h-10 flex items-center justify-center rounded-full transition-all duration-200 text-xl font-bold" 
                  onClick={() => setShowFeedbackModal(false)}
                >×</button>
              </div>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              {/* Simple Explanation */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200 mb-8">
                <h3 className="text-xl font-bold text-blue-800 mb-4 flex items-center">
                  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  How Teacher Rankings Work
                </h3>
                <div className="space-y-4">
                  <p className="text-gray-700 leading-relaxed">
                    Our teacher leaderboard ranks faculty based on three key factors that matter most for student success. 
                    The system prioritizes <strong>student satisfaction</strong> while also recognizing teachers who spend quality time 
                    with students and maintain consistent availability.
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    Teachers are scored using a simple formula that combines their average student ratings (60%), 
                    total consultation time (25%), and number of sessions (15%). This balanced approach ensures 
                    that quality teaching is rewarded while preventing gaming of the system.
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Student Ratings */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg">Student Ratings</h3>
                      <p className="text-sm text-gray-600">60% of total score</p>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">
                    Students rate their consultation experience from 1 to 5 stars. 
                    Higher ratings mean better student satisfaction and learning outcomes.
                  </p>
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg key={star} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                    <span className="text-xs text-gray-500 ml-2">1-5 stars</span>
                  </div>
                </div>

                {/* Consultation Time */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg">Consultation Time</h3>
                      <p className="text-sm text-gray-600">25% of total score</p>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">
                    Total hours spent in consultations. More time typically means 
                    more thorough and helpful guidance for students.
                  </p>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-xs text-green-700 font-medium">
                      <strong>Example:</strong> 20 hours = 16 points
                    </p>
                  </div>
                </div>

                {/* Session Count */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg">Session Count</h3>
                      <p className="text-sm text-gray-600">15% of total score</p>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">
                    Total number of consultation sessions. Rewards consistent 
                    availability while keeping focus on quality over quantity.
                  </p>
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <p className="text-xs text-purple-700 font-medium">
                      <strong>Example:</strong> 15 sessions = 3 points
                    </p>
                  </div>
                </div>
              </div>

              {/* Simple Formula */}
              <div className="mt-8 bg-gray-50 p-6 rounded-xl border border-gray-200">
                <h3 className="font-bold text-gray-800 mb-4 text-lg">Final Score Calculation</h3>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <code className="text-sm text-gray-800 font-mono">
                    Final Score = (Average Rating × 60) + (Total Hours × 0.8) + (Total Sessions × 0.2)
                  </code>
                </div>
                <p className="text-sm text-gray-600 mt-3">
                  Teachers with higher scores rank higher on the leaderboard. This system ensures that 
                  student satisfaction is the most important factor while still recognizing teacher dedication and availability.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminConsultation;
