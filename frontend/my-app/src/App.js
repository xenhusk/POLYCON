import React, { useEffect, useState } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import BookingStudent from './components/BookingStudent';
import BookingTeacher from './components/BookingTeacher';
import Session from './components/Session';
import Signup from './components/Signup';
import Login from './components/Login';
import AdminPortal from './components/AdminPortal';
import Courses from './components/Courses'; 
import AddGrade from './components/AddGrade';
import Home from './components/Home';

function App() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

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
            navigate('/admin');
          }
        } catch (error) {
          console.error('Error fetching user role:', error);
        }
      }
    };

    // Only fetch user role if not on the session page
    if (location.pathname !== '/session' && location.pathname !== '/courses' && location.pathname !== '/addgrade') {
      fetchUserRole();
    }
  }, [navigate, location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('userEmail');
    setUser(null);
    navigate('/');
  };

  return (
    <div className="container mx-auto">
      {/* { (location.pathname !== '/login'
        && location.pathname !== '/signup'
        && location.pathname !== '/booking-student'
        && location.pathname !== '/booking-teacher'
        && location.pathname !== '/admin'
        && location.pathname !== '/session'
        && location.pathname !== '/admin-portal'
        && location.pathname !== '/courses'
        && location.pathname !== '/addgrade'
        && location.pathname !== '/home' )&& ( // Allow access to session page
          <div>
            <h2 className="text-2xl font-bold text-center mb-4">Welcome to POLYCON System</h2>

            {user ? (
              <div className="flex justify-between items-center">
                <p className="text-center">Logged in as {user.email}</p>
                <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded">Logout</button>
              </div>
            ) : (
              <div className="flex justify-center gap-4">
                <Link to="/login" className="bg-blue-500 text-white px-4 py-2 rounded">Login</Link>
                <Link to="/signup" className="bg-green-500 text-white px-4 py-2 rounded">Signup</Link>
              </div>
            )}
          </div>
        )} */}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/booking-student" element={<BookingStudent />} />
        <Route path="/booking-teacher" element={<BookingTeacher />} />
        <Route path="/session" element={<Session />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login onLoginSuccess={setUser} />} />
        <Route path="/admin" element={<AdminPortal />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/addgrade" element={<AddGrade />} />
      </Routes>
    </div>
  );
}

export default App;
