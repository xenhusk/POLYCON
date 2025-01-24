import React, { useEffect, useState } from 'react';

function BookingTeacher() {
    const [teacherID, setTeacherID] = useState('');
    const [students, setStudents] = useState([]);
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [schedule, setSchedule] = useState('');
    const [venue, setVenue] = useState('');
    const [appointments, setAppointments] = useState({ pending: [], upcoming: [] });

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

    return (
        <div className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-lg">
            <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">Teacher Booking Panel</h2>

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
        </div>
    );
}

export default BookingTeacher;
