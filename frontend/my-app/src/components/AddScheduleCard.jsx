import React from 'react';
import { motion } from 'framer-motion';

const AddScheduleCard = ({ onAddClick }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="group relative perspective-1000 card-container"
    >
      <motion.div
        whileHover={{ 
          y: -8, 
          scale: 1.02,
          transition: { duration: 0.3 }
        }}
        className="relative w-full h-80 bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden"
        onClick={onAddClick}
      >
        {/* Status indicator - neutral gray */}
        <div className="h-1 w-full rounded-t-2xl mb-4 bg-gradient-to-r from-gray-400 to-gray-500" />
        
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-bold text-xl text-gray-700">
            Add Schedule
          </h3>
          <span className="px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 text-gray-700">
            New
          </span>
        </div>
        
        {/* Content */}
        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/50 mb-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center shadow-md">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div>
              <h5 className="font-semibold text-sm text-gray-600">Create New</h5>
              <p className="text-gray-700 font-bold">
                Consultation Time Slot
              </p>
            </div>
          </div>
        </div>
        
        {/* Description */}
        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/50 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center shadow-md">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h5 className="font-semibold text-sm text-gray-600">Information</h5>
              <p className="text-gray-700 font-bold">Set day, time & venue</p>
            </div>
          </div>
        </div>

        {/* Hover Overlay with Add Button */}
        <motion.div
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-2xl flex items-center justify-center"
          transition={{ duration: 0.2 }}
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation();
              onAddClick();
            }}
            className="bg-white text-gray-700 px-6 py-3 rounded-xl font-semibold shadow-lg flex items-center gap-2 hover:bg-gray-50 transition-colors duration-200"
          >
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Schedule
          </motion.button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default AddScheduleCard;
