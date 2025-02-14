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

  // NEW: Helper function to check if booking quota is exceeded.
  const isBookingOverQuota = () => {
    const selectedCount = selectedStudents.length;
    // For student users, include the booking student in the count.
    return role === 'student' ? (selectedCount + 1 > 4) : (selectedCount > 4);
  };

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
    <div className="p-4">
      {role === 'faculty' ? (
        <>
          {/* Teacher's Form */}
          <div className="space-y-6">
            {/* Student Selection */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Students <span className="text-red-500">*</span>
              </label>
              <div className="min-h-[45px] flex flex-wrap items-center gap-2 border-2 border-[#0065A8] rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-[#54BEFF]">
                {selectedStudents.map(student => (
                  <div key={student.id} 
                    className="bg-[#0065A8] text-white px-2 py-1 rounded-full flex items-center gap-2 text-sm">
                    <img src={getProfilePictureUrl(student.profile_picture)} 
                      alt="Profile" 
                      className="w-5 h-5 rounded-full" />
                    <span>{student.firstName} {student.lastName}</span>
                    <button onClick={() => setSelectedStudents(selectedStudents.filter(s => s.id !== student.id))}
                      className="hover:text-red-300 transition-colors">
                      ×
                    </button>
                  </div>
                ))}
                <input type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  onFocus={() => setIsStudentInputFocused(true)}
                  onBlur={() => setTimeout(() => setIsStudentInputFocused(false), 200)}
                  placeholder="Search students..."
                  className="flex-1 min-w-[120px] outline-none bg-transparent" />
              </div>
              {/* Student Search Results Dropdown */}
              {isStudentInputFocused && studentResults.length > 0 && (
                <ul className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {studentResults
                    .filter(student => !selectedStudents.some(s => s.id === student.id))
                    .map(student => (
                      <li key={student.id}
                        onClick={() => {
                          setSelectedStudents([...selectedStudents, student]);
                          setSearchTerm('');
                        }}
                        className="px-4 py-2 hover:bg-gray-50 flex items-center gap-3 cursor-pointer">
                        <img src={getProfilePictureUrl(student.profile_picture)}
                          alt="Profile"
                          className="w-8 h-8 rounded-full" />
                        <div>
                          <div className="font-medium">{student.firstName} {student.lastName}</div>
                          <div className="text-sm text-gray-500">{student.program} • {student.year_section}</div>
                        </div>
                      </li>
                    ))}
                </ul>
              )}
            </div>

            {/* Schedule Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Schedule <span className="text-red-500">*</span>
              </label>
              <input type="datetime-local"
                value={schedule}
                onChange={(e) => setSchedule(e.target.value)}
                className="w-full border-2 border-[#0065A8] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#54BEFF]" />
            </div>

            {/* Venue Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Venue <span className="text-red-500">*</span>
              </label>
              <input type="text"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="Enter venue (e.g., Room 101)"
                className="w-full border-2 border-[#0065A8] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#54BEFF]" />
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Student's Form */}
          <div className="space-y-6">
            {/* Teacher Selection */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teacher <span className="text-red-500">*</span>
              </label>
              <div className="min-h-[45px] flex items-center gap-2 border-2 border-[#0065A8] rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-[#54BEFF]">
                {selectedTeacher && !teacherSearchTerm ? (
                  <div className="bg-[#0065A8] text-white px-2 py-1 rounded-full flex items-center gap-2 text-sm">
                    <img src={getProfilePictureUrl(selectedTeacherProfile)}
                      alt="Teacher"
                      className="w-5 h-5 rounded-full" />
                    <span>{selectedTeacherName}</span>
                    <button onClick={() => {
                      setSelectedTeacher('');
                      setSelectedTeacherName('');
                      setSelectedTeacherProfile('');
                    }} className="hover:text-red-300 transition-colors">×</button>
                  </div>
                ) : (
                  <input type="text"
                    value={teacherSearchTerm}
                    onChange={e => {
                      setTeacherSearchTerm(e.target.value);
                      setSelectedTeacher('');
                      setSelectedTeacherName('');
                      setSelectedTeacherProfile('');
                    }}
                    onFocus={() => setIsTeacherInputFocused(true)}
                    onBlur={() => setTimeout(() => setIsTeacherInputFocused(false), 200)}
                    placeholder="Search for a teacher..."
                    className="flex-1 outline-none bg-transparent" />
                )}
              </div>
              
              {/* Teacher Search Results Dropdown */}
              {isTeacherInputFocused && teacherResults.length > 0 && (
                <ul className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {teacherResults.map(teacher => (
                    <li key={teacher.id}
                      onClick={() => {
                        setSelectedTeacher(teacher.id);
                        setSelectedTeacherName(`${teacher.firstName} ${teacher.lastName}`);
                        setSelectedTeacherProfile(teacher.profile_picture);
                        setTeacherSearchTerm('');
                      }}
                      className="px-4 py-2 hover:bg-gray-50 flex items-center gap-3 cursor-pointer">
                      <img src={getProfilePictureUrl(teacher.profile_picture)}
                        alt="Profile"
                        className="w-8 h-8 rounded-full" />
                      <div>
                        <div className="font-medium">{teacher.firstName} {teacher.lastName}</div>
                        <div className="text-sm text-gray-500">{teacher.department}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Fellow Students Selection (Optional) */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fellow Students (Optional)
              </label>
              <div className="min-h-[45px] flex flex-wrap items-center gap-2 border-2 border-[#0065A8] rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-[#54BEFF]">
                {selectedStudents.map(student => (
                  <div key={student.id} className="bg-[#0065A8] text-white px-2 py-1 rounded-full flex items-center gap-2 text-sm">
                    <img src={getProfilePictureUrl(student.profile_picture)} alt="Profile" className="w-5 h-5 rounded-full" />
                    <span>{student.firstName} {student.lastName}</span>
                    <button onClick={() => setSelectedStudents(selectedStudents.filter(s => s.id !== student.id))} className="hover:text-red-300 transition-colors">×</button>
                  </div>
                ))}
                <input type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  onFocus={() => setIsStudentInputFocused(true)}
                  onBlur={() => setTimeout(() => setIsStudentInputFocused(false), 200)}
                  placeholder="Search students..."
                  className="flex-1 min-w-[120px] outline-none bg-transparent" />
              </div>
              {isStudentInputFocused && studentResults.length > 0 && (
                <ul className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {studentResults
                    .filter(student => !selectedStudents.some(s => s.id === student.id))
                    .map(student => (
                      <li key={student.id}
                        onClick={() => {
                          setSelectedStudents([...selectedStudents, student]);
                          setSearchTerm('');
                        }}
                        className="px-4 py-2 hover:bg-gray-50 flex items-center gap-3 cursor-pointer">
                        <img src={getProfilePictureUrl(student.profile_picture)}
                          alt="Profile"
                          className="w-8 h-8 rounded-full" />
                        <div>
                          <div className="font-medium">{student.firstName} {student.lastName}</div>
                          <div className="text-sm text-gray-500">{student.program} • {student.year_section}</div>
                        </div>
                      </li>
                    ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}

      {/* Submit Button */}
      <div className="mt-8 flex flex-col items-end">
        {isBookingOverQuota() && (
          <div className="text-red-500 mb-2">
            Warning: You have exceeded the maximum number of 4 students per consultation.
          </div>
        )}
        <button
          onClick={submitBooking}
          disabled={isBookingOverQuota()}
          className={`${
            isBookingOverQuota() ? 'opacity-50 cursor-not-allowed' : ''
          } bg-[#0065A8] hover:bg-[#54BEFF] text-white px-4 py-2 rounded-lg transition-colors`}
        >
          {role === 'faculty' ? 'Book Appointment' : 'Request Appointment'}
        </button>
      </div>
    </div>
  );
}

export default BookingAppointment;
