import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import API_URL from '../apiConfig';

// CSS for hiding scrollbar
const modalStyles = `
  .modal-no-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .modal-no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`;

// Inject styles into head
if (typeof document !== 'undefined') {
  const styleElement = document.getElementById('schedule-modal-scrollbar-styles');
  if (!styleElement) {
    const style = document.createElement('style');
    style.id = 'schedule-modal-scrollbar-styles';
    style.textContent = modalStyles;
    document.head.appendChild(style);
  }
}

// Schedule icon SVG
const ScheduleIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 2V5M16 2V5M3.5 9.09H20.5M21 8.5V17C21 20 19.5 22 16 22H8C4.5 22 3 20 3 17V8.5C3 5.5 4.5 3.5 8 3.5H16C19.5 3.5 21 5.5 21 8.5Z" stroke="white" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M15.6947 13.7002H15.7037M15.6947 16.7002H15.7037M11.9955 13.7002H12.0045M11.9955 16.7002H12.0045M8.29431 13.7002H8.30329M8.29431 16.7002H8.30329" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30
    }
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: { duration: 0.2 }
  }
};

const TeacherScheduleManager = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [scheduleClicked, setScheduleClicked] = useState(false);
  
  const [formData, setFormData] = useState({
    day_of_week: '',
    start_time: '',
    end_time: '',
    venue: '',
    is_available: true
  });

  const dayNames = {
    0: 'Monday',
    1: 'Tuesday',
    2: 'Wednesday',
    3: 'Thursday',
    4: 'Friday',
    5: 'Saturday',
    6: 'Sunday'
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const getTeacherId = () => {
    // For faculty, get their teacher ID (which is their id_number)
    const teacherID = localStorage.getItem('teacherID');
    const teacherId = localStorage.getItem('teacherId');
    const studentID = localStorage.getItem('studentID'); // Fallback for existing data
    
    console.log('Debug - Teacher ID values:', { teacherID, teacherId, studentID });
    
    return teacherID || teacherId || studentID;
  };

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const teacherId = getTeacherId();
      
      if (!teacherId) {
        setError('Teacher ID not found. Please login again.');
        return;
      }

      const response = await fetch(`${API_URL}/teacher_schedule/my_schedules?teacher_id=${teacherId}`);
      
      if (response.ok) {
        const data = await response.json();
        setSchedules(data.schedules);
        setError('');
      } else {
        setError('Failed to fetch your schedules');
      }
    } catch (error) {
      console.error('Error fetching schedules:', error);
      setError('Failed to fetch schedules');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const teacherId = getTeacherId();
    if (!teacherId) {
      setError('Teacher ID not found. Please login again.');
      return;
    }

    // Validate form data
    if (!formData.day_of_week || !formData.start_time || !formData.end_time) {
      setError('Please fill in all required fields');
      return;
    }

    // Validate time range
    if (formData.start_time >= formData.end_time) {
      setError('Start time must be before end time');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/teacher_schedule/create_update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teacher_id: teacherId,
          ...formData,
          day_of_week: parseInt(formData.day_of_week)
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess(data.message);
        setShowModal(false);
        setEditingSchedule(null);
        resetForm();
        fetchSchedules(); // Refresh the list
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to save schedule');
        setTimeout(() => setError(''), 3000);
      }
    } catch (error) {
      console.error('Error saving schedule:', error);
      setError('Failed to save schedule');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleEdit = (schedule) => {
    setEditingSchedule(schedule);
    setFormData({
      day_of_week: schedule.day_of_week.toString(),
      start_time: schedule.start_time,
      end_time: schedule.end_time,
      venue: schedule.venue || '',
      is_available: schedule.is_available
    });
    setShowModal(true);
  };

  const handleDelete = async (scheduleId) => {
    if (!window.confirm('Are you sure you want to delete this schedule?')) {
      return;
    }

    const teacherId = getTeacherId();
    if (!teacherId) {
      setError('Teacher ID not found. Please login again.');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/teacher_schedule/delete/${scheduleId}?teacher_id=${teacherId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSuccess('Schedule deleted successfully');
        fetchSchedules(); // Refresh the list
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to delete schedule');
        setTimeout(() => setError(''), 3000);
      }
    } catch (error) {
      console.error('Error deleting schedule:', error);
      setError('Failed to delete schedule');
      setTimeout(() => setError(''), 3000);
    }
  };

  const resetForm = () => {
    setFormData({
      day_of_week: '',
      start_time: '',
      end_time: '',
      venue: '',
      is_available: true
    });
  };

  const handleCancel = () => {
    setShowModal(false);
    setEditingSchedule(null);
    resetForm();
    setError('');
    setSuccess('');
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 p-2 sm:p-4 lg:p-6">
        <div className="w-full max-w-none">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-4">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0065A8]">My Consultation Schedule</h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">Manage your weekly consultation hours</p>
            </div>
            
            {/* Floating Add Button */}
            <button
              onClick={() => {
                setScheduleClicked(true);
                setTimeout(() => setScheduleClicked(false), 200);
                setShowModal(true);
              }}
              className={`bg-[#0065A8] hover:bg-[#1976d2] text-white p-3 sm:p-4 rounded-lg shadow-lg transform hover:scale-110 
                        transition-all duration-300 ease-in-out flex items-center gap-2 sm:gap-3 shrink-0
                        ${scheduleClicked ? "scale-90" : "scale-100"}`}
              title="Add New Schedule"
            >
              <span className="font-medium text-sm lg:text-base">Add Schedule</span>
            </button>
          </div>

          {/* Success/Error Messages */}
          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 sm:mb-6 bg-green-100 border border-green-400 text-green-700 px-4 sm:px-6 py-3 sm:py-4 rounded-lg shadow-md"
              >
                <div className="flex items-center">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm sm:text-base">{success}</span>
                </div>
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 sm:mb-6 bg-red-100 border border-red-400 text-red-700 px-4 sm:px-6 py-3 sm:py-4 rounded-lg shadow-md"
              >
                <div className="flex items-center">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm sm:text-base">{error}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Current Schedules */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-[#0065A8] px-4 sm:px-6 py-3 sm:py-4">
              <h2 className="text-lg sm:text-xl font-semibold text-white">Weekly Consultation Schedule</h2>
              <p className="text-blue-100 text-xs sm:text-sm mt-1">
                {schedules.length === 0 ? 'No schedules configured' : `${schedules.length} time slot${schedules.length !== 1 ? 's' : ''} configured`}
              </p>
            </div>
            
            {schedules.length === 0 ? (
              <div className="p-6 sm:p-12 text-center">
                <div className="mb-4 flex justify-center">
                  <ScheduleIcon />
                </div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">No consultation schedules yet</h3>
                <p className="text-gray-500 mb-6 text-sm sm:text-base">Set up your weekly consultation hours to let students know when you're available.</p>
                <button
                  onClick={() => setShowModal(true)}
                  className="bg-[#0065A8] hover:bg-[#1976d2] text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition duration-200 text-sm sm:text-base"
                >
                  Create Your First Schedule
                </button>
              </div>
            ) : (
              <div className="p-3 sm:p-4 lg:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
                  {schedules
                    .sort((a, b) => a.day_of_week - b.day_of_week)
                    .map((schedule) => (
                  <motion.div
                    key={schedule.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.02 }}
                    className="bg-white border-2 border-gray-200 rounded-xl p-3 sm:p-4 lg:p-5 hover:border-[#0065A8] hover:shadow-lg transition-all duration-200"
                  >
                    <div className="flex justify-between items-start mb-3 sm:mb-4">
                      <h3 className="font-bold text-base sm:text-lg text-[#0065A8]">
                        {dayNames[schedule.day_of_week]}
                      </h3>
                      <span
                        className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${
                          schedule.is_available
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {schedule.is_available ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                    
                    <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-5">
                      <div className="flex items-center text-gray-600">
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-xs sm:text-sm">
                          {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                        </span>
                      </div>
                      {schedule.venue && (
                        <div className="flex items-center text-gray-600">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="text-xs sm:text-sm truncate">{schedule.venue}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(schedule)}
                        className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition duration-200 flex items-center justify-center gap-1"
                      >
                        <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <span className="hidden sm:inline">Edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(schedule.id)}
                        className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition duration-200 flex items-center justify-center gap-1"
                      >
                        <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        <span className="hidden sm:inline">Delete</span>
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed bg-black/60 backdrop-blur-md flex items-center justify-center z-[9999] p-2 sm:p-4" style={{ 
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            margin: 0,
            padding: '0.5rem'
          }}>
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[95vh] sm:max-h-[90vh] overflow-y-auto modal-no-scrollbar"
              onClick={(e) => e.stopPropagation()}
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            >
              {/* Modal Header */}
              <div className="bg-[#0065A8] px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center sticky top-0 z-10">
                <h2 className="text-base sm:text-lg font-semibold text-white">
                  {editingSchedule ? "Edit Schedule" : "Add New Schedule"}
                </h2>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                {/* Message Display */}
                {error && (
                  <div className="p-3 rounded-lg text-xs sm:text-sm bg-red-100 text-red-700">
                    {error}
                  </div>
                )}

                {/* Day of Week */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                    Day of Week *
                  </label>
                  <select
                    value={formData.day_of_week}
                    onChange={(e) => setFormData({ ...formData, day_of_week: e.target.value })}
                    className="w-full border-2 border-[#0065A8] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1976d2] focus:border-transparent text-sm sm:text-base"
                    required
                  >
                    <option value="">Select Day</option>
                    {Object.entries(dayNames).map(([value, name]) => (
                      <option key={value} value={value}>{name}</option>
                    ))}
                  </select>
                </div>

                {/* Time Row */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                      Start Time *
                    </label>
                    <input
                      type="time"
                      value={formData.start_time}
                      onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                      className="w-full border-2 border-[#0065A8] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1976d2] focus:border-transparent text-sm sm:text-base"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                      End Time *
                    </label>
                    <input
                      type="time"
                      value={formData.end_time}
                      onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                      className="w-full border-2 border-[#0065A8] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1976d2] focus:border-transparent text-sm sm:text-base"
                      required
                    />
                  </div>
                </div>

                {/* Venue */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                    Venue
                  </label>
                  <input
                    type="text"
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    className="w-full border-2 border-[#0065A8] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1976d2] focus:border-transparent text-sm sm:text-base"
                    placeholder="e.g., Room 101, Faculty Office"
                  />
                </div>

                {/* Availability Checkbox */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_available"
                    checked={formData.is_available}
                    onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                    className="w-4 h-4 text-[#0065A8] border-gray-300 rounded focus:ring-[#1976d2]"
                  />
                  <label htmlFor="is_available" className="ml-2 text-xs sm:text-sm text-gray-700">
                    Available for consultation
                  </label>
                </div>
              </form>

              {/* Modal Footer */}
              <div className="flex">
                <button
                  type="submit"
                  onClick={handleSubmit}
                  className="flex-1 py-3 sm:py-4 bg-[#0065A8] hover:bg-[#1976d2] text-white text-center justify-center rounded-bl-xl transition-colors flex items-center gap-2 text-xs sm:text-sm font-medium"
                >
                  {editingSchedule ? 'Update Schedule' : 'Save Schedule'}
                </button>
                <button
                  onClick={handleCancel}
                  className="flex-1 py-3 sm:py-4 text-gray-700 bg-gray-100 rounded-br-xl hover:bg-gray-200 transition-colors text-xs sm:text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default TeacherScheduleManager;
