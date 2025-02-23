import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import EnrollmentModal from './EnrollmentModal';

// Enrollment icon SVG
const EnrollmentIcon = () => (
  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.5 7.63V5C17.5 3 16.5 2 14.5 2H9.5C7.5 2 6.5 3 6.5 5V7.56M4.26 11.02V15.99C4.26 17.81 4.26 17.81 5.98 18.97L10.71 21.7C11.42 22.11 12.58 22.11 13.29 21.7L18.02 18.97C19.74 17.81 19.74 17.81 19.74 15.99V11.02C19.74 9.2 19.74 9.2 18.02 8.04L13.29 5.31C12.58 4.9 11.42 4.9 10.71 5.31L5.98 8.04C4.26 9.2 4.26 9.2 4.26 11.02ZM12.63 10.99L13.2 11.88C13.29 12.02 13.49 12.16 13.64 12.2L14.66 12.46C15.29 12.62 15.46 13.16 15.05 13.66L14.38 14.47C14.28 14.6 14.2 14.83 14.21 14.99L14.27 16.04C14.31 16.69 13.85 17.02 13.25 16.78L12.27 16.39C12.12 16.33 11.87 16.33 11.72 16.39L10.74 16.78C10.14 17.02 9.68 16.68 9.72 16.04L9.78 14.99C9.79 14.83 9.71 14.59 9.61 14.47L8.94 13.66C8.53 13.16 8.7 12.62 9.33 12.46L10.35 12.2C10.51 12.16 10.71 12.01 10.79 11.88L11.36 10.99C11.72 10.45 12.28 10.45 12.63 10.99Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
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
  const userRole = localStorage.getItem('userRole');
  const location = useLocation();
  const email = localStorage.getItem('userEmail');

  useEffect(() => {
    if (userRole === 'faculty' && email) {
      // Fetch user details from user_routes to get the isActive field.
      fetch(`http://localhost:5001/user/get_user?email=${encodeURIComponent(email)}`)
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

  return (
    <>
      {/* Floating Action Button - Updated z-index to be lower than modal overlay */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-24 right-8 w-14 h-14 rounded-full bg-[#00D1B2] hover:bg-[#00F7D4] 
                   flex items-center justify-center shadow-lg transform hover:scale-110 
                   transition-all duration-300 ease-in-out z-[45]" // Changed from z-50 to z-45
        title="Enroll Students"
      >
        <EnrollmentIcon />
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
              <div className="bg-[#00D1B2] px-6 py-4 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-white">Enroll Students</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                <EnrollmentModal closeModal={() => setShowModal(false)} />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default EnrollmentPopup;
