import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import API_URL from '../apiConfig';
import ScheduleCard from './ScheduleCard';

// CSS for hiding scrollbar and card effects
const modalStyles = `
  .modal-no-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .modal-no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .perspective-1000 {
    perspective: 1000px;
  }
  .card-flip {
    transform-style: preserve-3d;
    transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1), scale 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    transform-origin: center center;
  }
  .card-flip.flipped {
    transform: rotateY(180deg) scale(1.1);
    z-index: 10;
  }
  .card-front, .card-back {
    backface-visibility: hidden;
  }
  .card-back {
    transform: rotateY(180deg);
  }
  .card-container {
    transition: all 0.3s ease;
  }
  .card-container.flipped {
    z-index: 20;
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
  const [flippedCards, setFlippedCards] = useState(new Set());
  const [editingCardId, setEditingCardId] = useState(null);

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

  const dayColors = {
    0: { // Monday - Deep Blue
      card: 'from-blue-50 to-blue-100',
      border: 'border-blue-200',
      accent: 'bg-blue-500',
      form: 'from-blue-100 to-blue-150',
      formBorder: 'border-blue-300'
    },
    1: { // Tuesday - Teal
      card: 'from-teal-50 to-teal-100',
      border: 'border-teal-200',
      accent: 'bg-teal-500',
      form: 'from-teal-100 to-teal-150',
      formBorder: 'border-teal-300'
    },
    2: { // Wednesday - Indigo
      card: 'from-indigo-50 to-indigo-100',
      border: 'border-indigo-200',
      accent: 'bg-indigo-500',
      form: 'from-indigo-100 to-indigo-150',
      formBorder: 'border-indigo-300'
    },
    3: { // Thursday - Purple
      card: 'from-purple-50 to-purple-100',
      border: 'border-purple-200',
      accent: 'bg-purple-500',
      form: 'from-purple-100 to-purple-150',
      formBorder: 'border-purple-300'
    },
    4: { // Friday - Emerald
      card: 'from-emerald-50 to-emerald-100',
      border: 'border-emerald-200',
      accent: 'bg-emerald-500',
      form: 'from-emerald-100 to-emerald-150',
      formBorder: 'border-emerald-300'
    },
    5: { // Saturday - Orange
      card: 'from-orange-50 to-orange-100',
      border: 'border-orange-200',
      accent: 'bg-orange-500',
      form: 'from-orange-100 to-orange-150',
      formBorder: 'border-orange-300'
    },
    6: { // Sunday - Rose
      card: 'from-rose-50 to-rose-100',
      border: 'border-rose-200',
      accent: 'bg-rose-500',
      form: 'from-rose-100 to-rose-150',
      formBorder: 'border-rose-300'
    }
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

  const toggleCardFlip = (scheduleId) => {
    setFlippedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(scheduleId)) {
        // Close the current card
        newSet.delete(scheduleId);
        setEditingCardId(null);
      } else {
        // Close all other cards and open this one
        newSet.clear();
        newSet.add(scheduleId);
        setEditingCardId(scheduleId);
      }
      return newSet;
    });
  };


  const handleCardEdit = (schedule) => {
    setEditingSchedule(schedule);
    setFormData({
      day_of_week: schedule.day_of_week.toString(),
      start_time: schedule.start_time,
      end_time: schedule.end_time,
      venue: schedule.venue || '',
      is_available: schedule.is_available
    });
    setShowModal(true);
    // Close the flipped card
    setFlippedCards(new Set());
    setEditingCardId(null);
  };

  const handleCardFormSubmit = async (e, localFormData) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      setError('');
      setSuccess('');
      
      const schedule = schedules.find(s => s.id === editingCardId);
      if (!schedule) return;

      const response = await fetch(`${API_URL}/api/teacher-schedules/${schedule.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          day_of_week: parseInt(localFormData.day_of_week),
          start_time: localFormData.start_time,
          end_time: localFormData.end_time,
          venue: localFormData.venue,
          is_available: localFormData.is_available
        })
      });

      if (response.ok) {
        setSuccess('Schedule updated successfully!');
        await fetchSchedules();
        // Close the card after successful update
        setTimeout(() => {
          setFlippedCards(prev => {
            const newSet = new Set(prev);
            newSet.delete(editingCardId);
            return newSet;
          });
          setEditingCardId(null);
          setSuccess('');
        }, 1500);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to update schedule');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    }
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 font-poppins">
        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="relative py-20 overflow-hidden"
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

          <div className="relative z-10 max-w-7xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-center"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
                My Consultation Schedule
              </h1>
              <p className="text-xl md:text-2xl text-blue-200 mb-8">
                Manage your weekly consultation hours
              </p>
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setScheduleClicked(true);
                  setTimeout(() => setScheduleClicked(false), 200);
                  setShowModal(true);
                }}
                className="group relative w-80 h-48 bg-white/95 backdrop-blur-sm border border-white/20 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 cursor-pointer overflow-hidden mx-auto"
              >
                {/* Animated background pattern */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300">
                  <div className="absolute top-4 right-4 w-16 h-16 bg-[#057DCD] rounded-full blur-xl"></div>
                  <div className="absolute bottom-4 left-4 w-12 h-12 bg-[#046bb8] rounded-full blur-xl"></div>
                </div>

                {/* Content */}
                <div className="relative z-10 h-full flex flex-col items-center justify-center text-center p-6">
                  {/* Icon */}
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="w-16 h-16 bg-gradient-to-br from-[#057DCD] to-[#046bb8] rounded-2xl flex items-center justify-center shadow-lg mb-4 group-hover:shadow-xl transition-shadow duration-300"
                  >
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </motion.div>

                  {/* Text */}
                  <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-[#057DCD] transition-colors duration-300">
                    Add New Schedule
                  </h3>
                  <p className="text-gray-600 text-sm group-hover:text-gray-700 transition-colors duration-300">
                    Create a new consultation time slot
                  </p>
                </div>

                {/* Hover overlay */}
                <motion.div
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  className="absolute inset-0 bg-gradient-to-br from-[#057DCD]/10 to-[#046bb8]/10 rounded-2xl"
                  transition={{ duration: 0.2 }}
                />
              </motion.div>
            </motion.div>
          </div>
        </motion.section>

        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4"
          >
            <div className="flex-1">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Weekly Schedule</h2>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">Configure your availability for student consultations</p>
            </div>
          </motion.div>

          {/* Success/Error Messages */}
          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="mb-8 flex justify-center"
              >
                <div className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-100 max-w-2xl mx-auto">
                  <div className="flex items-center justify-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-200 to-green-300 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="text-center">
                      <h3 className="text-lg font-bold text-gray-800 mb-1">Success!</h3>
                      <p className="text-gray-600">{success}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="mb-8 flex justify-center"
              >
                <div className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-100 max-w-2xl mx-auto">
                  <div className="flex items-center justify-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-200 to-red-300 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <div className="text-center">
                      <h3 className="text-lg font-bold text-gray-800 mb-1">Error</h3>
                      <p className="text-gray-600">{error}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Current Schedules */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100"
          >
            <div className="bg-gradient-to-r from-[#057DCD] to-[#046bb8] text-white p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Weekly Consultation Schedule</h2>
                  <p className="text-blue-100">
                    {schedules.length === 0 ? 'No schedules configured' : `${schedules.length} time slot${schedules.length !== 1 ? 's' : ''} configured`}
                  </p>
                </div>
              </div>
            </div>
            
            {schedules.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="text-center py-16"
              >
                <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-2xl mx-auto border border-gray-100">
                  <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center">
                    <svg className="w-12 h-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">No Consultation Schedules Yet</h3>
                  <p className="text-lg text-gray-600 mb-8">Set up your weekly consultation hours to let students know when you're available for meetings.</p>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowModal(true)}
                    className="bg-gradient-to-r from-[#057DCD] to-[#046bb8] hover:from-[#046bb8] hover:to-[#034a94] text-white py-3 px-8 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 shadow-lg mx-auto"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Create Your First Schedule
                  </motion.button>
                </div>
              </motion.div>
            ) : (
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {schedules
                    .sort((a, b) => a.day_of_week - b.day_of_week)
                    .map((schedule, index) => (
                      <ScheduleCard
                        key={schedule.id}
                        schedule={schedule}
                        dayNames={dayNames}
                        dayColors={dayColors}
                        formatTime={formatTime}
                        isFlipped={flippedCards.has(schedule.id)}
                        onFlip={toggleCardFlip}
                        onEdit={handleCardEdit}
                        onDelete={handleDelete}
                        formData={formData}
                        setFormData={setFormData}
                        onFormSubmit={handleCardFormSubmit}
                      />
                    ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed bg-black/60 backdrop-blur-md flex items-center justify-center z-[9999] p-4" style={{ 
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            margin: 0,
            padding: '1rem'
          }}>
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="relative w-full max-w-lg max-h-[95vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            >
              {/* Card Container */}
              <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
                {/* Card Header */}
                <div className="bg-gradient-to-r from-[#057DCD] via-[#046bb8] to-[#034a94] text-white p-6 relative overflow-hidden">
                  {/* Background decoration */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-12 translate-x-12"></div>
                  <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full translate-y-8 -translate-x-8"></div>
                  
                  <div className="relative z-10 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold">
                          {editingSchedule ? 'Edit Schedule' : 'Add New Schedule'}
                        </h2>
                        <p className="text-blue-100 text-sm">
                          {editingSchedule ? 'Update your consultation time' : 'Create a new consultation slot'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleCancel}
                      className="text-white hover:text-gray-200 transition-colors p-2 hover:bg-white/10 rounded-lg"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Card Body */}
                <div className="overflow-y-auto modal-no-scrollbar" style={{ maxHeight: 'calc(95vh - 200px)' }}>
                  <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Message Display */}
                {error && (
                  <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-3">
                    <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <span className="text-sm font-medium">{error}</span>
                  </div>
                )}

                {/* Day of Week */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                  <label className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <div className="w-6 h-6 bg-[#057DCD] rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    Day of Week *
                  </label>
                  <select
                    value={formData.day_of_week}
                    onChange={(e) => setFormData({ ...formData, day_of_week: e.target.value })}
                    className="w-full bg-white border-2 border-blue-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#057DCD] focus:border-[#057DCD] text-base shadow-sm"
                    required
                  >
                    <option value="">Select Day</option>
                    {Object.entries(dayNames).map(([value, name]) => (
                      <option key={value} value={value}>{name}</option>
                    ))}
                  </select>
                </div>

                {/* Time Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                    <label className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <div className="w-6 h-6 bg-[#057DCD] rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      Start Time *
                    </label>
                    <input
                      type="time"
                      value={formData.start_time}
                      onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                      className="w-full bg-white border-2 border-blue-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#057DCD] focus:border-[#057DCD] text-base shadow-sm"
                      required
                    />
                  </div>
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                    <label className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <div className="w-6 h-6 bg-[#057DCD] rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      End Time *
                    </label>
                    <input
                      type="time"
                      value={formData.end_time}
                      onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                      className="w-full bg-white border-2 border-blue-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#057DCD] focus:border-[#057DCD] text-base shadow-sm"
                      required
                    />
                  </div>
                </div>

                {/* Venue */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                  <label className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <div className="w-6 h-6 bg-[#057DCD] rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    Venue
                  </label>
                  <input
                    type="text"
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    className="w-full bg-white border-2 border-blue-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#057DCD] focus:border-[#057DCD] text-base shadow-sm"
                    placeholder="e.g., Room 101, Faculty Office"
                  />
                </div>

                {/* Availability Toggle */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${formData.is_available ? 'bg-[#057DCD]' : 'bg-gray-400'}`}></div>
                      <span className="text-sm font-semibold text-gray-700">
                        {formData.is_available ? 'Available for consultation' : 'Not available for consultation'}
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.is_available}
                        onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#057DCD]"></div>
                    </label>
                  </div>
                </div>
                  </form>
                </div>

                {/* Card Footer */}
                <div className="flex border-t border-gray-200 bg-gray-50/50">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    onClick={handleSubmit}
                    className="flex-1 py-4 bg-gradient-to-r from-[#057DCD] to-[#046bb8] hover:from-[#046bb8] hover:to-[#034a94] text-white text-center justify-center rounded-bl-3xl transition-all duration-200 flex items-center gap-2 text-sm font-semibold shadow-lg"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {editingSchedule ? 'Update Schedule' : 'Save Schedule'}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCancel}
                    className="flex-1 py-4 text-gray-700 bg-gray-100 rounded-br-3xl hover:bg-gray-200 transition-all duration-200 text-sm font-semibold"
                  >
                    Cancel
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default TeacherScheduleManager;