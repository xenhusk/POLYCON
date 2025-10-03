import React, { useState } from 'react';
import { motion } from 'framer-motion';

const ScheduleCard = ({ 
  schedule, 
  dayNames, 
  dayColors, 
  formatTime, 
  isFlipped, 
  onFlip, 
  onEdit, 
  onDelete,
  formData,
  setFormData,
  onFormSubmit
}) => {
  const [localFormData, setLocalFormData] = useState({
    day_of_week: schedule.day_of_week.toString(),
    start_time: schedule.start_time,
    end_time: schedule.end_time,
    venue: schedule.venue || '',
    is_available: schedule.is_available
  });

  // Helper to get the text class, defaulting to a solid color if accent is missing or null
  const getDayTextClass = (dayOfWeek) => {
    const accent = dayColors[dayOfWeek]?.accent;
    // We check for the accent color and replace 'bg-' with 'text-' for Tailwind class
    return accent ? accent.replace('bg-', 'text-') + '-700' : 'text-gray-800';
  };
  
  // Helper to get a generic gray text class for less prominent text
  const getLightTextClass = (dayOfWeek) => {
    const accent = dayColors[dayOfWeek]?.accent;
    // Use a slightly lighter shade of the accent color, or a standard gray
    return accent ? accent.replace('bg-', 'text-') + '-600' : 'text-gray-600';
  };

  const dayTextClass = getDayTextClass(schedule.day_of_week);
  const lightTextClass = getLightTextClass(schedule.day_of_week);
  const accentColorBase = dayColors[schedule.day_of_week]?.accent?.replace('bg-', '') || 'blue';


  const handleFormSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onFormSubmit(e, localFormData);
  };

  const closeCard = () => {
    onFlip(schedule.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="group relative perspective-1000 card-container"
    >
      {/* Card Container with Flip Effect */}
      <div 
        className={`card-flip w-full h-80 ${isFlipped ? 'flipped' : ''}`}
        onClick={() => {
          if (!isFlipped) {
            onFlip(schedule.id);
          }
        }}
      >
        {/* Front of Card */}
        <div className="card-front absolute inset-0 w-full h-full">
          <motion.div
            whileHover={{ 
              y: -8, 
              scale: 1.02,
              transition: { duration: 0.3 }
            }}
            className={`relative w-full h-full bg-gradient-to-br ${dayColors[schedule.day_of_week]?.card || 'from-gray-50 to-gray-100'} border ${dayColors[schedule.day_of_week]?.border || 'border-gray-200'} rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden`}
          >
            {/* Status indicator */}
            <div className={`h-1 w-full rounded-t-2xl mb-4 ${
              schedule.is_available 
                ? `bg-gradient-to-r ${dayColors[schedule.day_of_week]?.accent?.replace('bg-', 'from-')}-600 to-${dayColors[schedule.day_of_week]?.accent?.replace('bg-', '')}-700` 
                : 'bg-gradient-to-r from-red-500 to-red-700'
            }`} />
            
            {/* Day header */}
            <div className="flex justify-between items-start mb-4">
              <h3 className={`font-bold text-xl ${dayTextClass}`}>
                {dayNames[schedule.day_of_week]}
              </h3>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                schedule.is_available
                  ? `${dayColors[schedule.day_of_week]?.accent?.replace('bg-', 'bg-')}-100 ${dayColors[schedule.day_of_week]?.accent?.replace('bg-', 'text-')}-800`
                  : 'bg-red-100 text-red-800'
              }`}>
                {schedule.is_available ? 'Available' : 'Unavailable'}
              </span>
            </div>
            
            {/* Time section */}
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/50 mb-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 ${dayColors[schedule.day_of_week]?.accent || 'bg-gray-500'} rounded-full flex items-center justify-center shadow-md`}>
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h5 className={`font-semibold text-sm ${lightTextClass}`}>Time</h5>
                  <p className={`${dayTextClass} font-bold`}>
                    {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Venue section */}
            {schedule.venue && (
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/50 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 ${dayColors[schedule.day_of_week]?.accent || 'bg-gray-500'} rounded-full flex items-center justify-center shadow-md`}>
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h5 className={`font-semibold text-sm ${lightTextClass}`}>Venue</h5>
                    <p className={`${dayTextClass} font-bold`}>{schedule.venue}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Hover Overlay with Edit Button */}
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
                  onFlip(schedule.id);
                }}
                className={`bg-white ${dayTextClass} px-6 py-3 rounded-xl font-semibold shadow-lg flex items-center gap-2 hover:bg-gray-50 transition-colors duration-200`}
              >
                <svg className={`w-5 h-5 ${dayTextClass}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Schedule
              </motion.button>
            </motion.div>
          </motion.div>
        </div>

        {/* Back of Card (Edit Form) */}
        <div className="card-back absolute inset-0 w-full h-full">
          <div className={`relative w-full h-full bg-gradient-to-br ${dayColors[schedule.day_of_week]?.form || 'from-gray-100 to-gray-150'} border ${dayColors[schedule.day_of_week]?.formBorder || 'border-gray-300'} rounded-2xl p-4 shadow-2xl`}>
            <form onSubmit={handleFormSubmit} className="h-full flex flex-col" onClick={(e) => e.stopPropagation()}>
              {/* Header */}
              <div className="flex justify-between items-center mb-4">
                <h3 className={`font-bold text-lg ${dayTextClass}`}>Edit Schedule</h3>
                <button 
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    closeCard();
                  }}
                  className={`${dayColors[schedule.day_of_week]?.accent?.replace('bg-', 'text-')}-500 hover:${dayColors[schedule.day_of_week]?.accent?.replace('bg-', 'text-')}-700 transition-colors p-1`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Form Fields - Compact Layout */}
              <div className="flex-1 space-y-3">
                {/* Day and Time Row */}
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className={`block text-xs font-semibold mb-1 ${lightTextClass}`}>Day</label>
                    <select
                      value={localFormData.day_of_week}
                      onChange={(e) => setLocalFormData({...localFormData, day_of_week: e.target.value})}
                      className={`w-full px-2 py-2 text-sm bg-white border ${dayColors[schedule.day_of_week]?.formBorder || 'border-gray-300'} rounded-md focus:ring-1 focus:ring-${accentColorBase}-500 focus:border-transparent transition-all duration-200`}
                    >
                      <option value="">Day</option>
                      {Object.entries(dayNames).map(([value, name]) => (
                        <option key={value} value={value}>{name.slice(0, 3)}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-xs font-semibold mb-1 ${lightTextClass}`}>Start</label>
                    <input
                      type="time"
                      value={localFormData.start_time}
                      onChange={(e) => setLocalFormData({...localFormData, start_time: e.target.value})}
                      className={`w-full px-2 py-2 text-sm bg-white border ${dayColors[schedule.day_of_week]?.formBorder || 'border-gray-300'} rounded-md focus:ring-1 focus:ring-${accentColorBase}-500 focus:border-transparent transition-all duration-200`}
                    />
                  </div>
                  <div>
                    <label className={`block text-xs font-semibold mb-1 ${lightTextClass}`}>End</label>
                    <input
                      type="time"
                      value={localFormData.end_time}
                      onChange={(e) => setLocalFormData({...localFormData, end_time: e.target.value})}
                      className={`w-full px-2 py-2 text-sm bg-white border ${dayColors[schedule.day_of_week]?.formBorder || 'border-gray-300'} rounded-md focus:ring-1 focus:ring-${accentColorBase}-500 focus:border-transparent transition-all duration-200`}
                    />
                  </div>
                </div>

                {/* Venue */}
                <div>
                  <label className={`block text-xs font-semibold mb-1 ${lightTextClass}`}>Venue</label>
                  <input
                    type="text"
                    value={localFormData.venue}
                    onChange={(e) => setLocalFormData({...localFormData, venue: e.target.value})}
                    placeholder="Office, Lab, etc."
                    className={`w-full px-3 py-2 text-sm bg-white border ${dayColors[schedule.day_of_week]?.formBorder || 'border-gray-300'} rounded-md focus:ring-1 focus:ring-${accentColorBase}-500 focus:border-transparent transition-all duration-200`}
                  />
                </div>

                {/* Availability Toggle */}
                <div className="flex items-center justify-between bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-white/50">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${localFormData.is_available ? dayColors[schedule.day_of_week]?.accent || 'bg-green-500' : 'bg-gray-400'}`}></div>
                    <span className={`text-sm font-medium ${dayTextClass}`}>
                      {localFormData.is_available ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={localFormData.is_available}
                      onChange={(e) => setLocalFormData({...localFormData, is_available: e.target.checked})}
                      className="sr-only peer"
                    />
                    {/* The Tailwind JIT engine is sometimes tricky with dynamic classes inside after: and peer-checked:bg- 
                        For production, you might need to safelist these classes in your tailwind.config.js if you encounter issues.
                        We'll use a string literal for the dynamic parts which is better for Tailwind's JIT.
                    */}
                    <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-${accentColorBase}-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-${accentColorBase}-500`}></div>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 mt-4">
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex-1 ${dayColors[schedule.day_of_week]?.accent || 'bg-blue-500'} hover:${dayColors[schedule.day_of_week]?.accent?.replace('bg-', 'bg-')}-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 shadow-md`}
                >
                  Save
                </motion.button>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(schedule.id);
                    closeCard();
                  }}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 shadow-md"
                >
                  Delete
                </motion.button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ScheduleCard;