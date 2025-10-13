import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getProfilePictureUrl } from '../utils/utils';
import { formatUTCToLocal, debugTimezone } from '../utils/timezoneUtils';
import API_URL from '../apiConfig';

function AppointmentItem({ appointment, role, onStartSession, onCancel, onConfirm, confirmInputs = {}, handleConfirmClick, setConfirmInputs }) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', content: '' });
  const [actionType, setActionType] = useState(''); // 'cancel', 'confirm', or 'start'
  const [StartClicked, setStartClicked] = useState(false);
  const [ConfirmClicked, setConfirmClicked] = useState(false);
  const [ConfirmedClicked, setConfirmedClicked] = useState(false);
  const [CancelClicked, setCancelClicked] = useState(false);
  const [CanceledClicked, setCanceledClicked] = useState(false);
  const [CancelingClicked, setCancelingClicked] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false); // New state for cancel confirmation
  const [venues, setVenues] = useState([]);
  const [loadingVenues, setLoadingVenues] = useState(false);
  const [activePeriod, setActivePeriod] = useState(null);

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && showCancelConfirm) {
        setShowCancelConfirm(false);
      }
    };

    if (showCancelConfirm) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [showCancelConfirm]);

  // Fetch venues for teacher's department
  const fetchVenues = async () => {
    if (!appointment.teacher?.department_id && !appointment.teacher?.department) return;
    
    setLoadingVenues(true);
    try {
      // Get department ID from teacher info
      let departmentId = appointment.teacher?.department_id;
      if (!departmentId && appointment.teacher?.department) {
        // If department is a string, we might need to extract ID or fetch departments
        // For now, we'll fetch all venues and filter by department name
        const response = await fetch(`${API_URL}/venues/get_venues`);
        const allVenues = await response.json();
        const filteredVenues = allVenues.filter(venue => 
          venue.department_name === appointment.teacher.department
        );
        setVenues(filteredVenues);
        return;
      }
      
      if (departmentId) {
        const response = await fetch(`${API_URL}/venues/get_venues_by_department/${departmentId}`);
        const venuesData = await response.json();
        setVenues(venuesData);
      }
    } catch (error) {
      console.error('Error fetching venues:', error);
    } finally {
      setLoadingVenues(false);
    }
  };

  // Fetch venues when component mounts or when teacher info changes
  useEffect(() => {
    if (appointment.teacher) {
      fetchVenues();
    }
  }, [appointment.teacher]);

  // Fetch active period
  const fetchActivePeriod = async () => {
    try {
      const response = await fetch(`${API_URL}/periods/get_active_period`);
      if (response.ok) {
        const periodData = await response.json();
        setActivePeriod(periodData);
      }
    } catch (error) {
      console.error('Error fetching active period:', error);
    }
  };

  // Fetch active period on component mount
  useEffect(() => {
    fetchActivePeriod();
  }, []);

  // Extract teacher info from appointment data
  // Handle potential flat or nested structure for teacher information
  const teacherNameFromProp = appointment.teacher?.teacherName || appointment.teacherName;
  const profilePictureFromProp = appointment.teacher?.profile_picture || appointment.teacherProfile;
  const departmentFromProp = appointment.teacher?.department || appointment.department;

  const teacherInfo = {
    profile_picture: profilePictureFromProp,
    teacherName: teacherNameFromProp,
    department: departmentFromProp
  };
  
  const formatDateTime = (dateTime) => {
    console.log('🕐 AppointmentItem formatDateTime called with:', dateTime);
    
    // Use our timezone-aware formatter
    const result = formatUTCToLocal(dateTime);
    console.log('🕐 AppointmentItem formatDateTime result:', result);
    return result;
  };

  // Ensure the appointment object contains booking_id (if not, map id accordingly)
  const bookingID = appointment.booking_id || appointment.id; 

  // In your Start Session button click handler:
  const handleStart = () => {
    // If onStartSession prop is provided, prefer delegating to it.
    // This is generally a better pattern for separation of concerns.
    if (onStartSession) {
      onStartSession(appointment);
      return;
    }

    // Fallback: If onStartSession is not provided, AppointmentItem will construct the URL.
    // This section assumes AppointmentItem is responsible for URL generation.
    console.warn("AppointmentItem is generating session URL directly. Consider using onStartSession prop for better separation.");

    const teacherIDFromStorage = localStorage.getItem("teacherID"); // Assuming teacherID is stored

    if (!appointment || !Array.isArray(appointment.info)) {
      console.error("Student info is missing or not an array in appointment object:", appointment);
      alert("Cannot start session: student information is missing.");
      return;
    }

    const studentIdNumbers = appointment.info.map(student => {
      if (!student.idNumber) {
        console.warn("Student object in appointment.info is missing idNumber:", student);
        // Fallback to id if idNumber is missing, though this is not ideal
        return student.id || null; 
      }
      return student.idNumber;
    }).filter(idNum => idNum !== null);

    if (studentIdNumbers.length === 0 && appointment.info.length > 0) {
      console.error("No valid student IDNumbers (or fallback IDs) found to start session.");
      alert("Cannot start session: no valid student identifiers found.");
      return;
    }
    
    const studentIDsParam = studentIdNumbers.join(',');

    // Prepare teacherInfo for the URL
    const teacherDetailsForSession = {
      name: teacherNameFromProp, // Already extracted at the top of the component
      profile_picture: profilePictureFromProp, // Already extracted
      department: departmentFromProp, // Already extracted
      // role: appointment.teacher?.role || null, // If role is available
    };
    const teacherInfoParam = encodeURIComponent(JSON.stringify(teacherDetailsForSession));

    // Student info for the URL - appointment.info should contain idNumber if prepared correctly by parent
    const studentInfoParam = encodeURIComponent(JSON.stringify(appointment.info)); 

    const venueParam = appointment.venue ? encodeURIComponent(appointment.venue) : "";
    const bookingIdParam = bookingID; // Already determined

    const sessionUrl = `/session?teacherID=${teacherIDFromStorage}&studentIDs=${studentIDsParam}&teacherInfo=${teacherInfoParam}&studentInfo=${studentInfoParam}&venue=${venueParam}&booking_id=${bookingIdParam}`;
    
    setStartClicked(true); // Assuming this state is for UI feedback
    window.open(sessionUrl, "_blank");
    // setTimeout(() => setStartClicked(false), 2000); // Reset UI state if needed
  };

  const handleCancel = async (id) => {
    setIsLoading(true);
    setActionType('cancel');
    try {
      await onCancel(id);
      setMessage({ type: 'success', content: 'Appointment cancelled successfully' });
      setTimeout(() => setMessage({ type: '', content: '' }), 3000);
      setShowCancelConfirm(false); // Hide confirmation after action
    } catch (error) {
      setMessage({ type: 'error', content: error.message || 'Failed to cancel appointment' });
    } finally {
      setIsLoading(false);
      setActionType('');
    }
  };

  const handleConfirmation = async (id, schedule, venue_id) => {
    setIsLoading(true);
    setActionType('confirm');
    try {
      await onConfirm(id, schedule, venue_id);
      setMessage({ type: 'success', content: 'Appointment confirmed successfully' });
      setTimeout(() => setMessage({ type: '', content: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', content: error.message || 'Failed to confirm appointment' });
    } finally {
      setIsLoading(false);
      setActionType('');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 hover:shadow-3xl transition-all duration-300 mx-2 sm:mx-0 mb-4 sm:mb-6"
    >
      {/* Status indicator */}
      <div className={`h-1 w-full ${appointment.status === 'confirmed' ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' : 'bg-gradient-to-r from-amber-500 to-orange-500'}`} />
      <div className="p-4 sm:p-6">
        {/* Teacher Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-3 sm:gap-0">
          <div className="flex items-center gap-3 sm:gap-4">
            <motion.img
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.2 }}
              src={getProfilePictureUrl(teacherInfo.profile_picture, teacherInfo.teacherName)}
              alt="Teacher"
              className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 sm:border-4 border-white shadow-lg object-cover"
            />
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-800">{teacherInfo.teacherName}</h3>
              {teacherInfo.department && (
                <p className="text-gray-600 text-xs sm:text-sm">{teacherInfo.department}</p>
              )}
            </div>
          </div>
          {appointment.status && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={`px-3 sm:px-4 py-1 sm:py-2 rounded-full font-semibold text-xs sm:text-sm shadow-lg self-start sm:self-auto ${
                appointment.status === 'confirmed' 
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white' 
                  : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
              }`}
            >
              {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
            </motion.span>
          )}
        </div>

        {/* Students Section */}
        <div className="mb-3 sm:mb-4 md:mb-6">
          <h4 className="text-sm sm:text-base md:text-lg font-semibold text-gray-800 mb-2 sm:mb-3 md:mb-4 flex items-center gap-1 sm:gap-2">
            <svg className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-[#057DCD]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            </svg>
            Student{appointment.info && appointment.info.length > 1 ? 's' : ''}
          </h4>
          <div className="flex flex-wrap gap-1.5 sm:gap-2 md:gap-3">
            {appointment.info && Array.isArray(appointment.info) && appointment.info.length > 0 ? (
              appointment.info.map((student, index) => {
                const studentAvatarUrl = getProfilePictureUrl(student.profile_picture, `${student.firstName} ${student.lastName}`);
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center bg-gradient-to-r from-blue-50 to-indigo-50 rounded-full px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 border border-blue-200 shadow-sm"
                  >
                    <img
                      src={studentAvatarUrl}
                      alt="Student"
                      className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 rounded-full border-2 border-white mr-1.5 sm:mr-2 md:mr-3 shadow-sm"
                    />
                    <span className="text-gray-800 font-medium text-xs sm:text-sm leading-tight">
                      {student.firstName} {student.lastName}
                    </span>
                  </motion.div>
                );
              })
            ) : (
              <div className="flex items-center bg-gradient-to-r from-gray-50 to-gray-100 rounded-full px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 border border-gray-200">
                <span className="text-gray-600 text-xs sm:text-sm leading-tight">
                  {Array.isArray(appointment.studentNames) ? appointment.studentNames.join(", ") : appointment.studentNames}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Details Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4 md:mb-6">
          {appointment.created_at && (
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg sm:rounded-xl p-2.5 sm:p-3 md:p-4 border border-gray-200">
              <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 mb-1.5 sm:mb-2">
                <div className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 bg-[#057DCD] rounded-full flex items-center justify-center">
                  <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h5 className="font-semibold text-gray-800 text-xs sm:text-sm md:text-base">Created</h5>
              </div>
              <p className="text-gray-600 text-xs sm:text-sm leading-tight">{formatDateTime(appointment.created_at)}</p>
            </div>
          )}
          {appointment.schedule && (
            <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-lg sm:rounded-xl p-2.5 sm:p-3 md:p-4 border border-emerald-200">
              <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 mb-1.5 sm:mb-2">
                <div className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                  <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h5 className="font-semibold text-gray-800 text-xs sm:text-sm md:text-base">Schedule</h5>
              </div>
              <p className="text-gray-600 text-xs sm:text-sm leading-tight">{formatDateTime(appointment.schedule)}</p>
            </div>
          )}
        </div>
        {appointment.venue && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-100 rounded-lg sm:rounded-xl p-2.5 sm:p-3 md:p-4 border border-blue-200 mb-3 sm:mb-4 md:mb-6">
            <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 mb-1.5 sm:mb-2">
              <div className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 bg-[#057DCD] rounded-full flex items-center justify-center">
                <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h5 className="font-semibold text-gray-800 text-xs sm:text-sm md:text-base">Venue</h5>
            </div>
            <p className="text-gray-600 text-xs sm:text-sm leading-tight">{appointment.venue}</p>
          </div>
        )}

        {/* Message display */}
        <AnimatePresence>
          {message.content && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`mb-3 sm:mb-4 p-2.5 sm:p-3 md:p-4 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium shadow-lg ${
                message.type === 'success' 
                  ? 'bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-800 border border-emerald-200' 
                  : 'bg-gradient-to-r from-red-50 to-red-100 text-red-800 border border-red-200'
              }`}
            >
              <div className="flex items-center gap-2">
                {message.type === 'success' ? (
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                )}
                {message.content}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        {role === 'faculty' && (
          <div className="border-t border-gray-200 pt-3 sm:pt-4 md:pt-6">
            {!confirmInputs || !confirmInputs[appointment.id] ? (
              <>
                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    {typeof onStartSession === 'function' ? (
                      <>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            setStartClicked(true);
                            setTimeout(() => setStartClicked(false), 300);
                            handleStart();
                          }}
                          disabled={isLoading}
                          className={`flex-1 bg-gradient-to-r from-[#057DCD] to-[#046bb8] hover:from-[#046bb8] hover:to-[#034a94] text-white py-2.5 sm:py-3 md:py-4 px-3 sm:px-4 md:px-6 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 sm:gap-2 shadow-lg text-xs sm:text-sm md:text-base
                            ${isLoading && actionType === 'start' ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {isLoading && actionType === 'start' ? (
                            <>
                              <svg className="animate-spin h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              <span>Starting...</span>
                            </>
                          ) : (
                            <>
                              <svg className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Start Session
                            </>
                          )}
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setShowCancelConfirm(true)}
                          disabled={isLoading}
                          className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg text-sm sm:text-base"
                        >
                          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Cancel
                        </motion.button>
                      </>
                    ) : (
                      <>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            setConfirmClicked(true);
                            setTimeout(() => setConfirmClicked(false), 300);
                            handleConfirmClick(appointment.id);
                          }}
                          disabled={isLoading}
                          className={`flex-1 bg-gradient-to-r from-[#057DCD] to-[#046bb8] hover:from-[#046bb8] hover:to-[#034a94] text-white py-3 sm:py-4 px-4 sm:px-6 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg text-sm sm:text-base
                            ${isLoading && actionType === 'confirm' ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {isLoading && actionType === 'confirm' ? (
                            <>
                              <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              <span>Confirming...</span>
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Confirm
                            </>
                          )}
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setShowCancelConfirm(true)}
                          disabled={isLoading}
                          className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg text-sm sm:text-base"
                        >
                          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Cancel
                        </motion.button>
                      </>
                    )}
                </div>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-blue-50 to-indigo-100 rounded-xl p-4 sm:p-6 border border-blue-200"
              >
                <h4 className="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#057DCD]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Confirm Appointment Details
                </h4>
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Schedule Date & Time</label>
                    <input 
                      type="datetime-local" 
                      value={confirmInputs[appointment.id]?.schedule || ''}
                      onChange={(e) => setConfirmInputs?.(prev => ({
                        ...prev, 
                        [appointment.id]: { 
                          ...prev[appointment.id],
                          schedule: e.target.value 
                        }
                      }))}
                      className="w-full border-2 border-gray-200 rounded-lg p-2 sm:p-3 focus:outline-none focus:border-[#057DCD] text-xs sm:text-sm transition-colors duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Venue</label>
                    {loadingVenues ? (
                      <div className="w-full border-2 border-gray-200 rounded-lg p-2 sm:p-3 text-xs sm:text-sm text-gray-500">
                        Loading venues...
                      </div>
                    ) : (
                      <select
                        value={confirmInputs[appointment.id]?.venue_id || ''}
                        onChange={(e) => setConfirmInputs?.(prev => ({
                          ...prev, 
                          [appointment.id]: { 
                            ...prev[appointment.id],
                            venue_id: e.target.value,
                            venue: e.target.selectedOptions[0]?.text || ''
                          }
                        }))}
                        className="w-full border-2 border-gray-200 rounded-lg p-2 sm:p-3 focus:outline-none focus:border-[#057DCD] text-xs sm:text-sm transition-colors duration-200"
                      >
                        <option value="">Select a venue</option>
                        {/* Available venues first */}
                        {venues
                          .filter(venue => venue.is_available)
                          .map(venue => (
                            <option key={venue.id} value={venue.id}>
                              {venue.name} (Available)
                            </option>
                          ))}
                        {/* Unavailable venues second */}
                        {venues
                          .filter(venue => !venue.is_available)
                          .map(venue => (
                            <option key={venue.id} value={venue.id}>
                              {venue.name} (Unavailable)
                            </option>
                          ))}
                        {/* Others option last */}
                        <option value="others">Others</option>
                      </select>
                    )}
                    {confirmInputs[appointment.id]?.venue_id === 'others' && (
                      <input 
                        type="text" 
                        placeholder="Enter custom venue"
                        value={confirmInputs[appointment.id]?.custom_venue || ''}
                        onChange={(e) => setConfirmInputs?.(prev => ({
                          ...prev, 
                          [appointment.id]: { 
                            ...prev[appointment.id],
                            custom_venue: e.target.value,
                            venue: e.target.value
                          }
                        }))}
                        className="w-full border-2 border-gray-200 rounded-lg p-2 sm:p-3 focus:outline-none focus:border-[#057DCD] text-xs sm:text-sm transition-colors duration-200 mt-2"
                      />
                    )}
                  </div>
                  
                  {/* Period Display */}
                  {activePeriod && (
                    <div className="mb-3">
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                        Current Period
                      </label>
                      <div className="w-full border-2 border-gray-200 rounded-lg p-2 sm:p-3 text-xs sm:text-sm bg-gray-50 text-gray-600">
                        {activePeriod.name}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        This consultation will be recorded under the current active period.
                      </p>
                    </div>
                  )}
                  
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setConfirmedClicked(true);
                        setTimeout(() => {
                          setConfirmedClicked(false);
                          if (onConfirm && confirmInputs[appointment.id]) {
                            handleConfirmation(
                              appointment.id, 
                              confirmInputs[appointment.id].schedule, 
                              confirmInputs[appointment.id].venue_id
                            );
                            setConfirmInputs?.((prev) => {
                              const updated = { ...prev };
                              delete updated[appointment.id];
                              return updated;
                            });
                          }
                        }, 300);
                      }}
                      disabled={isLoading}
                      className={`flex-1 bg-gradient-to-r from-[#057DCD] to-[#046bb8] hover:from-[#046bb8] hover:to-[#034a94] text-white py-3 px-4 sm:px-6 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg text-sm sm:text-base
                        ${isLoading && actionType === 'confirm' ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {isLoading && actionType === 'confirm' ? (
                        <>
                          <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Confirming...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Confirm Booking
                        </>
                      )}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setCancelingClicked(true);
                        setTimeout(() => {
                          setCancelingClicked(false);
                          setConfirmInputs?.((prev) => {
                            const updated = { ...prev };
                            delete updated[appointment.id];
                            return updated;
                          })
                        }, 300);
                      }} 
                      disabled={isLoading}
                      className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white py-3 px-4 sm:px-6 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg text-sm sm:text-base"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Cancel
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* Cancel Confirmation Modal */}
      <AnimatePresence>
        {showCancelConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50"
            onClick={() => setShowCancelConfirm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-sm sm:max-w-md w-full mx-2 sm:mx-4 max-h-[95vh] sm:max-h-[90vh] overflow-y-auto relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="p-4 sm:p-6 pb-3 sm:pb-4">
                {/* Close Button */}
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  className="absolute top-3 right-3 sm:top-4 sm:right-4 p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  disabled={isLoading && actionType === 'cancel'}
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <div className="text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-red-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1.5 sm:mb-2">Confirm Cancellation</h3>
                  <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                    Are you sure you want to cancel this appointment? This action cannot be undone.
                  </p>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="px-4 sm:px-6 pb-4 sm:pb-6">
                <div className="flex flex-col sm:flex-row gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setCancelClicked(true);
                      setTimeout(() => setCancelClicked(false), 300);
                      handleCancel(appointment.id);
                    }}
                    disabled={isLoading && actionType === 'cancel'}
                    className={`flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 sm:gap-2 shadow-lg text-sm sm:text-base
                      ${isLoading && actionType === 'cancel' ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isLoading && actionType === 'cancel' ? (
                      <>
                        <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Cancelling...</span>
                      </>
                    ) : (
                      'Yes, Cancel'
                    )}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowCancelConfirm(false)}
                    disabled={isLoading && actionType === 'cancel'}
                    className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg font-semibold transition-all duration-200 shadow-lg text-sm sm:text-base"
                  >
                    No, Keep
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default AppointmentItem;
