import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

function BookingTeacher() {
    const [teacherID, setTeacherID] = useState('');
    const [students, setStudents] = useState([]);
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [schedule, setSchedule] = useState('');
    const [venue, setVenue] = useState('');
    const [appointments, setAppointments] = useState({ pending: [], upcoming: [], canceled: [] });
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const storedTeacherID = localStorage.getItem('teacherID');
        if (location.state?.teacherID) {
            setTeacherID(location.state.teacherID);
            localStorage.setItem('teacherID', location.state.teacherID); // Store in localStorage
        } else if (storedTeacherID) {
            setTeacherID(storedTeacherID);  // Retrieve from localStorage
        }
        fetchStudents();
    }, [location]);

    async function fetchStudents() {
        try {
            const response = await fetch('http://localhost:5001/bookings/get_students');
            const data = await response.json();
            setStudents(data);
        } catch (error) {
            console.error('Error fetching students:', error);
        }
    }

    async function fetchTeacherAppointments() {
        if (!teacherID) {
            alert("Enter your teacher ID to view appointments.");
            return;
        }

        try {
            const response = await fetch(`http://localhost:5001/bookings/get_teacher_bookings?teacherID=${teacherID}`);
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
                const studentNames = await Promise.all(booking.studentID.map(async ref => {
                    const studentID = ref.split('/').pop();
                    const userResponse = await fetch(`http://localhost:5001/bookings/get_user?userID=${studentID}`);
                    const userData = await userResponse.json();
                    return `${userData.firstName} ${userData.lastName}`;
                }));

                const appointmentItem = {
                    id: booking.id,
                    studentNames: studentNames.join(", "),
                    studentIDs: booking.studentID,
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
            console.error('Error fetching teacher bookings:', error);
            alert(`Error fetching teacher bookings: ${error.message}`);
        }
    }

    async function bookAppointment() {
        if (!teacherID || selectedStudents.length === 0 || !schedule || !venue) {
            alert("Please fill in all fields.");
            return;
        }

        const bookingData = {
            teacherID: teacherID,
            studentIDs: selectedStudents,
            schedule: schedule,
            venue: venue,
            createdBy: teacherID
        };

        try {
            const response = await fetch('http://localhost:5001/bookings/create_booking', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bookingData),
            });

            if (response.ok) {
                alert("Appointment booked successfully!");
                fetchTeacherAppointments();
            } else {
                alert("Failed to book appointment.");
            }
        } catch (error) {
            console.error('Error booking appointment:', error);
        }
    }

    async function confirmBooking(bookingID, schedule, venue) {
        if (!schedule || !venue) {
            alert("Schedule and venue are required to confirm the booking.");
            return;
        }

        try {
            const response = await fetch('http://localhost:5001/bookings/confirm_booking', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bookingID, schedule, venue }),
            });

            const result = await response.json();
            if (response.ok) {
                alert("Booking confirmed successfully!");
                fetchTeacherAppointments();
            } else {
                alert(`Failed to confirm booking: ${result.error || "Unknown error"}`);
            }
        } catch (error) {
            console.error('Error confirming booking:', error);
        }
    }

    async function cancelBooking(bookingID) {
        try {
            const response = await fetch('http://localhost:5001/bookings/cancel_booking', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bookingID }),
            });

            const result = await response.json();
            if (response.ok) {
                alert("Booking canceled successfully!");
                fetchTeacherAppointments();
            } else {
                alert(`Failed to cancel booking: ${result.error || "Unknown error"}`);
            }
        } catch (error) {
            console.error('Error canceling booking:', error);
        }
    }

    async function startSession(appointment) {
        try {
            const response = await fetch('http://localhost:5001/consultation/start_session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    teacher_id: teacherID,
                    student_ids: appointment.studentIDs,
                }),
            });

            const result = await response.json();
            if (response.ok) {
                const sessionUrl = `/session?sessionID=${result.session_id}&teacherID=${teacherID}&studentIDs=${appointment.studentIDs.join(',')}`;
                window.open(sessionUrl, '_blank'); // Open session page in a new tab
            } else {
                alert(`Failed to start session: ${result.error || "Unknown error"}`);
            }
        } catch (error) {
            console.error('Error starting session:', error);
        }
    }

    function showConfirmationInputs(bookingID, bookingItem) {
        const scheduleInput = document.createElement("input");
        scheduleInput.type = "datetime-local";
        scheduleInput.id = `schedule-${bookingID}`;

        const venueInput = document.createElement("input");
        venueInput.type = "text";
        venueInput.id = `venue-${bookingID}`;
        venueInput.placeholder = "Enter venue";

        const confirmButton = document.createElement("button");
        confirmButton.textContent = "Confirm Booking";
        confirmButton.onclick = () => confirmBooking(bookingID, scheduleInput.value, venueInput.value);

        bookingItem.appendChild(document.createElement("br"));
        bookingItem.appendChild(scheduleInput);
        bookingItem.appendChild(document.createElement("br"));
        bookingItem.appendChild(venueInput);
        bookingItem.appendChild(document.createElement("br"));
        bookingItem.appendChild(confirmButton);
    }

    const handleLogout = () => {
        localStorage.removeItem('userEmail');
        navigate('/login');
    };

    const formatDateTime = (dateTime) => {
        const date = new Date(dateTime);
        const formattedDate = date.toLocaleDateString();
        const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return `${formattedDate} at ${formattedTime}`;
    };

    return (
        <div className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-lg">
            <header className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Teacher Booking Panel</h2>
                <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded">Logout</button>
            </header>

            <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-1">Your Teacher ID:</label>
                <input
                    type="text"
                    value={teacherID}
                    readOnly
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-100 text-gray-600"
                />
            </div>

            <button onClick={fetchTeacherAppointments} className="bg-green-500 text-white px-4 py-2 rounded-lg">
                Fetch Appointments
            </button>

            <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-1">Select Students:</label>
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

            <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-1">Select Schedule:</label>
                <input type="datetime-local" value={schedule} onChange={(e) => setSchedule(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-1">Venue:</label>
                <input type="text" placeholder="Enter venue" value={venue} onChange={(e) => setVenue(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <button onClick={bookAppointment} className="bg-blue-500 text-white px-4 py-2 rounded-lg">
                Book Appointment
            </button>

            <h3 className="text-lg font-bold mt-6">Pending Appointments</h3>
            <ul className="space-y-4">
                {appointments.pending.map(app => (
                    <li key={app.id} className="p-4 border rounded-lg shadow-sm bg-gray-50">
                        <div className="flex justify-between items-center">
                            <div>
                                <p><strong>Students:</strong> {app.studentNames}</p>
                                <p><strong>Schedule:</strong> {formatDateTime(app.schedule)}</p>
                                <p><strong>Venue:</strong> {app.venue}</p>
                            </div>
                            <div className="flex space-x-2">
                                <button onClick={() => showConfirmationInputs(app.id, document.getElementById(`pending-${app.id}`))} className="bg-blue-500 text-white px-4 py-2 rounded-lg">Confirm</button>
                                <button onClick={() => cancelBooking(app.id)} className="bg-red-500 text-white px-4 py-2 rounded-lg">Cancel</button>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>

            <h3 className="text-lg font-bold mt-6">Upcoming Appointments</h3>
            <ul className="space-y-4">
                {appointments.upcoming.map(app => (
                    <li key={app.id} className="p-4 border rounded-lg shadow-sm bg-gray-50">
                        <div className="flex justify-between items-center">
                            <div>
                                <p><strong>Students:</strong> {app.studentNames}</p>
                                <p><strong>Schedule:</strong> {formatDateTime(app.schedule)}</p>
                                <p><strong>Venue:</strong> {app.venue}</p>
                            </div>
                            <button onClick={() => startSession(app)} className="bg-green-500 text-white px-4 py-2 rounded-lg">Start Session</button>
                        </div>
                    </li>
                ))}
            </ul>

            <h3 className="text-lg font-bold mt-6">Canceled Appointments</h3>
            <ul className="space-y-4">
                {appointments.canceled.map(app => (
                    <li key={app.id} className="p-4 border rounded-lg shadow-sm bg-gray-50">
                        <div>
                            <p><strong>Students:</strong> {app.studentNames}</p>
                            <p><strong>Schedule:</strong> {formatDateTime(app.schedule)}</p>
                            <p><strong>Venue:</strong> {app.venue}</p>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default BookingTeacher;
