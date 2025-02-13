import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getProfilePictureUrl } from '../utils/utils';

function BookingAppointment({ closeModal, role: propRole }) {
  // Determine role setup
  const role = propRole || localStorage.getItem('userRole') || 'student';
  const navigate = useNavigate();
  const location = useLocation();
  
  // Replace full lists with search result state
  const [searchTerm, setSearchTerm] = useState('');
  // --- Modified: selectedStudents now holds full student objects ---
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [studentResults, setStudentResults] = useState([]);
  
  const [teacherSearchTerm, setTeacherSearchTerm] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [selectedTeacherName, setSelectedTeacherName] = useState('');
  const [selectedTeacherProfile, setSelectedTeacherProfile] = useState('');
  const [teacherResults, setTeacherResults] = useState([]);
  
  // Additional teacher states
  const [schedule, setSchedule] = useState('');
  const [venue, setVenue] = useState('');
  const [teacherID, setTeacherID] = useState(localStorage.getItem('teacherID') || '');
  
  // Student-specific state
  const [studentID, setStudentID] = useState(localStorage.getItem('studentID') || '');

  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const searchTimeout = useRef(null);
  const [isStudentInputFocused, setIsStudentInputFocused] = useState(false);
  const [isTeacherInputFocused, setIsTeacherInputFocused] = useState(false);

  // Debounced search function
  const debouncedSearch = (term) => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    searchTimeout.current = setTimeout(async () => {
      try {
        const res = await fetch(`http://localhost:5001/search/students?query=${encodeURIComponent(term.toLowerCase())}&page=${page}`);
        const data = await res.json();
        if (data.results) {
          setStudentResults(page === 0 ? data.results : [...studentResults, ...data.results]);
          setHasMore(data.hasMore);
        } else {
          setStudentResults([]);
          setHasMore(false);
        }
      } catch (error) {
        console.error('Search error:', error);
        setStudentResults([]);
        setHasMore(false);
      }
    }, 300); // Wait 300ms after user stops typing
  };

  // Handle search input change (unchanged logic)
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setPage(0); // Reset pagination when search term changes
    debouncedSearch(value);
  };

  // Load more results when scrolling
  const loadMore = () => {
    if (hasMore) {
      setPage(prev => prev + 1);
      debouncedSearch(searchTerm);
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, []);

  // Fetch search results for teachers on teacherSearchTerm change
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const res = await fetch(`http://localhost:5001/search/teachers?query=${encodeURIComponent(teacherSearchTerm.toLowerCase())}`);
        const data = await res.json();
        if (data.results) {
          setTeacherResults(data.results);
        } else {
          setTeacherResults([]);
        }
      } catch (error) {
        console.error('Teacher search error:', error);
        setTeacherResults([]);
      }
    };

    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    
    searchTimeout.current = setTimeout(() => {
      fetchTeachers();
    }, 300);

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [teacherSearchTerm]);

  async function submitBooking() {
    if (role === 'faculty') {
      // Validate required fields: teacherID, at least one student, schedule, and venue must be provided.
      if (!teacherID || selectedStudents.length === 0 || !schedule || !venue) {
        alert("Please fill in all fields.");
        return;
      }
      // Build payload using the required fields.
      const bookingData = {
        teacherID,                     
        // --- Modified: extract student IDs from the selected student objects ---
        studentIDs: selectedStudents.map(s => s.id),
        schedule,
        venue,
        createdBy: teacherID,
      };
      console.log("Faculty bookingData:", bookingData);
      try {
        const response = await fetch('http://localhost:5001/bookings/create_booking', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bookingData)
        });
        if (response.ok) {
          alert("Appointment booked successfully!");
          if (typeof closeModal === 'function') closeModal();
        } else {
          const errorData = await response.json();
          alert("Failed to book appointment. " + (errorData.error || ''));
        }
      } catch (error) {
        console.error('Error booking appointment:', error);
      }
    } else {
      // Validate required fields: selectedTeacher and studentID must be provided.
      if (!studentID || !selectedTeacher) {
        alert("Please fill in all fields.");
        return;
      }
      // Build payload with required keys.
      const bookingData = {
        teacherID: selectedTeacher,
        // --- Modified: include studentID plus IDs from selected student objects ---
        studentIDs: [studentID, ...selectedStudents.map(s => s.id)],
        schedule: '',
        venue: '',
        createdBy: studentID,
      };
      console.log("Student bookingData:", bookingData);
      try {
        const response = await fetch('http://localhost:5001/bookings/create_booking', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bookingData)
        });
        if (response.ok) {
          alert("Appointment request sent successfully!");
          if (typeof closeModal === 'function') closeModal();
        } else {
          const errorData = await response.json();
          alert("Failed to request appointment. " + (errorData.error || ''));
        }
      } catch (error) {
        console.error('Error requesting appointment:', error);
      }
    }
  }
  
  return (
    <div className="p-8 bg-white rounded-lg">
      {role === 'faculty' ? (
        <>
          <h2 className="text-xl font-bold mb-4">Book Appointment (Teacher)</h2>
          <div className="mb-4 relative">
            <label className="block text-gray-700 font-medium mb-1">Search Students:</label>
            <div className="flex flex-wrap items-center gap-2 border border-gray-300 rounded-lg px-3 py-2">
              {/* --- Modified: render selected student objects directly --- */}
              {selectedStudents.map(student => (
                <div key={student.id} className="bg-blue-100 text-blue-800 px-2 py-1 rounded flex items-center">
                  <img 
                    src={getProfilePictureUrl(student.profile_picture)} 
                    alt="Profile"
                    className="rounded-full w-6 h-6 mr-1" 
                  />
                  <span>{student.firstName} {student.lastName}</span>
                  <button onClick={() => setSelectedStudents(selectedStudents.filter(s => s.id !== student.id))} className="ml-1 text-red-500">
                    x
                  </button>
                </div>
              ))}
              <input 
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                onFocus={() => setIsStudentInputFocused(true)}
                onBlur={() => setTimeout(() => setIsStudentInputFocused(false), 200)}
                placeholder="Search by name"
                className="flex-grow min-w-[150px] focus:outline-none"
              />
            </div>
            {isStudentInputFocused && studentResults.length > 0 && (
              <ul className="absolute z-10 bg-white border border-gray-300 rounded-lg mt-1 max-h-40 overflow-y-auto w-full shadow-md">
                {studentResults
                  .filter(student => student.id !== studentID && !selectedStudents.some(s => s.id === student.id))
                  .map(student => (
                    <li key={student.id} 
                      onClick={() => {
                        // --- Modified: add full student object rather than just the id ---
                        if (!selectedStudents.some(s => s.id === student.id)) {
                          setSelectedStudents([...selectedStudents, student]);
                        }
                        setSearchTerm('');
                      }}
                      className="px-3 py-2 cursor-pointer hover:bg-gray-200 flex items-center">
                      <img src={getProfilePictureUrl(student.profile_picture)} alt="Profile" className="rounded-full w-6 h-6 mr-1"/>
                      <span>{student.firstName} {student.lastName}</span>
                    </li>
                ))}
              </ul>
            )}
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-1">Select Schedule:</label>
            <input type="datetime-local" value={schedule} onChange={(e) => setSchedule(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2"/>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-1">Venue:</label>
            <input type="text" placeholder="Enter venue" value={venue} onChange={(e) => setVenue(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2"/>
          </div>
        </>
      ) : (
        <>
          <h2 className="text-xl font-bold mb-4">Book Appointment (Student)</h2>
          <div className="mb-4 relative">
            <label className="block text-gray-700 font-medium mb-1">Teacher:</label>
            <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2">
              {selectedTeacher && !teacherSearchTerm && (
                <div className="flex items-center gap-2">
                  <img src={selectedTeacherProfile || 'https://avatar.iran.liara.run/public/boy?username=Ash'} alt="Teacher Profile" className="rounded-full w-6 h-6"/>
                  <span>{selectedTeacherName}</span>
                  <button onClick={() => { setSelectedTeacher(''); setSelectedTeacherName(''); setSelectedTeacherProfile(''); }} className="text-red-500">x</button>
                </div>
              )}
              <input 
                type="text"
                value={teacherSearchTerm}
                onChange={e => {
                  setTeacherSearchTerm(e.target.value);
                  setSelectedTeacher('');
                  setSelectedTeacherName('');
                  setSelectedTeacherProfile('');
                }}
                onFocus={() => setIsTeacherInputFocused(true)}
                onBlur={() => setTimeout(() => setIsTeacherInputFocused(false), 200)}
                placeholder="Search by name"
                className="flex-grow focus:outline-none"
              />
            </div>
            {isTeacherInputFocused && teacherResults.length > 0 && (
              <ul className="absolute z-10 bg-white border border-gray-300 rounded-lg mt-1 max-h-40 overflow-y-auto w-full shadow-md">
                {teacherResults.map(teacher => (
                  <li key={teacher.id} onClick={() => { 
                    setSelectedTeacher(teacher.id);
                    setSelectedTeacherName(`${teacher.firstName} ${teacher.lastName}`);
                    setSelectedTeacherProfile(teacher.profile_picture);
                    setTeacherSearchTerm('');
                  }} className="px-3 py-2 cursor-pointer hover:bg-gray-200 flex items-center">
                    <img src={getProfilePictureUrl(teacher.profile_picture)} alt="Profile" className="rounded-full w-6 h-6 mr-1"/>
                    <span>{teacher.firstName} {teacher.lastName}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="mb-4 relative">
            <label className="block text-gray-700 font-medium mb-1">Fellow Students:</label>
            <div className="flex flex-wrap items-center gap-2 border border-gray-300 rounded-lg px-3 py-2">
              {/* --- Modified: render selected student objects directly --- */}
              {selectedStudents.map(student => (
                <div key={student.id} className="bg-blue-100 text-blue-800 px-2 py-1 rounded flex items-center">
                  <img src={getProfilePictureUrl(student.profile_picture)} alt="Profile" className="rounded-full w-6 h-6 mr-1"/>
                  <span>{student.firstName} {student.lastName}</span>
                  <button onClick={() => setSelectedStudents(selectedStudents.filter(s => s.id !== student.id))} className="ml-1 text-red-500">x</button>
                </div>
              ))}
              <input 
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                onFocus={() => setIsStudentInputFocused(true)}
                onBlur={() => setTimeout(() => setIsStudentInputFocused(false), 200)}
                placeholder="Search by name"
                className="flex-grow min-w-[150px] focus:outline-none"
              />
            </div>
            {isStudentInputFocused && studentResults.length > 0 && (
              <ul className="absolute z-10 bg-white border border-gray-300 rounded-lg mt-1 max-h-40 overflow-y-auto w-full shadow-md">
                {studentResults
                  .filter(student => student.id !== studentID && !selectedStudents.some(s => s.id === student.id))
                  .map(student => (
                    <li key={student.id} onClick={() => {
                      if (!selectedStudents.some(s => s.id === student.id)) {
                        setSelectedStudents([...selectedStudents, student]);
                      }
                      setSearchTerm('');
                    }} className="px-3 py-2 cursor-pointer hover:bg-gray-200 flex items-center">
                      <img src={getProfilePictureUrl(student.profile_picture)} alt="Profile" className="rounded-full w-6 h-6 mr-1"/>
                      <span>{student.firstName} {student.lastName}</span>
                    </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
      <div className="flex space-x-2">
        <button onClick={submitBooking} className="bg-blue-500 text-white px-4 py-2 rounded-lg">
          {role === 'faculty' ? 'Book Appointment' : 'Request Appointment'}
        </button>
      </div>
    </div>
  );
}

export default BookingAppointment;
