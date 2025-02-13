import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import BookingAppointment from './BookingAppointment';

// Inline SVG for bookAppointment icon with blue background and white stroke
const BookIcon = () => (
  <svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="34" height="34" rx="4" fill="none"/>
    <path d="M11.3333 2.83337V7.08337M22.6667 2.83337V7.08337M29.75 19.3092V12.0417C29.75 7.79171 27.625 4.95837 22.6667 4.95837H11.3333C6.375 4.95837 4.25 7.79171 4.25 12.0417V24.0834C4.25 28.3334 6.375 31.1667 11.3333 31.1667H20.7967M29.75 19.3092C28.4892 18.3034 26.8883 17.7084 25.1458 17.7084C23.4033 17.7084 21.7742 18.3175 20.4992 19.3517C18.785 20.6975 17.7083 22.8084 17.7083 25.1459C17.7083 26.5342 18.105 27.8659 18.785 28.9709C19.3092 29.8351 19.9892 30.5859 20.7967 31.1667M29.75 19.3092C31.4783 20.6692 32.5833 22.78 32.5833 25.1459C32.5833 26.5342 32.1867 27.8659 31.5067 28.9709C31.11 29.6509 30.6142 30.2459 30.0333 30.7275C28.73 31.8892 27.03 32.5834 25.1458 32.5834C23.5167 32.5834 22.015 32.0592 20.7967 31.1667M9.91667 15.5834H18.4167M9.91667 22.6667H13.6283M25.1458 28.6875C25.1458 26.7325 26.7325 25.1459 28.6875 25.1459C26.7325 25.1459 25.1458 23.5592 25.1458 21.6042C25.1458 23.5592 23.5592 25.1459 21.6042 25.1459C23.5592 25.1459 25.1458 26.7325 25.1458 28.6875Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const modalVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1 }
};

const BookingPopup = ({ closePopup, role }) => {
  const location = useLocation();
  const [showModal, setShowModal] = useState(false);
  const userRole = localStorage.getItem('userRole'); // 'faculty' or 'student'
  
  // Execute the conditional check after hooks are called.
  if (location.pathname.includes('/session') || !['faculty', 'student'].includes(userRole)) {
    return null;
  }
  
  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  return (
    <>
      {/* Fixed button on bottom right */}
      <button
        onClick={openModal}
        className="fixed bottom-8 right-8 w-14 h-14 rounded-full flex items-center justify-center shadow-lg bg-[#0065A8] hover:bg-[#54BEFF] hover:scale-110 duration-300 ease-in-out text-white z-50"
      >
        <BookIcon />
      </button>
      
      <AnimatePresence>
        {showModal && (
          // Clicking the overlay closes the modal
          <div onClick={closeModal} className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50">
            {/* Stop propagation so clicks inside don't close the modal */}
            <motion.div 
              onClick={(e) => e.stopPropagation()}
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              transition={{ duration: 0.1 }} // updated quicker transition
              className="relative bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-md"
            >
              {/* "x" button to close modal */}
              <button onClick={closeModal} className="absolute top-2 right-2 text-gray-500 hover:text-gray-800">
                x
              </button>
              <BookingAppointment closeModal={closePopup} role={role} />
              <button 
                onClick={closePopup} 
                className="mt-4 bg-gray-300 text-black px-4 py-2 rounded"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default BookingPopup;
