import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import BookingAppointment from './BookingAppointment';

// Restore original calendar icon
const BookIcon = () => (
  <svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="34" height="34" rx="4" fill="none"/>
    <path d="M11.3333 2.83337V7.08337M22.6667 2.83337V7.08337M29.75 19.3092V12.0417C29.75 7.79171 27.625 4.95837 22.6667 4.95837H11.3333C6.375 4.95837 4.25 7.79171 4.25 12.0417V24.0834C4.25 28.3334 6.375 31.1667 11.3333 31.1667H20.7967M29.75 19.3092C28.4892 18.3034 26.8883 17.7084 25.1458 17.7084C23.4033 17.7084 21.7742 18.3175 20.4992 19.3517C18.785 20.6975 17.7083 22.8084 17.7083 25.1459C17.7083 26.5342 18.105 27.8659 18.785 28.9709C19.3092 29.8351 19.9892 30.5859 20.7967 31.1667M29.75 19.3092C31.4783 20.6692 32.5833 22.78 32.5833 25.1459C32.5833 26.5342 32.1867 27.8659 31.5067 28.9709C31.11 29.6509 30.6142 30.2459 30.0333 30.7275C28.73 31.8892 27.03 32.5834 25.1458 32.5834C23.5167 32.5834 22.015 32.0592 20.7967 31.1667M9.91667 15.5834H18.4167M9.91667 22.6667H13.6283M25.1458 28.6875C25.1458 26.7325 26.7325 25.1459 28.6875 25.1459C26.7325 25.1459 25.1458 23.5592 25.1458 21.6042C25.1458 23.5592 23.5592 25.1459 21.6042 25.1459C23.5592 25.1459 25.1458 26.7325 25.1458 28.6875Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const modalVariants = {
  hidden: { 
    opacity: 0,
    scale: 0.95,
    y: 20
  },
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
    transition: {
      duration: 0.2
    }
  }
};

const BookingPopup = () => {
  const [showModal, setShowModal] = useState(false);
  const userRole = localStorage.getItem('userRole');  
  const isActive = localStorage.getItem('isActive');   // "true" or "false"
  const isEnrolled = localStorage.getItem('isEnrolled'); // "true" or "false"
  const location = useLocation();

  // For student users, show popup button only if isEnrolled is "true"
  if (userRole === 'student' && isEnrolled !== 'true') {
    return null;
  }
  // Hide popup on session pages or if role is not faculty/student.
  if (location.pathname.includes('/session') || !['faculty', 'student'].includes(userRole)) {
    return null;
  }

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-[#0088FF] hover:bg-[#54BEFF] 
                   flex items-center justify-center shadow-lg transform hover:scale-110 
                   transition-all duration-300 ease-in-out z-[45]" // Changed from z-50 to z-45
        title="Book Appointment"
      >
        <BookIcon />
      </button>

      {/* Modal Overlay */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4"> {/* Increased z-index */}
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="bg-[#0065A8] px-6 py-4 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-white">
                  {userRole === 'faculty' ? 'Book Appointment' : 'Request Appointment'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                <BookingAppointment 
                  closeModal={handleCloseModal}
                  role={userRole}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default BookingPopup;
