import React, { useEffect, useState, useRef, useCallback } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import BookingStudent from './components/BookingStudent';
import BookingTeacher from './components/BookingTeacher';
import Session from './components/Session';
import Signup from './components/Signup';
import Login from './components/Login';
import AdminPortal from './components/AdminPortal';
import Courses from './components/Courses'; 
import AddGrade from './components/AddGrade';
import Home from './components/Home';
import AppointmentsCalendar from './components/AppointmentsCalendar';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import ProfilePictureUploader from './components/ProfilePictureUploader'; // added import
import HomeTeacher from './components/HomeTeacher'; // added import


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

  // Remove the old fileInputRef used in header; add modal-specific states
  const modalFileInputRef = useRef(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [modalStep, setModalStep] = useState('upload'); // 'upload' or 'crop'
  const [modalSelectedFile, setModalSelectedFile] = useState(null);
  const fileInputRef = useRef(null); // remains for other uses if needed

  useEffect(() => {
    const fetchUserRole = async () => {
      const storedEmail = localStorage.getItem('userEmail');
      if (storedEmail) {
        try {
          const response = await fetch(`http://localhost:5001/account/get_user_role?email=${storedEmail}`);
          const data = await response.json();
          
          if (data.role === 'faculty' && data.teacherId) {
            setTeacherId(data.teacherId);
            localStorage.setItem("teacherId", data.teacherId); // Store it for persistence
          }

          if (data.role === 'student' && location.pathname !== '/booking-student') {
            navigate('/booking-student');
          } else if (data.role === 'faculty' && location.pathname !== '/home-teacher' && location.pathname !== '/booking-teacher') {
            navigate('/home-teacher');
          } else if (data.role === 'admin' && location.pathname !== '/admin') {
            navigate('/admin');
          }
        } catch (error) {
          console.error('Error fetching user role:', error);
        }
      }
    };

    if (!teacherId) {
      fetchUserRole();
    }
  }, [navigate, location.pathname, teacherId]);

  useEffect(() => {
    const storedEmail = localStorage.getItem('userEmail');
    if (storedEmail) {
      fetch(`http://localhost:5001/account/get_user?email=${storedEmail}`)
        .then(response => response.json())
        .then(data => {
          localStorage.setItem('userID', data.id); // Ensure userID is stored
          if (data.role === 'student') {
            fetch(`http://localhost:5001/bookings/get_students`)
              .then(response => response.json())
              .then(students => {
                const student = students.find(s => s.id === data.id);
                if (student) {
                  setProfile({
                    name: `${student.firstName} ${student.lastName}`,
                    id: student.id,
                    role: 'Student',
                    program: student.program || 'Unknown Program',
                    year_section: student.year_section || 'Unknown Year/Section',
                    profile_picture: data.profile_picture || 'https://via.placeholder.com/100'
                  });
                }
              });
          } else {
            setProfile({
              name: `${data.firstName} ${data.lastName}`,
              id: data.id || data.idNumber,
              role: data.role ? data.role.charAt(0).toUpperCase() + data.role.slice(1) : '',
              department: data.department || 'Unknown Department',
              program: data.program || 'Unknown Program',
              year_section: data.year_section || 'Unknown Year/Section',
              profile_picture: data.profile_picture || 'https://via.placeholder.com/100'
            });
          }
        })
        .catch(error => console.error('Error fetching profile details:', error));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userID'); 
    localStorage.removeItem('teacherId'); // Ensure teacherId is removed
    setUser(null);
    setProfile(null);
    setTeacherId(null);
    navigate('/');
  };
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

  return (
    <div>

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
        <Route path="/appointments-calendar" element={<AppointmentsCalendar />} />
        console.log("Passing Teacher ID to HomeTeacher:", teacherId);
        <Route path="/home-teacher" element={<HomeTeacher teacherId={teacherId} />} />

      </Routes>
    </div>
  );
}

export default App;
