import React, { useEffect, useState } from 'react';

function StudentAppointments() {
  const [appointments, setAppointments] = useState({
    pending: [],
    upcoming: [],
    canceled: []
  });
  const [students, setStudents] = useState([]);

  const formatDateTime = (dateTime) => {
    const date = new Date(dateTime);
    const formattedDate = date.toLocaleDateString();
    const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${formattedDate} at ${formattedTime}`;
  };

  useEffect(() => {
    const fetchStudentAppointments = async () => {
      const studentID = localStorage.getItem('studentID');
      try {
        const response = await fetch(`http://localhost:5001/bookings/get_student_bookings?studentID=${studentID}`);
        const bookings = await response.json();

        if (!Array.isArray(bookings)) {
          throw new Error('Invalid response format');
        }

        const categorizedAppointments = {
          pending: [],
          upcoming: [],
          canceled: []
        };

        for (const booking of bookings) {
          const teacherResponse = await fetch(`http://localhost:5001/user/get_user?userID=${booking.teacherID.split('/').pop()}`);
          const teacherData = await teacherResponse.json();
          const teacherName = `${teacherData.firstName} ${teacherData.lastName}`;

          const appointmentItem = {
            id: booking.id,
            teacherName,
            studentNames: booking.studentNames,
            schedule: booking.schedule,
            venue: booking.venue,
            status: booking.status
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
      }
    };

    fetchStudentAppointments();
  }, []);

  return (
    <div>
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
              <p><strong>Schedule:</strong> {app.schedule && !isNaN(new Date(app.schedule).getTime()) ? formatDateTime(app.schedule) : ''}</p>
              <p><strong>Venue:</strong> {app.venue}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TeacherAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [pending, setPending] = useState([]);
  const [canceled, setCanceled] = useState([]);

  const fetchTeacherAppointments = async () => {
    const teacherID = localStorage.getItem('teacherID');
    try {
      const res = await fetch(`http://localhost:5001/bookings/get_teacher_bookings?teacherID=${teacherID}`);
      const data = await res.json();
      setAppointments(data);
    } catch (err) {
      console.error('Error fetching teacher appointments:', err);
    }
  };

  useEffect(() => {
    fetchTeacherAppointments();
  }, []);

  useEffect(() => {
    setUpcoming(appointments.filter(app => app.status === 'confirmed'));
    setPending(appointments.filter(app => app.status === 'pending'));
    setCanceled(appointments.filter(app => app.status === 'canceled'));
  }, [appointments]);

  const handleConfirm = (bookingID) => {
    // ...existing code for confirming booking...
    console.log('Confirm booking:', bookingID);
  };

  const handleCancel = (bookingID) => {
    // ...existing code for canceling booking...
    console.log('Cancel booking:', bookingID);
  };

  const handleStartSession = (bookingID) => {
    // ...existing code for starting session...
    console.log('Start session for booking:', bookingID);
  };

  const formatDateTime = (dateTime) => {
    const date = new Date(dateTime);
    const formattedDate = date.toLocaleDateString();
    const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${formattedDate} at ${formattedTime}`;
  };

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
    confirmButton.className = "bg-blue-500 text-white px-4 py-2 rounded-lg";
    confirmButton.onclick = () => confirmBooking(bookingID, scheduleInput.value, venueInput.value);

    bookingItem.appendChild(document.createElement("br"));
    bookingItem.appendChild(scheduleInput);
    bookingItem.appendChild(document.createElement("br"));
    bookingItem.appendChild(venueInput);
    bookingItem.appendChild(document.createElement("br"));
    bookingItem.appendChild(confirmButton);
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

      if (response.ok) {
        alert("Booking confirmed successfully!");
        await fetchTeacherAppointments(); // Now fetchTeacherAppointments is in scope
      } else {
        const result = await response.json();
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

      if (response.ok) {
        alert("Booking canceled successfully!");
        await fetchTeacherAppointments(); // Now fetchTeacherAppointments is in scope
      } else {
        const result = await response.json();
        alert(`Failed to cancel booking: ${result.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error('Error canceling booking:', error);
    }
  }

  async function startSession(appointment) {
    const teacherID = localStorage.getItem('teacherID');
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
        window.open(sessionUrl, '_blank');
      } else {
        alert(`Failed to start session: ${result.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error('Error starting session:', error);
    }
  }

  return (
    <div>
      <section>
        <h3 className="text-xl font-semibold">Upcoming Appointments</h3>
        {upcoming.length > 0 ? (
          <ul>
            {upcoming.map(app => (
              <li key={app.id} className="border p-4 my-2">
                <p><strong>Student(s):</strong> {Array.isArray(app.studentNames) ? app.studentNames.join(", ") : app.studentNames}</p>
                <p><strong>Schedule:</strong> {new Date(app.schedule).toLocaleString()}</p>
                <p><strong>Venue:</strong> {app.venue}</p>
                <div className="mt-2">
                  <button onClick={() => handleStartSession(app.id)} className="bg-green-500 text-white px-3 py-1 rounded">Start Session</button>
                  <button onClick={() => handleCancel(app.id)} className="bg-red-500 text-white px-3 py-1 rounded">Cancel</button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>No upcoming appointments.</p>
        )}
      </section>
      
      <section className="mt-6">
        <h3 className="text-xl font-semibold">Pending Appointments</h3>
        {pending.length > 0 ? (
          <ul>
            {pending.map(app => (
              <li key={app.id} className="border p-4 my-2">
                <p><strong>Student(s):</strong> {Array.isArray(app.studentNames) ? app.studentNames.join(", ") : app.studentNames}</p>
                <p><strong>Schedule:</strong> {new Date(app.schedule).toLocaleString()}</p>
                <p><strong>Venue:</strong> {app.venue}</p>
                <div className="mt-2">
                  <button onClick={() => handleConfirm(app.id)} className="mr-2 bg-blue-500 text-white px-3 py-1 rounded">Confirm</button>
                  <button onClick={() => handleCancel(app.id)} className="bg-red-500 text-white px-3 py-1 rounded">Cancel</button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>No pending appointments.</p>
        )}
      </section>
      
      <section className="mt-6">
        <h3 className="text-xl font-semibold">Canceled Appointments</h3>
        {canceled.length > 0 ? (
          <ul>
            {canceled.map(app => (
              <li key={app.id} className="border p-4 my-2">
                <p><strong>Student(s):</strong> {Array.isArray(app.studentNames) ? app.studentNames.join(", ") : app.studentNames}</p>
                <p><strong>Schedule:</strong> {new Date(app.schedule).toLocaleString()}</p>
                <p><strong>Venue:</strong> {app.venue}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No canceled appointments.</p>
        )}
      </section>
    </div>
  );
}

function Appointments() {
  const [role, setRole] = useState('');

  useEffect(() => {
    const storedRole = localStorage.getItem('userRole');
    if (storedRole) {
      setRole(storedRole.toLowerCase());
    }
  }, []);

  if (!role) return <p>Loading...</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Appointments</h2>
      {role === 'student' ? (
        <StudentAppointments />
      ) : role === 'faculty' ? (
        <TeacherAppointments />
      ) : (
        <p>No appointments available for your role.</p>
      )}
    </div>
  );
}

export default Appointments;
