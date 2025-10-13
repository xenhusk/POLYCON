import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ProfilePictureUploader from './ProfilePictureUploader';
import { getProfilePictureUrl } from '../utils/utils';
import API_URL from '../apiConfig';

function BookingTeacher({ closeModal }) {
  const [teacherID, setTeacherID] = useState('');
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [schedule, setSchedule] = useState('');
  const [venue, setVenue] = useState('');
  const [venueId, setVenueId] = useState('');
  const [venues, setVenues] = useState([]);
  const [loadingVenues, setLoadingVenues] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [profileDetails, setProfileDetails] = useState({ name: '', id: '', role: '', department: '' });
  const [departmentName, setDepartmentName] = useState('');
  const [isTeacherActive, setIsTeacherActive] = useState(true);
  const [studentSearchError, setStudentSearchError] = useState('');
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
      checkTeacherStatus(location.state.teacherID);
    } else if (storedTeacherID) {
      setTeacherID(storedTeacherID);
      checkTeacherStatus(storedTeacherID);
    }
  }, [location]);

  // Fetch students on component mount
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch(`${API_URL}/get_students`);
        const data = await response.json();
        setStudents(data);
      } catch (error) {
        console.error('Error fetching students:', error);
      }
    };

    fetchStudents();
  }, []);

  const checkTeacherStatus = async (teacherId) => {
    try {
      const response = await fetch(`${API_URL}/user/get_user?idNumber=${teacherId}`);
      const data = await response.json();
      setIsTeacherActive(data.isActive);
      setProfileDetails(data);
      if (!data.isActive) {
        setStudentSearchError('You are currently inactive. Cannot book consultations during semester break.');
      }
    } catch (error) {
      console.error('Error checking teacher status:', error);
      setStudentSearchError('Unable to verify teacher status. Please try again later.');
    }
  };

  // Fetch venues based on teacher's department
  const fetchVenues = async () => {
    if (!profileDetails.department) return;

    setLoadingVenues(true);
    try {
      let departmentId = null;
      
      // Extract department ID from the department field
      if (profileDetails.department.startsWith("/departments/")) {
        departmentId = profileDetails.department.split("/").pop();
      } else {
        // If it's not a URL, try to find the department by name
        const response = await fetch(`${API_URL}/departments/get_departments`);
        const departments = await response.json();
        const dept = departments.find(d => d.name === profileDetails.department);
        if (dept) {
          departmentId = dept.id;
        }
      }

      if (departmentId) {
        const response = await fetch(`${API_URL}/venues/get_venues_by_department/${departmentId}`);
        const venuesData = await response.json();
        setVenues(venuesData);
      }
    } catch (error) {
      console.error('Error fetching venues:', error);
    } finally {
      setLoadingVenues(false);
    }
  };

  useEffect(() => {
    if (profileDetails.department && profileDetails.department.startsWith("/departments/")) {
      const deptID = profileDetails.department.split("/").pop();
      fetch(`${API_URL}/account/departments`)
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
    
    // Fetch venues when department is available
    if (profileDetails.department) {
      fetchVenues();
    }
  }, [profileDetails.department]);

  const handleBookAppointment = async () => {
    if (!teacherID || selectedStudents.length === 0 || !schedule || (!venueId && !venue)) {
      setStudentSearchError('Please fill in all required fields.');
      return;
    }

    try {
      const bookingData = {
        teacherID,
        studentIDs: selectedStudents,
        schedule: new Date(schedule).toISOString(),
        venue_id: venueId === 'others' ? null : venueId,
        venue: venueId === 'others' ? venue : null,
        createdBy: teacherID,
      };

      const response = await fetch(`${API_URL}/bookings/create_booking`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData),
      });

      if (response.ok) {
        setStudentSearchError('');
        // Reset form
        setSelectedStudents([]);
        setSchedule('');
        setVenue('');
        setVenueId('');
        setSearchTerm('');
        
        // Show success message or close modal
        if (typeof closeModal === 'function') {
          closeModal();
        }
      } else {
        const errorData = await response.json();
        setStudentSearchError(errorData.error || 'Failed to book appointment.');
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      setStudentSearchError('Network error. Please try again.');
    }
  };

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

      {studentSearchError && (
        <div className="mb-4 text-red-500 text-sm">
          {studentSearchError}
        </div>
      )}

      <div className="mb-4 relative">
        <label className="block text-gray-700 font-medium mb-1">Search Students:</label>
        <div className="flex flex-wrap items-center gap-2 border border-gray-300 rounded-lg px-3 py-2">
          {selectedStudents.map(studentId => {
            const student = students.find(s => s.id === studentId);
            const studentName = student.fullName || `${student.firstName} ${student.lastName}`;
            const studentProfile = getProfilePictureUrl(student.profile_picture, studentName);
            return student ? (
              <div key={studentId} className="bg-blue-100 text-blue-800 px-2 py-1 rounded flex items-center">
                <img
                  src={studentProfile}
                  alt={studentName}
                  className="rounded-full w-6 h-6 mr-1"
                />
                <span>{studentName}</span>
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
            disabled={!isTeacherActive}
          />
        </div>
        {searchTerm && (
          <ul className="absolute z-10 bg-white border border-gray-300 rounded-lg mt-1 max-h-40 overflow-y-auto w-full shadow-md">
            {students
              .filter(student => {
                const name = (student.fullName || `${student.firstName} ${student.lastName}`).toLowerCase();
                return name.includes(searchTerm.toLowerCase());
              })
              .map(student => {
                const studentName = student.fullName || `${student.firstName} ${student.lastName}`;
                const studentProfile = getProfilePictureUrl(student.profile_picture, studentName);
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
                      alt={studentName}
                      className="rounded-full w-6 h-6 mr-1"
                    />
                    <span>{studentName} ({student.program} {student.year_section})</span>
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
        {loadingVenues ? (
          <div className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-500">
            Loading venues...
          </div>
        ) : (
          <select
            value={venueId}
            onChange={(e) => {
              setVenueId(e.target.value);
              if (e.target.value === 'others') {
                setVenue(''); // Clear venue name for custom input
              } else {
                setVenue(e.target.selectedOptions[0]?.text || '');
              }
            }}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={!isTeacherActive}
          >
            <option value="">Select a venue</option>
            {/* Available venues first */}
            {venues
              .filter(venue => venue.is_available)
              .map(venue => (
                <option key={venue.id} value={venue.id}>
                  {venue.name} (Available)
                </option>
              ))}
            {/* Unavailable venues second */}
            {venues
              .filter(venue => !venue.is_available)
              .map(venue => (
                <option key={venue.id} value={venue.id}>
                  {venue.name} (Unavailable)
                </option>
              ))}
            {/* Others option last */}
            <option value="others">Others</option>
          </select>
        )}
        {venueId === 'others' && (
          <input
            type="text"
            placeholder="Enter custom venue"
            value={venue}
            onChange={(e) => setVenue(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 mt-2"
            disabled={!isTeacherActive}
          />
        )}
      </div>

      <button 
        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed" 
        disabled={!isTeacherActive || !teacherID || selectedStudents.length === 0 || !schedule || (!venueId && !venue)}
        onClick={handleBookAppointment}
      >
        Book Appointment
      </button>
    </div>
  );
}

export default BookingTeacher;
