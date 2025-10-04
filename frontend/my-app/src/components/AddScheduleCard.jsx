import React from 'react';
import { motion } from 'framer-motion';

const AddScheduleCard = ({ onAddClick }) => {
  // Helper function to generate colored shadows
  const getColoredShadow = (type) => {
    const emeraldRgb = '16, 185, 129';
    
    if (type === 'hover') {
      return `0 25px 50px -12px rgba(${emeraldRgb}, 0.4), 0 0 0 1px rgba(${emeraldRgb}, 0.1)`;
    } else {
      return `0 10px 15px -3px rgba(${emeraldRgb}, 0.2), 0 4px 6px -2px rgba(${emeraldRgb}, 0.1)`;
    }
  };

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
        className="relative w-full h-80 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 border-2 border-dashed border-emerald-300 rounded-2xl p-6 transition-all duration-300 cursor-pointer overflow-hidden"
        style={{
          boxShadow: getColoredShadow('default'),
        }}
        onMouseEnter={(e) => {
          e.target.style.boxShadow = getColoredShadow('hover');
        }}
        onMouseLeave={(e) => {
          e.target.style.boxShadow = getColoredShadow('default');
        }}
        onClick={onAddClick}
      >
        {/* Animated border effect */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-400/20 via-teal-400/20 to-cyan-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Status indicator - vibrant gradient */}
        <div className="h-1 w-full rounded-t-2xl mb-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />
        
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-bold text-xl text-emerald-700">
            Add Schedule
          </h3>
          <span className="px-3 py-1 rounded-full text-sm font-semibold bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 border border-emerald-200">
            New
          </span>
        </div>
        
        {/* Main content area */}
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          {/* Large animated plus icon */}
          <motion.div
            animate={{ 
              rotate: [0, 5, -5, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-xl mb-4 group-hover:shadow-2xl transition-shadow duration-300"
          >
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </motion.div>
          
          {/* Text content */}
          <h4 className="text-lg font-bold text-emerald-700 mb-2 group-hover:text-emerald-800 transition-colors duration-300">
            Create New Schedule
          </h4>
          <p className="text-sm text-emerald-600 group-hover:text-emerald-700 transition-colors duration-300">
            Add a new consultation time slot
          </p>
        </div>

        {/* Floating elements for visual interest */}
        <div className="absolute top-4 right-4 w-3 h-3 bg-emerald-400 rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute bottom-6 left-4 w-2 h-2 bg-teal-400 rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute top-1/2 right-6 w-1.5 h-1.5 bg-cyan-400 rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Hover Overlay with Add Button */}
        <motion.div
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          className="absolute inset-0 bg-gradient-to-br from-emerald-500/80 to-teal-600/80 backdrop-blur-sm rounded-2xl flex items-center justify-center"
          transition={{ duration: 0.2 }}
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation();
              onAddClick();
            }}
            className="bg-white text-emerald-700 px-8 py-4 rounded-xl font-bold shadow-xl flex items-center gap-3 hover:bg-emerald-50 transition-colors duration-200 border-2 border-emerald-200"
          >
            <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add New Schedule
          </motion.button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default AddScheduleCard;
