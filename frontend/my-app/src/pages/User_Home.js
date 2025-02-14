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

  return (
    <div className="min-h-screen">
      {/* Welcome Header */}
      <div className="px-6 py-4 bg-white">
        <div className="max-w-[1920px] mx-auto"> {/* Increased max width */}
          <h1 className="text-2xl font-bold text-[#0065A8]">
            Welcome, {userDetails?.firstName} {userDetails?.lastName}
          </h1>
          <p className="text-gray-600">
            {userRole === 'student' ? 'Student Dashboard' : 'Faculty Dashboard'}
          </p>
        </div>
      </div>

      <div className="max-w-[1920px] mx-auto px-4 py-8"> {/* Increased max width */}
        {userRole === 'faculty' ? (
          <div className="space-y-8">
            <HomeTeacher />
            <div className="overflow-hidden"> {/* Add overflow control */}
              <h2 className="text-xl text-center font-semibold mb-4 text-[#0065A8]">Consultation Calendar</h2>
              <div className="bg-white rounded-lg shadow-lg p-6 overflow-x-auto"> {/* Add horizontal scroll if needed */}
                <AppointmentsCalendar />
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            <div className="xl:col-span-4"> {/* Changed from col-span-3 to col-span-4 */}
              <h2 className="text-xl text-center font-semibold mb-4 text-[#0065A8]">Consultation Calendar</h2>
              <div className="bg-white rounded-lg p-6 overflow-x-auto"> {/* Add horizontal scroll if needed */}
                <AppointmentsCalendar />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
