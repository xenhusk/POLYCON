import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppointmentsCalendar from '../components/AppointmentsCalendar';
import HomeTeacher from '../components/HomeTeacher';

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
      fetch(`http://localhost:5001/user/get_user?email=${email}`)
        .then(res => res.json())
        .then(data => setUserDetails(data))
        .catch(err => console.error('Error fetching user details:', err));
    }
  }, []);

  // Define if we're on mobile or not
  const isMobile = screenWidth < 768;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Welcome Header */}
      <div className="px-2 sm:px-4 py-1 sm:py-2 bg-white">
        <div className="mx-auto">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-[#0065A8]">
            Welcome, {userDetails?.firstName} {userDetails?.lastName}
          </h1>
          <p className="text-xs sm:text-sm text-gray-600">
            {userRole === 'student' ? 'Student Dashboard' : 'Faculty Dashboard'}
          </p>
        </div>
      </div>

      <div className="w-full px-1 sm:px-3 py-1 sm:py-3 lg:py-4 flex-grow">
        {userRole === 'faculty' ? (
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
        ) : (
          <div className="space-y-2">
            {isMobile ? (
              /* Mobile view for students - Calendar hidden with message */
              <div className="w-full">
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
        )}
      </div>
    </div>
  );
}

export default Home;
