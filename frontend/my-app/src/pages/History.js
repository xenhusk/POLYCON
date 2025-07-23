import React, { useState } from "react";
import { useQuery } from "react-query";
import { motion, AnimatePresence } from "framer-motion";
import HistoryItem from "../components/HistoryItem";
import apiClient from "../utils/apiClient";
import useDebounce from "../hooks/useDebounce";

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

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.total_pages) {
      setCurrentPage(newPage);
    }
  };

  if (!role || !userID) {
    return <p className="text-center text-red-500">Missing user information</p>;
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen w-full overflow-x-hidden p-4 sm:p-6 lg:p-8"
    >
      <motion.h2 
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 sm:mb-6 lg:mb-8 text-center text-[#0065A8]"
      >
        Session History
      </motion.h2>

      {/* Search and Filter Controls */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white rounded-xl p-4 sm:p-5 lg:p-6 shadow-lg border border-gray-100 mb-4 sm:mb-6 w-full"
      >
        
        {/* Search Bar */}
        <div className="flex flex-col gap-4 mb-4">
          <motion.div 
            className="w-full"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <label htmlFor="search" className="block text-sm font-semibold text-gray-700 mb-2">
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
                className="w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-2.5 sm:py-3 border-2 border-gray-200 rounded-lg 
                  focus:ring-2 focus:ring-[#0065A8] focus:border-[#0065A8] transition-all duration-200
                  placeholder-gray-400 text-gray-700 text-sm sm:text-base"
              />
              <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                <svg className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  className="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-3 max-w-full"
                  >
                    <div className="text-xs font-semibold text-gray-600 mb-2">Search by:</div>
                    <div className="flex flex-wrap gap-1 sm:gap-2">
                      {role === "faculty" ? (
                        <>
                          <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs whitespace-nowrap">Student names</span>
                          <span className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs whitespace-nowrap">Session summary</span>
                          <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs whitespace-nowrap">Concerns</span>
                          <span className="px-2 py-1 bg-orange-50 text-orange-700 rounded text-xs whitespace-nowrap">Outcomes</span>
                          <span className="px-2 py-1 bg-pink-50 text-pink-700 rounded text-xs whitespace-nowrap">Actions taken</span>
                        </>
                      ) : (
                        <>
                          <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs whitespace-nowrap">Teacher names</span>
                          <span className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs whitespace-nowrap">Session summary</span>
                          <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs whitespace-nowrap">Concerns</span>
                          <span className="px-2 py-1 bg-orange-50 text-orange-700 rounded text-xs whitespace-nowrap">Outcomes</span>
                          <span className="px-2 py-1 bg-pink-50 text-pink-700 rounded text-xs whitespace-nowrap">Other students</span>
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Search Tips */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: searchQuery ? 1 : 0 }}
              transition={{ duration: 0.2 }}
              className={`mt-2 text-xs text-gray-500 ${searchQuery ? 'block' : 'hidden'}`}
            >
              <div className="flex items-start gap-1">
                <svg className="w-3 h-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="break-words">
                  {role === "faculty" 
                    ? "You can search by student names, session content, or any related information"
                    : "You can search by teacher names, session content, or any related information"
                  }
                </span>
              </div>
            </motion.div>
          </motion.div>
          
          {/* Buttons Container */}
          <motion.div 
            className="flex gap-2 justify-center sm:justify-start mt-0 sm:mt-0"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <motion.button
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
              className={`px-2.5 py-1.5 rounded-md font-medium transition-all duration-200 flex items-center gap-1.5 shadow-sm text-xs relative
                ${isFiltersExpanded 
                  ? 'bg-[#0065A8] text-white shadow-md' 
                  : 'bg-white text-[#0065A8] border border-[#0065A8] hover:bg-[#0065A8] hover:text-white'
                }`}
            >
              <motion.svg 
                className="w-3.5 h-3.5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                animate={{ rotate: isFiltersExpanded ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </motion.svg>
              <span>Filters</span>
              {(startDate || endDate) && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center ml-0.5 text-xs"
                >
                  •
                </motion.span>
              )}
            </motion.button>
            
            <AnimatePresence>
              {(searchQuery || startDate || endDate) && (
                <motion.button
                  initial={{ opacity: 0, scale: 0, x: 20 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0, x: 20 }}
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={clearFilters}
                  className="px-2.5 py-1.5 bg-gray-500 text-white rounded-md hover:bg-gray-600 
                    transition-all duration-200 font-medium shadow-sm flex items-center gap-1.5 text-xs"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Clear
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
              className="overflow-hidden"
            >
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="p-4 sm:p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200 mt-4 w-full overflow-hidden"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-[#0065A8] rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Date Range Filter</h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="w-full"
                  >
                    <label htmlFor="startDate" className="block text-sm font-semibold text-gray-700 mb-2">
                      From Date
                    </label>
                    <input
                      id="startDate"
                      type="date"
                      value={startDate}
                      onChange={(e) => handleDateFilter(e.target.value, endDate)}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-lg 
                        focus:ring-2 focus:ring-[#0065A8] focus:border-[#0065A8] transition-all duration-200 text-sm sm:text-base"
                    />
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="w-full"
                  >
                    <label htmlFor="endDate" className="block text-sm font-semibold text-gray-700 mb-2">
                      To Date
                    </label>
                    <input
                      id="endDate"
                      type="date"
                      value={endDate}
                      onChange={(e) => handleDateFilter(startDate, e.target.value)}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-lg 
                        focus:ring-2 focus:ring-[#0065A8] focus:border-[#0065A8] transition-all duration-200 text-sm sm:text-base"
                    />
                  </motion.div>
                </div>
                
                {(startDate || endDate) && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-4 p-3 bg-blue-100 rounded-lg border border-blue-200"
                  >
                    <div className="flex items-center gap-2 text-blue-800">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm font-medium">
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
              className="mt-4 flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg w-full overflow-hidden"
            >
              <svg className="w-4 h-4 text-[#0065A8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="font-medium break-words">
                Showing <span className="text-[#0065A8] font-bold">{sessions.length}</span> of{' '}
                <span className="text-[#0065A8] font-bold">{pagination.total_count}</span> sessions
                {searchQuery && (
                  <span className="text-gray-500 block sm:inline">
                    {' '}matching "<span className="font-semibold text-gray-700 break-all">{searchQuery}</span>"
                    <span className="block sm:inline">
                      {role === "faculty" ? " (includes student names)" : " (includes teacher names)"}
                    </span>
                  </span>
                )}
                {(startDate || endDate) && (
                  <span className="text-gray-500 block sm:inline"> filtered by date range</span>
                )}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-[#dceffa] rounded-xl p-4 sm:p-5 lg:p-6 shadow-lg 
          h-[calc(100vh-16rem)] sm:h-[calc(100vh-18rem)] lg:h-[calc(100vh-20rem)] 
          overflow-y-auto overflow-x-hidden w-full"
      >
        {isLoading ? (
          <motion.ul 
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {Array.from({ length: 3 }).map((_, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
                className="bg-white rounded-lg p-4 shadow hover:shadow-lg transition-shadow 
                  cursor-pointer border-l-4 border-[#0065A8] 
                  md-px:p-4 sm-px:p-3 animate-pulse">
                {/* Teacher Section Skeleton */}
                <div className="flex items-center mb-2">
                  <div className="w-12 h-12 bg-gray-200 rounded-full mr-3
                    md-px:w-12 md-px:h-12 
                    sm-px:w-10 sm-px:h-10 
                    xs:w-8 xs:h-8" />
                  <div className="space-y-2">
                    {/* Teacher name */}
                    <div className="h-4 bg-gray-300 rounded w-32
                      md-px:h-4 md-px:w-32
                      sm-px:h-3.5 sm-px:w-28
                      xs:h-3 xs:w-24" />
                    {/* Department */}
                    <div className="h-3 bg-gray-300 rounded w-24
                      md-px:h-3 md-px:w-24
                      sm-px:h-2.5 sm-px:w-20
                      xs:h-2 xs:w-16" />
                  </div>
                </div>

                {/* Session Date Skeleton */}
                <div className="h-3 bg-gray-200 rounded w-40 mb-4
                  md-px:h-3 md-px:mb-4
                  sm-px:h-2.5 sm-px:mb-3
                  xs:h-2 xs:mb-2" />

                {/* Students Section Skeleton */}
                <div className="h-3 bg-gray-300 rounded w-24 mb-2
                  md-px:h-3 md-px:mb-2
                  sm-px:h-2.5 sm-px:mb-1.5
                  xs:h-2 xs:mb-1" />
                <div className="flex flex-wrap items-center gap-3 mb-4
                  md-px:gap-3 md-px:mb-4
                  sm-px:gap-2 sm-px:mb-3
                  xs:gap-1.5 xs:mb-2">
                  {Array.from({ length: 3 }).map((__, i) => (
                    <div
                      key={i}
                      className="flex items-center bg-gray-50 rounded-full px-3 py-1
                        md-px:px-3 md-px:py-1
                        sm-px:px-2 sm-px:py-0.5
                        xs:px-1.5 xs:py-0.5"
                    >
                      <div className="w-8 h-8 rounded-full mr-2 bg-gray-200
                        md-px:w-8 md-px:h-8 md-px:mr-2
                        sm-px:w-7 sm-px:h-7 sm-px:mr-1.5
                        xs:w-6 xs:h-6 xs:mr-1" />
                      <div className="h-3 bg-gray-300 rounded w-20
                        md-px:h-3 md-px:w-20
                        sm-px:h-2.5 sm-px:w-16
                        xs:h-2 xs:w-14" />
                    </div>
                  ))}
                </div>

                {/* Summary Skeleton */}
                <div className="h-3 bg-gray-300 rounded w-24 mb-2
                  md-px:h-3 md-px:mb-2
                  sm-px:h-2.5 sm-px:mb-1.5
                  xs:h-2 xs:mb-1" />
                <div className="h-3 bg-gray-200 rounded w-full mb-1
                  md-px:h-3 md-px:mb-1
                  sm-px:h-2.5 sm-px:mb-0.5
                  xs:h-2 xs:mb-0.5" />
                <div className="h-3 bg-gray-200 rounded w-3/4
                  md-px:h-3
                  sm-px:h-2.5
                  xs:h-2" />
              </motion.li>
            ))}
          </motion.ul>
        ) : error ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="text-red-500 text-center"
          >
            <div className="flex flex-col items-center justify-center py-12">
              <svg className="w-16 h-16 text-red-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <p className="text-xl font-medium text-red-500 mb-2">Error loading history</p>
              <p className="text-sm text-red-400 mb-4">Please check your connection and try again</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => refetch()}
                className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600
                  transition-all duration-200 font-medium shadow-md flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Try Again
              </motion.button>
            </div>
          </motion.div>
        ) : sessions.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <motion.ul 
              className="space-y-3 sm:space-y-4 w-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, staggerChildren: 0.1 }}
            >
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
                    y: -2, 
                    boxShadow: "0 10px 25px rgba(0, 101, 168, 0.15)" 
                  }}
                  className="transform transition-all duration-200"
                >
                  <HistoryItem
                    session={session}
                  />
                </motion.div>
              ))}
            </motion.ul>
            
            {/* Pagination Controls */}
            <AnimatePresence>
              {pagination.total_pages > 1 && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                  className="mt-6 sm:mt-8 flex justify-center items-center gap-2 sm:gap-3 w-full px-2"
                >
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={!pagination.has_prev}
                    className="px-3 sm:px-4 py-2 rounded-lg border-2 border-gray-300 bg-white text-gray-700 
                      hover:bg-gray-50 hover:border-[#0065A8] disabled:opacity-50 disabled:cursor-not-allowed
                      transition-all duration-200 font-medium shadow-sm text-sm sm:text-base flex-shrink-0"
                  >
                    <svg className="w-4 h-4 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span className="hidden sm:inline">Previous</span>
                    <span className="sm:hidden">Prev</span>
                  </motion.button>
                  
                  <div className="flex gap-1 flex-shrink-0 min-w-0">
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
                          className={`px-3 sm:px-4 py-2 rounded-lg border-2 font-semibold transition-all duration-200 shadow-sm text-sm sm:text-base flex-shrink-0 ${
                            currentPage === pageNum
                              ? 'border-[#0065A8] bg-[#0065A8] text-white shadow-md'
                              : 'border-gray-300 bg-white text-gray-700 hover:bg-[#0065A8] hover:text-white hover:border-[#0065A8]'
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
                    className="px-3 sm:px-4 py-2 rounded-lg border-2 border-gray-300 bg-white text-gray-700 
                      hover:bg-gray-50 hover:border-[#0065A8] disabled:opacity-50 disabled:cursor-not-allowed
                      transition-all duration-200 font-medium shadow-sm text-sm sm:text-base flex-shrink-0"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <span className="sm:hidden">Next</span>
                    <svg className="w-4 h-4 ml-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-center text-gray-500 italic text-base sm:text-lg"
          >
            <div className="flex flex-col items-center justify-center py-12">
              <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} 
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-xl font-medium text-gray-400 mb-2">
                {searchQuery || startDate || endDate 
                  ? "No sessions found matching your criteria" 
                  : "No session history available"
                }
              </p>
              <p className="text-sm text-gray-400 mb-4">
                {searchQuery || startDate || endDate 
                  ? "Try adjusting your search filters" 
                  : "Sessions will appear here once they're created"
                }
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => refetch()}
                className="px-6 py-3 bg-[#0065A8] text-white rounded-lg hover:bg-[#004d82]
                  transition-all duration-200 font-medium shadow-md flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </motion.button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}

export default History;
