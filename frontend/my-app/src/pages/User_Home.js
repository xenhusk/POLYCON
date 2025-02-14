import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppointmentsCalendar from '../components/AppointmentsCalendar';
import HomeTeacher from '../components/HomeTeacher';

function Home() {
  const [userRole, setUserRole] = useState('');
  const [userDetails, setUserDetails] = useState(null);
  const navigate = useNavigate();

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

  const handleBookConsultation = () => {
    navigate('/booking-student');
  };

  const handleViewGrades = () => {
    navigate('/grade');
  };

  const CustomAgendaHeader = () => (
    <thead>
      <tr>
        <th>Date</th>
        <th>Time</th>
        <th>Event</th>
      </tr>
    </thead>
  );

  

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0065A8]">
          Welcome, {userDetails?.firstName} {userDetails?.lastName}
        </h1>
        <p className="text-gray-600">
        {userRole === 'student' ? 'Student Dashboard' : userRole === 'faculty' ? 'Faculty Dashboard' : userRole === 'admin' ? 'Admin Dashboard' : 'Dashboard'}
        </p>
      </div>

      {/* HomeTeacher Section for Faculty */}
      {userRole === 'faculty' && (
        <div className="mb-8">
          <HomeTeacher />
        </div>
      )}

      {/* Main Calendar Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-center text-[#0065A8]">Consultation Calendar</h2>
          <AppointmentsCalendar />
      </div>

      {/* Role-specific Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {userRole === 'student' && (
          <>
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-4">
                <button 
                  onClick={handleBookConsultation}
                  className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
                >
                  Book New Consultation
                </button>
                <button 
                  onClick={handleViewGrades}
                  className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition-colors"
                >
                  View Grades
                </button>
              </div>
            </div>
          </>
        )}
        
        {userRole === 'faculty' && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Today's Schedule</h3>
            {/* Add faculty-specific content here */}
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
