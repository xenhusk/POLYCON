import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery } from 'react-query';
import AppointmentItem from '../components/AppointmentItem';
import { useSocket } from '../hooks/useSocket';

// Fetch student appointments via React Query
const fetchStudentAppointments = async () => {
  const studentID = localStorage.getItem('studentID');
  const res = await fetch(`http://localhost:5001/bookings/get_bookings?role=student&userID=${studentID}`);
  if (!res.ok) throw new Error('Network response was not ok');
  return res.json();
};

function StudentAppointments() {
  const { data: bookings = [], refetch } = useQuery('studentAppointments', fetchStudentAppointments, {
    staleTime: 30000, // 30 seconds caching
    refetchOnWindowFocus: false,
  });

  const [appointments, setAppointments] = useState({ pending: [], upcoming: [] });
  const socket = useSocket('http://localhost:5001');

  useEffect(() => {
    const categorizedAppointments = { pending: [], upcoming: [] };
    bookings.forEach(booking => {
      const appointmentItem = {
        id: booking.id,
        teacher: booking.teacher || {},
        studentNames: booking.studentNames,
        info: booking.info,
        schedule: booking.schedule,
        venue: booking.venue,
        status: booking.status,
        created_at: booking.created_at,
      };
      if (booking.status === "pending") {
        categorizedAppointments.pending.push(appointmentItem);
      } else if (booking.status === "confirmed") {
        categorizedAppointments.upcoming.push(appointmentItem);
      }
    });

    categorizedAppointments.pending.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    categorizedAppointments.upcoming.sort((a, b) => new Date(a.schedule) - new Date(b.schedule));

    setAppointments(categorizedAppointments);
  }, [bookings]);

  useEffect(() => {
    if (socket) {
      const handleBookingUpdate = (data) => {
        console.log('Booking update received:', data);
        // Refetch on any booking update, including creates
        refetch();
      };

      socket.on('booking_updated', handleBookingUpdate);
      return () => socket.off('booking_updated', handleBookingUpdate);
    }
  }, [socket, refetch]);

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

// Similarly, update TeacherAppointments to use useQuery
const fetchTeacherAppointments = async () => {
  const teacherID = localStorage.getItem('teacherID');
  const res = await fetch(`http://localhost:5001/bookings/get_bookings?role=faculty&userID=${teacherID}`);
  if (!res.ok) throw new Error('Network response was not ok');
  return res.json();
};

function TeacherAppointments() {
  const { data: appointments = [], refetch } = useQuery('teacherAppointments', fetchTeacherAppointments, {
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });

  const [sortedAppointments, setSortedAppointments] = useState({ pending: [], upcoming: [] });
  const [confirmInputs, setConfirmInputs] = useState({});
  const socket = useSocket('http://localhost:5001');

  // Memoize the sorted appointments
  const sortedData = useMemo(() => {
    const upcomingApps = appointments
      .filter(app => app.status === 'confirmed')
      .sort((a, b) => new Date(a.schedule) - new Date(b.schedule));
    
    const pendingApps = appointments
      .filter(app => app.status === 'pending')
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    return {
      upcoming: upcomingApps,
      pending: pendingApps
    };
  }, [appointments]);

  // Update state when memoized data changes
  useEffect(() => {
    setSortedAppointments(sortedData);
  }, [sortedData]);

  // Memoize the booking update handler
  const handleBookingUpdate = useCallback(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    if (socket) {
      socket.on('booking_updated', handleBookingUpdate);
      return () => socket.off('booking_updated', handleBookingUpdate);
    }
  }, [socket, handleBookingUpdate]);

  const handleConfirmClick = (bookingID) => {
    setConfirmInputs(prev => ({ ...prev, [bookingID]: { schedule: '', venue: '' } }));
  };

  async function confirmBooking(bookingID, schedule, venue) {
    if (!schedule || !venue) {
      // Remove alert; instead, throw an error to be caught later.
      throw new Error("Schedule and venue are required to confirm the booking.");
    }
    const response = await fetch('http://localhost:5001/bookings/confirm_booking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingID, schedule, venue }),
    });
    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.error || "Unknown error");
    }
    // On success no alert will be shown.
  }

  async function cancelBooking(bookingID) {
    const response = await fetch('http://localhost:5001/bookings/cancel_booking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingID }),
    });
    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.error || "Unknown error");
    }
    // On success, no alert is shown.
  }

  async function startSession(appointment) {
    const teacherID = localStorage.getItem('teacherID');
    // Remove the prefix since it's already in the correct format
    const studentIDs = appointment.info.map(student => student.ID); // Changed from student.id
    const teacherInfo = appointment.teacher ? encodeURIComponent(JSON.stringify(appointment.teacher)) : '';
    const studentInfo = appointment.info ? encodeURIComponent(JSON.stringify(appointment.info)) : '';
    const venue = appointment.venue ? encodeURIComponent(appointment.venue) : '';
    const sessionUrl = `/session?teacherID=${teacherID}&studentIDs=${studentIDs.join(',')}&teacherInfo=${teacherInfo}&studentInfo=${studentInfo}&venue=${venue}&booking_id=${appointment.id}`;
    window.open(sessionUrl, '_blank');
  }

  return (
    <div className="grid grid-cols-2 gap-5 h-full">
      <section className="bg-white rounded-xl shadow-sm p-6 flex flex-col max-h-[77vh]">
        <h3 className="text-xl font-semibold mb-4 text-[#0065A8] border-b-2 border-[#54BEFF] pb-2 sticky top-0 bg-white z-10">
          Pending Appointments
        </h3>
        <div className="flex-1 overflow-y-auto min-h-0">
          {sortedAppointments.pending.length > 0 ? (
            <ul className="space-y-4 pr-2">
              {sortedAppointments.pending.map(app => (
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
          {sortedAppointments.upcoming.length > 0 ? (
            <ul className="space-y-4 pr-2">
              {sortedAppointments.upcoming.map(app => (
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
  const [role, setRole] = useState(() => {
    // Initialize role from localStorage immediately
    return localStorage.getItem('userRole')?.toLowerCase() || '';
  });

  // Remove the role-setting effect that was causing multiple updates
  // The role should now be stable from initial state

  if (!role) return <p>Loading...</p>;
  
  return (
    <div className="h-screen overflow-hidden p-8">
      <h2 className="text-3xl font-bold mb-8 text-center text-[#0065A8]">Appointments</h2>
      <div className="bg-[#dceffa] rounded-xl p-6 shadow-sm h-[calc(100vh-8rem)]">
        {role === 'student' ? <StudentAppointments /> : role === 'faculty' ? <TeacherAppointments /> : <p>No appointments available for your role.</p>}
      </div>
    </div>
  );
}

export default Appointments;
