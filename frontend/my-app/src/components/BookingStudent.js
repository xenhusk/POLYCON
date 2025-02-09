import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ProfilePictureUploader from './ProfilePictureUploader'; // adjusted import path
import { fetchStudentDetails } from '../utils/fetchStudentDetails'; // import the helper function
import { getProfilePictureUrl } from '../utils/utils'; // import the utility function
import ProfileDetails from './ProfileDetails';

function BookingStudent() {
    const location = useLocation();
    const navigate = useNavigate();
    const [studentID, setStudentID] = useState('');
    const [teachers, setTeachers] = useState([]);
    const [students, setStudents] = useState([]);
    const [selectedTeacher, setSelectedTeacher] = useState('');
    const [selectedTeacherName, setSelectedTeacherName] = useState('');
    const [selectedTeacherProfile, setSelectedTeacherProfile] = useState('');
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [teacherSearchTerm, setTeacherSearchTerm] = useState('');
    const [profileDetails, setProfileDetails] = useState({ name: '', id: '', role: '', program: '', year_section: '' });
    const modalFileInputRef = useRef(null);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [modalStep, setModalStep] = useState('upload'); // 'upload' or 'crop'
    const [modalSelectedFile, setModalSelectedFile] = useState(null);

    useEffect(() => {
        const storedStudentID = localStorage.getItem('studentID');
        if (location.state?.studentID) {
            setStudentID(location.state.studentID);
            localStorage.setItem('studentID', location.state.studentID); // Store in localStorage
        } else if (storedStudentID) {
            setStudentID(storedStudentID);  // Retrieve from localStorage
        }
        fetchTeachers();
        fetchStudents();
        fetchProfileDetails(storedStudentID || location.state?.studentID);
    }, []); // [] instead of [location]

    useEffect(() => {
        if (studentID) {
            fetchStudentAppointments();
        }
    }, [studentID]);

    async function fetchTeachers() {
        try {
            const response = await fetch('http://localhost:5001/bookings/get_teachers');
            const data = await response.json();
            setTeachers(data);
        } catch (error) {
            console.error('Error fetching teachers:', error);
        }
    }

    async function fetchStudents() {
        try {
            const response = await fetch('http://localhost:5001/bookings/get_students');
            const data = await response.json();
            setStudents(data);
        } catch (error) {
            console.error('Error fetching students:', error);
        }
    }

    async function fetchProfileDetails(userID) {
        try {
            // Changed endpoint from /bookings/get_user to /user/get_user
            const response = await fetch(`http://localhost:5001/user/get_user?userID=${userID}`);
            const data = await response.json();
            const studentDetails = await fetchStudentDetails(userID);
            setProfileDetails({
                name: `${data.firstName} ${data.lastName}`,
                id: userID,
                role: 'Student',
                program: studentDetails.program,
                year_section: studentDetails.year_section,
                profile_picture: data.profile_picture || 'https://via.placeholder.com/100'
            });
        } catch (error) {
            console.error('Error fetching profile details:', error);
        }
    }

    async function fetchStudentAppointments() {
        if (!studentID) {
            alert("Enter your student ID to view appointments.");
            return;
        }

        try {
            const response = await fetch(`http://localhost:5001/bookings/get_student_bookings?studentID=${studentID}`);
            const bookings = await response.json();

            if (!Array.isArray(bookings)) {
                throw new Error('Invalid response format');
            }

            const categorizedAppointments = {
                pending: [],
                upcoming: [],
                canceled: [],
            };

            for (const booking of bookings) {
                // Changed teacher fetch URL to /user/get_user so teacher details are correctly retrieved.
                const teacherResponse = await fetch(`http://localhost:5001/user/get_user?userID=${booking.teacherID.split('/').pop()}`);
                const teacherData = await teacherResponse.json();
                const teacherName = `${teacherData.firstName} ${teacherData.lastName}`;

                // Rebuild studentNames using get_students data; fallback to booking.studentNames (if available) or "Unknown Student".
                const studentNames = booking.studentID.map((ref, index) => {
                    const id = ref.split('/').pop();
                    const student = students.find(s => s.id === id);
                    return student 
                      ? `${student.firstName} ${student.lastName} ${student.program} ${student.year_section}` 
                      : (booking.studentNames && booking.studentNames[index] ? booking.studentNames[index] : "Unknown Student");
                });

                const appointmentItem = {
                    id: booking.id,
                    teacherName,
                    studentNames: studentNames.join(", "),
                    schedule: booking.schedule,
                    venue: booking.venue,
                };

                if (booking.status === "pending") {
                    categorizedAppointments.pending.push(appointmentItem);
                } else if (booking.status === "confirmed") {
                    categorizedAppointments.upcoming.push(appointmentItem);
                } else if (booking.status === "canceled") {
                    categorizedAppointments.canceled.push(appointmentItem);
                }
            }

            setAppointments(categorizedAppointments);
        } catch (error) {
            console.error('Error fetching student bookings:', error);
            alert(`Error fetching student bookings: ${error.message}`);
        }
    }

    async function requestAppointment() {
        if (!studentID || !selectedTeacher || selectedStudents.length === 0) {
            alert("Please fill in all fields.");
            return;
        }

        const bookingData = {
            createdBy: studentID,
            teacherID: selectedTeacher,
            studentIDs: [...selectedStudents, studentID],
            schedule: '',
            venue: ''
        };

        try {
            const response = await fetch('http://localhost:5001/bookings/create_booking', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bookingData),
            });

            if (response.ok) {
                alert("Appointment request sent successfully!");
                fetchStudentAppointments(); // Refresh appointments after booking
            } else {
                alert("Failed to request appointment.");
            }
        } catch (error) {
            console.error('Error requesting appointment:', error);
        }
    }

    const handleLogout = () => {
        localStorage.removeItem('userEmail');
        navigate('/');
    };

    const formatDateTime = (dateTime) => {
        const date = new Date(dateTime);
        const formattedDate = date.toLocaleDateString();
        const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return `${formattedDate} at ${formattedTime}`;
    };

    const navigateToCalendar = () => {
        navigate('/appointments-calendar');
    };

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

    return (
        <div className="p-8 bg-white rounded-lg">
            {/* Booking form section */}
            <div className="mb-4 relative">
                <label className="block text-gray-700 font-medium mb-1">Teacher:</label>
                <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2">
                    {selectedTeacher && !teacherSearchTerm && (
                        <div className="flex items-center gap-2">
                            {/* Use actual teacher profile picture instead of placeholder */}
                            <img 
                                src={getProfilePictureUrl(selectedTeacherProfile)} 
                                alt="Teacher Profile" 
                                className="rounded-full w-6 h-6"
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
                                        setSelectedTeacher(teacher.id);
                                        setSelectedTeacherName(`${teacher.firstName} ${teacher.lastName}`);
                                        setSelectedTeacherProfile(getProfilePictureUrl(teacher.profile_picture));
                                        setTeacherSearchTerm('');
                                    }} 
                                    className="px-3 py-2 cursor-pointer hover:bg-gray-200 flex items-center"
                                >
                                    <img 
                                        src={getProfilePictureUrl(teacher.profile_picture)} 
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
                                {/* Use actual student's profile picture */}
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
                                student.id !== studentID && // exclude current student
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
                <button onClick={requestAppointment} className="bg-blue-500 text-white px-4 py-2 rounded-lg">
                    Request Appointment
                </button>
            </div>
        </div>
    );
}

export default BookingStudent;
