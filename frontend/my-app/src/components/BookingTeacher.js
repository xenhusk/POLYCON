import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ProfilePictureUploader from './ProfilePictureUploader'; // replaced wrong component import
import { getProfilePictureUrl } from '../utils/utils'; // import the utility function

function BookingTeacher() {
    const [teacherID, setTeacherID] = useState('');
    const [students, setStudents] = useState([]);
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [schedule, setSchedule] = useState('');
    const [venue, setVenue] = useState('');
    const [appointments, setAppointments] = useState({ pending: [], upcoming: [], canceled: [] });
    const [searchTerm, setSearchTerm] = useState('');
    const [profileDetails, setProfileDetails] = useState({ name: '', id: '', role: '', department: '' });
    const [departmentName, setDepartmentName] = useState('');
    const [selectedTeacherProfile, setSelectedTeacherProfile] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    // New modal states
    const modalFileInputRef = useRef(null);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [modalStep, setModalStep] = useState('upload'); // 'upload' or 'crop'
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
            localStorage.setItem('teacherID', location.state.teacherID); // Store in localStorage
        } else if (storedTeacherID) {
            setTeacherID(storedTeacherID);  // Retrieve from localStorage
        }
        fetchStudents();
        fetchProfileDetails(storedTeacherID || location.state?.teacherID);
    }, [location]);

    useEffect(() => {
        if (teacherID) {
            fetchTeacherAppointments();
        }
    }, [teacherID]);

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
            const response = await fetch(`http://localhost:5001/bookings/get_user?userID=${userID}`);
            const data = await response.json();
            setProfileDetails({
                name: `${data.firstName} ${data.lastName}`,
                id: userID,
                role: 'Faculty',
                department: data.department || 'Unknown Department',
                profile_picture: getProfilePictureUrl(data.profile_picture)
            });
        } catch (error) {
            console.error('Error fetching profile details:', error);
        }
    }

    useEffect(() => {
        if (profileDetails.department && profileDetails.department.startsWith("/departments/")) {
            const deptID = profileDetails.department.split("/").pop();
            fetch(`http://localhost:5001/account/departments`)
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
    }, [profileDetails.department]);

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
        <div className="max-w-3xl mx-auto p-8 bg-white shadow-lg rounded-lg">
            <header className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Teacher Booking Panel</h2>
                <button onClick={() => navigate('/addgrade')} className=" bg-blue-500 text-white px-2 py-2 rounded">
                    Add Grade
                </button>
                <button onClick={handleLogout} className="space-x-2 bg-red-500 text-white px-4 py-2 rounded ">Logout</button>
            </header>

            {/* Updated Teacher profile details */}
            <div className="mb-4 flex items-center">
                <img 
                    src={profileDetails.profile_picture} 
                    alt="Profile" 
                    className="rounded-full w-24 h-24 mr-4 cursor-pointer"
                    onClick={handleProfilePictureClick}
                />
                <div>
                    <h3 className="text-xl font-bold text-gray-800">{profileDetails.name || 'No profile info'}</h3>
                    <p className="text-gray-600">{profileDetails.id} | {profileDetails.role}</p>
                    <p className="text-gray-600">{departmentName}</p>
                </div>
            </div>

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

            <div className="mb-4 relative">
                <label className="block text-gray-700 font-medium mb-1">Search Students:</label>
                <div className="flex flex-wrap items-center gap-2 border border-gray-300 rounded-lg px-3 py-2">
                    {selectedStudents.map(studentId => {
                        const student = students.find(s => s.id === studentId);
                        const studentProfile = getProfilePictureUrl(student.profile_picture);
                        return student ? (
                            <div key={studentId} className="bg-blue-100 text-blue-800 px-2 py-1 rounded flex items-center">
                                <img 
                                    src={studentProfile} 
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
                            .map(student => {
                                const studentProfile = getProfilePictureUrl(student.profile_picture);
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
                                            alt="Profile" 
                                            className="rounded-full w-6 h-6 mr-1" 
                                        />
                                        <span>{student.firstName} {student.lastName} ({student.program} {student.year_section})</span>
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
                <input type="text" placeholder="Enter venue" value={venue} onChange={(e) => setVenue(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <button onClick={bookAppointment} className="bg-blue-500 text-white px-4 py-2 rounded-lg">
                Book Appointment
            </button>

            <h3 className="text-lg font-bold mt-6">Pending Appointments</h3>
            <ul className="space-y-4">
                {appointments.pending?.map(app => (
                    <li id={`pending-${app.id}`} key={app.id} className="p-4 border rounded-lg shadow-sm bg-gray-50">
                        <div className="flex justify-between items-center">
                            <div>
                                <p><strong>Students:</strong> {app.studentNames}</p>
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
                {appointments.upcoming?.map(app => (
                    <li key={app.id} className="p-4 border rounded-lg shadow-sm bg-gray-50">
                        <div className="flex justify-between items-center">
                            <div>
                                <p><strong>Students:</strong> {app.studentNames}</p>
                                <p><strong>Schedule:</strong> {formatDateTime(app.schedule)}</p>
                                <p><strong>Venue:</strong> {app.venue}</p>
                            </div>
                            <div className="flex space-x-2">
                                <button onClick={() => startSession(app)} className="bg-green-500 text-white px-4 py-2 rounded-lg">Start Session</button>
                                <button onClick={() => cancelBooking(app.id)} className="bg-red-500 text-white px-4 py-2 rounded-lg">Cancel</button>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>

            <h3 className="text-lg font-bold mt-6">Canceled Appointments</h3>
            <ul className="space-y-4">
                {appointments.canceled?.map(app => (
                    <li key={app.id} className="p-4 border rounded-lg shadow-sm bg-gray-50">
                        <div>
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

export default BookingTeacher;
