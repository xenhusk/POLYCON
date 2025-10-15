import React, { useState, useEffect } from "react";
import { useQuery } from "react-query";
import { motion, AnimatePresence } from "framer-motion";
import HistoryItem from "../components/HistoryItem";
import apiClient from "../utils/apiClient";
import useDebounce from "../hooks/useDebounce";
import FeedbackPopup from "../components/FeedbackPopup";
import { io } from 'socket.io-client';
import API_URL from '../apiConfig';

function History() {
  const role = localStorage.getItem("userRole")?.toLowerCase();
  const userID =
    role === "faculty"
      ? localStorage.getItem("teacherID")
      : localStorage.getItem("studentID");

  // State for filters and pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  
  // Feedback popup state
  const [showFeedbackPopup, setShowFeedbackPopup] = useState(false);
  const [feedbackSessionData, setFeedbackSessionData] = useState(null);
  const [socket, setSocket] = useState(null);

  const limit = 10;

  // Debounced search to avoid too many API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const {
    data: historyData,
    isLoading,
    error,
    refetch,
  } = useQuery(
    ["history", role, userID, currentPage, debouncedSearchQuery, startDate, endDate],
    () => apiClient.consultations.getHistory(role, userID, {
      search: debouncedSearchQuery,
      startDate,
      endDate,
      page: currentPage,
      limit
    }),
    {
      enabled: !!role && !!userID,
      staleTime: 30000,
      refetchOnWindowFocus: false,
      keepPreviousData: true,
    }
  );

  const sessions = historyData?.data || [];
  const pagination = historyData?.pagination || {};

  // Reset to first page when filters change
  const handleSearchChange = (value) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleDateFilter = (start, end) => {
    setStartDate(start);
    setEndDate(end);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
  };


  const handleFeedbackSubmitted = (feedbackData) => {
    console.log('Feedback submitted from History page:', feedbackData);
    setShowFeedbackPopup(false);
    setFeedbackSessionData(null);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.total_pages) {
      setCurrentPage(newPage);
    }
  };

  // Polling-based feedback check (replaces Socket.IO)
  const checkForFeedbackOpportunity = async () => {
    try {
      const response = await fetch(`${API_URL}/feedback/check_pending?student_id=${userID}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.has_pending_feedback && data.session_data) {
          setFeedbackSessionData({
            sessionId: data.session_data.session_id,
            teacherId: data.session_data.teacher_id,
            studentId: data.session_data.student_id
          });
          setShowFeedbackPopup(true);
        }
      }
    } catch (error) {
      console.error('Error checking for feedback:', error);
    }
  };

  // Polling-based feedback check (only for students)
  useEffect(() => {
    if (role !== 'student' || !userID) return;

    // Initial check
    checkForFeedbackOpportunity();
    
    // Set up polling every 30 seconds
    const pollingInterval = setInterval(() => {
      checkForFeedbackOpportunity();
    }, 30000); // Check every 30 seconds

    // Cleanup on unmount
    return () => {
      clearInterval(pollingInterval);
    };
  }, [role, userID]);

  // Socket connection for feedback triggers (fallback)
  useEffect(() => {
    if (role !== 'student' || !userID) return;

    // Connect to socket
    const newSocket = io(API_URL, {
      transports: ['websocket', 'polling']
    });

    // Join student's room
    newSocket.emit('join_room', `user_${userID}`);

    // Listen for feedback trigger
    newSocket.on('feedback_trigger', (data) => {
      if (data.student_id === userID) {
        setFeedbackSessionData({
          sessionId: data.sessionID,
          teacherId: data.teacher_id,
          studentId: data.student_id
        });
        setTimeout(() => {
          setShowFeedbackPopup(true);
        }, 2000); // Show after 2 seconds
      }
    });

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      newSocket.disconnect();
    };
  }, [role, userID]);

  if (!role || !userID) {
    return <p className="text-center text-red-500">Missing user information</p>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 font-poppins">
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

        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
              Session History
            </h1>
            <p className="text-xl md:text-2xl text-blue-200 mb-2">
              {role === "student" ? "Your consultation history" : "Your teaching sessions"}
            </p>
            <p className="text-lg text-blue-100 max-w-2xl mx-auto">
              {role === "student" 
                ? "Review all your past consultation sessions with faculty members" 
                : "Track and review all your completed consultation sessions with students"
              }
            </p>
          </motion.div>
        </div>
      </motion.section>

      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >

          {/* Search and Filter Controls */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 mb-8"
          >
            <div className="bg-gradient-to-r from-[#057DCD] to-[#046bb8] text-white p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Search & Filter</h3>
                  <p className="text-blue-100">Find specific sessions quickly</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              {/* Search Bar */}
              <motion.div 
                className="w-full mb-6"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
                <label htmlFor="search" className="block text-lg font-semibold text-gray-800 mb-3">
                  Search Sessions
                </label>
                <div className="relative w-full">
                  <input
                    id="search"
                    type="text"
                    placeholder={
                      role === "faculty" 
                        ? "Search by summary, concern, action, outcome, or student names..."
                        : "Search by summary, concern, action, outcome, or teacher names..."
                    }
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    onFocus={() => setShowSearchSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSearchSuggestions(false), 200)}
                    className="w-full pl-12 pr-12 py-4 border-2 border-gray-200 rounded-xl 
                      focus:ring-2 focus:ring-[#057DCD] focus:border-[#057DCD] transition-all duration-200
                      placeholder-gray-400 text-gray-700 text-base shadow-sm"
                  />
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  {searchQuery && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0 }}
                      onClick={() => handleSearchChange('')}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </motion.button>
                  )}
                  
                  {/* Search Suggestions */}
                  <AnimatePresence>
                    {showSearchSuggestions && !searchQuery && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-2xl z-10 p-4"
                      >
                        <div className="text-sm font-semibold text-gray-700 mb-3">Search by:</div>
                        <div className="flex flex-wrap gap-2">
                          {role === "faculty" ? (
                            <>
                              <span className="px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium">Student names</span>
                              <span className="px-3 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-medium">Session summary</span>
                              <span className="px-3 py-2 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium">Concerns</span>
                              <span className="px-3 py-2 bg-orange-50 text-orange-700 rounded-lg text-sm font-medium">Outcomes</span>
                              <span className="px-3 py-2 bg-pink-50 text-pink-700 rounded-lg text-sm font-medium">Actions taken</span>
                            </>
                          ) : (
                            <>
                              <span className="px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium">Teacher names</span>
                              <span className="px-3 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-medium">Session summary</span>
                              <span className="px-3 py-2 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium">Concerns</span>
                              <span className="px-3 py-2 bg-orange-50 text-orange-700 rounded-lg text-sm font-medium">Outcomes</span>
                              <span className="px-3 py-2 bg-pink-50 text-pink-700 rounded-lg text-sm font-medium">Other students</span>
                            </>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
                {/* Search Tips */}
                <AnimatePresence>
                  {searchQuery && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200"
                    >
                      <div className="flex items-start gap-2">
                        <svg className="w-4 h-4 mt-0.5 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm text-blue-800">
                          {role === "faculty" 
                            ? "You can search by student names, session content, or any related information"
                            : "You can search by teacher names, session content, or any related information"
                          }
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
              
              {/* Filter Buttons */}
              <motion.div 
                className="flex gap-3 justify-center sm:justify-start"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 shadow-lg relative
                    ${isFiltersExpanded 
                      ? 'bg-gradient-to-r from-[#057DCD] to-[#046bb8] text-white' 
                      : 'bg-white text-[#057DCD] border-2 border-[#057DCD] hover:bg-[#057DCD] hover:text-white'
                    }`}
                >
                  <motion.svg 
                    className="w-5 h-5" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    animate={{ rotate: isFiltersExpanded ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </motion.svg>
                  <span>Date Filters</span>
                  {(startDate || endDate) && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold"
                    >
                      !
                    </motion.span>
                  )}
                </motion.button>
                
                <AnimatePresence>
                  {(searchQuery || startDate || endDate) && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0, x: 20 }}
                      animate={{ opacity: 1, scale: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0, x: 20 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={clearFilters}
                      className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 
                        transition-all duration-200 font-semibold shadow-lg flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Clear All
                    </motion.button>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>

            {/* Date Range Filters */}
            <AnimatePresence>
              {isFiltersExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -20 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -20 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="overflow-hidden mt-6"
                >
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="p-6 bg-gradient-to-r from-blue-50 to-indigo-100 rounded-xl border border-blue-200"
                  >
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-[#057DCD] rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">Date Range Filter</h3>
                        <p className="text-gray-600 text-sm">Filter sessions by specific date range</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="w-full"
                      >
                        <label htmlFor="startDate" className="block text-sm font-semibold text-gray-700 mb-3">
                          From Date
                        </label>
                        <input
                          id="startDate"
                          type="date"
                          value={startDate}
                          onChange={(e) => handleDateFilter(e.target.value, endDate)}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg 
                            focus:ring-2 focus:ring-[#057DCD] focus:border-[#057DCD] transition-all duration-200 text-base shadow-sm"
                        />
                      </motion.div>
                      
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="w-full"
                      >
                        <label htmlFor="endDate" className="block text-sm font-semibold text-gray-700 mb-3">
                          To Date
                        </label>
                        <input
                          id="endDate"
                          type="date"
                          value={endDate}
                          onChange={(e) => handleDateFilter(startDate, e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg 
                            focus:ring-2 focus:ring-[#057DCD] focus:border-[#057DCD] transition-all duration-200 text-base shadow-sm"
                        />
                      </motion.div>
                    </div>
                    
                    {(startDate || endDate) && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="mt-6 p-4 bg-blue-100 rounded-lg border border-blue-200"
                      >
                        <div className="flex items-center gap-3 text-blue-800">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="font-medium">
                            Filtering sessions {startDate ? `from ${startDate}` : ''} 
                            {startDate && endDate ? ' ' : ''}
                            {endDate ? `to ${endDate}` : ''}
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Results Summary */}
            <AnimatePresence>
              {pagination.total_count !== undefined && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: 0.1 }}
                  className="mt-6 p-4 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-xl border border-emerald-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div>
                      <span className="font-semibold text-emerald-800">
                        Showing <span className="font-bold text-[#057DCD]">{sessions.length}</span> of{' '}
                        <span className="font-bold text-[#057DCD]">{pagination.total_count}</span> sessions
                      </span>
                      {searchQuery && (
                        <div className="text-sm text-emerald-700 mt-1">
                          matching "<span className="font-semibold">{searchQuery}</span>"
                          {role === "faculty" ? " (includes student names)" : " (includes teacher names)"}
                        </div>
                      )}
                      {(startDate || endDate) && (
                        <div className="text-sm text-emerald-700 mt-1">filtered by date range</div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Sessions List */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100"
          >
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Session History</h3>
                  <p className="text-indigo-100">All your consultation sessions</p>
                </div>
              </div>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto">
              {isLoading ? (
                <div className="space-y-6">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.4 }}
                      className="bg-gray-50 rounded-2xl p-6 animate-pulse border border-gray-200"
                    >
                      {/* Header Skeleton */}
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                        <div className="flex-1">
                          <div className="h-5 bg-gray-200 rounded w-48 mb-2"></div>
                          <div className="h-4 bg-gray-200 rounded w-32"></div>
                        </div>
                        <div className="h-6 bg-gray-200 rounded w-20"></div>
                      </div>

                      {/* Date Skeleton */}
                      <div className="h-4 bg-gray-200 rounded w-40 mb-6"></div>

                      {/* Students Section Skeleton */}
                      <div className="mb-6">
                        <div className="h-4 bg-gray-200 rounded w-24 mb-3"></div>
                        <div className="flex gap-3">
                          {Array.from({ length: 2 }).map((_, i) => (
                            <div key={i} className="flex items-center bg-gray-100 rounded-full px-4 py-2">
                              <div className="w-8 h-8 bg-gray-200 rounded-full mr-3"></div>
                              <div className="h-4 bg-gray-200 rounded w-24"></div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Summary Skeleton */}
                      <div>
                        <div className="h-4 bg-gray-200 rounded w-20 mb-3"></div>
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-full"></div>
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : error ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className="text-center py-16"
                >
                  <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-2xl mx-auto border border-gray-100">
                    <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-red-200 to-red-300 rounded-full flex items-center justify-center">
                      <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-3">Error Loading History</h3>
                    <p className="text-lg text-gray-600 mb-6">Please check your connection and try again</p>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => refetch()}
                      className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-3 px-8 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 shadow-lg mx-auto"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Try Again
                    </motion.button>
                  </div>
                </motion.div>
              ) : sessions.length > 0 ? (
                <div className="space-y-6">
                  {sessions.map((session, index) => (
                    <motion.div
                      key={session.session_id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ 
                        duration: 0.4, 
                        delay: index * 0.1,
                        ease: "easeOut"
                      }}
                      whileHover={{ 
                        y: -5, 
                        boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)" 
                      }}
                      className="transform transition-all duration-300"
                    >
                      <HistoryItem
                        session={session}
                      />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className="text-center py-16"
                >
                  <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-2xl mx-auto border border-gray-100">
                    <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center">
                      <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-3">
                      {searchQuery || startDate || endDate 
                        ? "No Sessions Found" 
                        : "No Session History"
                      }
                    </h3>
                    <p className="text-lg text-gray-600 mb-6">
                      {searchQuery || startDate || endDate 
                        ? "Try adjusting your search filters to find sessions" 
                        : "Sessions will appear here once they're created"
                      }
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => refetch()}
                      className="bg-gradient-to-r from-[#057DCD] to-[#046bb8] hover:from-[#046bb8] hover:to-[#034a94] text-white py-3 px-8 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 shadow-lg mx-auto"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Refresh
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* Pagination Controls */}
              <AnimatePresence>
                {sessions.length > 0 && pagination.total_pages > 1 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    className="mt-8"
                  >
                    {/* Mobile Pagination */}
                    <div className="flex flex-col sm:hidden gap-4">
                      {/* Page Info */}
                      <div className="text-center">
                        <span className="text-sm text-gray-600">
                          Page <span className="font-semibold text-[#057DCD]">{currentPage}</span> of{' '}
                          <span className="font-semibold text-[#057DCD]">{pagination.total_pages}</span>
                        </span>
                      </div>
                      
                      {/* Mobile Navigation Buttons */}
                      <div className="flex justify-between items-center gap-3">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={!pagination.has_prev}
                          className="flex-1 px-4 py-3 rounded-lg border-2 border-gray-300 bg-white text-gray-700 
                            hover:bg-gray-50 hover:border-[#057DCD] disabled:opacity-50 disabled:cursor-not-allowed
                            transition-all duration-200 font-semibold shadow-lg flex items-center justify-center gap-2 text-sm"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                          <span className="hidden xs:inline">Previous</span>
                          <span className="xs:hidden">Prev</span>
                        </motion.button>
                        
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={!pagination.has_next}
                          className="flex-1 px-4 py-3 rounded-lg border-2 border-gray-300 bg-white text-gray-700 
                            hover:bg-gray-50 hover:border-[#057DCD] disabled:opacity-50 disabled:cursor-not-allowed
                            transition-all duration-200 font-semibold shadow-lg flex items-center justify-center gap-2 text-sm"
                        >
                          <span className="hidden xs:inline">Next</span>
                          <span className="xs:hidden">Next</span>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </motion.button>
                      </div>
                      
                      {/* Mobile Page Numbers (Compact) */}
                      <div className="flex justify-center gap-1">
                        {Array.from({ length: Math.min(3, pagination.total_pages) }, (_, i) => {
                          let pageNum;
                          if (pagination.total_pages <= 3) {
                            pageNum = i + 1;
                          } else {
                            const startPage = Math.max(1, currentPage - 1);
                            const endPage = Math.min(pagination.total_pages, startPage + 2);
                            pageNum = startPage + i;
                            if (pageNum > endPage) return null;
                          }
                          
                          return (
                            <motion.button
                              key={pageNum}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handlePageChange(pageNum)}
                              className={`px-3 py-2 rounded-lg border-2 font-semibold transition-all duration-200 shadow-lg text-sm ${
                                currentPage === pageNum
                                  ? 'border-[#057DCD] bg-[#057DCD] text-white'
                                  : 'border-gray-300 bg-white text-gray-700 hover:bg-[#057DCD] hover:text-white hover:border-[#057DCD]'
                              }`}
                            >
                              {pageNum}
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Desktop Pagination */}
                    <div className="hidden sm:flex justify-center items-center gap-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={!pagination.has_prev}
                        className="px-6 py-3 rounded-lg border-2 border-gray-300 bg-white text-gray-700 
                          hover:bg-gray-50 hover:border-[#057DCD] disabled:opacity-50 disabled:cursor-not-allowed
                          transition-all duration-200 font-semibold shadow-lg flex items-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Previous
                      </motion.button>
                      
                      <div className="flex gap-2">
                        {Array.from({ length: Math.min(5, pagination.total_pages) }, (_, i) => {
                          let pageNum;
                          if (pagination.total_pages <= 5) {
                            pageNum = i + 1;
                          } else {
                            const startPage = Math.max(1, currentPage - 2);
                            const endPage = Math.min(pagination.total_pages, startPage + 4);
                            pageNum = startPage + i;
                            if (pageNum > endPage) return null;
                          }
                          
                          return (
                            <motion.button
                              key={pageNum}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handlePageChange(pageNum)}
                              className={`px-4 py-3 rounded-lg border-2 font-semibold transition-all duration-200 shadow-lg ${
                                currentPage === pageNum
                                  ? 'border-[#057DCD] bg-[#057DCD] text-white'
                                  : 'border-gray-300 bg-white text-gray-700 hover:bg-[#057DCD] hover:text-white hover:border-[#057DCD]'
                              }`}
                            >
                              {pageNum}
                            </motion.button>
                          );
                        })}
                      </div>
                      
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={!pagination.has_next}
                        className="px-6 py-3 rounded-lg border-2 border-gray-300 bg-white text-gray-700 
                          hover:bg-gray-50 hover:border-[#057DCD] disabled:opacity-50 disabled:cursor-not-allowed
                          transition-all duration-200 font-semibold shadow-lg flex items-center gap-2"
                      >
                        Next
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      </div>


      {/* Feedback Popup */}
      {showFeedbackPopup && feedbackSessionData && (
        <FeedbackPopup
          isOpen={showFeedbackPopup}
          onClose={() => setShowFeedbackPopup(false)}
          consultationSessionId={feedbackSessionData.sessionId}
          studentId={feedbackSessionData.studentId}
          teacherId={feedbackSessionData.teacherId}
          onFeedbackSubmitted={handleFeedbackSubmitted}
        />
      )}
    </div>
  );
}

export default History;
