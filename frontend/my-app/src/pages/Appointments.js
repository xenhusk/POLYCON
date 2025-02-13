import React, { useEffect, useState } from 'react';
import { useCachedFetch } from '../hooks/useCachedFetch';
import AppointmentItem from '../components/AppointmentItem'; // new import
import { useSocket } from '../hooks/useSocket';

function StudentAppointments() {
  // Removed cancelled appointments from state.
  const [appointments, setAppointments] = useState({ pending: [], upcoming: [] });
  const { cachedFetch } = useCachedFetch();
  const socket = useSocket('http://localhost:5001');
  const studentID = localStorage.getItem('studentID');

  const formatDateTime = (dateTime) => {
    const date = new Date(dateTime);
    const formattedDate = date.toLocaleDateString();
    const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${formattedDate} at ${formattedTime}`;
  };

  const fetchStudentAppointments = async () => {
    console.log('Fetching student appointments...');
    const studentID = localStorage.getItem('studentID');
    try {
      const bookings = await fetch(`http://localhost:5001/bookings/get_bookings?role=student&userID=${studentID}`)
        .then(res => res.json());
      console.log('Received student bookings:', bookings);
      if (!Array.isArray(bookings)) throw new Error('Invalid response format');

      const categorizedAppointments = { pending: [], upcoming: [] };
      bookings.forEach(booking => {
        // Add created_at from booking data.
        const appointmentItem = {
          id: booking.id,
          teacher: booking.teacher || {},
          studentNames: booking.studentNames,
          info: booking.info,
          schedule: booking.schedule,
          venue: booking.venue,
          status: booking.status,
          created_at: booking.created_at, // new field for created timestamp
        };
        if (booking.status === "pending") {
          categorizedAppointments.pending.push(appointmentItem);
        } else if (booking.status === "confirmed") {
          categorizedAppointments.upcoming.push(appointmentItem);
        }
      });

      // Sort pending appointments by created_at (earliest to latest)
      categorizedAppointments.pending.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      // Sort upcoming appointments by schedule (nearest date first)
      categorizedAppointments.upcoming.sort((a, b) => new Date(a.schedule) - new Date(b.schedule));

      setAppointments(categorizedAppointments);
    } catch (error) {
      console.error('Error fetching student bookings:', error);
    }
  };

  // Initial fetch only
  useEffect(() => {
    console.log('Initial student appointments fetch');
    fetchStudentAppointments();
  }, []); // Remove cachedFetch dependency

  // Socket listener
  useEffect(() => {
    if (socket) {
      console.log('Setting up student socket listeners');
      socket.on('booking_updated', (data) => {
        console.log('Student received booking update:', data);
        fetchStudentAppointments();
      });
    }
    return () => {
      if (socket) {
        socket.off('booking_updated');
      }
    };
  }, [socket]);

  return (
    <div className="grid grid-cols-2 gap-5 h-full">
      <section className="bg-white rounded-xl shadow-sm p-6 flex flex-col max-h-[80vh]">
        <h3 className="text-xl font-semibold mb-4 text-[#0065A8] border-b-2 border-[#54BEFF] pb-2 sticky top-0 bg-white z-10">
          Pending Appointments
        </h3>
        <div className="flex-1 overflow-y-auto min-h-0">
          {appointments.pending.length > 0 ? (
            <ul className="space-y-4 pr-2">
              {appointments.pending.map(app => (
                <AppointmentItem key={app.id} appointment={app} role="student" />
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 italic">No pending appointments</p>
          )}
        </div>
      </section>

      <section className="bg-white rounded-xl shadow-sm p-6 flex flex-col max-h-[80vh]">
        <h3 className="text-xl font-semibold mb-4 text-[#0065A8] border-b-2 border-[#54BEFF] pb-2 sticky top-0 bg-white z-10">
          Upcoming Appointments
        </h3>
        <div className="flex-1 overflow-y-auto min-h-0">
          {appointments.upcoming.length > 0 ? (
            <ul className="space-y-4 pr-2">
              {appointments.upcoming.map(app => (
                <AppointmentItem key={app.id} appointment={app} role="student" />
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 italic">No upcoming appointments</p>
          )}
        </div>
      </section>
    </div>
  );
}

function TeacherAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [pending, setPending] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [confirmInputs, setConfirmInputs] = useState({});
  const { cachedFetch } = useCachedFetch();
  const socket = useSocket('http://localhost:5001');
  const teacherID = localStorage.getItem('teacherID');

  const handleConfirmClick = (bookingID) => {
    setConfirmInputs(prev => ({ ...prev, [bookingID]: { schedule: '', venue: '' } }));
  };

  const fetchTeacherAppointments = async () => {
    console.log('Fetching teacher appointments...');
    const teacherID = localStorage.getItem('teacherID');
    try {
      const data = await fetch(`http://localhost:5001/bookings/get_bookings?role=faculty&userID=${teacherID}`)
        .then(res => res.json());
      console.log('Received teacher bookings:', data);
      // Include created_at field for sorting and ensure studentIDs is set.
      const updatedData = data.map(booking => ({
        ...booking,
        studentIDs: booking.studentIDs || booking.student_ids || [],
        created_at: booking.created_at,
      })).filter(booking => booking.status !== 'canceled'); // Filter out cancelled bookings
      setAppointments(updatedData);
    } catch (err) {
      console.error('Error fetching teacher appointments:', err);
    }
  };

  // Initial fetch only
  useEffect(() => {
    console.log('Initial teacher appointments fetch');
    fetchTeacherAppointments();
  }, []); // Remove cachedFetch and refresh dependencies

  // Update pending and upcoming categories and sort them.
  useEffect(() => {
    const upcomingApps = appointments
      .filter(app => app.status === 'confirmed')
      .sort((a, b) => new Date(a.schedule) - new Date(b.schedule));
    const pendingApps = appointments
      .filter(app => app.status === 'pending')
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    setUpcoming(upcomingApps);
    setPending(pendingApps);
  }, [appointments]);

  // Socket listener
  useEffect(() => {
    if (socket) {
      console.log('Setting up teacher socket listeners');
      socket.on('booking_updated', (data) => {
        console.log('Teacher received booking update:', data);
        fetchTeacherAppointments();
      });
    }
    return () => {
      if (socket) {
        socket.off('booking_updated');
      }
    };
  }, [socket]);

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
        setConfirmInputs(prev => { 
          const updated = { ...prev }; 
          delete updated[bookingID]; 
          return updated; 
        });
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
      if (!response.ok) {
        const result = await response.json();
        alert(`Failed to cancel booking: ${result.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error('Error canceling booking:', error);
    }
  }

  async function startSession(appointment) {
    const teacherID = localStorage.getItem('teacherID');
    let studentIDs = (appointment.studentIDs && appointment.studentIDs.length)
      ? appointment.studentIDs
      : appointment.studentID;
    if (!studentIDs || !Array.isArray(studentIDs) || studentIDs.length === 0) {
      alert("Cannot start session: Missing student IDs.");
      return;
    }
    // Convert teacher and student details into JSON strings and URL-encode them.
    const teacherInfo = appointment.teacher ? encodeURIComponent(JSON.stringify(appointment.teacher)) : '';
    const studentInfo = appointment.info ? encodeURIComponent(JSON.stringify(appointment.info)) : '';
    
    // Build the session URL without a sessionID.
    const sessionUrl = `/session?teacherID=${teacherID}&studentIDs=${studentIDs.join(',')}&teacherInfo=${teacherInfo}&studentInfo=${studentInfo}`;
    window.open(sessionUrl, '_blank');
  }
  

  return (
    <div className="grid grid-cols-2 gap-5 h-full">
      <section className="bg-white rounded-xl shadow-sm p-6 flex flex-col max-h-[77vh]">
        <h3 className="text-xl font-semibold mb-4 text-[#0065A8] border-b-2 border-[#54BEFF] pb-2 sticky top-0 bg-white z-10">
          Pending Appointments
        </h3>
        <div className="flex-1 overflow-y-auto min-h-0">
          {pending.length > 0 ? (
            <ul className="space-y-4 pr-2">
              {pending.map(app => (
                <AppointmentItem 
                  key={app.id}
                  appointment={app}
                  role="faculty"
                  onCancel={cancelBooking}
                  onConfirm={confirmBooking}
                  confirmInputs={confirmInputs}
                  handleConfirmClick={handleConfirmClick}
                  setConfirmInputs={setConfirmInputs}
                />
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 italic">No pending appointments</p>
          )}
        </div>
      </section>

      <section className="bg-white rounded-xl shadow-sm p-6 flex flex-col max-h-[77vh]">
        <h3 className="text-xl font-semibold mb-4 text-[#0065A8] border-b-2 border-[#54BEFF] pb-2 sticky top-0 bg-white z-10">
          Upcoming Appointments
        </h3>
        <div className="flex-1 overflow-y-auto min-h-0">
          {upcoming.length > 0 ? (
            <ul className="space-y-4 pr-2">
              {upcoming.map(app => (
                <AppointmentItem 
                  key={app.id}
                  appointment={app}
                  role="faculty"
                  onStartSession={startSession}
                  onCancel={cancelBooking}
                />
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 italic">No upcoming appointments</p>
          )}
        </div>
      </section>
    </div>
  );
}

function Appointments() {
  const [role, setRole] = useState('');

  // This effect runs only once to set the role.
  useEffect(() => {
    const storedRole = localStorage.getItem('userRole');
    if (storedRole && role !== storedRole.toLowerCase()) {
      setRole(storedRole.toLowerCase());
    }
  }, []); // empty dependency array

  if (!role) return <p>Loading...</p>;
  return (
    <div className="h-screen overflow-hidden p-8">
      <h2 className="text-3xl font-bold mb-8 text-[#0065A8]">Appointments</h2>
      <div className="bg-[#dceffa] rounded-xl p-6 shadow-sm h-[calc(100vh-8rem)]">
        {role === 'student' ? <StudentAppointments /> : role === 'faculty' ? <TeacherAppointments /> : <p>No appointments available for your role.</p>}
      </div>
    </div>
  );
}

export default Appointments;
