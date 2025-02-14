import React from 'react';
import { useNavigate } from 'react-router-dom';

const HistoryItem = ({ session }) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    // Open in new tab instead of using navigate
    window.open(`/finaldocument?sessionID=${session.session_id}`, '_blank');
  };

  // NEW: Format session_date without seconds
  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = new Date(timestamp);
    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const sessionDateDisplay = formatDate(session.session_date);

  // Use teacher info if available; fallback to parsing teacher_id
  const teacher = session.teacher || {};
  const teacherName =
    teacher.firstName && teacher.lastName
      ? `${teacher.firstName} ${teacher.lastName}`
      : (typeof session.teacher_id === 'string' && session.teacher_id.split('/')?.pop()) || 'N/A';
  const teacherDept = teacher.department || 'N/A';
  const teacherPic = teacher.profile_picture || '';

  // For students, use detailed info if available; fallback to student_ids.
  const students = session.info && Array.isArray(session.info) && session.info.length > 0 
    ? session.info 
    : (Array.isArray(session.student_ids) ? session.student_ids : []);
  
  return (
    <div 
      onClick={handleClick} 
      className="bg-white rounded-lg p-4 shadow hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-[#0065A8]"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center">
            {session.teacher?.profile_picture ? (
              <img 
                src={session.teacher.profile_picture} 
                alt="Teacher" 
                className="w-12 h-12 rounded-full mr-3 border-2 border-[#54BEFF]" 
              />
            ) : (
              <div className="w-12 h-12 rounded-full mr-3 bg-gray-200"/>
            )}
            <div>
              <h3 className="font-semibold text-[#0065A8]">
                {session.teacher?.firstName ? `${session.teacher.firstName} ${session.teacher.lastName}` : 'N/A'}
              </h3>
              <p className="text-gray-600 text-sm">
                {session.teacher?.department || 'N/A'}
              </p>
            </div>
          </div>
          <p className="mt-2 text-gray-600 text-sm">
            Session Date: {sessionDateDisplay}
          </p>
        </div>
      </div>
      <div className="mt-2">
        <p className="text-sm text-gray-600 font-semibold">Student(s):</p>
        <div className="flex flex-wrap items-center gap-3">
          {Array.isArray(students) && students.length > 0 ? (
            students.map((student, index) => {
              if (typeof student === 'object') {
                return (
                  <div key={index} className="flex items-center bg-gray-50 rounded-full px-3 py-1">
                    {student.profile_picture ? (
                      <img 
                        src={student.profile_picture} 
                        alt="Student" 
                        className="w-8 h-8 rounded-full mr-2 border-2 border-[#54BEFF]"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full mr-2 bg-gray-200"/>
                    )}
                    <span className="text-gray-700">
                      {student.firstName} {student.lastName}
                    </span>
                  </div>
                );
              } else {
                return (
                  <span key={index} className="text-gray-700">{student}</span>
                );
              }
            })
          ) : (
            <span className="text-gray-700">N/A</span>
          )}
        </div>
      </div>
      <div className="mt-4">
        <p className="text-sm text-gray-600 font-semibold">Summary:</p>
        <p className="text-sm">{session.summary || 'No summary available'}</p>
      </div>
    </div>
  );
};

export default HistoryItem;
