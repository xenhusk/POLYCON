import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom'; // Add useLocation import
import './Sidebar.css'; // Import the CSS file
// Placeholder imports for SVG icons
import { ReactComponent as HomeIcon } from './icons/home.svg';
import { ReactComponent as UpcomingIcon } from './icons/consultation.svg';
import { ReactComponent as PastIcon } from './icons/past_consultation.svg';
import { ReactComponent as GradesIcon } from './icons/grade.svg';
import { ReactComponent as BellIcon } from './icons/bell.svg';
import { ReactComponent as SettingsIcon } from './icons/setting.svg';
import { ReactComponent as ClassRecorderIcon } from './icons/classRecord.svg';
import { ReactComponent as PointerIcon } from './icons/pointer.svg'; // NEW import
import { ReactComponent as UserAdd } from './icons/user-add.svg';
import { ReactComponent as CourseAdd } from './icons/CourseAdd.svg'; 
import { ReactComponent as ProgramAdd } from './icons/Code.svg'; // NEW: import profile icon
import logo from './icons/logo2.png';
// Import missing icons from react-icons/fa
import { FaHome, FaGraduationCap, FaClipboardList, FaUser, FaUsers, FaCog } from 'react-icons/fa'; // Added FaUsers, FaCog
// NEW: helper for profile picture
import { getProfilePictureUrl } from '../utils/utils';
import ProfilePictureUploader from './ProfilePictureUploader';
import SettingsPopup from './SettingsPopup';
import NotificationTray from './NotificationTray';

const Sidebar = ({ onExpandChange }) => {
  const location = useLocation(); // Add this hook
  const [isOpen, setIsOpen] = useState(false);
  const [userRole, setUserRole] = useState('');
  // NEW: state for profile picture URL
  const [profilePicture, setProfilePicture] = useState('');
  const [userDetails, setUserDetails] = useState(null);
  const [activeItem, setActiveItem] = useState('dashboard'); // Home is default
  const [profile, setProfile] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isFrozen, setIsFrozen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsPosition, setSettingsPosition] = useState({ top: 0, left: 0 });
  const settingsButtonRef = useRef(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationPosition, setNotificationPosition] = useState({ top: 0, left: 0 });
  const bellButtonRef = useRef(null);
  const [pointerPosition, setPointerPosition] = useState(0); // NEW pointer state
  const menuItemRefs = useRef({}); // NEW ref for menu items
  const navigate = useNavigate();

  useEffect(() => {
    const userEmail = localStorage.getItem('userEmail');
    const userRole = localStorage.getItem('userRole');

    if (userEmail && userRole) {
      fetch(`http://localhost:5001/user/get_user?email=${userEmail}`)
        .then(res => res.json())
        .then(data => {
          if (userRole === 'faculty') {
            setProfile({
              name: `${data.firstName} ${data.lastName}`,
              id: data.id || data.idNumber,
              profile_picture: data.profile_picture || 'https://via.placeholder.com/100',
              role: 'Teacher'
            });
          } else {
            setProfile({
              name: `${data.firstName} ${data.lastName}`,
              id: data.id,
              profile_picture: data.profile_picture || 'https://via.placeholder.com/100',
              role: 'Student'
            });
          }
        })
        .catch(err => console.error('Error fetching profile:', err));
    }
  }, []);

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

  const fetchUserDetails = async () => {
    const email = localStorage.getItem('userEmail');
    const userRole = localStorage.getItem('userRole');
    const studentID = localStorage.getItem('studentID');
    
    if (!email) return;

    try {
      const response = await fetch(`http://localhost:5001/user/get_user?email=${email}`);
      let userData = await response.json();
      
      if (userRole === 'student' && studentID) {
        try {
          const studentResponse = await fetch(`http://localhost:5001/user/get_student_details?studentID=${studentID}`);
          if (studentResponse.ok) {
            const studentData = await studentResponse.json();
            userData = { 
              ...userData, 
              program: studentData.program,
              year_section: studentData.year_section 
            };
          }
        } catch (error) {
          console.error('Error fetching student details:', error);
        }
      } else if (userRole === 'faculty' && userData.department) {
        if (userData.department.includes('/departments/')) {
          try {
            const deptID = userData.department.split('/').pop();
            const deptResponse = await fetch(`http://localhost:5001/account/departments`);
            if (deptResponse.ok) {
              const departments = await deptResponse.json();
              const deptMatch = departments.find(d => d.departmentID === deptID);
              if (deptMatch) {
                userData.department = deptMatch.departmentName;
              }
            }
          } catch (error) {
            console.error('Error fetching department:', error);
          }
        }
      }
      
      setUserDetails(userData);
      if (userData.profile_picture) {
        setProfilePicture(userData.profile_picture);
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, []);

  // Update path mappings to include exact paths
  const menuPaths = {
    student: {
      dashboard: '/dashboard',
      appointments: '/appointments',
      past: '/history',
      grades: '/gradeview'
    },
    faculty: {
      dashboard: '/dashboard',
      classRecord: '/addgrade',
      appointments: '/appointments',
      past: '/history'
    },
    admin: {
      dashboard: '/home',
      add_users: '/admin',
      course: '/courses',
      program: '/programs'
    }
  };

  // Update the path matching useEffect
  useEffect(() => {
    const currentPath = location.pathname;
    const userMenuPaths = menuPaths[userRole] || {};
    
    // Find matching menu item by comparing paths
    const activeMenuItem = Object.entries(userMenuPaths).find(
      ([_, path]) => path === currentPath
    );

    if (activeMenuItem) {
      setActiveItem(activeMenuItem[0]);
    }
  }, [location.pathname, userRole, menuPaths]);

  // Helper to render a menu item with an icon and a label that fades in
  const renderMenuItem = (id, IconComponent, label) => (
    <li 
      ref={el => menuItemRefs.current[id] = el}
      className={`sidebar-item relative h-9 flex items-center cursor-pointer px-2 ${
        activeItem === id ? 'bg-white outline outline-3 outline-[#54BEFF] sidebar-item-active' : ''
      }`}
      onClick={() => {
        setActiveItem(id);
        const path = menuPaths[userRole]?.[id];
        if (path) {
          navigate(path);
        }
      }}
    >
      <div className="flex-shrink-0 -translate-y-[0px]">
        <IconComponent className={`w-6 h-6 icon-white ${
          activeItem === id ? 'active-icon' : ''
        }`} />
      </div>
      <span className={`sidebar-label transition-opacity duration-200 ${
        isOpen ? "opacity-100" : "opacity-0"
      } ${activeItem === id ? 'active-label' : ''}`}>
        {label}
      </span>
    </li>
  );

  // NEW: Update pointer position whenever activeItem or userRole changes
  useEffect(() => {
    const ref = menuItemRefs.current[activeItem];
    if (ref) {
      setPointerPosition(ref.offsetTop + ref.offsetHeight / 2);
    }
  }, [activeItem, userRole]);

  const handleModalClose = () => {
    // Keep sidebar expanded for a moment after modal closes
    setTimeout(() => {
      setIsFrozen(false);
    }, 200); // 200ms delay
    setShowUploadModal(false);
  };

  const handleSettingsClick = () => {
    if (settingsButtonRef.current) {
      const rect = settingsButtonRef.current.getBoundingClientRect();
      setSettingsPosition({
        // Position the popup 100px above the settings icon
        top: rect.top - 100,
        left: rect.right + 10
      });
    }
    setShowSettings(!showSettings);
  };

  const handleBellClick = () => {
    if (bellButtonRef.current) {
      const rect = bellButtonRef.current.getBoundingClientRect();
      setNotificationPosition({
        // Position higher up to prevent overflow
        top: rect.top - 300, // Increased offset to move tray higher
        left: rect.right + 10
      });
    }
    setShowNotifications(!showNotifications);
  };

  useEffect(() => {
    // Notify parent component when sidebar expansion state changes
    onExpandChange?.(isOpen || isFrozen);
  }, [isOpen, isFrozen, onExpandChange]);

  return (
    <div 
      className={`sidebar fixed top-0 left-0 bg-[#0065A8] h-screen p-5 pt-8 z-40 transition-all duration-300 ${
        isFrozen || isOpen ? 'w-64' : 'w-20'
      }`}
      onMouseEnter={() => !isFrozen && setIsOpen(true)}
      onMouseLeave={() => !isFrozen && setIsOpen(false)}
    >
      {/* NEW: Render the pointer element */}
      <div 
        className="pointer-icon" 
        style={{
          position: 'absolute',
          right: '-1.7rem', // adjust horizontal offset as needed
          top: pointerPosition,
          transform: 'translateY(-50%)',
          transition: 'top 0.3s ease'
        }}
      >
        <PointerIcon width="48" height="48" /> {/* Increased size */}
      </div>

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
          {renderMenuItem("appointments", UpcomingIcon, "Appointments")}
          {renderMenuItem("past", PastIcon, "History")}
          {renderMenuItem("grades", GradesIcon, "Grades")}
        </ul>
      )}

      {userRole === 'faculty' && (
        <ul className="mt-2 space-y-3"> {/* Changed from mt-6 to mt-2 */}
          {renderMenuItem("dashboard", HomeIcon, "Home")}
          {renderMenuItem("appointments", UpcomingIcon, "Appointments")}
          {renderMenuItem("past", PastIcon, "History")}
          {renderMenuItem("classRecord", ClassRecorderIcon, "Class Record")}
        </ul>
      )}

      {userRole === 'admin' && (
        <ul className="mt-2 space-y-3"> {/* Changed from mt-6 to mt-2 */}
          {renderMenuItem("dashboard", HomeIcon, "Home")}
          {renderMenuItem("add_users", UserAdd, "Manage Users")}
          {renderMenuItem("course", CourseAdd, "Manage Courses")}
          {renderMenuItem("program", ProgramAdd, "Manage Programs")}
        </ul>
      )}

      {/* Bell and Settings container */}
      <div className="absolute bottom-32 left-0 pl-7">
        <ul className="flex flex-col items-center space-y-4">
          <li 
            ref={bellButtonRef}
            onClick={handleBellClick}
            className={`no-hover-item relative h-8 flex items-center cursor-pointer transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
          >
            <BellIcon className="w-6 h-6 bell-icon -mr-2" />
            {/* Notification dot */}
            <span className="absolute -top-0 -right-2 h-3 w-3 bg-red-500 rounded-full"></span>
          </li>
          <li 
            ref={settingsButtonRef}
            onClick={handleSettingsClick}
            className={`no-hover-item relative h-8 flex items-center cursor-pointer transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
          >
            <SettingsIcon className="w-6 h-6 justify -mr-2" />
          </li>
        </ul>
      </div>

      {/* Notification Tray */}
      <NotificationTray 
        isVisible={showNotifications} 
        onClose={() => setShowNotifications(false)}
        position={notificationPosition}
      />

      {/* Settings Popup */}
      <SettingsPopup 
        isVisible={showSettings} 
        onClose={() => setShowSettings(false)}
        position={settingsPosition}
      />

      {/* Profile photo and user info container */}
      <div className="absolute bottom-10 left-0 pl-3 w-full pr-2">
        <div className="flex items-center space-x-2">
          <div className="flex-shrink-0">
            <div 
              className="rounded-full p-1 bg-[#54BEFF] relative group cursor-pointer"
              onClick={() => {
                setShowUploadModal(true);
                setIsFrozen(true);
              }}
            >
              <div className="rounded-full p-1 bg-white">
                <div className="relative">
                  <img 
                    src={userDetails?.profile_picture || profilePicture} 
                    alt="Profile" 
                    className="rounded-full w-10 h-10"  
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
                    <span className="text-white text-xs">Edit</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className={`flex-grow min-w-0 transform transition-all duration-300 ${
            isOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
          }`}>
            {userDetails && (
              <>
                <p className="text-white text-sm font-semibold truncate transition-opacity duration-300">
                  {userDetails.firstName} {userDetails.lastName}
                </p>
                <p className="text-gray-200 text-xs truncate transition-opacity duration-300">
                  {userDetails.ID}
                </p>
                <p className="text-gray-200 text-xs truncate transition-opacity duration-300">
                  {userRole === 'student' ? 
                    `${userDetails.program || ''} ${userDetails.year_section || ''}` :
                    userRole === 'faculty' ? 
                      userDetails.department || 'Loading...' :
                      'Admin'}
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Photo Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl">
            <ProfilePictureUploader
              onClose={handleModalClose}
              onSuccess={(newProfileUrl) => {
                fetchUserDetails();
                setProfilePicture(newProfileUrl);
                handleModalClose();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
