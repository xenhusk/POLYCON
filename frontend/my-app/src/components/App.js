import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './Login';
import Signup from './Signup';
import BookingStudent from './BookingStudent';
import BookingTeacher from './BookingTeacher';
import Session from './Session';

const App = () => {
  const [userRole, setUserRole] = useState(null);

  const handleLogin = (role) => {
    setUserRole(role);
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/signup" element={<Signup />} />
        {userRole === 'student' && <Route path="/booking-student" element={<BookingStudent />} />}
        {userRole === 'faculty' && (
          <>
            <Route path="/booking-teacher" element={<BookingTeacher />} />
            <Route path="/session" element={<Session />} />
          </>
        )}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

export default App;
