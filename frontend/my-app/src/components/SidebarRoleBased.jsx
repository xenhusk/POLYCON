import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaUser, FaClipboardList, FaBell, FaCog, FaGraduationCap, FaTools } from 'react-icons/fa';

const SidebarRoleBased = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    // Retrieve role from localStorage or set default role
    const role = localStorage.getItem('userRole') || 'student';
    setUserRole(role);
  }, []);

  // Define menu items for each role
  const menuItems = {
    student: [
      { icon: <FaHome size={24} />, text: 'Dashboard', link: '/dashboard' },
      { icon: <FaClipboardList size={24} />, text: 'Request Appointment', link: '/request' },
      { icon: <FaClipboardList size={24} />, text: 'Calendar', link: '/appointments-calendar' },
      { icon: <FaUser size={24} />, text: 'Profile', link: '/profile' },
      { icon: <FaGraduationCap size={24} />, text: 'Grades', link: '/gradeview' },
    ],
    faculty: [
      { icon: <FaHome size={24} />, text: 'Dashboard', link: '/dashboard' },
      { icon: <FaGraduationCap size={24} />, text: 'Add Grade', link: '/addgrade' },
      { icon: <FaClipboardList size={24} />, text: 'Booking Panel', link: '/teacher-booking' },
      { icon: <FaUser size={24} />, text: 'Profile', link: '/profile' },
    ],
    admin: [
      { icon: <FaTools size={24} />, text: 'Manage Users', link: '/admin' },
      { icon: <FaCog size={24} />, text: 'Manage Courses', link: '/courses' },
      { icon: <FaHome size={24} />, text: 'Dashboard', link: '/admin/dashboard' },
      { icon: <FaUser size={24} />, text: 'Department', link: '/department' },
    ]
  };

  // Fallback menu if role isn't found.
  const currentMenu = menuItems[userRole] || menuItems.student;

  return (
    <div className={`bg-[#057DCD] h-screen p-5 pt-8 relative transition-all duration-300 ${isOpen ? 'w-64' : 'w-20'}`}>
      <div className="absolute cursor-pointer right-3 top-9" onClick={() => setIsOpen(!isOpen)}>
        <span className={`transition-all duration-300 ${isOpen ? 'rotate-180' : ''}`}>▶</span>
      </div>
      <div className="mb-8">
        {/* Logo and title */}
        <div className="flex items-center space-x-4">
          {/* ... Logo image here if needed ... */}
          {isOpen && <h1 className="text-white font-bold text-xl">Polycon</h1>}
        </div>
      </div>
      <ul className="space-y-6">
        {currentMenu.map((item, index) => (
          <li key={index} className="flex items-center text-white space-x-3 cursor-pointer">
            {item.icon}
            {isOpen && <Link to={item.link}>{item.text}</Link>}
          </li>
        ))}
      </ul>
      <ul className="absolute bottom-10 space-y-6">
        <li className="flex items-center text-white space-x-3 cursor-pointer">
          <FaBell size={24} className="icon-white" /> {/* added icon-white class */}
          {isOpen && <span>Notifications</span>}
        </li>
        <li className="flex items-center text-white space-x-3 cursor-pointer">
          <FaCog size={24} className="icon-white" /> {/* added icon-white class */}
          {isOpen && <span>Settings</span>}
        </li>
      </ul>
    </div>
  );
};

export default SidebarRoleBased;
