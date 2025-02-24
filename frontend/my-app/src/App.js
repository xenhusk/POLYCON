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
import NotificationTray from './components/NotificationTray';  // NEW import
import Toast from './components/Toast'; // Add import for Toast
import useNotifications from './hooks/useNotifications'; // Add import for useNotifications
import { NotificationProvider } from './context/NotificationContext'; // Add import for NotificationProvider
import PreLoader from './components/PreLoader'; // Add import for PreLoader
import EnrollmentTestPage from './pages/EnrollmentTestPage'; // new import for testing enrollment modal
import EnrollmentPopup from './components/EnrollmentPopup';

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
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [teacherId, setTeacherId] = useState(localStorage.getItem("teacherId") || null);
  const navigate = useNavigate();
  const location = useLocation();
  const [userRole, setUserRole] = useState('');
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);  // NEW state
  const { toast, closeToast } = useNotifications();
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  // NEW state to control overlay visibility
  const [showOverlay, setShowOverlay] = useState(true);
  // NEW: Initialize loggedIn based on localStorage.
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem('userEmail'));

  // List of routes that should not trigger role fetching
  const noRoleFetchPaths = ['/appointments', '/someOtherRolelessPage'];

  // Remove the old fileInputRef used in header; add modal-specific states
  const modalFileInputRef = useRef(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [modalStep, setModalStep] = useState('upload'); // 'upload' or 'crop'
  const [modalSelectedFile, setModalSelectedFile] = useState(null);
  const fileInputRef = useRef(null); // remains for other uses if needed

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

  // Update the preload effect to run when either loggedIn or user changes.
  useEffect(() => {
    // Remove the early return that skipped if (!user).
    if (!loggedIn) {
      setIsLoading(false);
      return;
    }
    const userEmail = localStorage.getItem('userEmail');
    const userRole = localStorage.getItem('userRole');
    if (!userEmail || !userRole) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setShowOverlay(true);
    const preloadAllData = async () => {
      const totalTasks = 5;
      let completedCount = 0;
      const update = () => {
        completedCount++;
        const progress = Math.floor((completedCount / totalTasks) * 100);
        setLoadingProgress(progress);
        console.log(`Task completed: ${completedCount}/${totalTasks} (Progress: ${progress}%)`);
      };

      const tasks = [
        fetch(`http://localhost:5001/user/get_user?email=${userEmail}`)
          .then(res => res.json())
          .then(data => { update(); return data; })
          .catch(err => { console.error(err); update(); }),
        fetch(`http://localhost:5001/bookings/get_bookings?role=${userRole}&userID=${localStorage.getItem('userID')}&status=confirmed`)
          .then(res => res.json())
          .then(data => { update(); return data; })
          .catch(err => { console.error(err); update(); }),
        fetch(`http://localhost:5001/grade/get_student_grades?studentID=${localStorage.getItem('studentID')}&schoolYear=&semester=&period=`)
          .then(res => res.json())
          .then(data => { update(); return data; })
          .catch(err => { console.error(err); update(); }),
        fetch(`http://localhost:5001/course/get_courses`)
          .then(res => res.json())
          .then(data => { update(); return data; })
          .catch(err => { console.error(err); update(); }),
        fetch(`http://localhost:5001/consultation/get_history?role=${userRole}&userID=${localStorage.getItem('userID')}`)
          .then(res => res.json())
          .then(data => { update(); return data; })
          .catch(err => { console.error(err); update(); })
      ];
      
      await Promise.all(tasks);
    };

    (async () => {
      await preloadAllData();
      setIsLoading(false);
    })();
  }, [loggedIn, user]);

  return (
    <NotificationProvider>
      <div className={location.pathname.includes('/session') ? '' : 'flex min-h-screen'}>
        <PreloadProvider>
          <div className="app-container flex flex-1">
            {localStorage.getItem('userEmail') &&
              !location.pathname.includes('/session') &&
              !location.pathname.includes('/finaldocument') && (
                <Sidebar onExpandChange={setSidebarExpanded} />
              )}

            <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${localStorage.getItem('userEmail') &&
              !location.pathname.includes('/session') &&
              !location.pathname.includes('/finaldocument')
              ? sidebarExpanded
                ? 'ml-64'
                : 'ml-20'
              : ''}`}>


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
                          <Login onLoginSuccess={(data) => { setUser(data); setLoggedIn(true); }} /> :
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
                      <Route path="/enrollment-test" element={<EnrollmentTestPage />} /> {/* new test route */}
                      <Route path="/semester-management" element={<SemesterManagement />} /> {/* Update this line */}
                    </Routes>
                  </Suspense>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
          {/* Render NotificationTray */}
          {showNotifications && (
            <NotificationTray
              isVisible={showNotifications}
              onClose={() => setShowNotifications(false)}
              position={{ top: '50px', left: 'calc(100% - 320px)' }}  // adjust as needed
            />
          )}
          {/* Only show BookingPopup and EnrollmentPopup if not on session or finaldocument page */}
          {!location.pathname.includes('/session') &&
            !location.pathname.includes('/finaldocument') && (
              <>
                <BookingPopup />
                {userRole === 'faculty' && <EnrollmentPopup />} {/* Only show for faculty */}
              </>
            )}
        </PreloadProvider>
      </div>

      {/* Toast positioned outside the Router */}
      <Toast
        message={toast.message || ''}
        isVisible={toast.visible || false}
        onClose={closeToast}
      />

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
      )}
    </NotificationProvider>
  );
}

export default App;
