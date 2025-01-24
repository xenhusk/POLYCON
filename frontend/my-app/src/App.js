import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import BookingStudent from './components/BookingStudent';
import BookingTeacher from './components/BookingTeacher';
import Session from './components/Session';
import Signup from './components/Signup';
import Login from './components/Login';

function App() {
  return (
    <div className="container mx-auto p-4">

      {/* Define Routes */}
      <Routes>
        <Route path="/" element={<h2>Welcome to POLYCON System</h2>} />
        <Route path="/booking-student" element={<BookingStudent />} />
        <Route path="/booking-teacher" element={<BookingTeacher />} />
        <Route path="/session" element={<Session />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </div>
  );
}

export default App;
