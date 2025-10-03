import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getProfilePictureUrl } from '../utils/utils'; // Import profile picture util
// Set API base URL for image loading
import API_URL from '../apiConfig';

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
  const teacherPicUrl = getProfilePictureUrl(teacher.profile_picture, teacherName);

  // For students, use detailed info if available; fallback to student_ids.
  const students = session.info && Array.isArray(session.info) && session.info.length > 0 
    ? session.info 
    : (Array.isArray(session.student_ids) ? session.student_ids : []);
  
  return (
    <motion.div 
      onClick={handleClick} 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className={`bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 hover:shadow-3xl transition-all duration-300 cursor-pointer ${className || ''}`}
    >
      {/* Status indicator */}
      <div className="h-1 w-full bg-gradient-to-r from-indigo-500 to-purple-600" />
      
      <div className="p-6">
        {/* Teacher Section */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            {session.teacher ? (
              <motion.img
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.2 }}
                src={getProfilePictureUrl(session.teacher.profile_picture, teacherName)}
                alt="Teacher"
                className="w-16 h-16 rounded-full border-4 border-white shadow-lg object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full border-4 border-white shadow-lg bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            )}
            <div>
              <h3 className="text-xl font-bold text-gray-800">
                {session.teacher?.firstName ? 
                  `${session.teacher.firstName} ${session.teacher.lastName}` : 'N/A'}
              </h3>
              {session.teacher?.department && (
                <p className="text-gray-600 text-sm">{session.teacher.department}</p>
              )}
            </div>
          </div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-full font-semibold text-sm shadow-lg"
          >
            Completed
          </motion.div>
        </div>

        {/* Session Date */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-100 rounded-xl p-4 border border-blue-200 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#057DCD] rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h5 className="font-semibold text-gray-800">Session Date</h5>
              <p className="text-gray-600 text-sm">{sessionDateDisplay}</p>
            </div>
          </div>
        </div>

        {/* Students Section */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-[#057DCD]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            </svg>
            Student{Array.isArray(students) && students.length > 1 ? 's' : ''}
          </h4>
          <div className="flex flex-wrap gap-3">
            {Array.isArray(students) && students.length > 0 ? (
              students.map((student, index) => {
                if (typeof student === 'object') {
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center bg-gradient-to-r from-blue-50 to-indigo-50 rounded-full px-4 py-2 border border-blue-200 shadow-sm"
                    >
                      <img
                        src={getProfilePictureUrl(student.profile_picture, `${student.firstName} ${student.lastName}`)}
                        alt="Student"
                        className="w-8 h-8 rounded-full border-2 border-white mr-3 shadow-sm"
                      />
                      <span className="text-gray-800 font-medium text-sm">
                        {student.firstName} {student.lastName}
                      </span>
                    </motion.div>
                  );
                } else {
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center bg-gradient-to-r from-gray-50 to-gray-100 rounded-full px-4 py-2 border border-gray-200"
                    >
                      <span className="text-gray-600 text-sm">{student}</span>
                    </motion.div>
                  );
                }
              })
            ) : (
              <div className="flex items-center bg-gradient-to-r from-gray-50 to-gray-100 rounded-full px-4 py-2 border border-gray-200">
                <span className="text-gray-600 text-sm">N/A</span>
              </div>
            )}
          </div>
        </div>

        {/* Summary Section */}
        <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-xl p-4 border border-emerald-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h5 className="font-semibold text-gray-800">Session Summary</h5>
          </div>
          <p className="text-gray-700 text-sm leading-relaxed">
            {session.summary || 'No summary available for this session'}
          </p>
        </div>

        {/* Click to view details hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-4 flex items-center justify-center gap-2 text-gray-500 text-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <span>Click to view full session details</span>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default HistoryItem;
