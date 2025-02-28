import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import EnrollmentModal from './EnrollmentModal';

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

  // Calculate button size and position based on screen size
  const buttonSize = windowWidth < 640 ? 'w-12 h-12' : 'w-14 h-14';
  const iconSize = windowWidth < 640 ? 'scale-75' : 'scale-100';
  const buttonPosition = windowWidth < 640 ? 'bottom-4 right-4' : 'bottom-24 right-8';

  return (
    <>
      {/* Floating Action Button - Now responsive */}
      <button
        onClick = {() => {
          setEnrollmentClicked(true);
          setTimeout(() => setEnrollmentClicked(false), 200) 
          setShowModal(true)
        }}
        className={`fixed ${buttonPosition} ${buttonSize} rounded-full bg-[#00D1B2] hover:bg-[#00F7D4] 
                  flex items-center justify-center shadow-lg transform hover:scale-110 
                  transition-all duration-300 ease-in-out z-[45]
                  ${EnrollmentClicked ? "scale-90" : "scale-100"}
                  `} 
        title="Enroll Students"
      >
        <div className={`w-8 h-8 ${iconSize}`}>
          <EnrollmentIcon />
        </div>
      </button>

      {/* Modal Overlay - Now responsive */}
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
              {/* Modal Header with close button */}
              <div className="bg-[#00D1B2] px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center sticky top-0 z-10">
                <h2 className="text-lg sm:text-xl font-semibold text-white">Enroll Students</h2>
              </div>

              {/* Modal Content */}
              <div style={{ paddingBottom: "4px" }} className="p-4 sm:p-6">
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
