import React, { useState, useEffect, useRef, useContext } from 'react';
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
import { ReactComponent as DepartmentAdd } from './icons/Briefcase.svg';
import { ReactComponent as SemesterAdd } from './icons/Timer.svg';
import { ReactComponent as ComparativeIcon } from './icons/Comparative.svg';
import logo from './icons/logo2.png';
// Import missing icons from react-icons/fa
import { FaHome, FaGraduationCap, FaClipboardList, FaUser, FaUsers, FaCog } from 'react-icons/fa'; // Added FaUsers, FaCog
// NEW: helper for profile picture
import { getProfilePictureUrl } from '../utils/utils';
import ProfilePictureUploader from './ProfilePictureUploader';
import SettingsPopup from './SettingsPopup';
import NotificationTray from './NotificationTray';
import { NotificationContext } from '../context/NotificationContext'; // NEW import

const Sidebar = ({ onExpandChange }) => {
  const location = useLocation(); // Add this hook
  const [isOpen, setIsOpen] = useState(false);
  const [userRole, setUserRole] = useState('');
  // NEW: state for profile picture URL
  const [profilePicture, setProfilePicture] = useState('');
  const [userDetails, setUserDetails] = useState(null);
  const [activeItem, setActiveItem] = useState(() => {
    const role = localStorage.getItem('userRole');
    if (role === 'admin') {
      return 'homeadmin'; // Set default active item for admin
    }
    return 'dashboard'; // Default for other roles
  });
  const [profile, setProfile] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isFrozen, setIsFrozen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsPosition, setSettingsPosition] = useState({ top: 0, left: 0 });
  const settingsButtonRef = useRef(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationPosition, setNotificationPosition] = useState({ top: 0, left: 0 });
  const bellButtonRef = useRef(null);
  const [pointerPosition, setPointerPosition] = useState(0);
  const [pointerVisible, setPointerVisible] = useState(true); // Force pointer to be visible initially (not controlled by state)
  const menuItemRefs = useRef({});
  const pointerRef = useRef(null); // Add ref for the pointer element
  const navigate = useNavigate();
  const { notifications } = useContext(NotificationContext); // Change this line to use context
  const unreadCount = notifications?.filter(n => !n.isRead)?.length || 0; // Add null check

  // Add new state for mobile sidebar visibility
  const [isMobile, setIsMobile] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const sidebarRef = useRef(null);
  
  // Add the missing isMounted ref
  const isMounted = useRef(true);
  
  // Logout handler to navigate to homepage
  const handleLogoutCommand = () => {
    // Additional cleanup for Sidebar state can be done here if necessary,
    // e.g., resetting activeItem, isOpen, etc.
    // For now, the main goal is navigation.
    navigate('/');
  };
  
  // Add cleanup effect for isMounted
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  // Function to check if screen is mobile size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768); // Consider screens <= 768px as mobile
    };
    
    // Initial check
    checkScreenSize();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkScreenSize);
    
    // Cleanup function
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);
  
  // Handle clicks outside sidebar to close it on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobile && mobileOpen && sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setMobileOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobile, mobileOpen]);
  
  // Toggle sidebar on pointer click for mobile
  const handlePointerClick = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    }
  };
  
  // Notify parent when sidebar state changes
  useEffect(() => {
    if (isMobile) {
      onExpandChange?.(mobileOpen);
    } else {
      onExpandChange?.(isOpen || isFrozen);
    }
  }, [isOpen, isFrozen, mobileOpen, isMobile, onExpandChange]);

  useEffect(() => {
    const userEmail = localStorage.getItem('userEmail');
    const userRole = localStorage.getItem('userRole');

    if (userEmail && userRole) {
      fetch(`http://localhost:5001/user/get_user?email=${userEmail}`)
        .then(res => res.json())
        .then(data => {
          // Construct full URL for profile picture
          const picUrl = getProfilePictureUrl(data.profile_picture);
          setProfile({
            name: `${data.firstName} ${data.lastName}`,
            id: data.id || data.idNumber,
            profile_picture: picUrl,
            role: userRole === 'faculty' ? 'Teacher' : 'Student'
          });
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
      // Update userDetails with full URL for picture
      const fullPic = getProfilePictureUrl(userData.profile_picture);
      setUserDetails({ ...userData, profile_picture: fullPic });
      // Fallback for profilePicture state
      setProfilePicture(fullPic);
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
      homestudent: '/dashboard',
      appointments: '/appointments',
      history: '/history',
      grades: '/gradeview'
    },
    faculty: {
      dashboard: '/dashboard',
      classRecord: '/addgrade',
      appointments: '/appointments',
      past: '/history',
      comparative: '/comparative-analysis'
    },
    admin: {
      homeadmin: '/homeadmin',
      semester: '/semester-management',
      add_users: '/admin',
      course: '/courses',
      program: '/programs',
      department: '/department'
    }
  };

  // Add this new useEffect for initial admin navigation
  useEffect(() => {
    if (userRole === 'admin' && location.pathname === '/') {
      navigate('/homeadmin');
    }
  }, [userRole, location.pathname, navigate]);

  // Update the path matching useEffect to preserve active state on reload
  useEffect(() => {
    const currentPath = location.pathname;
    const userMenuPaths = menuPaths[userRole] || {};
    
    // Special handling for admin paths
    if (userRole === 'admin') {
      if (currentPath === '/') {
        setActiveItem('homeadmin');
      } else {
        // Find matching menu item by comparing paths
        const activeMenuItem = Object.entries(userMenuPaths).find(
          ([_, path]) => path === currentPath
        );
        if (activeMenuItem) {
          setActiveItem(activeMenuItem[0]);
        }
      }
    } else {
      // Handle non-admin paths as before
      const activeMenuItem = Object.entries(userMenuPaths).find(
        ([_, path]) => path === currentPath
      );
      if (activeMenuItem) {
        setActiveItem(activeMenuItem[0]);
      }
    }
  }, [location.pathname, userRole]);

  // Helper to render a menu item with an icon and a label that fades in
  const renderMenuItem = (id, IconComponent, label) => (
    <li 
      ref={el => menuItemRefs.current[id] = el}
      className={`sidebar-item relative h-9 flex items-center cursor-pointer px-2 ${
        activeItem === id ? 'bg-white outline outline-3 outline-[#54BEFF] sidebar-item-active' : ''
      }`}
      onClick={() => {
        setActiveItem(id);
        if (isMobile) setMobileOpen(false); // Close sidebar on item click in mobile
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
      <span className={`sidebar-label ${
        ((isOpen && !isMobile) || mobileOpen) ? "opacity-100" : "opacity-0"
      } ${activeItem === id ? 'active-label' : ''}`}>
        {label}
      </span>
    </li>
  );

  // NEW: Update pointer position calculation for desktop screens
  useEffect(() => {
    if (isMobile) return;

    // Don't wait, calculate immediately
    const updatePointerPosition = () => {
      const activeMenuItem = menuItemRefs.current[activeItem];
      if (activeMenuItem && sidebarRef.current) {
        // Simple calculation based on offset from top
        const position = activeMenuItem.offsetTop + (activeMenuItem.offsetHeight / 2);
        setPointerPosition(position);
        setPointerVisible(true);
        
        console.log("Desktop pointer updated:", {
          activeItem,
          position,
          element: activeMenuItem
        });
      }
    };
    
    // Run immediately after render
    updatePointerPosition();
    
    // Also add a small delay to catch any layout shifts
    const timer = setTimeout(updatePointerPosition, 100);
    return () => clearTimeout(timer);
  }, [activeItem, isMobile]);

  // Add resize observer for more accurate pointer positioning
  useEffect(() => {
    if (isMobile) return;
    
    const resizeObserver = new ResizeObserver(() => {
      const ref = menuItemRefs.current[activeItem];
      if (ref) {
        const pos = ref.offsetTop + (ref.offsetHeight / 2);
        setPointerPosition(pos);
      }
    });
    
    // Observe the entire sidebar to detect any size changes
    if (sidebarRef.current) {
      resizeObserver.observe(sidebarRef.current);
    }
    
    return () => resizeObserver.disconnect();
  }, [activeItem, isMobile]);

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

  // Derive display name and picture for avatar (initial or fetched)
  const initialName = profile?.name || '';
  const initialPic = profile?.profile_picture || profilePicture;  // from localStorage fallback
  const displayName = userDetails?.fullName || initialName;
  const displayPic = userDetails?.profile_picture || initialPic;

  return (
    <>
      {/* MOBILE: Standalone pointer when sidebar is closed */}
      {isMobile && !mobileOpen && (
        <div 
          className="fixed top-0 left-0 h-screen z-40 flex items-center cursor-pointer"
          style={{ width: '30px' }}
          onClick={handlePointerClick}
        >
          <div 
            className="mobile-pointer-icon" 
            style={{ 
              position: 'absolute', 
              right: '-7px',
              pointerEvents: 'all' 
            }}
          >
            <PointerIcon width="48" height="48" className="fill-current text-[#057DCD]" />
          </div>
        </div>
      )}
      
      {/* Main sidebar */}
      <div 
        ref={sidebarRef}
        className={`sidebar fixed top-0 left-0 bg-[#057DCD] h-screen p-5 pt-8 z-40 transition-all duration-300 ${
          isMobile 
            ? mobileOpen ? 'translate-x-0 w-64' : '-translate-x-full' 
            : (isFrozen || isOpen) ? 'w-64' : 'w-20'
        }`}
        onMouseEnter={() => !isFrozen && !isMobile && setIsOpen(true)}
        onMouseLeave={() => !isFrozen && !isMobile && setIsOpen(false)}
      >
        {/* DESKTOP: Modified to add smooth transition */}
        {!isMobile && (
          <div 
            className="pointer-icon desktop-pointer"
            style={{
              position: 'absolute',
              right: '-20px',
              top: `${pointerPosition}px`,
              transform: 'translateY(330%)',
              transition: 'top 0.3s cubic-bezier(0.4, 0, 0.2, 1)', // Added smooth transition
              zIndex: 999,
              pointerEvents: 'none',
            }}
          >
            <PointerIcon 
              width="40" 
              height="40" 
              className="fill-current text-[#057DCD]" 
            />
          </div>
        )}

        {/* For mobile: Add close button in the sidebar */}
        {isMobile && mobileOpen && (
          <button 
            className="absolute top-4 right-4 text-white z-50"
            onClick={() => setMobileOpen(false)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        )}

        {/* Rest of the sidebar content */}
        {/* ...existing logo and menu items... */}
        <div className="flex items-center mb-10">
          <div className="w-20 min-w-[5rem] -ml-5">
            <img src={logo} alt="Logo" className="w-full" />
          </div>
          <div className={`transition-opacity duration-300 ${((isOpen && !isMobile) || mobileOpen) ? 'opacity-100' : 'opacity-0'}`}>
            <h1 className="text-white font-bold text-xl">Polycon</h1>
          </div>
        </div>

        {userRole === 'student' && (
          <ul className="mt-2 space-y-3 relative">
            {renderMenuItem("homestudent", HomeIcon, "Home")}
            {renderMenuItem("appointments", UpcomingIcon, "Appointments")}
            {renderMenuItem("history", PastIcon, "History")}
            {renderMenuItem("grades", GradesIcon, "Grades")}
          </ul>
        )}

        {userRole === 'faculty' && (
          <ul className="mt-2 space-y-3 relative"> {/* Changed from mt-6 to mt-2 */}
            {renderMenuItem("dashboard", HomeIcon, "Home")}
            {renderMenuItem("appointments", UpcomingIcon, "Appointments")}
            {renderMenuItem("history", PastIcon, "History")}
            {renderMenuItem("classRecord", ClassRecorderIcon, "Class Record")}
            {renderMenuItem("comparative", ComparativeIcon, "Comparative Analysis")}
          </ul>
        )}

        {userRole === 'admin' && (
          <ul className="mt-2 space-y-3 relative"> {/* Changed from mt-6 to mt-2 */}
            {renderMenuItem("homeadmin", HomeIcon, "Home")}
            {renderMenuItem("add_users", UserAdd, "Users")}
            {renderMenuItem("course", CourseAdd, "Courses")}
            {renderMenuItem("program", ProgramAdd, "Programs")}
            {renderMenuItem("department", DepartmentAdd, "Departments")}
            {renderMenuItem("semester", SemesterAdd, "Semesters")}
          </ul>
        )}

        {/* Bell and Settings container - Fix clickability and opacity issues */}
        <div className="absolute bottom-32 left-0 pl-7 z-50">
          <ul className="flex flex-col items-center space-y-4">
            <li 
              ref={bellButtonRef}
              onClick={handleBellClick}
              className={`no-hover-item relative h-8 flex items-center cursor-pointer ${((isOpen && !isMobile) || mobileOpen) ? 'opacity-100' : 'opacity-0'}`}
            >
              <BellIcon className="w-6 h-6 bell-icon -mr-2" />
              {unreadCount > 0 && (
                <span className="absolute -top-0 -right-2 h-3 w-3 bg-red-500 rounded-full"></span>
              )}
            </li>
            <li 
              ref={settingsButtonRef}
              onClick={handleSettingsClick}
              className={`no-hover-item relative h-8 flex items-center cursor-pointer ${((isOpen && !isMobile) || mobileOpen) ? 'opacity-100' : 'opacity-0'}`}
            >
              <SettingsIcon className="w-6 h-6 justify -mr-2" />
            </li>
          </ul>
        </div>

        {/* Profile photo and user info container - Fix clickability and visibility */}
        <div className="absolute bottom-10 left-0 pl-3 w-full pr-2 z-50">
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
                      src={getProfilePictureUrl(displayPic, displayName)}
                      alt={displayName || 'Profile'}
                      className="rounded-full w-10 h-10"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
                      <span className="text-white text-xs">Edit</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className={`flex-grow min-w-0 ${((isOpen && !isMobile) || mobileOpen) ? "opacity-100" : "opacity-0"}`}>
              {userDetails && (
                <>
                  <p className="text-white text-sm font-semibold truncate">
                    {userDetails.firstName} {userDetails.lastName}
                  </p>
                  <p className="text-gray-200 text-xs truncate">
                    {userDetails.idNumber || userDetails.id}
                  </p>
                  <p className="text-gray-200 text-xs truncate">
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
      </div>

      {/* Notification and Settings popups */}
      <NotificationTray 
        isVisible={showNotifications} 
        onClose={() => setShowNotifications(false)}
        position={notificationPosition}
      />

      <SettingsPopup 
        isVisible={showSettings} 
        onClose={() => setShowSettings(false)}
        position={settingsPosition}
        onLogout={handleLogoutCommand} // Pass the logout handler
        userEmail={userDetails?.email} // Pass userEmail if needed by SettingsPopup
      />

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
    </>
  );
};

export default Sidebar;

