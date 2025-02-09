import React, { useState, useEffect } from 'react';
import AppointmentsCalendar from '../components/AppointmentsCalendar';

function Home() {
  const [userRole, setUserRole] = useState('');
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    setUserRole(role);
    fetchUpcomingAppointments();
  }, []);

  const fetchUpcomingAppointments = async () => {
    const role = localStorage.getItem('userRole');
    const id = role === 'student' ? localStorage.getItem('studentID') : localStorage.getItem('teacherID');
    
    try {
      const endpoint = role === 'student' ? 
        `http://localhost:5001/bookings/get_student_bookings?studentID=${id}` :
        `http://localhost:5001/bookings/get_teacher_bookings?teacherID=${id}`;
      
      const response = await fetch(endpoint);
      const data = await response.json();
      const upcoming = data.filter(booking => booking.status === 'confirmed');
      setUpcomingAppointments(upcoming.slice(0, 3)); // Show only next 3 appointments
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calendar Section */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Calendar</h2>
          <AppointmentsCalendar />
        </div>

        {/* Upcoming Appointments Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Upcoming Appointments</h2>
          <div className="bg-white rounded-lg shadow p-4">
            {upcomingAppointments.length > 0 ? (
              upcomingAppointments.map(apt => (
                <div key={apt.id} className="mb-4 p-4 border rounded">
                  <p className="font-semibold">
                    {userRole === 'student' ? `Teacher: ${apt.teacherName}` : `Students: ${apt.studentNames}`}
                  </p>
                  <p>Schedule: {new Date(apt.schedule).toLocaleString()}</p>
                  <p>Venue: {apt.venue}</p>
                </div>
              ))
            ) : (
              <p>No upcoming appointments</p>
            )}
          </div>
        </div>

        {/* Quick Stats Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Quick Stats</h2>
          <div className="bg-white rounded-lg shadow p-4 grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded">
              <p className="text-sm text-gray-600">Total Appointments</p>
              <p className="text-2xl font-bold text-blue-600">{upcomingAppointments.length}</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded">
              <p className="text-sm text-gray-600">Upcoming</p>
              <p className="text-2xl font-bold text-green-600">{upcomingAppointments.length}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
