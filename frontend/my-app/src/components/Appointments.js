import React from 'react';
import { useLocation } from 'react-router-dom';
import StudentAppointments from './StudentAppointments';
import TeacherAppointments from './TeacherAppointments';
import { usePreloadedData } from '../context/PreloadContext';

const Appointments = React.memo(() => {
  const location = useLocation();
  const { preloadedData } = usePreloadedData();
  const userRole = localStorage.getItem('userRole');

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {userRole === 'student' ? (
        <StudentAppointments />
      ) : (
        <TeacherAppointments />
      )}
    </div>
  );
});

Appointments.displayName = 'Appointments';
export default Appointments;
