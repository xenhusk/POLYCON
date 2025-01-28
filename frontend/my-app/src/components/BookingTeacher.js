import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function BookingTeacher() {
    const [teacherID, setTeacherID] = useState('');
    const [students, setStudents] = useState([]);
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [schedule, setSchedule] = useState('');
    const [venue, setVenue] = useState('');
    const [appointments, setAppointments] = useState({ pending: [], upcoming: [], canceled: [] });
    const navigate = useNavigate();

    useEffect(() => {
        fetchStudents();
    }, []);

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
                    placeholder="Enter your Teacher ID"
                    value={teacherID}
                    onChange={(e) => setTeacherID(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <ul>
                {appointments.pending.map(app => (
                    <li key={app.id}>
                        Students: {app.studentNames}, Schedule: {app.schedule}, Venue: {app.venue}
                        <button onClick={() => showConfirmationInputs(app.id, document.getElementById(`pending-${app.id}`))}>Confirm</button>
                        <button onClick={() => cancelBooking(app.id)}>Cancel</button>
                    </li>
                ))}
            </ul>

            <h3 className="text-lg font-bold mt-6">Upcoming Appointments</h3>
            <ul>
                {appointments.upcoming.map(app => (
                    <li key={app.id}>
                        Students: {app.studentNames}, Schedule: {app.schedule}, Venue: {app.venue}
                    </li>
                ))}
            </ul>

            <h3 className="text-lg font-bold mt-6">Canceled Appointments</h3>
            <ul>
                {appointments.canceled.map(app => (
                    <li key={app.id}>
                        Students: {app.studentNames}, Schedule: {app.schedule}, Venue: {app.venue}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default BookingTeacher;
