import React from 'react';

function AppointmentItem({ appointment, role, onStartSession, onCancel, onConfirm, confirmInputs, handleConfirmClick, setConfirmInputs }) {
  const teacherInfo = appointment.teacher || {};
  const formatDateTime = (dateTime) => {
    const date = new Date(dateTime);
    const formattedDate = date.toLocaleDateString();
    const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${formattedDate} at ${formattedTime}`;
  };

  return (
    <li className="border p-4 my-2">
      <div className="mb-2">
        <p><strong>Teacher:</strong></p>
        <div className="flex items-center">
          {teacherInfo.profile_picture && (
            <img 
              src={teacherInfo.profile_picture} 
              alt="Teacher" 
              className="w-10 h-10 rounded-full mr-2" 
            />
          )}
          <span>
            {teacherInfo.teacherName}{teacherInfo.department ? ` (${teacherInfo.department})` : ''}
          </span>
        </div>
      </div>
      <div className="mt-2">
        <strong>Student(s):</strong>
        <div className="flex items-center space-x-2 mt-1">
          {appointment.info && Array.isArray(appointment.info) && appointment.info.length > 0 ? (
            appointment.info.map((student, index) => (
              <div key={index} className="flex items-center">
                {student.profile_picture && (
                  <img src={student.profile_picture} alt="Student" className="w-8 h-8 rounded-full mr-1"/>
                )}
                <span>{student.firstName} {student.lastName}</span>
              </div>
            ))
          ) : (
            <span>{Array.isArray(appointment.studentNames) ? appointment.studentNames.join(", ") : appointment.studentNames}</span>
          )}
        </div>
      </div>
      {appointment.created_at && (
        <p className="mt-2"><strong>Created at:</strong> {formatDateTime(appointment.created_at)}</p>
      )}
      {appointment.schedule && (
        <p className="mt-2"><strong>Schedule:</strong> {formatDateTime(appointment.schedule)}</p>
      )}
      {appointment.venue && (
        <p><strong>Venue:</strong> {appointment.venue}</p>
      )}
      {role === 'faculty' && (
        <div className="mt-2">
          {typeof onStartSession === 'function' && (
            <button 
              onClick={() => onStartSession(appointment)} 
              className="bg-green-500 text-white px-3 py-1 rounded mr-2"
            >
              Start Session
            </button>
          )}
          {typeof onConfirm === 'function' && (
            <>
              {!confirmInputs[appointment.id] ? (
                <button 
                  onClick={() => handleConfirmClick(appointment.id)} 
                  className="bg-blue-500 text-white px-3 py-1 rounded mr-2"
                >
                  Confirm
                </button>
              ) : (
                <div className="mt-2">
                  <input 
                    type="datetime-local" 
                    value={confirmInputs[appointment.id].schedule}
                    onChange={(e) => setConfirmInputs(prev => ({
                      ...prev, 
                      [appointment.id]: { 
                        ...prev[appointment.id], 
                        schedule: e.target.value 
                      }
                    }))}
                    className="border p-1 mr-2"
                  />
                  <input 
                    type="text" 
                    placeholder="Enter venue"
                    value={confirmInputs[appointment.id].venue}
                    onChange={(e) => setConfirmInputs(prev => ({
                      ...prev, 
                      [appointment.id]: { 
                        ...prev[appointment.id], 
                        venue: e.target.value 
                      }
                    }))}
                    className="border p-1 mr-2"
                  />
                  <button 
                    onClick={() => {
                      onConfirm(appointment.id, confirmInputs[appointment.id].schedule, confirmInputs[appointment.id].venue);
                      setConfirmInputs(prev => { 
                        const updated = { ...prev }; 
                        delete updated[appointment.id]; 
                        return updated; 
                      });
                    }}
                    className="bg-blue-500 text-white px-2 py-1 rounded"
                  >
                    Confirm Booking
                  </button>
                </div>
              )}
            </>
          )}
          {typeof onCancel === 'function' && (
            <button 
              onClick={() => onCancel(appointment.id)} 
              className="bg-red-500 text-white px-3 py-1 rounded"
            >
              Cancel
            </button>
          )}
        </div>
      )}
    </li>
  );
}

export default AppointmentItem;
