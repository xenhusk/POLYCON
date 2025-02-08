import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Sidebar.css'; // Import the CSS file
// Placeholder imports for SVG icons
import { ReactComponent as HomeIcon } from './icons/home.svg';
import { ReactComponent as UpcomingIcon } from './icons/consultation.svg';
import { ReactComponent as PastIcon } from './icons/past_consultation.svg';
import { ReactComponent as GradesIcon } from './icons/grade.svg';
import { ReactComponent as BellIcon } from './icons/bell.svg';
import { ReactComponent as SettingsIcon } from './icons/setting.svg';
import logo from './icons/logo2.png';
// Import missing icons from react-icons/fa
import { FaHome, FaGraduationCap, FaClipboardList, FaUser, FaUsers, FaCog } from 'react-icons/fa'; // Added FaUsers, FaCog
// NEW: helper for profile picture
import { getProfilePictureUrl } from '../utils/utils';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [userRole, setUserRole] = useState('');
  // NEW: state for profile picture URL
  const [profilePicture, setProfilePicture] = useState('');
  const [userDetails, setUserDetails] = useState(null);
  const [activeItem, setActiveItem] = useState('dashboard'); // Changed from empty string to 'dashboard'

  useEffect(() => {
    // Assume userRole is stored in localStorage (e.g., "student" or "faculty")
    const role = localStorage.getItem('userRole') || 'student';
    setUserRole(role);
  }, []);

  // NEW: retrieve profile picture using the API-based placeholder logic
  useEffect(() => {
    const storedPic = localStorage.getItem('profile_picture');
    setProfilePicture(getProfilePictureUrl(storedPic));
  }, []);

  useEffect(() => {
    const fetchUserDetails = async () => {
      const email = localStorage.getItem('userEmail');
      const studentID = localStorage.getItem('studentID');
      const teacherID = localStorage.getItem('teacherID');
      const userID = studentID || teacherID;

      if (email && userID) {
        try {
          // Update endpoint URL for fetching user details
          const response = await fetch(`http://localhost:5001/user/get_user?userID=${userID}`);
          const userData = await response.json();
          
          if (userRole === 'student') {
            // Update endpoint URL for fetching student details
            const studentResponse = await fetch(`http://localhost:5001/user/get_student_details?studentID=${userID}`);
            const studentData = await studentResponse.json();
            setUserDetails({
              ...userData,
              program: studentData.program,
              year_section: studentData.year_section
            });
          } else {
            setUserDetails(userData);
          }
          
          if (userData.profile_picture) {
            setProfilePicture(userData.profile_picture);
          }
        } catch (error) {
          console.error('Error fetching user details:', error);
        }
      }
    };
    fetchUserDetails();
  }, [userRole]);

  // Helper to render a menu item with an icon and a label that fades in
  const renderMenuItem = (id, IconComponent, label) => (
    <li 
      className={`sidebar-item relative h-9 flex items-center cursor-pointer px-2 ${  // Changed px-3 to px-2
        activeItem === id ? 'bg-white outline outline-3 outline-[#54BEFF]' : ''
      }`}
      onClick={() => setActiveItem(id)}
    >
      <div className="flex-shrink-0 -translate-y-[0px]"> {/* Changed -mb-1 to -translate-y-[2px] for better vertical alignment */}
        <IconComponent className={`w-6 h-6 icon-white ${
          activeItem === id ? 'active-icon' : ''
        }`} />
      </div>
      <span className={`sidebar-label transition-opacity duration-200 ${
        isOpen ? "opacity-100" : "opacity-0"
      } ${activeItem === id ? 'text-[#057DCD]' : ''}`}>
        {label}
      </span>
    </li>
  );

  return (
    <div 
      className={`bg-[#057DCD] h-screen p-5 pt-8 relative transition-all duration-300 ${isOpen ? 'w-64' : 'w-20'}`}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {/* Return to original logo placement but with fixed size */}
      <div className="flex items-center mb-10">
        <div className="w-20 min-w-[5rem] -ml-5">
          <img src={logo} alt="Logo" className="w-full" />
        </div>
        <div className={`transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
          <h1 className="text-white font-bold text-xl">Polycon</h1>
        </div>
      </div>

      {userRole === 'student' && (
        <ul className="mt-2 space-y-3"> {/* Changed from mt-6 to mt-2 */}
          {renderMenuItem("dashboard", HomeIcon, "Home")}
          {renderMenuItem("upcoming", UpcomingIcon, "Upcoming Consultations")}
          {renderMenuItem("past", PastIcon, "Past Consultations")}
          {renderMenuItem("grades", GradesIcon, "Grades")}
        </ul>
      )}

      {userRole === 'faculty' && (
        <ul className="mt-2 space-y-3"> {/* Changed from mt-6 to mt-2 */}
          {renderMenuItem("dashboard", () => <FaHome size={24} className="icon-white" />, "Dashboard")}
          {renderMenuItem("addgrade", () => <FaGraduationCap size={24} className="icon-white" />, "Add Grade")}
          {renderMenuItem("booking", () => <FaClipboardList size={24} className="icon-white" />, "Booking Panel")}
          {renderMenuItem("profile", () => <FaUser size={24} className="icon-white" />, "Profile")}
        </ul>
      )}

      {userRole === 'admin' && (
        <ul className="mt-2 space-y-3"> {/* Changed from mt-6 to mt-2 */}
          {renderMenuItem("dashboard", () => <FaHome size={24} className="icon-white" />, "Dashboard")}
          {renderMenuItem("users", () => <FaUsers size={24} className="icon-white" />, "Manage Users")}
          {renderMenuItem("settings", () => <FaCog size={24} className="icon-white" />, "Settings")}
        </ul>
      )}

      {/* Bell and Settings container - stacked vertically with fade effect */}
      <div className="absolute bottom-32 left-0 pl-7">
        <ul className="flex flex-col items-center space-y-4">
          <li className={`no-hover-item relative h-8 flex items-center cursor-pointer transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
            <BellIcon className="w-6 h-6 bell-icon -mr-2" />
          </li>
          <li className={`no-hover-item relative h-8 flex items-center cursor-pointer transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
            <SettingsIcon className="w-6 h-6 justify -mr-2" />
          </li>
        </ul>
      </div>

      {/* Profile photo and user info container */}
      <div className="absolute bottom-10 left-0 pl-3 w-full pr-2">
        <div className="flex items-center space-x-2">
          <div className="flex-shrink-0">
            <div className="rounded-full p-1 bg-[#54BEFF]">
              <div className="rounded-full p-1 bg-white">
                <img 
                  src={userDetails?.profile_picture || profilePicture} 
                  alt="Profile" 
                  className="rounded-full w-10 h-10"  
                />
              </div>
            </div>
          </div>
          {isOpen && userDetails && (
            <div className="flex-grow min-w-0">
              <p className="text-white text-sm font-semibold truncate">
                {userDetails.firstName} {userDetails.lastName}
              </p>
              <p className="text-gray-200 text-xs truncate">
                {userDetails.ID}
              </p>
              <p className="text-gray-200 text-xs truncate">
                {userRole === 'student' && userDetails.program && userDetails.year_section ? (
                  `${userDetails.program} ${userDetails.year_section}`
                ) : userRole === 'faculty' ? (
                  userDetails.department
                ) : (
                  'Admin'
                )}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
