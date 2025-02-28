import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import BookingAppointment from './BookingAppointment';

// Restore original calendar icon
const BookIcon = () => (
  <svg width="100%" height="100%" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="34" height="34" rx="4" fill="none"/>
    <path d="M11.3333 2.83337V7.08337M22.6667 2.83337V7.08337M29.75 19.3092V12.0417C29.75 7.79171 27.625 4.95837 22.6667 4.95837H11.3333C6.375 4.95837 4.25 7.79171 4.25 12.0417V24.0834C4.25 28.3334 6.375 31.1667 11.3333 31.1667H20.7967M29.75 19.3092C28.4892 18.3034 26.8883 17.7084 25.1458 17.7084C23.4033 17.7084 21.7742 18.3175 20.4992 19.3517C18.785 20.6975 17.7083 22.8084 17.7083 25.1459C17.7083 26.5342 18.105 27.8659 18.785 28.9709C19.3092 29.8351 19.9892 30.5859 20.7967 31.1667M29.75 19.3092C31.4783 20.6692 32.5833 22.78 32.5833 25.1459C32.5833 26.5342 32.1867 27.8659 31.5067 28.9709C31.11 29.6509 30.6142 30.2459 30.0333 30.7275C28.73 31.8892 27.03 32.5834 25.1458 32.5834C23.5167 32.5834 22.015 32.0592 20.7967 31.1667M9.91667 15.5834H18.4167M9.91667 22.6667H13.6283M25.1458 28.6875C25.1458 26.7325 26.7325 25.1459 28.6875 25.1459C26.7325 25.1459 25.1458 23.5592 25.1458 21.6042C25.1458 23.5592 23.5592 25.1459 21.6042 25.1459C23.5592 25.1459 25.1458 26.7325 25.1458 28.6875Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 30 }
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: { duration: 0.2 }
  }
};

const BookingPopup = () => {
  const [showModal, setShowModal] = useState(false);
  const [teacherActive, setTeacherActive] = useState(null);
  const [BookIconClicked, setBookIconClicked] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [shouldRender, setShouldRender] = useState(false);

  const userRole = localStorage.getItem('userRole'); 
  const isEnrolled = localStorage.getItem('isEnrolled'); // "true" or "false"
  const location = useLocation();
  const email = localStorage.getItem('userEmail');

  // Add window resize listener - moved before any conditional returns
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // For teachers, fetch isActive from user_routes endpoint.
  useEffect(() => {
    // Check if component should render at all first
    const isSessionPage = location.pathname.includes('/session');
    const isValidRole = ['faculty', 'student'].includes(userRole);
    
    if (isSessionPage || !isValidRole) {
      setShouldRender(false);
      return;
    }
    
    if (userRole === 'student') {
      setShouldRender(isEnrolled === 'true');
      return;
    }
    
    if (userRole === 'faculty' && email) {
      fetch(`http://localhost:5001/user/get_user?email=${encodeURIComponent(email)}`)
        .then(res => res.json())
        .then(data => {
          setTeacherActive(data.isActive);
          setShouldRender(data.isActive === true);
        })
        .catch(err => {
          console.error("Error fetching user isActive:", err);
          setTeacherActive(false);
          setShouldRender(false);
        });
    }
  }, [userRole, email, isEnrolled, location.pathname]);

  const handleCloseModal = () => {
    setShowModal(false);
  };

  // If we shouldn't render the component, return null
  if (!shouldRender) {
    return null;
  }

  // Calculate button size and position based on screen size
  const buttonSize = windowWidth < 640 ? 'w-12 h-12' : 'w-14 h-14';
  const iconSize = windowWidth < 640 ? 'scale-75' : 'scale-100';
  const buttonPosition = windowWidth < 640 ? 'bottom-20 right-4' : 'bottom-8 right-8';

  return (
    <>
      {/* Floating Action Button - Responsive */}
      <button
        onClick={() => {
          setBookIconClicked(true);
          setTimeout(() => setBookIconClicked(false), 200) 
          setShowModal(true)
        }}
        className={`fixed ${buttonPosition} ${buttonSize} rounded-full bg-[#397de2] hover:bg-[#54BEFF] 
                   flex items-center justify-center shadow-lg transform hover:scale-110 
                   transition-all duration-300 ease-in-out z-50
                   ${BookIconClicked ? "scale-90" : "scale-100"}`}
        title="Book Appointment"
      >
        <div className={`w-8 h-8 ${iconSize}`}>
          <BookIcon />
        </div>
      </button>

      {/* Modal - Now responsive */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="bg-[#397de2] px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center sticky top-0 z-10">
                <h2 className="text-lg sm:text-xl font-semibold text-white">
                  {userRole === 'faculty' ? 'Book Appointment' : 'Request Appointment'}
                </h2>
              </div>

              {/* Modal Content */}
              <div className="p-4 pb-0 sm:p-6">
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
