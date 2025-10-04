import React, { useState, useEffect } from 'react';
import API_URL from '../apiConfig';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import AppointmentsCalendar from '../components/AppointmentsCalendar';
import HomeTeacher from '../components/HomeTeacher';
import HomeStudent from '../components/HomeStudent';
import HomeAdmin from '../components/HomeAdmin';
import AdminConsultationCalendar from '../components/AdminConsultationCalendar';

function Home() {
  const [userRole, setUserRole] = useState('');
  const [userDetails, setUserDetails] = useState(null);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const navigate = useNavigate();

  // Track screen width for responsive decisions
  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Existing effect for user details
  useEffect(() => {
    const role = localStorage.getItem('userRole');
    const email = localStorage.getItem('userEmail');
    setUserRole(role);

    if (email) {
      fetch(`${API_URL}/user/get_user?email=${email}`)
        .then(res => res.json())
        .then(data => setUserDetails(data))
        .catch(err => console.error('Error fetching user details:', err));
    }
  }, []);

  // Define if we're on mobile or not
  const isMobile = screenWidth < 768;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 font-poppins">
      {/* Hero Section - Hidden for admin on mobile */}
      {!(userRole === 'admin' && isMobile) && (
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="relative py-16 overflow-hidden"
        >
          {/* Background Elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#057DCD] via-[#046bb8] to-[#034a94]" />
          <div className="absolute inset-0 bg-black bg-opacity-20" />
          
          {/* Floating Elements */}
          <motion.div
            animate={{ 
              y: [0, -20, 0],
              rotate: [0, 5, 0]
            }}
            transition={{ 
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-10 left-10 w-20 h-20 bg-blue-400 rounded-full opacity-20"
          />
          <motion.div
            animate={{ 
              y: [0, 30, 0],
              rotate: [0, -5, 0]
            }}
            transition={{ 
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute bottom-10 right-10 w-32 h-32 bg-blue-300 rounded-full opacity-15"
          />
          <motion.div
            animate={{ 
              y: [0, -15, 0],
              x: [0, 10, 0]
            }}
            transition={{ 
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-1/2 right-1/4 w-16 h-16 bg-blue-200 rounded-full opacity-25"
          />

          <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
                Welcome, {userDetails?.firstName} {userDetails?.lastName}
              </h1>
              <p className="text-xl md:text-2xl text-blue-200 mb-2">
                {userRole === 'student' ? 'Student Dashboard' : 
                 userRole === 'faculty' ? 'Faculty Dashboard' : 
                 userRole === 'admin' ? 'Admin Dashboard' : 'Dashboard'}
              </p>
              <p className="text-lg text-blue-100 max-w-2xl mx-auto">
                {userRole === 'student' 
                  ? "Access your consultation requests, view grades, and manage your academic journey" 
                  : userRole === 'faculty'
                  ? "Manage your consultation schedule, track student progress, and analyze performance"
                  : "Oversee system operations, manage users, and monitor consultation activities"
                }
              </p>
            </motion.div>
          </div>
        </motion.section>
      )}



      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {userRole === 'admin' ? (
            <div className="space-y-2 sm:space-y-4">
              <HomeAdmin />
              {/* Admin Consultation Calendar - Hidden on mobile */}
              {!isMobile && (
                <div className="w-full mt-10">
                  <h2 className="text-3xl text-center font-semibold mb-8 text-[#0065A8]">
                    Consultation Calendar
                  </h2>
                  <div className="bg-white rounded-lg shadow-lg p-1 sm:p-2 overflow-x-auto">
                    <div className="calendar-wrapper">
                      <AdminConsultationCalendar />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : userRole === 'faculty' ? (
            <div className="space-y-2 sm:space-y-4">
              <HomeTeacher />
              
              {isMobile ? (
                /* Mobile view - Calendar hidden with message */
                <div className="overflow-hidden">
                  <h2 className="text-sm sm:text-base md:text-lg text-center font-semibold mb-1 sm:mb-2 text-[#0065A8]">
                    Consultation Calendar
                  </h2>
                  <div className="bg-white rounded-lg shadow-lg p-4 text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-[#057DCD] mb-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm text-gray-600 mb-2">
                      Calendar view is not available on mobile devices.
                    </p>
                    <p className="text-xs text-gray-500">
                      Please use a tablet or desktop for the full calendar experience.
                    </p>
                  </div>
                </div>
              ) : (
                /* Desktop view - Calendar shown */
                <div className="overflow-hidden">
                  <h2 className="text-lg sm:text-base md:text-lg text-center font-semibold mb-1 sm:mb-2 text-[#0065A8]">
                    Consultation Calendar
                  </h2>
                  <div className="bg-white rounded-lg shadow-lg p-1 sm:p-2 overflow-x-auto">
                    <div className="calendar-wrapper">
                      <AppointmentsCalendar />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            userRole === 'student' && (
            <div className="space-y-2">
              <HomeStudent />  {/* Add HomeStudent component */}
              {isMobile ? (
                /* Mobile view for students - Calendar hidden with message */
                <div className="w-full">
                  <h2 className="text-lg sm:text-base md:text-lg text-center font-semibold mb-1 sm:mb-2 text-[#0065A8]">
                    Consultation Calendar
                  </h2>
                  <div className="bg-white rounded-lg shadow-lg p-4 text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-[#057DCD] mb-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm text-gray-600 mb-2">
                      Calendar view is not available on mobile devices.
                    </p>
                    <p className="text-xs text-gray-500 mb-3">
                      Please use a tablet or desktop for the full calendar experience.
                    </p>
                    <button 
                      onClick={() => navigate('/appointments')}
                      className="bg-[#057DCD] text-white px-4 py-2 rounded-md text-sm"
                    >
                      View My Appointments
                    </button>
                  </div>
                </div>
              ) : (
                /* Desktop view for students - Calendar shown */
                <div className="w-full">
                  <h2 className="text-sm sm:text-base md:text-lg text-center font-semibold mb-1 sm:mb-2 text-[#0065A8]">
                    Consultation Calendar
                  </h2>
                  <div className="bg-white rounded-lg shadow-lg p-1 sm:p-2 overflow-x-auto">
                    <div className="calendar-wrapper">
                      <AppointmentsCalendar />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default Home;
