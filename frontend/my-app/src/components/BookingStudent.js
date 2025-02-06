import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function BookingStudent() {
    const location = useLocation();
    const navigate = useNavigate();
    const [studentID, setStudentID] = useState('');
    const [teachers, setTeachers] = useState([]);
    const [students, setStudents] = useState([]);
    const [selectedTeacher, setSelectedTeacher] = useState('');
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [appointments, setAppointments] = useState({ pending: [], upcoming: [], canceled: [] });

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
    }, [location]);

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

            <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-1">Select Teacher:</label>
                <select
                    value={selectedTeacher}
                    onChange={(e) => setSelectedTeacher(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">-- Select --</option>
                    {teachers.map((teacher) => (
                        <option key={teacher.id} value={teacher.id}>
                            {teacher.firstName} {teacher.lastName}
                        </option>
                    ))}
                </select>
            </div>

            <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-1">Select Fellow Students:</label>
                <div className="grid grid-cols-1 gap-2">
                    {students.map((student) => (
                        <label key={student.id} className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                value={student.id}
                                onChange={(e) => {
                                    if (e.target.checked) {
                                        setSelectedStudents([...selectedStudents, student.id]);
                                    } else {
                                        setSelectedStudents(selectedStudents.filter(id => id !== student.id));
                                    }
                                }}
                                className="h-4 w-4"
                            />
                            <span>{student.firstName} {student.lastName}</span>
                        </label>
                    ))}
                </div>
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
