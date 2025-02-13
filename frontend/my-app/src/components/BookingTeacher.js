import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ProfilePictureUploader from './ProfilePictureUploader';
import { getProfilePictureUrl } from '../utils/utils';

function BookingTeacher({ closeModal }) {
  const [teacherID, setTeacherID] = useState('');
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [schedule, setSchedule] = useState('');
  const [venue, setVenue] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [profileDetails, setProfileDetails] = useState({ name: '', id: '', role: '', department: '' });
  const [departmentName, setDepartmentName] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // New modal states
  const modalFileInputRef = useRef(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [modalStep, setModalStep] = useState('upload');
  const [modalSelectedFile, setModalSelectedFile] = useState(null);

  const handleProfilePictureClick = () => {
    setShowProfileModal(true);
    setModalStep('upload');
  };

  const onModalSelectFile = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setModalSelectedFile(e.target.files[0]);
      setModalStep('crop');
    }
  };

  useEffect(() => {
    const storedTeacherID = localStorage.getItem('teacherID');
    if (location.state?.teacherID) {
      setTeacherID(location.state.teacherID);
      localStorage.setItem('teacherID', location.state.teacherID);
    } else if (storedTeacherID) {
      setTeacherID(storedTeacherID);
    }
  }, [location]);

  useEffect(() => {
    if (profileDetails.department && profileDetails.department.startsWith("/departments/")) {
      const deptID = profileDetails.department.split("/").pop();
      fetch(`http://localhost:5001/account/departments`)
        .then(response => response.json())
        .then(data => {
          const dept = data.find(item => item.departmentID === deptID);
          setDepartmentName(dept ? dept.departmentName : 'Unknown Department');
        })
        .catch(err => {
          console.error(err);
          setDepartmentName('Unknown Department');
        });
    } else {
      setDepartmentName(profileDetails.department || 'Unknown Department');
    }
  }, [profileDetails.department]);

  return (
    <div className="max-w-3xl mx-auto p-8 bg-white rounded-lg">
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

      <div className="mb-4 relative">
        <label className="block text-gray-700 font-medium mb-1">Search Students:</label>
        <div className="flex flex-wrap items-center gap-2 border border-gray-300 rounded-lg px-3 py-2">
          {selectedStudents.map(studentId => {
            const student = students.find(s => s.id === studentId);
            const studentProfile = getProfilePictureUrl(student.profile_picture);
            return student ? (
              <div key={studentId} className="bg-blue-100 text-blue-800 px-2 py-1 rounded flex items-center">
                <img 
                  src={studentProfile} 
                  alt="Profile" 
                  className="rounded-full w-6 h-6 mr-1" 
                />
                <span>{student.firstName} {student.lastName}</span>
                <button 
                  onClick={() => setSelectedStudents(selectedStudents.filter(id => id !== studentId))}
                  className="ml-1 text-red-500"
                >
                  x
                </button>
              </div>
            ) : null;
          })}
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name"
            className="flex-grow min-w-[150px] focus:outline-none"
          />
        </div>
        {searchTerm && (
          <ul className="absolute z-10 bg-white border border-gray-300 rounded-lg mt-1 max-h-40 overflow-y-auto w-full shadow-md">
            {students
              .filter(student => {
                const fullName = `${student.firstName} {student.lastName}`.toLowerCase();
                return fullName.includes(searchTerm.toLowerCase());
              })
              .map(student => {
                const studentProfile = getProfilePictureUrl(student.profile_picture);
                return (
                  <li 
                    key={student.id} 
                    onClick={() => {
                      if (!selectedStudents.includes(student.id)) {
                        setSelectedStudents([...selectedStudents, student.id]);
                      }
                      setSearchTerm(''); // Clear search term after selection
                    }} 
                    className="px-3 py-2 cursor-pointer hover:bg-gray-200 flex items-center"
                  >
                    <img 
                      src={studentProfile} 
                      alt="Profile" 
                      className="rounded-full w-6 h-6 mr-1" 
                    />
                    <span>{student.firstName} {student.lastName} ({student.program} {student.year_section})</span>
                  </li>
                );
              })}
          </ul>
        )}
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-1">Select Schedule:</label>
        <input type="datetime-local" value={schedule} onChange={(e) => setSchedule(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-1">Venue:</label>
        <input type="text" placeholder="Enter venue" value={venue} onChange={(e) => setVenue(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      <button className="bg-blue-500 text-white px-4 py-2 rounded-lg">
        Book Appointment
      </button>
    </div>
  );
}

export default BookingTeacher;
