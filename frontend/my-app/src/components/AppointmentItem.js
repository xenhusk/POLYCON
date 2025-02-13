import React from 'react';

function AppointmentItem({ appointment, role, onStartSession, onCancel, onConfirm, confirmInputs = {}, handleConfirmClick, setConfirmInputs }) {
  const teacherInfo = appointment.teacher || {};
  const formatDateTime = (dateTime) => {
    const date = new Date(dateTime);
    const formattedDate = date.toLocaleDateString();
    const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${formattedDate} at ${formattedTime}`;
  };

  return (
    <li className="bg-white rounded-lg shadow-md p-6 pb-0 my-4 border-l-4 border-[#0065A8] hover:shadow-lg transition-shadow flex flex-col">
      <div className="mb-4">
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

      <div className="mt-4">
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

      <div className="grid grid-cols-2 gap-4 mt-4">
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

      {role === 'faculty' && (
        <div className="mt-6 -mx-6 flex">
          {!confirmInputs || !confirmInputs[appointment.id] ? (
            <>
              {typeof onStartSession === 'function' ? (
                <>
                  <button 
                    onClick={() => onStartSession(appointment)} 
                    className="flex-1 bg-[#0065A8] hover:bg-[#00D1B2] text-white py-4 transition-colors rounded-bl-lg rounded-br-none"
                  >
                    Start Session
                  </button>
                  <button 
                    onClick={() => onCancel(appointment.id)} 
                    className="flex-1 bg-[#54BEFF] hover:bg-[#FF7171] text-white py-4 transition-colors rounded-br-lg rounded-bl-none"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => handleConfirmClick(appointment.id)} 
                    className="flex-1 bg-[#0065A8] hover:bg-[#0088FF] text-white py-4 transition-colors rounded-bl-lg rounded-br-none"
                  >
                    Confirm
                  </button>
                  <button 
                    onClick={() => onCancel(appointment.id)} 
                    className="flex-1 bg-[#54BEFF] hover:bg-[#FF7171] text-white py-4 transition-colors rounded-br-lg rounded-bl-none"
                  >
                    Cancel
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
                        onConfirm(
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
                    className="flex-1 bg-[#0065A8] hover:bg-[#0088FF] text-white py-4 transition-colors rounded-bl-lg rounded-br-none"
                  >
                    Confirm Booking
                  </button>
                  <button 
                    onClick={() => setConfirmInputs?.(prev => {
                      const updated = { ...prev };
                      delete updated[appointment.id];
                      return updated;
                    })}
                    className="flex-1 bg-[#54BEFF] hover:bg-[#FF7171] text-white py-4 transition-colors rounded-br-lg rounded-bl-none"
                  >
                    Cancel
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
