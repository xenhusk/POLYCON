import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function BookingStudent() {
    const location = useLocation();
    const navigate = useNavigate();
    const [studentID, setStudentID] = useState('');
    const [teachers, setTeachers] = useState([]);
    const [students, setStudents] = useState([]);
    const [selectedTeacher, setSelectedTeacher] = useState('');
    const [selectedTeacherName, setSelectedTeacherName] = useState('');
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [appointments, setAppointments] = useState({ pending: [], upcoming: [], canceled: [] });
    const [searchTerm, setSearchTerm] = useState('');
    const [teacherSearchTerm, setTeacherSearchTerm] = useState('');

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
                const teacherResponse = await fetch(`http://localhost:5001/bookings/get_user?userID=${booking.teacherID.split('/').pop()}`);
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

    return (
        <div className="p-8 bg-white shadow-lg rounded-lg">
            <header className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Student Booking Panel</h2>
                <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded">Logout</button>
            </header>

            <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-1">Your Student ID:</label>
                <input
                    type="text"
                    value={studentID}
                    readOnly
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-100 text-gray-600"
                />
            </div>

            <div className="mb-4 relative">
                <label className="block text-gray-700 font-medium mb-1">Teacher:</label>
                <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2">
                    {selectedTeacher && !teacherSearchTerm && (
                        <div className="flex items-center gap-2">
                            <img 
                                src="https://via.placeholder.com/24" 
                                alt="Teacher Profile" 
                                className="rounded-full w-6 h-6"
                            />
                            <span>{selectedTeacherName}</span>
                            <button 
                                onClick={() => {
                                    setSelectedTeacher('');
                                    setSelectedTeacherName('');
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
                                        setTeacherSearchTerm(''); // Clear search term after selection
                                    }} 
                                    className="px-3 py-2 cursor-pointer hover:bg-gray-200 flex items-center"
                                >
                                    <img 
                                        src="https://via.placeholder.com/24" 
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
                                    src="https://via.placeholder.com/24" 
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
                                const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
                                return fullName.includes(searchTerm.toLowerCase());
                            })
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
                                        src="https://via.placeholder.com/24" 
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
                <button onClick={navigateToCalendar} className="bg-blue-500 text-white px-4 py-2 rounded-lg">
                    View Calendar
                </button>
            </div>

            <h3 className="text-lg font-bold mt-6">Pending Appointments</h3>
            <ul className="space-y-4">
                {appointments.pending?.map(app => (
                    <li key={app.id} className="p-4 border rounded-lg shadow-sm bg-gray-50">
                        <div>
                            <p><strong>Teacher:</strong> {app.teacherName}</p>
                            <p><strong>Students:</strong> {app.studentNames}</p>
                        </div>
                    </li>
                ))}
            </ul>

            <h3 className="text-lg font-bold mt-6">Upcoming Appointments</h3>
            <ul className="space-y-4">
                {appointments.upcoming?.map(app => (
                    <li key={app.id} className="p-4 border rounded-lg shadow-sm bg-gray-50">
                        <div>
                            <p><strong>Teacher:</strong> {app.teacherName}</p>
                            <p><strong>Students:</strong> {app.studentNames}</p>
                            <p><strong>Schedule:</strong> {formatDateTime(app.schedule)}</p>
                            <p><strong>Venue:</strong> {app.venue}</p>
                        </div>
                    </li>
                ))}
            </ul>

            <h3 className="text-lg font-bold mt-6">Canceled Appointments</h3>
            <ul className="space-y-4">
                {appointments.canceled?.map(app => (
                    <li key={app.id} className="p-4 border rounded-lg shadow-sm bg-gray-50">
                        <div>
                            <p><strong>Teacher:</strong> {app.teacherName}</p>
                            <p><strong>Students:</strong> {app.studentNames}</p>
                            <p>
                                <strong>Schedule:</strong> {app.schedule && !isNaN(new Date(app.schedule).getTime()) ? formatDateTime(app.schedule) : ''}
                            </p>
                            <p><strong>Venue:</strong> {app.venue}</p>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default BookingStudent;
