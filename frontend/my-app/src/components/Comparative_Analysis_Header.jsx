import React from 'react';
import { motion } from 'framer-motion';

const ComparativeAnalysisHeader = () => {
  return (
    <div className="mb-12">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden bg-gradient-to-r from-[#0065A8] via-[#057DCD] to-[#54BEFF] py-12 px-4 sm:px-6 lg:px-8 rounded-2xl mb-8"
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4"
          >
Polycon Analysis
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl sm:text-2xl text-blue-100 max-w-4xl mx-auto"
          >
            Comprehensive student improvement and learning progress analysis
          </motion.p>
        </div>
      </motion.div>

      {/* Description Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="text-center max-w-4xl mx-auto mb-8"
      >
        <p className="text-gray-600 text-lg px-4">
          Welcome to the Polycon Analysis tool, your comprehensive solution for
          evaluating student grade improvement and learning progress. This analysis
          compares student performance across different periods to provide
          clear insights into academic progress and consultation effectiveness.
        </p>
      </motion.div>

      {/* Feature Cards Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 px-4"
      >
        {/* Performance Tracking Card */}
        <motion.div 
          whileHover={{ scale: 1.05, y: -5 }}
          className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300"
        >
          <div className="w-12 h-12 bg-gradient-to-r from-[#0065A8] to-[#057DCD] rounded-full flex items-center justify-center mb-4 mx-auto">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <h3 className="font-bold text-gray-800 text-center mb-3">Before & After Analysis</h3>
          <p className="text-sm text-gray-600 text-center">
            Compare student performance before and after consultation sessions
          </p>
        </motion.div>

        {/* Consultation History Card */}
        <motion.div 
          whileHover={{ scale: 1.05, y: -5 }}
          className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300"
        >
          <div className="w-12 h-12 bg-gradient-to-r from-[#057DCD] to-[#54BEFF] rounded-full flex items-center justify-center mb-4 mx-auto">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <h3 className="font-bold text-gray-800 text-center mb-3">Impact Assessment</h3>
          <p className="text-sm text-gray-600 text-center">
            Measure consultation effectiveness and student improvement rates
          </p>
        </motion.div>

        {/* Academic Events Card */}
        <motion.div 
          whileHover={{ scale: 1.05, y: -5 }}
          className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300"
        >
          <div className="w-12 h-12 bg-gradient-to-r from-[#54BEFF] to-[#0065A8] rounded-full flex items-center justify-center mb-4 mx-auto">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
              />
            </svg>
          </div>
          <h3 className="font-bold text-gray-800 text-center mb-3">Class Performance</h3>
          <p className="text-sm text-gray-600 text-center">
            View class-wide consultation impact and improvement statistics
          </p>
        </motion.div>
      </motion.div>

      {/* Note: Start Analysis button and empty state removed - search is now directly on the page */}
    </div>
  );
};

export default ComparativeAnalysisHeader;