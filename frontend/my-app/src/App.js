import React, { useEffect, useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import BookingStudent from './components/BookingStudent';
import BookingTeacher from './components/BookingTeacher';
import Session from './components/Session';
import Signup from './components/Signup';
import Login from './components/Login';

function App() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserRole = async () => {
      const storedEmail = localStorage.getItem('userEmail');
      if (storedEmail) {
        try {
          const response = await fetch(`http://localhost:5001/account/get_user_role?email=${storedEmail}`);
          const data = await response.json();
          if (data.role === 'student') {
            navigate('/booking-student');
          } else if (data.role === 'faculty') {
            navigate('/booking-teacher');
          } else if (data.role === 'admin') {
            alert('Admins do not have booking pages.');
          }
        } catch (error) {
          console.error('Error fetching user role:', error);
        }
      }
    };

    fetchUserRole();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold text-center mb-4">Welcome to POLYCON System</h2>

      {user ? (
        <p className="text-center">Logged in as {user.email}</p>
      ) : (
        <div className="flex justify-center gap-4">
          <Link to="/login" className="bg-blue-500 text-white px-4 py-2 rounded">Login</Link>
          <Link to="/signup" className="bg-green-500 text-white px-4 py-2 rounded">Signup</Link>
        </div>
      )}

      <Routes>
        <Route path="/" element={<h2>Welcome to POLYCON System</h2>} />
        <Route path="/booking-student" element={<BookingStudent />} />
        <Route path="/booking-teacher" element={<BookingTeacher />} />
        <Route path="/session" element={<Session />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login onLoginSuccess={setUser} />} />
      </Routes>
    </div>
  );
}

export default App;
