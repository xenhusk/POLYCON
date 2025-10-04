import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import EnrollmentModal from './EnrollmentModal';
import API_URL from '../apiConfig';

// Enrollment icon SVG - Updated for responsiveness
const EnrollmentIcon = () => (
  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 8H19M15 12H19M17 16H19M12 16.33C11.86 14.88 10.71 13.74 9.26 13.61C8.76 13.56 8.25 13.56 7.74 13.61C6.29 13.75 5.14 14.88 5 16.33M17 21H7C3 21 2 20 2 16V8C2 4 3 3 7 3H17C21 3 22 4 22 8V16C22 20 21 21 17 21ZM10.31 9.48C10.31 10.4796 9.49964 11.29 8.5 11.29C7.50036 11.29 6.69 10.4796 6.69 9.48C6.69 8.48036 7.50036 7.67 8.5 7.67C9.49964 7.67 10.31 8.48036 10.31 9.48Z" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
);

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
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
    transition: { duration: 0.2 }
  }
};

const EnrollmentPopup = () => {
  const [showModal, setShowModal] = useState(false);
  const [isActive, setIsActive] = useState(null); // Local state for isActive
  const [EnrollmentClicked, setEnrollmentClicked] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  
  const userRole = localStorage.getItem('userRole');
  const location = useLocation();
  const email = localStorage.getItem('userEmail');

  // Add window resize listener
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (userRole === 'faculty' && email) {
      // Fetch user details from user_routes to get the isActive field.
      fetch(`${API_URL}/user/get_user?email=${encodeURIComponent(email)}`)
        .then(res => res.json())
        .then(data => {
          // Assuming data.isActive is a boolean.
          setIsActive(data.isActive);
        })
        .catch(err => {
          console.error("Error fetching user isActive:", err);
          setIsActive(false);
        });
    }
  }, [userRole, email]);

  // Show enrollment popup only if user is faculty AND isActive is true.
  if (userRole !== 'faculty' || isActive !== true || location.pathname.includes('/session')) {
    return null;
  }

  // Calculate button size and position based on screen size
  const buttonSize = windowWidth < 640 ? 'w-12 h-12' : 'w-14 h-14';
  const iconSize = windowWidth < 640 ? 'scale-75' : 'scale-100';

  return (
    <>
      {/* Floating Action Button - Now without fixed positioning */}
      <button
        onClick = {() => {
          console.log("Enrollment button clicked!"); // Debug log
          setEnrollmentClicked(true);
          setTimeout(() => setEnrollmentClicked(false), 200) 
          setShowModal(true)
        }}
        className={`${buttonSize} rounded-full bg-[#00D1B2] hover:bg-[#00F7D4] 
                  flex items-center justify-center shadow-lg transform hover:scale-110 
                  transition-all duration-300 ease-in-out
                  ${EnrollmentClicked ? "scale-90" : "scale-100"}
                  `} 
        title="Enroll Students"
      >
        <div className={`w-8 h-8 ${iconSize}`}>
          <EnrollmentIcon />
        </div>
      </button>

      {/* Modal Overlay - Enhanced with modern design */}
      <AnimatePresence>
        {showModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[9999] p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden border border-white/20 mx-2 sm:mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header with close button */}
              <div className="bg-[#00D1B2] px-4 sm:px-8 py-4 sm:py-6 flex justify-between items-center">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-white">Enroll Students</h2>
                    <p className="text-blue-100 text-xs sm:text-sm hidden sm:block">
                      Add students to your class roster
                    </p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowModal(false)}
                  className="text-white hover:text-gray-200 transition-colors p-1 sm:p-2 rounded-lg hover:bg-white/20"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </div>

              {/* Modal Content */}
              <div className="p-0">
                <EnrollmentModal closeModal={() => setShowModal(false)} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default EnrollmentPopup;
