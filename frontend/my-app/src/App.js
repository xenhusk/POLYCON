import React, { useEffect, useState, useRef, useCallback, Suspense } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import BookingStudent from './components/BookingStudent';
import BookingTeacher from './components/BookingTeacher';
import Session from './components/Session';
import Signup from './components/Signup';
import Login from './components/Login';
import AdminPortal from './components/AdminPortal';
import Courses from './components/Courses';
import AddGrade from './components/AddGrade';
import UserHome from './pages/User_Home';  // Update import name and path
import AppointmentsCalendar from './components/AppointmentsCalendar';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import ProfilePictureUploader from './components/ProfilePictureUploader'; // added import
import HomeTeacher from './components/HomeTeacher'; // added import
import HomeStudent from './components/HomeStudent'; // Update import name and path
import Programs from './components/Programs';
import FinalDocument from './pages/finaldocument'; // add import for FinalDocument
import History from './pages/History'; // add import for History
import Departments from './components/Departments';
import HomeAdmin from './components/HomeAdmin'; // Update import name and path
import SemesterManagement from './components/SemesterManagement'; // Update import name and path

import SidebarPreview from './components/SidebarPreview'; // Import the SidebarPreview component
import Appointments from './pages/Appointments'; // Import the Appointments page
import Sidebar from './components/Sidebar';
import Home from './pages/Home'; // Update this import
import { PreloadProvider } from './context/PreloadContext';
import { AnimatePresence, motion } from 'framer-motion'; // Add framer-motion import
import BookingPopup from './components/BookingPopup'; // Add import
import GradeViewer from './components/GradeViewer';
import PreLoader from './components/PreLoader'; // Add import for PreLoader
import EnrollmentTestPage from './pages/EnrollmentTestPage'; // new import for testing enrollment modal
import EnrollmentPopup from './components/EnrollmentPopup';
import { useQueryClient } from 'react-query';
import { useFetchWithCache } from './hooks/useFetchWithCache';
import { usePrefetch } from './context/DataPrefetchContext';
import NetworkMonitor from './components/NetworkMonitor';
import { getUserIdentifiers } from "./utils/userUtils"; // Add import for getUserIdentifiers
import { ensureUserIdPersistence, recoverUserIds } from "./utils/persistUtils";
import ComparativeAnalysis from './pages/ComparativeAnalysis';
const PreloaderTest = React.lazy(() => import('./components/PagePreloader'));

// Update the variants to only include fade in (no fade out)
const getVariants = () => ({
  initial: { opacity: 0 },
  animate: { opacity: 1 }
});

// Inline component with cropping/upload logic remains unchanged
function InlineProfilePictureUploader({ initialFile, onClose }) {
  const [src, setSrc] = useState(null);
  const [crop, setCrop] = useState({ aspect: 1 });
  const [croppedImage, setCroppedImage] = useState(null);
  const [imageRef, setImageRef] = useState(null);

  // If initial file chosen, read it as data URL
  useEffect(() => {
    if (initialFile) {
      const reader = new FileReader();
      reader.addEventListener('load', () => setSrc(reader.result));
      reader.readAsDataURL(initialFile);
    }
  }, [initialFile]);

  const onImageLoaded = useCallback(img => {
    setImageRef(img);
  }, []);

  const onCropComplete = useCallback(currentCrop => {
    if (imageRef && currentCrop.width && currentCrop.height) {
      const canvas = document.createElement('canvas');
      canvas.width = 200;
      canvas.height = 200;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(
        imageRef,
        currentCrop.x,
        currentCrop.y,
        currentCrop.width,
        currentCrop.height,
        0,
        0,
        200,
        200
      );
      canvas.toBlob(blob => {
        setCroppedImage(blob);
      }, 'image/png');
    }
  }, [imageRef]);

  const uploadPicture = async () => {
    if (!croppedImage) return;
    const formData = new FormData();
    formData.append('picture', croppedImage, 'profile.png');
    const userID = localStorage.getItem('userID') || localStorage.getItem('userEmail');
    formData.append('user_id', userID);
    try {
      const response = await fetch('http://localhost:5001/profile/upload_profile_picture', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (response.ok) {
        alert('Profile picture uploaded!');
        onClose();
      } else {
        alert(`Upload failed: ${data.error}`);
      }
    } catch (error) {
      console.error('Error uploading picture:', error);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">Crop & Upload Profile Picture</h2>
      {src && (
        <ReactCrop
          src={src}
          crop={crop}
          onImageLoaded={onImageLoaded}
          onComplete={onCropComplete}
          onChange={newCrop => setCrop(newCrop)}
        />
      )}
      {croppedImage && (
        <div className="mt-4">
          <p>Preview:</p>
          <img src={URL.createObjectURL(croppedImage)} alt="Cropped" className="w-48 h-48" />
        </div>
      )}
      <div className="mt-4 flex space-x-4">
        <button onClick={uploadPicture} className="bg-blue-500 text-white px-4 py-2 rounded">
          Upload
        </button>
        <button onClick={onClose} className="bg-gray-300 text-black px-4 py-2 rounded">
          Cancel
        </button>
      </div>
    </div>
  );
}

function App() {
  // Run ID persistence check and recovery when App loads
  useEffect(() => {
    const runRecovery = async () => {
      ensureUserIdPersistence();
      
      const needsRecovery = 
        localStorage.getItem('isAuthenticated') === 'true' && 
        (!localStorage.getItem('userId') || 
         !localStorage.getItem('studentID') || 
         !localStorage.getItem('teacherID'));
      
      if (needsRecovery) {
        console.log("App detected missing IDs, running recovery...");
        const recovered = await recoverUserIds();
        if (recovered) {
          console.log("Recovery successful, reloading app state...");
          // Force a state update to re-render with recovered IDs
          setLoggedIn(!!localStorage.getItem('userEmail'));
          ensureUserIdPersistence();
        }
      }
    };
    
    runRecovery();
  }, []);

  // Run ID persistence check immediately when App loads
  useEffect(() => {
    ensureUserIdPersistence();
    console.log("App mounted - localStorage state:", {
      userEmail: localStorage.getItem('userEmail'),
      userId: localStorage.getItem('userId'),
      userID: localStorage.getItem('userID'),
      studentId: localStorage.getItem('studentId'),
      studentID: localStorage.getItem('studentID'),
      teacherId: localStorage.getItem('teacherId'),
      teacherID: localStorage.getItem('teacherID'),
      isAuthenticated: localStorage.getItem('isAuthenticated'),
      userRole: localStorage.getItem('userRole'),
    });
  }, []);

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [teacherId, setTeacherId] = useState(localStorage.getItem("teacherId") || null);
  const navigate = useNavigate();
  const location = useLocation();
  const [userRole, setUserRole] = useState('');
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  // NEW state to control overlay visibility
  const [showOverlay, setShowOverlay] = useState(true);
  // NEW: Initialize loggedIn based on localStorage.
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem('userEmail'));
  const [preloadAttempted, setPreloadAttempted] = useState(false); // Track if preload was attempted

  // List of routes that should not trigger role fetching
  const noRoleFetchPaths = ['/appointments', '/someOtherRolelessPage'];

  // Remove the old fileInputRef used in header; add modal-specific states
  const modalFileInputRef = useRef(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [modalStep, setModalStep] = useState('upload'); // 'upload' or 'crop'
  const [modalSelectedFile, setModalSelectedFile] = useState(null);
  const fileInputRef = useRef(null); // remains for other uses if needed

  // Access React Query client for manual operations
  const queryClient = useQueryClient();
  const { prefetchStatus, triggerPrefetch } = usePrefetch();
  
  // Use cached data fetching for user role
  const storedEmail = localStorage.getItem('userEmail');
  const { data: userRoleData } = useFetchWithCache(
    ['userRole', storedEmail], 
    storedEmail ? `http://localhost:5001/account/get_user_role?email=${storedEmail}` : null,
    {
      enabled: !!storedEmail && !noRoleFetchPaths.includes(location.pathname),
      onSuccess: (data) => setUserRole(data.role)
    }
  );
  
  // Use cached data fetching for user details
  const { data: userData } = useFetchWithCache(
    ['userData', storedEmail],
    storedEmail ? `http://localhost:5001/user/get_user?email=${storedEmail}` : null,
    {
      enabled: !!storedEmail,
      onSuccess: (data) => {
        if (data) {
          // Log full response to see what comes back
          console.log("User data fetched:", data);
          if (data.idNumber) {
            localStorage.setItem('userID', data.idNumber);
            localStorage.setItem('userId', data.idNumber);
          } else {
            console.error("Fetched user data has no valid idNumber:", data);
          }
          
          const role = userRoleData?.role || localStorage.getItem('userRole');
          if (role === 'student') {
            if (data.idNumber) {
              localStorage.setItem('studentID', data.idNumber);
              localStorage.setItem('studentId', data.idNumber);
            } else {
              console.error("Fetched student data has no valid idNumber:", data);
            }
            setProfile({
              name: `${data.firstName} ${data.lastName}`,
              id: data.id,
              role: 'Student',
              program: data.program || 'Unknown Program',
              year_section: data.year_section || 'Unknown Year/Section',
              profile_picture: data.profile_picture || 'https://via.placeholder.com/100'
            });
          } else if (role === 'faculty') {
            if (data.idNumber) {
              localStorage.setItem('teacherID', data.idNumber);
              localStorage.setItem('teacherId', data.idNumber);
              localStorage.setItem('facultyID', data.idNumber);
            } else {
              console.error("Fetched faculty data has no valid idNumber:", data);
            }
            setProfile({
              name: `${data.firstName} ${data.lastName}`,
              id: data.id || data.idNumber,
              role: 'Teacher',
              department: data.department,
              profile_picture: data.profile_picture || 'https://via.placeholder.com/100'
            });
          } else if (role) {
            setProfile({
              name: `${data.firstName} ${data.lastName}`,
              id: data.id || data.idNumber,
              role: role.charAt(0).toUpperCase() + role.slice(1),
              profile_picture: data.profile_picture || 'https://via.placeholder.com/100'
            });
          }
          
          // Ensure persistence after user data is loaded
          ensureUserIdPersistence();
        }
      }
    }
  );
  
  // Use prefetch status for loading indicator
  useEffect(() => {
    if (prefetchStatus.isPrefetching) {
      setLoadingProgress(prefetchStatus.progress);
      setIsLoading(true);
    } else if (prefetchStatus.completed === prefetchStatus.total && prefetchStatus.total > 0) {
      setLoadingProgress(100);
      setTimeout(() => {
        setIsLoading(false);
        setShowOverlay(false);
      }, 500);
    }
  }, [prefetchStatus]);

  useEffect(() => {
    // Only fetch role if current pathname is not in noRoleFetchPaths
    if (!noRoleFetchPaths.includes(location.pathname)) {
      const storedEmail = localStorage.getItem('userEmail');
      if (storedEmail) {
        fetch(`http://localhost:5001/account/get_user_role?email=${storedEmail}`)
          .then(res => res.json())
          .then(data => setUserRole(data.role))
          .catch(err => console.error('Error fetching user role:', err));
      }
    }
  }, [location.pathname]);

  useEffect(() => {
    const storedEmail = localStorage.getItem('userEmail');
    if (storedEmail) {
      // First get the user role
      fetch(`http://localhost:5001/account/get_user_role?email=${storedEmail}`)
        .then(res => res.json())
        .then(roleData => {
          const role = roleData.role;

          // Then fetch user details based on role
          fetch(`http://localhost:5001/user/get_user?email=${storedEmail}`)
            .then(response => response.json())
            .then(data => {
              localStorage.setItem('userID', data.id);

              if (role === 'faculty') {
                setProfile({
                  name: `${data.firstName} ${data.lastName}`,
                  id: data.id || data.idNumber,
                  role: 'Teacher',
                  department: data.department,
                  profile_picture: data.profile_picture || 'https://via.placeholder.com/100'
                });
              } else if (role === 'student') {
                // Store enrollment status from user details
                localStorage.setItem('isEnrolled', data.isEnrolled ? "true" : "false");
                setProfile({
                  name: `${data.firstName} ${data.lastName}`,
                  id: data.id,
                  role: 'Student',
                  program: data.program || 'Unknown Program',
                  year_section: data.year_section || 'Unknown Year/Section',
                  profile_picture: data.profile_picture || 'https://via.placeholder.com/100'
                });
              } else {
                // Handle admin or other roles
                setProfile({
                  name: `${data.firstName} ${data.lastName}`,
                  id: data.id || data.idNumber,
                  role: role.charAt(0).toUpperCase() + role.slice(1),
                  profile_picture: data.profile_picture || 'https://via.placeholder.com/100'
                });
              }
            });
        })
        .catch(error => console.error('Error fetching user role:', error));
    }
  }, []);

  // NEW effect for overlay fade-out
  useEffect(() => {
    if (!isLoading && profile) {
      // When loading completes, initiate fade-out transition
      setTimeout(() => {
        setShowOverlay(false);
      }, 500); // 500ms fade-out duration
    }
  }, [isLoading, profile]);

  // NEW: Effect to disable scrollbar while preloader is active
  useEffect(() => {
    document.body.style.overflow = isLoading || !profile ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isLoading, profile]);

  // Clicking the profile placeholder now triggers the modal popup
  const handleProfilePictureClick = () => {
    setShowProfileModal(true);
    setModalStep('upload');
  };

  // When file is selected within the modal, move to crop step
  const onModalSelectFile = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setModalSelectedFile(e.target.files[0]);
      setModalStep('crop');
    }
  };

  // Update the preload effect with better error handling and state management
  useEffect(() => {
    // Set body overflow to hidden when preloader is active
    
    // Don't attempt preload if not logged in
    if (!loggedIn) {
      setIsLoading(false);
      setShowOverlay(false);
      document.body.style.overflow = "auto";
      return;
    }

    const userEmail = localStorage.getItem('userEmail');
    const userRole = localStorage.getItem('userRole');
    
    // Exit preload if no user credentials
    if (!userEmail || !userRole) {
      setIsLoading(false);
      setShowOverlay(false);
      document.body.style.overflow = "auto";
      return;
    }

    const userId = localStorage.getItem('userID');
    const studentId = localStorage.getItem('studentID');

    // Start preloading
    setIsLoading(true);
    setShowOverlay(true);
    setPreloadAttempted(true);
    
    const preloadAllData = async () => {
      const totalTasks = 6; // Increased number of tasks to include enrollment status
      let completedCount = 0;
      
      // Helper function to update progress bar
      const update = (taskName) => {
        completedCount++;
        const progress = Math.floor((completedCount / totalTasks) * 100);
        setLoadingProgress(progress);
        console.log(`Preloaded: ${taskName} (${completedCount}/${totalTasks})`);
      };

      try {
        // Instead of using direct fetch calls, use React Query prefetch capabilities
        const tasks = [
          // Task 1: Prefetch user data and store in query cache
          queryClient.prefetchQuery({
            queryKey: ['userData', userEmail],
            queryFn: async () => {
              const res = await fetch(`http://localhost:5001/user/get_user?email=${userEmail}`);
              if (!res.ok) throw new Error('Failed to fetch user data');
              const data = await res.json();
              return data;
            },
            staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
          }).then(() => update('user data')),
          
          // Task 2: Prefetch bookings if we have userID
          userId ? 
            queryClient.prefetchQuery({
              queryKey: ['bookings', userRole, userId, 'confirmed'],
              queryFn: async () => {
                const res = await fetch(`http://localhost:5001/bookings/get_bookings?role=${userRole}&userID=${userId}&status=confirmed`);
                if (!res.ok) throw new Error('Failed to fetch bookings');
                return res.json();
              },
              staleTime: 1000 * 60 * 2, // Consider data fresh for 2 minutes
            }).then(() => update('bookings'))
            : Promise.resolve().then(() => update('bookings (skipped)')),
          
          // Task 3: Prefetch grades if we have studentID
          studentId ? 
            queryClient.prefetchQuery({
              queryKey: ['grades', studentId],
              queryFn: async () => {
                const res = await fetch(`http://localhost:5001/grade/get_student_grades?studentID=${studentId}&schoolYear=&semester=&period=`);
                if (!res.ok) throw new Error('Failed to fetch grades');
                return res.json();
              },
              staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
            }).then(() => update('grades'))
            : Promise.resolve().then(() => update('grades (skipped)')),
          
          // Task 4: Prefetch courses
          queryClient.prefetchQuery({
            queryKey: ['courses'],
            queryFn: async () => {
              const res = await fetch(`http://localhost:5001/course/get_courses`);
              if (!res.ok) throw new Error('Failed to fetch courses');
              return res.json();
            },
            staleTime: 1000 * 60 * 10, // Consider data fresh for 10 minutes
          }).then(() => update('courses')),
          
          // Task 5: Prefetch consultation history if we have userID
          userId ? 
            queryClient.prefetchQuery({
              queryKey: ['consultation-history', userRole, userId],
              queryFn: async () => {
                // Use idNumber parameter only for backend to filter by id_number
                const res = await fetch(
                  `http://localhost:5001/consultation/get_history?role=${userRole}&idNumber=${userId}`
                );
                if (!res.ok) throw new Error('Failed to fetch consultation history');
                return res.json();
              },
              staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
            }).then(() => update('consultation history'))
            : Promise.resolve().then(() => update('consultation history (skipped)')),
            
          // Task 6: NEW - Prefetch enrollment status for students
          userRole === 'student' && studentId ? 
            queryClient.prefetchQuery({
              queryKey: ['enrollment-status', studentId],
              queryFn: async () => {
                const res = await fetch(`http://localhost:5001/enrollment/status?studentID=${studentId}`);
                if (!res.ok) throw new Error('Failed to fetch enrollment status');
                const data = await res.json();
                // Store enrollment status in localStorage for quick access
                if (typeof data.isEnrolled === 'boolean') {
                  localStorage.setItem('isEnrolled', data.isEnrolled.toString());
                }
                return data;
              },
              staleTime: 1000 * 60 * 10, // Consider data fresh for 10 minutes
            }).then(() => update('enrollment status'))
            : Promise.resolve().then(() => update('enrollment status (skipped)'))
        ];
        
        // Execute all tasks in parallel with proper error handling
        await Promise.allSettled(tasks);
        
        // Force a cache update for search results to ensure they respect enrollment status
        if (userRole === 'faculty' || userRole === 'admin') {
          queryClient.invalidateQueries({ queryKey: ['students'] });
        }
        
      } catch (error) {
        console.error("Error during preload:", error);
      } finally {
        // Ensure the loading state completes, even if there were errors
        setLoadingProgress(100);
        
        setTimeout(() => {
          setIsLoading(false);
          setShowOverlay(false);
          document.body.style.overflow = "auto";
        }, 500);
      }
    };

    preloadAllData();
    
    // Return function to cleanup when component unmounts
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [loggedIn]); // Remove user dependency since we use loggedIn state
  
  // Manual cleanup effect to prevent stuck preloader
  useEffect(() => {
    // If preloader is shown for more than 10 seconds, force hide it
    let timeoutId;
    
    if (isLoading) {
      timeoutId = setTimeout(() => {
        console.log("Preloader safety timeout triggered");
        setIsLoading(false);
        setShowOverlay(false);
        document.body.style.overflow = "auto";
      }, 10000); // 10-second safety timeout
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isLoading]);

  // Handle login success to properly trigger preload
  const handleLoginSuccess = (data) => {
    setUser(data);
    setLoggedIn(true);
    setIsLoading(true);
    setShowOverlay(true);
    setPreloadAttempted(false); // Reset for a fresh preload
    
    // Small delay before triggering prefetch
    setTimeout(() => {
      triggerPrefetch();
    }, 500);
  };

  // Add this effect to handle admin redirects
  useEffect(() => {
    const userRole = localStorage.getItem('userRole');
    if (userRole === 'admin' && window.location.pathname === '/') {
      navigate('/homeadmin');
    }
  }, []);

  // Check for missing user IDs when the app starts
  useEffect(() => {
    // Get current user identifiers
    const { userId, studentId, teacherId, role } = getUserIdentifiers();
    
    // If the user is logged in but missing role-specific IDs, fix them
    if (userId && localStorage.getItem("isAuthenticated") === "true") {
      if (role === "student" && !studentId) {
        localStorage.setItem("studentID", userId);
        console.log("Fixed missing studentID by using userId:", userId);
      }
      
      if (role === "faculty" && !teacherId) {
        localStorage.setItem("teacherID", userId);
        console.log("Fixed missing teacherID by using userId:", userId);
      }
    }
  }, []);

  // Add this effect to help debug sidebar visibility
  useEffect(() => {
    // Log the conditions that control sidebar visibility
    const userEmail = localStorage.getItem('userEmail');
    const currentPath = location.pathname;
    const shouldShowSidebar = userEmail && 
      !currentPath.includes('/session') && 
      !currentPath.includes('/finaldocument');
    
    console.log("Sidebar visibility check:", {
      userEmail,
      currentPath,
      shouldShowSidebar,
      sessionCheck: !currentPath.includes('/session'),
      docCheck: !currentPath.includes('/finaldocument')
    });
  }, [location.pathname]);

  const showDebugger = false; // Set this to false to hide the debugger

  return (
    <div className={location.pathname.includes('/session') ? '' : 'flex min-h-screen'}>
      <PreloadProvider>
        <div className="app-container flex flex-1">
          {/* Add debugging info to sidebar rendering logic */}
          {(() => {
            const userEmail = localStorage.getItem('userEmail');
            const shouldShowSidebar = userEmail && 
              !location.pathname.includes('/session') && 
              !location.pathname.includes('/finaldocument');
            
            console.log("Sidebar render attempt:", { userEmail, shouldShowSidebar });
            
            return shouldShowSidebar ? (
              <Sidebar onExpandChange={setSidebarExpanded} />
            ) : (
              <div className="hidden">Sidebar hidden - Email: {userEmail || 'none'}</div>
            );
          })()}

          <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
            localStorage.getItem('userEmail') && 
            !location.pathname.includes('/session') && 
            !location.pathname.includes('/finaldocument')
              ? sidebarExpanded
                ? 'md:ml-64' // Only apply margin on medium screens and above
                : 'md:ml-20' 
              : ''
          }`}>

            {/* New Profile Picture Modal */}
            {showProfileModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                <div className="bg-white p-6 rounded-lg shadow-lg">
                  {modalStep === 'upload' && (
                    <div>
                      <h2 className="text-xl font-bold mb-4">Upload a Profile Picture</h2>
                      <button
                        onClick={() => modalFileInputRef.current && modalFileInputRef.current.click()}
                        className="bg-blue-500 text-white px-4 py-2 rounded"
                      >
                        Choose File
                      </button>
                      <input
                        ref={modalFileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={onModalSelectFile}
                        style={{ display: 'none' }}
                      />
                      <button
                        onClick={() => setShowProfileModal(false)}
                        className="bg-gray-300 text-black px-4 py-2 rounded ml-4"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                  {modalStep === 'crop' && (
                    <ProfilePictureUploader
                      initialFile={modalSelectedFile}
                      onClose={() => {
                        setShowProfileModal(false);
                        setModalSelectedFile(null);
                      }}
                    />
                  )}
                </div>
              </div>
            )}

            <AnimatePresence>
              <motion.div
                key={location.pathname}
                variants={getVariants()}
                initial="initial"
                animate="animate"
                transition={{ duration: 0.5 }}
                className="flex-1 flex flex-col"
              >
                <Suspense fallback={<div>Loading test...</div>}>
                  <Routes>
                    {/* Public home route with redirect for logged-in users */}
                    <Route path="/" element={
                      localStorage.getItem('userEmail') ?
                        <Navigate to="/dashboard" /> :
                        <Home />
                    } />

                    {/* Auth routes with redirects */}
                    <Route path="/login" element={
                      !localStorage.getItem('userEmail') ?
                        <Login onLoginSuccess={handleLoginSuccess} /> :
                        <Navigate to="/dashboard" />
                    } />
                    <Route path="/signup" element={
                      !localStorage.getItem('userEmail') ?
                        <Signup /> :
                        <Navigate to="/dashboard" />
                    } />

                    {/* Protected dashboard route */}
                    <Route path="/dashboard" element={
                      localStorage.getItem('userEmail') ?
                        <UserHome /> :
                        <Navigate to="/" />
                    } />

                    {/* Protected routes */}
                    <Route path="/booking-student" element={
                      localStorage.getItem('userEmail') ?
                        <BookingStudent /> :
                        <Navigate to="/login" replace />
                    } />
                    <Route path="/booking-teacher" element={<BookingTeacher />} />
                    <Route path="/session" element={<Session />} />
                    <Route path="/admin" element={<AdminPortal />} />
                    <Route path="/courses" element={<Courses />} />
                    <Route path="/addgrade" element={<AddGrade />} />
                    <Route path="/appointments-calendar" element={<AppointmentsCalendar />} />
                    <Route path="/sidebar-preview" element={<SidebarPreview />} /> {/* Add this route */}
                    <Route path="/appointments" element={<Appointments />} /> {/* Add this route */}
                    <Route path="/home-teacher" element={<HomeTeacher />} /> {/* Add this route */}
                    <Route path="/gradeview" element={<GradeViewer />} /> {/* Add this route */}
                    <Route path="/programs" element={<Programs />} /> {/* Add this route */}
                    <Route path="/finaldocument" element={<FinalDocument />} /> {/* New route */}
                    <Route path="/history" element={<History />} /> {/* New route */}
                    <Route path="/department" element={<Departments />} /> {/* New route */}
                    <Route path="/preloader-test" element={<PreloaderTest />} /> {/* Add this line */}
                    <Route path="/homeadmin" element={<HomeAdmin />} />
                    <Route path="/homestudent" element={<HomeStudent />} />
                    <Route path="/enrollment-test" element={<EnrollmentTestPage />} /> {/* new test route */}
                    <Route path="/semester-management" element={<SemesterManagement />} /> {/* Update this line */}
                    <Route path="/comparative-analysis" element={<ComparativeAnalysis />} />
                  </Routes>
                </Suspense>
              </motion.div>
            </AnimatePresence>
          </div>
        
          {/* Only show BookingPopup and EnrollmentPopup if not on session or finaldocument page */}
          {!location.pathname.includes('/session') &&
            !location.pathname.includes('/finaldocument') && (
              <>
                <BookingPopup />
                {userRole === 'faculty' && <EnrollmentPopup />} {/* Only show for faculty */}
              </>
            )}
        </div>
      
        {/* NEW: Show preloader overlay only when authenticated, not on Session or Final Document pages */}
        { localStorage.getItem('userEmail') &&
          !location.pathname.includes('/session') &&
          !location.pathname.includes('/finaldocument') &&
          (isLoading || !profile || showOverlay) && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'rgba(255,255,255,0.8)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'opacity 0.5s ease',
              opacity: isLoading || !profile ? 1 : 0
            }}>
              <PreLoader progress={loadingProgress} />
            </div>
          )
        }
        
        {/* Network Monitor with toggle button */}
        <NetworkMonitor visible={true} />
        
        {/* REMOVE OR MODIFY THIS LINE - you can either:
            1. Comment it out entirely: */}
        {/* {process.env.NODE_ENV === 'development' && <NotificationDebugger />} */}
        {/* OR 2. Set it to always be hidden: */}
        {/* {false && <NotificationDebugger />} */}
        {/* OR 3. Pass a prop to make it start hidden: */}
        {/* {showDebugger && process.env.NODE_ENV === 'development' && <NotificationDebugger />} */}
      </PreloadProvider>
    </div>
  );
}

export default App;
