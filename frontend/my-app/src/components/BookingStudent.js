import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ProfilePictureUploader from './ProfilePictureUploader';
import { fetchStudentDetails } from '../utils/fetchStudentDetails';
import { getProfilePictureUrl } from '../utils/utils';

function BookingStudent({ closeModal }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [studentID, setStudentID] = useState('');
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [selectedTeacherName, setSelectedTeacherName] = useState('');
  const [selectedTeacherProfile, setSelectedTeacherProfile] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [teacherSearchTerm, setTeacherSearchTerm] = useState('');
  const [profileDetails, setProfileDetails] = useState({ name: '', id: '', role: '', program: '', year_section: '' });
  const modalFileInputRef = useRef(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [modalStep, setModalStep] = useState('upload');
  const [modalSelectedFile, setModalSelectedFile] = useState(null);

  useEffect(() => {
    const storedStudentID = localStorage.getItem('studentID');
    if (location.state?.studentID) {
      setStudentID(location.state.studentID);
      localStorage.setItem('studentID', location.state.studentID);
    } else if (storedStudentID) {
      setStudentID(storedStudentID);
    }
  }, []);

  // Add this useEffect to fetch teachers when component mounts
  useEffect(() => {
    fetch('http://localhost:5001/get_teachers')
      .then(response => response.json())
      .then(data => setTeachers(data))
      .catch(error => console.error('Error fetching teachers:', error));
  }, []);

  return (
    <div className="p-8 bg-white rounded-lg">
      {/* Booking form section */}
      <div className="mb-4 relative">
        <label className="block text-gray-700 font-medium mb-1">Teacher:</label>
        <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2">
          {selectedTeacher && !teacherSearchTerm && (
            <div className="flex items-center gap-2">
              <img 
                src={getProfilePictureUrl(selectedTeacherProfile, selectedTeacherName)} // Construct full URL
                alt="Teacher Profile" 
                className="rounded-full w-6 h-6"
                onError={(e) => { e.target.onerror = null; e.target.src="https://avatar.iran.liara.run/public/boy?username=Ash"; }} // Fallback image
              />
              <span>{selectedTeacherName}</span>
              <button 
                onClick={() => {
                  setSelectedTeacher('');
                  setSelectedTeacherName('');
                  setSelectedTeacherProfile('');
                }}
                className="text-red-500"
              >
                x
              </button>
            </div>
          )}
          <input
            type="text"
            value={teacherSearchTerm}
            onChange={(e) => {
              setTeacherSearchTerm(e.target.value);
              setSelectedTeacher('');
              setSelectedTeacherName('');
              setSelectedTeacherProfile('');
            }}
            placeholder="Search by name"
            className="flex-grow focus:outline-none"
          />
        </div>
        {teacherSearchTerm && (
          <ul className="absolute z-10 bg-white border border-gray-300 rounded-lg mt-1 max-h-40 overflow-y-auto w-full shadow-md">
            {teachers
              .filter(teacher => {
                const fullName = `${teacher.firstName} ${teacher.lastName}`.toLowerCase();
                return fullName.includes(teacherSearchTerm.toLowerCase());
              })
              .map(teacher => (
                <li 
                  key={teacher.id} 
                  onClick={() => {
                    console.log('Selected teacher data:', teacher); // Debug log
                    setSelectedTeacher(teacher.id);
                    setSelectedTeacherName(`${teacher.firstName} ${teacher.lastName}`);
                    // Store the complete profile picture URL
                    const profilePic = teacher.profile_picture || "https://avatar.iran.liara.run/public/boy?username=Ash";
                    console.log('Setting profile picture:', profilePic); // Debug log
                    setSelectedTeacherProfile(profilePic);
                    setTeacherSearchTerm('');
                  }} 
                  className="px-3 py-2 cursor-pointer hover:bg-gray-200 flex items-center"
                >
                  <img 
                    src={teacher.profile_picture || "https://avatar.iran.liara.run/public/boy?username=Ash"}
                    alt="Profile" 
                    className="rounded-full w-6 h-6 mr-1" 
                  />
                  <span>{teacher.firstName} {teacher.lastName}</span>
                </li>
              ))}
          </ul>
        )}
      </div>

      <div className="mb-4 relative">
        <label className="block text-gray-700 font-medium mb-1">Fellow Students:</label>
        <div className="flex flex-wrap items-center gap-2 border border-gray-300 rounded-lg px-3 py-2">
          {selectedStudents.map(studentId => {
            const student = students.find(s => s.id === studentId);
            return student ? (
              <div key={studentId} className="bg-blue-100 text-blue-800 px-2 py-1 rounded flex items-center">
                <img 
                  src={getProfilePictureUrl(student.profile_picture)} 
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
              .filter(student => 
                student.id !== studentID && 
                `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map(student => (
                <li 
                  key={student.id} 
                  onClick={() => {
                    if (!selectedStudents.includes(student.id)) {
                      setSelectedStudents([...selectedStudents, student.id]);
                    }
                    setSearchTerm('');
                  }} 
                  className="px-3 py-2 cursor-pointer hover:bg-gray-200 flex items-center"
                >
                  <img 
                    src={getProfilePictureUrl(student.profile_picture)} 
                    alt="Profile" 
                    className="rounded-full w-6 h-6 mr-1" 
                  />
                  <span>{student.firstName} {student.lastName} ({student.program} {student.year_section})</span>
                </li>
              ))
            }
          </ul>
        )}
      </div>

      <div className="flex space-x-2">
        <button className="bg-blue-500 text-white px-4 py-2 rounded-lg">
          Request Appointment
        </button>
      </div>
    </div>
  );
}

export default BookingStudent;
