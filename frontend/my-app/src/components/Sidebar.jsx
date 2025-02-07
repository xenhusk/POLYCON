import React, { useState } from 'react';
import { FaHome, FaUser, FaBell, FaCog, FaHistory, FaGraduationCap, FaClipboardList } from 'react-icons/fa';
import logo from './logo2.png';


const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className={`bg-[#057DCD] h-screen p-5 pt-8 relative transition-all duration-300 ${isOpen ? 'w-64' : 'w-20'}`}>
      <div className="absolute cursor-pointer right-3 top-9" onClick={() => setIsOpen(!isOpen)}>
        <span className={`transition-all duration-300 ${isOpen ? 'rotate-180' : ''}`}>▶</span>
      </div>

      <div className="flex items-center space-x-4">
        <img src={logo} alt="Logo" className="w-10" />
        {isOpen && <h1 className="text-white font-bold text-xl">Polycon</h1>}
      </div>

      <ul className="mt-10 space-y-6">
        <li className="flex items-center text-white space-x-3 cursor-pointer">
          <FaHome size={24} />
          {isOpen && <span>Home</span>}
        </li>
        <li className="flex items-center text-white space-x-3 cursor-pointer">
          <FaClipboardList size={24} />
          {isOpen && <span>Consultation</span>}
        </li>
        <li className="flex items-center text-white space-x-3 cursor-pointer">
          <FaHistory size={24} />
          {isOpen && <span>History</span>}
        </li>
        <li className="flex items-center text-white space-x-3 cursor-pointer">
          <FaGraduationCap size={24} />
          {isOpen && <span>Grades</span>}
        </li>
      </ul>

      <ul className="absolute bottom-10 space-y-6">
        <li className="flex items-center text-white space-x-3 cursor-pointer">
          <FaBell size={24} />
          {isOpen && <span>Notifications</span>}
        </li>
        <li className="flex items-center text-white space-x-3 cursor-pointer">
          <FaUser size={24} />
          {isOpen && <span>Profile</span>}
        </li>
        <li className="flex items-center text-white space-x-3 cursor-pointer">
          <FaCog size={24} />
          {isOpen && <span>Settings</span>}
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
