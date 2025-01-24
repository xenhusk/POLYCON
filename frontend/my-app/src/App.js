import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import BookingStudent from './components/BookingStudent';
import BookingTeacher from './components/BookingTeacher';
import Session from './components/Session';

function App() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">POLYCON Consultation System</h1>

      {/* Navigation Links */}
      <nav className="space-x-4">
        <Link to="/booking-student" className="text-blue-500">Booking Student</Link>
        <Link to="/booking-teacher" className="text-blue-500">Booking Teacher</Link>
        <Link to="/session" className="text-blue-500">Session</Link>
      </nav>

      {/* Define Routes */}
      <Routes>
        <Route path="/" element={<h2>Welcome to POLYCON System</h2>} />
        <Route path="/booking-student" element={<BookingStudent />} />
        <Route path="/booking-teacher" element={<BookingTeacher />} />
        <Route path="/session" element={<Session />} />
      </Routes>
    </div>
  );
}

export default App;
