import React from 'react';
import { useNavigate } from 'react-router-dom';

const HistoryItem = ({ session, className }) => {
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
      className={`bg-white rounded-lg p-4 shadow hover:shadow-lg transition-shadow cursor-pointer 
        border-l-4 border-[#0065A8] fade-in 
        md-px:p-4 sm-px:p-3 xs:p-2 ${className || ''}`}
    >
      <div className="flex justify-between items-start mb-4 fade-in delay-100 
        md-px:mb-4 sm-px:mb-3 xs:mb-2">
        <div>
          <div className="flex items-center">
            {session.teacher?.profile_picture ? (
              <img 
                src={session.teacher.profile_picture} 
                alt="Teacher" 
                className="w-12 h-12 rounded-full mr-3 border-2 border-[#54BEFF]
                  md-px:w-12 md-px:h-12 sm-px:w-10 sm-px:h-10 xs:w-8 xs:h-8
                  md-px:mr-3 sm-px:mr-2 xs:mr-2" 
              />
            ) : (
              <div className="w-12 h-12 rounded-full mr-3 bg-gray-200
                md-px:w-12 md-px:h-12 sm-px:w-10 sm-px:h-10 xs:w-8 xs:h-8
                md-px:mr-3 sm-px:mr-2 xs:mr-2"/>
            )}
            <div>
              <h3 className="font-semibold text-[#0065A8] text-lg
                md-px:text-base sm-px:text-sm xs:text-sm">
                {session.teacher?.firstName ? 
                  `${session.teacher.firstName} ${session.teacher.lastName}` : 'N/A'}
              </h3>
              <p className="text-gray-600 text-base
                md-px:text-sm sm-px:text-xs xs:text-xs">
                {session.teacher?.department || 'N/A'}
              </p>
            </div>
          </div>
          <p className="mt-2 text-gray-600 text-base
            md-px:text-sm sm-px:text-xs xs:text-xs
            md-px:mt-2 sm-px:mt-1.5 xs:mt-1">
            Session Date: {sessionDateDisplay}
          </p>
        </div>
      </div>

      <div className="mt-2 fade-in delay-200">
        <p className="text-base text-gray-600 font-semibold
          md-px:text-sm sm-px:text-xs xs:text-xs">Student(s):</p>
        <div className="flex flex-wrap items-center gap-3
          md-px:gap-3 sm-px:gap-2 xs:gap-2">
          {Array.isArray(students) && students.length > 0 ? (
            students.map((student, index) => {
              if (typeof student === 'object') {
                return (
                  <div key={index} className="flex items-center bg-gray-50 rounded-full px-3 py-1
                    md-px:px-3 md-px:py-1 sm-px:px-2 sm-px:py-0.5 xs:px-2 xs:py-0.5">
                    {student.profile_picture ? (
                      <img 
                        src={student.profile_picture} 
                        alt="Student" 
                        className="w-8 h-8 rounded-full mr-2 border-2 border-[#54BEFF]
                          md-px:w-8 md-px:h-8 sm-px:w-7 sm-px:h-7 xs:w-6 xs:h-6
                          md-px:mr-2 sm-px:mr-1.5 xs:mr-1.5"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full mr-2 bg-gray-200
                        md-px:w-8 md-px:h-8 sm-px:w-7 sm-px:h-7 xs:w-6 xs:h-6
                        md-px:mr-2 sm-px:mr-1.5 xs:mr-1.5"/>
                    )}
                    <span className="text-gray-700 text-base
                      md-px:text-sm sm-px:text-xs xs:text-xs">
                      {student.firstName} {student.lastName}
                    </span>
                  </div>
                );
              } else {
                return (
                  <span key={index} className="text-gray-700 text-base
                    md-px:text-sm sm-px:text-xs xs:text-xs">{student}</span>
                );
              }
            })
          ) : (
            <span className="text-gray-700 text-base
              md-px:text-sm sm-px:text-xs xs:text-xs">N/A</span>
          )}
        </div>
      </div>

      <div className="mt-4 fade-in delay-300
        md-px:mt-4 sm-px:mt-3 xs:mt-2">
        <p className="text-base text-gray-600 font-semibold
          md-px:text-sm sm-px:text-xs xs:text-xs">Summary:</p>
        <p className="text-base md-px:text-sm sm-px:text-xs xs:text-xs">
          {session.summary || 'No summary available'}
        </p>
      </div>
    </div>
  );
};

export default HistoryItem;
