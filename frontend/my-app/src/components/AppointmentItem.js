import React, { useState } from 'react';

function AppointmentItem({ appointment, role, onStartSession, onCancel, onConfirm, confirmInputs = {}, handleConfirmClick, setConfirmInputs }) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', content: '' });
  const [actionType, setActionType] = useState(''); // 'cancel', 'confirm', or 'start'

  const teacherInfo = appointment.teacher || {};
  const formatDateTime = (dateTime) => {
    const date = new Date(dateTime);
    const formattedDate = date.toLocaleDateString();
    const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${formattedDate} at ${formattedTime}`;
  };

  // Ensure the appointment object contains booking_id (if not, map id accordingly)
  const bookingID = appointment.booking_id || appointment.id; 
  // In your Start Session button click handler:
  const handleStart = async () => {
    setIsLoading(true);
    setActionType('start');
    try {
      await onStartSession({ ...appointment, booking_id: bookingID });
      setMessage({ type: 'success', content: 'Session started successfully' });
    } catch (error) {
      setMessage({ type: 'error', content: error.message || 'Failed to start session' });
    } finally {
      setIsLoading(false);
      setActionType('');
    }
  };

  const handleCancel = async (id) => {
    setIsLoading(true);
    setActionType('cancel');
    try {
      await onCancel(id);
      setMessage({ type: 'success', content: 'Appointment cancelled successfully' });
      setTimeout(() => setMessage({ type: '', content: '' }), 3000);
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
    <li className={`bg-white rounded-lg shadow-md p-6 my-4 border-l-4 border-[#0065A8] hover:shadow-lg transition-shadow flex flex-col fade-in
      ${role === 'student' ? 'pb-6' : 'pb-0'}`}>
      <div className="mb-4 fade-in delay-100">
        <p className="text-[#0065A8] font-semibold mb-2">Teacher</p>
        <div className="flex items-center">
          {teacherInfo.profile_picture && (
            <img 
              src={teacherInfo.profile_picture} 
              alt="Teacher" 
              className="w-12 h-12 rounded-full mr-3 border-2 border-[#54BEFF]" 
            />
          )}
          <span className="text-gray-700 font-medium">
            {teacherInfo.teacherName}{teacherInfo.department ? ` (${teacherInfo.department})` : ''}
          </span>
        </div>
      </div>

      <div className="mt-4 fade-in delay-200">
        <p className="text-[#0065A8] font-semibold mb-2">Student(s)</p>
        <div className="flex flex-wrap items-center gap-3">
          {appointment.info && Array.isArray(appointment.info) && appointment.info.length > 0 ? (
            appointment.info.map((student, index) => (
              <div key={index} className="flex items-center bg-gray-50 rounded-full px-3 py-1">
                {student.profile_picture && (
                  <img src={student.profile_picture} alt="Student" className="w-8 h-8 rounded-full mr-2 border-2 border-[#54BEFF]"/>
                )}
                <span className="text-gray-700">{student.firstName} {student.lastName}</span>
              </div>
            ))
          ) : (
            <span className="text-gray-700">{Array.isArray(appointment.studentNames) ? appointment.studentNames.join(", ") : appointment.studentNames}</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4 fade-in delay-300">
        {appointment.created_at && (
          <div>
            <p className="text-[#0065A8] font-semibold">Created at</p>
            <p className="text-gray-600">{formatDateTime(appointment.created_at)}</p>
          </div>
        )}
        {appointment.schedule && (
          <div>
            <p className="text-[#0065A8] font-semibold">Schedule</p>
            <p className="text-gray-600">{formatDateTime(appointment.schedule)}</p>
          </div>
        )}
        {appointment.venue && (
          <div>
            <p className="text-[#0065A8] font-semibold">Venue</p>
            <p className="text-gray-600">{appointment.venue}</p>
          </div>
        )}
      </div>

      {/* Message display */}
      {message.content && (
        <div className={`mt-4 p-3 rounded-lg ${
          message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {message.content}
        </div>
      )}

      {role === 'faculty' && (
        <div className="mt-6 -mx-6 flex">
          {!confirmInputs || !confirmInputs[appointment.id] ? (
            <>
              {typeof onStartSession === 'function' ? (
                <>
                  <button 
                    onClick={handleStart}
                    disabled={isLoading}
                    className={`flex-1 bg-[#0065A8] hover:bg-[#00D1B2] text-white py-4 transition-colors rounded-bl-lg rounded-br-none flex items-center justify-center gap-2
                      ${isLoading && actionType === 'start' ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isLoading && actionType === 'start' ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
                    onClick={() => handleCancel(appointment.id)}
                    disabled={isLoading}
                    className={`flex-1 bg-[#54BEFF] hover:bg-[#FF7171] text-white py-4 transition-colors rounded-br-lg rounded-bl-none flex items-center justify-center gap-2
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
                </>
              ) : (
                <>
                  <button 
                    onClick={() => handleConfirmClick(appointment.id)}
                    disabled={isLoading}
                    className={`flex-1 bg-[#0065A8] hover:bg-[#0088FF] text-white py-4 transition-colors rounded-bl-lg rounded-br-none flex items-center justify-center gap-2
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
                    onClick={() => handleCancel(appointment.id)}
                    disabled={isLoading}
                    className={`flex-1 bg-[#54BEFF] hover:bg-[#FF7171] text-white py-4 transition-colors rounded-br-lg rounded-bl-none flex items-center justify-center gap-2
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
                </>
              )}
            </>
          ) : (
            <div className="w-full px-6 pb-6">
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
                  className="border rounded-lg p-2 focus:outline-none focus:border-[#0088FF]"
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
                  className="border rounded-lg p-2 focus:outline-none focus:border-[#0088FF]"
                />
                <div className="flex -mx-6 mt-3">
                  <button 
                    onClick={() => {
                      if (onConfirm && confirmInputs[appointment.id]) {
                        handleConfirmation(
                          appointment.id, 
                          confirmInputs[appointment.id].schedule, 
                          confirmInputs[appointment.id].venue
                        );
                        setConfirmInputs?.(prev => {
                          const updated = { ...prev };
                          delete updated[appointment.id];
                          return updated;
                        });
                      }
                    }}
                    disabled={isLoading}
                    className={`flex-1 bg-[#0065A8] hover:bg-[#0088FF] text-white py-4 transition-colors rounded-bl-lg rounded-br-none flex items-center justify-center gap-2
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
                    onClick={() => setConfirmInputs?.(prev => {
                      const updated = { ...prev };
                      delete updated[appointment.id];
                      return updated;
                    })}
                    disabled={isLoading}
                    className={`flex-1 bg-[#54BEFF] hover:bg-[#FF7171] text-white py-4 transition-colors rounded-br-lg rounded-bl-none flex items-center justify-center gap-2
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
