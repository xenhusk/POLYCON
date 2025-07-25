import React, { useState } from 'react';
import { getProfilePictureUrl } from '../utils/utils';
import { formatUTCToLocal, debugTimezone } from '../utils/timezoneUtils';

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

  const handleConfirmation = async (id, schedule, venue) => {
    setIsLoading(true);
    setActionType('confirm');
    try {
      await onConfirm(id, schedule, venue);
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
    <li className={`bg-white rounded-lg shadow-md p-4 sm:p-6 my-3 sm:my-4 border-l-4 border-[#0065A8] hover:shadow-lg transition-shadow flex flex-col fade-in
      ${role === 'student' ? 'pb-4 sm:pb-6' : 'pb-0'}`}>
      <div className="mb-3 sm:mb-4 fade-in delay-100">
        <p className="text-[#0065A8] font-semibold mb-2 text-sm sm:text-base">Teacher</p>
        <div className="flex items-center">
          {/* Always show teacher profile with fallback */}
          <img
            src={getProfilePictureUrl(teacherInfo.profile_picture, teacherInfo.teacherName)}
            alt="Teacher"
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full mr-2 sm:mr-3 border-2 border-[#54BEFF] flex-shrink-0"
          />
          
           <span className="text-gray-700 font-medium text-sm sm:text-base break-words">
            {teacherInfo.teacherName}{teacherInfo.department ? ` (${teacherInfo.department})` : ''}
          </span>
        </div>
      </div>

      <div className="mt-3 sm:mt-4 fade-in delay-200">
        <p className="text-[#0065A8] font-semibold mb-2 text-sm sm:text-base">Student(s)</p>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Log appointment.info before the conditional check */}
          {console.log("AppointmentItem - appointment.info:", appointment.info)}
          {appointment.info && Array.isArray(appointment.info) && appointment.info.length > 0 ? (
            appointment.info.map((student, index) => {
              // Log student data and generated avatar URL
              console.log(
                `Student ${index} - Profile Picture Input:`, student.profile_picture, 
                `Name for Avatar: '${student.firstName} ${student.lastName}'`
              );
              const studentAvatarUrl = getProfilePictureUrl(student.profile_picture, `${student.firstName} ${student.lastName}`);
              console.log(`Student ${index} - Generated Avatar URL:`, studentAvatarUrl);

              return (
                <div key={index} className="flex items-center bg-gray-50 rounded-full px-2 sm:px-3 py-1 min-w-0">
                  {/* Always render student profile with fallback */}
                  <img
                    src={studentAvatarUrl}
                    alt="Student"
                    className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-[#54BEFF] mr-1 sm:mr-2 flex-shrink-0" // Added mr-2 for spacing
                  />
                  <span className="text-gray-700 text-xs sm:text-sm truncate">{student.firstName} {student.lastName}</span>
                </div>
              );
            })
          ) : (
            <span className="text-gray-700 text-xs sm:text-sm break-words">{Array.isArray(appointment.studentNames) ? appointment.studentNames.join(", ") : appointment.studentNames}</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-3 sm:mt-4 fade-in delay-300">
        {appointment.created_at && (
          <div className="min-w-0">
            <p className="text-[#0065A8] font-semibold text-sm sm:text-base">Created at</p>
            <p className="text-gray-600 text-xs sm:text-sm break-words">{formatDateTime(appointment.created_at)}</p>
          </div>
        )}
        {appointment.schedule && (
          <div className="min-w-0">
            <p className="text-[#0065A8] font-semibold text-sm sm:text-base">Schedule</p>
            <p className="text-gray-600 text-xs sm:text-sm break-words">{formatDateTime(appointment.schedule)}</p>
          </div>
        )}
        {appointment.venue && (
          <div className="min-w-0 sm:col-span-2">
            <p className="text-[#0065A8] font-semibold text-sm sm:text-base">Venue</p>
            <p className="text-gray-600 text-xs sm:text-sm break-words">{appointment.venue}</p>
          </div>
        )}
      </div>

      {/* Message display */}
      {message.content && (
        <div className={`mt-3 sm:mt-4 p-2 sm:p-3 rounded-lg text-xs sm:text-sm ${
          message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {message.content}
        </div>
      )}

      {role === 'faculty' && (
        <div className="mt-4 sm:mt-6 flex flex-col"> {/* Removed negative margins */}
          {!confirmInputs || !confirmInputs[appointment.id] ? (
            <>
              {/* Conditional rendering for cancel confirmation */}
              {showCancelConfirm ? (
                <div className="w-full px-4 sm:px-6 pb-3 sm:pb-4">
                  <p className="text-center text-gray-700 mb-2 sm:mb-3 text-sm sm:text-base">Are you sure you want to cancel this appointment?</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setCancelClicked(true);
                        setTimeout(() => setCancelClicked(false), 300);
                        handleCancel(appointment.id);
                      }}
                      disabled={isLoading && actionType === 'cancel'}
                      className={`flex-1 bg-[#FF7171] hover:bg-[#E65A5A] text-white py-3 sm:py-3 transition-colors rounded-lg flex items-center justify-center gap-2 text-sm sm:text-base min-h-[44px]
                        ${isLoading && actionType === 'cancel' ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {isLoading && actionType === 'cancel' ? (
                        <>
                          <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Cancelling...</span>
                        </>
                      ) : (
                        'Yes, Cancel'
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setShowCancelConfirm(false);
                      }}
                      disabled={isLoading && actionType === 'cancel'}
                      className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-3 sm:py-3 transition-colors rounded-lg flex items-center justify-center text-sm sm:text-base min-h-[44px]"
                    >
                      No
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row"> {/* Stack on mobile, side-by-side on larger screens */}
                  {typeof onStartSession === 'function' ? (
                    <>
                      <button 
                        onClick={() => {
                          setStartClicked(true);
                          setTimeout(() => setStartClicked(false), 300);
                          handleStart();
                        }}
                        disabled={isLoading}
                        className={`flex-1 bg-[#0065A8] hover:bg-[#00D1B2] text-white py-3 sm:py-4 transition-colors rounded-t-lg sm:rounded-l-lg sm:rounded-tr-none flex items-center justify-center gap-2 text-sm sm:text-base min-h-[44px]
                          ${isLoading && actionType === 'start' ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {isLoading && actionType === 'start' ? (
                          <>
                            <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Starting...</span>
                          </>
                        ) : (
                          'Start Session'
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setShowCancelConfirm(true); // Show confirmation
                        }}
                        disabled={isLoading}
                        className={`flex-1 bg-[#54BEFF] hover:bg-[#FF7171] text-white py-3 sm:py-4 transition-colors rounded-b-lg sm:rounded-r-lg sm:rounded-bl-none flex items-center justify-center gap-2 text-sm sm:text-base min-h-[44px]
                          ${isLoading && actionType === 'cancel' ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        onClick={() => {
                          setConfirmClicked(true);
                          setTimeout(() => setConfirmClicked(false), 300);
                          handleConfirmClick(appointment.id);
                        }}
                        disabled={isLoading}
                        className={`flex-1 bg-[#0065A8] hover:bg-[#0088FF] text-white py-3 sm:py-4 transition-colors rounded-lg sm:rounded-l-lg sm:rounded-r-none flex items-center justify-center gap-2 text-sm sm:text-base min-h-[44px]
                          ${isLoading && actionType === 'confirm' ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {isLoading && actionType === 'confirm' ? (
                          <>
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Confirming...</span>
                          </>
                        ) : (
                          'Confirm'
                        )}
                      </button>
                      <button 
                        onClick={() => {
                          setShowCancelConfirm(true); // Show confirmation
                        }}
                        disabled={isLoading}
                        className={`flex-1 bg-[#54BEFF] hover:bg-[#FF7171] text-white py-3 sm:py-4 transition-colors rounded-lg sm:rounded-r-lg sm:rounded-l-none flex items-center justify-center gap-2 text-sm sm:text-base min-h-[44px]
                          ${isLoading && actionType === 'cancel' ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="w-full px-4 sm:px-6">
              <div className="flex flex-col gap-3">
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
                  className="border rounded-lg p-3 focus:outline-none focus:border-[#0088FF] text-sm sm:text-base min-h-[44px]"
                />
                <input 
                  type="text" 
                  placeholder="Enter venue"
                  value={confirmInputs[appointment.id]?.venue || ''}
                  onChange={(e) => setConfirmInputs?.(prev => ({
                    ...prev, 
                    [appointment.id]: { 
                      ...prev[appointment.id],
                      venue: e.target.value 
                    }
                  }))}
                  className="border rounded-lg p-3 focus:outline-none focus:border-[#0088FF] text-sm sm:text-base min-h-[44px]"
                />
                <div className="flex flex-col sm:flex-row mt-3 gap-2 sm:gap-0">
                  <button 
                    onClick={() => {
                      setConfirmedClicked(true);
                      setTimeout(() => {
                        setConfirmedClicked(false);
                        if (onConfirm && confirmInputs[appointment.id]) {
                          handleConfirmation(
                            appointment.id, 
                            confirmInputs[appointment.id].schedule, 
                            confirmInputs[appointment.id].venue
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
                    className={`flex-1 bg-[#0065A8] hover:bg-[#0088FF] text-white py-3 sm:py-4 transition-colors rounded-lg sm:rounded-l-lg sm:rounded-r-none flex items-center justify-center gap-2 text-sm sm:text-base min-h-[44px]
                      ${isLoading && actionType === 'confirm' ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isLoading && actionType === 'confirm' ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Confirming...</span>
                      </>
                    ) : (
                      'Confirm Booking'
                    )}
                  </button>
                  <button
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
                    className={`flex-1 bg-[#54BEFF] hover:bg-[#FF7171] text-white py-3 sm:py-4 transition-colors rounded-lg sm:rounded-r-lg sm:rounded-l-none flex items-center justify-center gap-2 text-sm sm:text-base min-h-[44px]
                      ${isLoading && actionType === 'cancel' ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isLoading && actionType === 'cancel' ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Cancelling...</span>
                      </>
                    ) : (
                      'Cancel'
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </li>
  );
}

export default AppointmentItem;
