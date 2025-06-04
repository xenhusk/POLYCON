import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useQuery } from "react-query";
import AppointmentItem from "../components/AppointmentItem";
import { showErrorNotification } from '../utils/notificationUtils';
import { useToast } from '../contexts/ToastContext';
import io from 'socket.io-client';

// Request notification permission on component load
if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
  Notification.requestPermission();
}

// Fetch student appointments via React Query
const fetchStudentAppointments = async () => {
  const studentID = localStorage.getItem("studentID");
  // Artificial 2-second delay:
  await new Promise((resolve) => setTimeout(resolve, 2000));
  const res = await fetch(
    `http://localhost:5001/bookings/get_bookings?role=student&idNumber=${studentID}`
  );
  if (!res.ok) throw new Error("Network response was not ok");
  return res.json();
};

function StudentAppointments() {
  const { showBookingCreated, showBookingConfirmed, showBookingCancelled } = useToast();
  
  const {
    data: bookings = [],
    refetch,
    isLoading,
  } = useQuery("studentAppointments", fetchStudentAppointments, {
    staleTime: 30000, // 30 seconds caching
    refetchOnWindowFocus: false,
  });

  const [appointments, setAppointments] = useState({
    pending: [],
    upcoming: [],
  });

  useEffect(() => {
    const categorizedAppointments = { pending: [], upcoming: [] };
    console.log("Appointments.js - Raw bookings data:", bookings); // Log raw bookings
    bookings.forEach((booking) => {      // Build appointment object for displaying in AppointmentItem
      const appointmentItem = {
        id: booking.id,
        teacher: {
          profile_picture: booking.teacherProfile,
          teacherName: booking.teacherName,
        },
        studentNames: booking.studentNames,
        // Transform studentProfiles to match AppointmentItem expected fields
        info: Array.isArray(booking.studentProfiles) ? booking.studentProfiles.map((s) => {
          const [firstName, ...rest] = s.name.split(" ");
          return {
            id: s.id,
            profile_picture: s.profile,
            firstName,
            lastName: rest.join(" "),
          };
        }) : [], // Default to empty array if studentProfiles is not an array
        schedule: booking.schedule,
        venue: booking.venue,
        status: booking.status,
        created_at: booking.created_at,
      };
      console.log("Appointments.js - Constructed appointmentItem:", appointmentItem); // Log constructed item
      if (booking.status === "pending") {
        categorizedAppointments.pending.push(appointmentItem);
      } else if (booking.status === "confirmed") {
        categorizedAppointments.upcoming.push(appointmentItem);
      }
    });

    categorizedAppointments.pending.sort(
      (a, b) => new Date(a.created_at) - new Date(b.created_at)
    );
    categorizedAppointments.upcoming.sort(
      (a, b) => new Date(a.schedule) - new Date(b.schedule)
    );

    setAppointments(categorizedAppointments);
  }, [bookings]);  useEffect(() => {
    const socket = io('http://localhost:5001');
    
    // Add connection event handlers
    socket.on('connect', () => {
      console.log('📡 StudentAppointments: Socket connected');
    });
    
    socket.on('disconnect', () => {
      console.log('📡 StudentAppointments: Socket disconnected');
    });
    
    socket.on('connect_error', (error) => {
      console.error('📡 StudentAppointments: Socket connection error:', error);
    });
    
    const handleBookingCreated = data => {
      console.log("✨ booking_created received:", data);
      showBookingCreated(`Subject: ${data.subject || 'Consultation'}`);
      refetch();
    };
    const handleBookingConfirmed = data => {
      console.log("✅ booking_confirmed received:", data);
      showBookingConfirmed(`Appointment ${data.id} confirmed`);
      refetch();
    };
    const handleBookingCancelled = data => {
      console.log("❌ booking_cancelled received:", data);
      showBookingCancelled(`Appointment ${data.id} cancelled`);
      refetch();
    };

    console.log("📱 StudentAppointments: Listening to booking_created/confirmed/cancelled events");
    socket.on('booking_created', handleBookingCreated);
    socket.on('booking_confirmed', handleBookingConfirmed);
    socket.on('booking_cancelled', handleBookingCancelled);
    
    return () => {
      console.log("📱 StudentAppointments: Removing Socket.IO listeners");
      socket.off('booking_created', handleBookingCreated);
      socket.off('booking_confirmed', handleBookingConfirmed);
      socket.off('booking_cancelled', handleBookingCancelled);
      socket.disconnect();
    };
  }, [refetch, showBookingCreated, showBookingConfirmed, showBookingCancelled]);

  return (
    <div className="grid grid-cols-1 gap-5 h-full sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2">
      {/* Pending Appointments Section */}
      <section className="bg-white rounded-xl shadow-sm p-6 flex flex-col max-h-[76vh] sm:order-1 md:order-1 lg:order-none">
        <h3 className="text-xl font-semibold mb-4 text-[#0065A8] border-b-2 border-[#54BEFF] sticky pb-2 top-0 bg-white">
          Pending Appointments
        </h3>
        <div className="flex-1 overflow-y-auto min-h-0 Appointments-scroll">
          {isLoading ? (
            <ul className="space-y-4 pr-2">
              {Array.from({ length: 1 }).map((_, index) => (
                <li
                  key={index}
                  className="bg-white rounded-lg shadow-md p-6 my-4 border-l-4 border-[#0065A8] hover:shadow-lg transition-shadow flex flex-col fade-in delay-300 animate-pulse"
                >
                  {/* Teacher Section Skeleton */}
                  <div className="mb-4 fade-in delay-100">
                    <p className="h-4 bg-gray-300 rounded w-40 mb-2"></p>
                    <div className="flex items-center">
                      <div className="w-8 sm:w-10 md:w-12 h-8 sm:h-10 md:h-12 bg-gray-200 rounded-full mr-3 border-2 border-[#54BEFF]"></div>
                      <div className="h-4 bg-gray-300 rounded w-40"></div>
                    </div>
                  </div>
                  {/* Student(s) Section Skeleton */}
                  <div className="mt-4 fade-in delay-200">
                    <p className="h-4 bg-gray-300 rounded w-40 mb-2"></p>
                    <div className="flex flex-wrap items-center gap-3">
                      {Array.from({ length: 3 }).map((_, index) => (
                        <div
                          key={index}
                          className="flex items-center bg-gray-50 rounded-full px-3 py-1"
                        >
                          <div className="w-8 sm:w-10 md:w-12 h-8 sm:h-10 md:h-12 bg-gray-200 rounded-full mr-2 border-2 border-[#54BEFF]"></div>
                          <div className="h-3 bg-gray-300 rounded w-20"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Details Section Skeleton */}
                  <div className="grid grid-cols-2 gap-4 mt-4 fade-in delay-300">
                    <div>
                      <div className="h-4 bg-gray-300 rounded w-40 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-24"></div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : appointments?.pending?.length > 0 ? (
            <ul className="space-y-4 pr-2">
              {appointments.pending.map((app) => (
                <AppointmentItem
                  key={app.id}
                  appointment={app}
                  role="student"
                />
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 italic">No pending appointments</p>
          )}
        </div>
      </section>

      {/* Upcoming Appointments Section */}
      <section className="bg-white rounded-xl shadow-sm p-6 flex flex-col max-h-[76vh] sm:order-2 md:order-2 lg:order-none">
        <h3 className="text-xl font-semibold mb-4 text-[#0065A8] border-b-2 border-[#54BEFF] pb-2 sticky top-0 bg-white">
          Upcoming Appointments
        </h3>
        <div className="flex-1 overflow-y-auto min-h-0 Appointments-scroll">
          {isLoading ? (
            <ul className="space-y-4 pr-2">
              {Array.from({ length: 1 }).map((_, index) => (
                <li
                  key={index}
                  className="bg-white rounded-lg shadow-md p-6 my-4 border-l-4 border-[#0065A8] hover:shadow-lg transition-shadow flex flex-col fade-in delay-300 animate-pulse"
                >
                  {/* Teacher Section Skeleton */}
                  <div className="mb-4 fade-in delay-100">
                    <p className="h-4 bg-gray-300 rounded w-40 mb-2"></p>
                    <div className="flex items-center">
                      <div className="w-8 sm:w-10 md:w-12 h-8 sm:h-10 md:h-12 bg-gray-200 rounded-full mr-3 border-2 border-[#54BEFF]"></div>
                      <div className="h-4 bg-gray-300 rounded w-40"></div>
                    </div>
                  </div>
                  {/* Student(s) Section Skeleton */}
                  <div className="mt-4 fade-in delay-200">
                    <p className="h-4 bg-gray-300 rounded w-40 mb-2">Student(s)</p>
                    <div className="flex flex-wrap items-center gap-3">
                      {Array.from({ length: 3 }).map((_, index) => (
                        <div
                          key={index}
                          className="flex items-center bg-gray-50 rounded-full px-3 py-1"
                        >
                          <div className="w-8 sm:w-10 md:w-12 h-8 sm:h-10 md:h-12 bg-gray-200 rounded-full mr-2 border-2 border-[#54BEFF]"></div>
                          <div className="h-3 bg-gray-300 rounded w-20"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Details Section Skeleton */}
                  <div className="grid grid-cols-2 gap-4 mt-4 fade-in delay-300">
                    <div>
                      <div className="h-4 bg-gray-300 rounded w-40 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-24"></div>
                    </div>
                    <div>
                      <div className="h-4 bg-gray-300 rounded w-40 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-24"></div>
                    </div>
                    <div>
                      <div className="h-4 bg-gray-300 rounded w-40 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-24"></div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : appointments?.upcoming?.length > 0 ? (
            <ul className="space-y-4 pr-2">
              {appointments.upcoming.map((app) => (
                <AppointmentItem
                  key={app.id}
                  appointment={app}
                  role="student"
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

// Fetch teacher appointments via React Query
const fetchTeacherAppointments = async () => {
  const teacherID = localStorage.getItem("teacherID");
  const res = await fetch(
    `http://localhost:5001/bookings/get_bookings?role=faculty&idNumber=${teacherID}`
  );
  if (!res.ok) throw new Error("Network response was not ok");
  return res.json();
};

function TeacherAppointments() {
  const { showBookingCreated, showBookingConfirmed, showBookingCancelled } = useToast();
  
  const {
    data: appointmentsData = [], // Renamed to avoid conflict
    refetch,
    isLoading,
  } = useQuery("teacherAppointments", fetchTeacherAppointments, {
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });

  const [sortedAppointments, setSortedAppointments] = useState({
    pending: [],
    upcoming: [],
  });
  const [confirmInputs, setConfirmInputs] = useState({});

  // Memoize the sorted appointments
  const sortedData = useMemo(() => {
    console.log("TeacherAppointments - Raw appointmentsData:", appointmentsData); // Log raw data

    const transformAppointment = (app) => ({
      ...app,
      info: Array.isArray(app.studentProfiles) ? app.studentProfiles.map((s) => {
        const [firstName, ...rest] = (s.name || '').split(" "); 
        return {
          id: s.id, // Keep this as the unique key for React lists or other internal uses
          idNumber: s.idNumber, // Assuming 's.idNumber' holds the student's ID number
          profile_picture: s.profile,
          firstName,
          lastName: rest.join(" "),
        };
      }) : [], 
    });

    const upcomingApps = appointmentsData
      .filter((app) => app.status === "confirmed")
      .map(transformAppointment)
      .sort((a, b) => new Date(a.schedule) - new Date(b.schedule));

    const pendingApps = appointmentsData
      .filter((app) => app.status === "pending")
      .map(transformAppointment)
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    return {
      upcoming: upcomingApps,
      pending: pendingApps,
    };
  }, [appointmentsData]); // Dependency: raw \'appointmentsData\'

  useEffect(() => {
    setSortedAppointments(sortedData);
  }, [sortedData]);  const handleBookingUpdateOrCreate = useCallback((data) => {
    console.log("🔄 TeacherAppointments: booking_updated or booking_created event received:", data);
    
    // Display notification based on status
    if (data && data.status) {
      if (data.status === 'confirmed') {
        showBookingConfirmed(`An appointment has been confirmed. Refreshing your appointments...`);
      } else if (data.status === 'cancelled') {
        showBookingCancelled(`An appointment has been cancelled. Refreshing your appointments...`);
      } else {
        showBookingCreated(`An appointment has been requested. Refreshing your appointments...`);
      }
    }
    
    // Refetch data
    console.log("Refetching teacher appointments due to Socket.IO event");
    refetch();
  }, [refetch, showBookingCreated, showBookingConfirmed, showBookingCancelled]);
  useEffect(() => {
    const socket = io('http://localhost:5001');
    
    // Add connection event handlers
    socket.on('connect', () => {
      console.log('📡 TeacherAppointments: Socket connected');
    });
    
    socket.on('disconnect', () => {
      console.log('📡 TeacherAppointments: Socket disconnected');
    });
    
    socket.on('connect_error', (error) => {
      console.error('📡 TeacherAppointments: Socket connection error:', error);
    });
    
    console.log("📱 TeacherAppointments: Listening to booking_created/confirmed/cancelled events");
    socket.on('booking_created', handleBookingUpdateOrCreate);
    socket.on('booking_confirmed', handleBookingUpdateOrCreate);
    socket.on('booking_cancelled', handleBookingUpdateOrCreate);
    
    return () => {
      console.log("📱 TeacherAppointments: Removing Socket.IO listeners");
      socket.off('booking_created', handleBookingUpdateOrCreate);
      socket.off('booking_confirmed', handleBookingUpdateOrCreate);
      socket.off('booking_cancelled', handleBookingUpdateOrCreate);
      socket.disconnect();
    };
  }, [handleBookingUpdateOrCreate]);

  const handleConfirmClick = (bookingID) => {
    setConfirmInputs((prev) => ({
      ...prev,
      [bookingID]: { schedule: "", venue: "" },
    }));
  };
  async function confirmBooking(bookingID, schedule, venue) {
    if (!schedule || !venue) {
      showErrorNotification("Schedule and venue are required to confirm the booking.");
      throw new Error(
        "Schedule and venue are required to confirm the booking."
      );
    }
    try {
      const response = await fetch(
        "http://localhost:5001/bookings/confirm_booking",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bookingID, schedule, venue }),
        }
      );
      if (!response.ok) {
        const result = await response.json();
        console.error("Failed to confirm booking:", result.error || "Unknown error");
        // Consider displaying this error to the user
        throw new Error(result.error || "Unknown error");
      }
      console.log("Booking confirmed successfully, refetching teacher appointments...");
      refetch(); // Refetch appointments
      // Clear the input fields for this booking ID after successful confirmation
      setConfirmInputs(prev => {
        const newInputs = { ...prev };
        delete newInputs[bookingID];
        return newInputs;
      });
    } catch (error) {
      console.error("Error in confirmBooking:", error);
      // Consider displaying this error to the user
      // For example: alert(\`Error confirming booking: \${error.message}\`);
    }
  }

  async function cancelBooking(bookingID) {
    try {
      const response = await fetch(
        "http://localhost:5001/bookings/cancel_booking",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bookingID }),
        }
      );
      if (!response.ok) {
        const result = await response.json();
        console.error("Failed to cancel booking:", result.error || "Unknown error");
        // Consider displaying this error to the user
        throw new Error(result.error || "Unknown error");
      }
      console.log("Booking cancelled successfully, refetching teacher appointments...");
      refetch(); // Refetch appointments
    } catch (error) {
      console.error("Error in cancelBooking:", error);
      // Consider displaying this error to the user
      // For example: alert(\`Error cancelling booking: \${error.message}\`);
    }
  }

  async function startSession(appointment) {
    const teacherID = localStorage.getItem("teacherID");
    // Use student.idNumber for the studentIDs query parameter
    const studentIDs = Array.isArray(appointment.info) ? appointment.info.map((student) => student.idNumber) : [];

    // Construct teacherInfo object for Session.js
    // Session.js expects 'name', 'profile_picture', 'department', and 'role'.
    // 'department' and 'role' are not directly available in the 'appointment' object from booking data.
    // Passing them as null so Session.js can handle them gracefully.
    const teacherDetailsForSession = {
      name: appointment.teacherName,
      profile_picture: appointment.teacherProfile,
      department: null, 
      role: null,       
    };
    const teacherInfoParam = encodeURIComponent(JSON.stringify(teacherDetailsForSession));

    const studentInfoParam = appointment.info
      ? encodeURIComponent(JSON.stringify(appointment.info)) // studentInfo will now also contain idNumber in each student object
      : "";
    const venueParam = appointment.venue
      ? encodeURIComponent(appointment.venue)
      : "";

    const sessionUrl = `/session?teacherID=${teacherID}&studentIDs=${studentIDs.join(
      ","
    )}&teacherInfo=${teacherInfoParam}&studentInfo=${studentInfoParam}&venue=${venueParam}&booking_id=${
      appointment.id
    }`;
    window.open(sessionUrl, "_blank");
  }

  return (
    <div
      className="grid grid-cols-1 gap-5 h-full sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2"
    >
      <section className="bg-white rounded-xl shadow-sm p-6 flex flex-col max-h-[76vh] sm:order-1 md:order-none lg:order-none">
        <h3 className="text-xl font-semibold mb-4 text-[#0065A8] border-b-2 border-[#54BEFF] sticky pb-2 top-0 bg-white">
          Pending Appointments
        </h3>
        <div className="flex-1 overflow-y-auto min-h-0">
          {isLoading ? (
            <ul className="space-y-4 pr-2">
              {Array.from({ length: 1 }).map((_, index) => (
                <li
                  key={index}
                  className="bg-white rounded-lg shadow-md p-6 my-4 border-l-4 border-[#0065A8] hover:shadow-lg transition-shadow flex flex-col fade-in delay-300 animate-pulse"
                >
                  {/* Teacher Section Skeleton */}
                  <div className="mb-4 fade-in delay-100">
                    <p className="h-4 bg-gray-300 rounded w-40 mb-2"></p>
                    <div className="flex items-center">
                      <div className="w-8 sm:w-10 md:w-12 h-8 sm:h-10 md:h-12 bg-gray-200 rounded-full mr-3 border-2 border-[#54BEFF]"></div>
                      <div className="h-4 bg-gray-300 rounded w-40"></div>
                    </div>
                  </div>
                  {/* Student(s) Section Skeleton */}
                  <div className="mt-4 fade-in delay-200">
                    <p className="h-4 bg-gray-300 rounded w-40 mb-2"></p>
                    <div className="flex flex-wrap items-center gap-3">
                      {Array.from({ length: 3 }).map((_, index) => (
                        <div
                          key={index}
                          className="flex items-center bg-gray-50 rounded-full px-3 py-1"
                        >
                          <div className="w-8 sm:w-10 md:w-12 h-8 sm:h-10 md:h-12 bg-gray-200 rounded-full mr-2 border-2 border-[#54BEFF]"></div>
                          <div className="h-3 bg-gray-300 rounded w-20"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Details Section Skeleton */}
                  <div className="grid grid-cols-2 gap-4 mt-4 fade-in delay-300">
                    <div>
                      <div className="h-4 bg-gray-300 rounded w-40 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-24"></div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : sortedAppointments?.pending?.length > 0 ? (
            <ul className="space-y-4 pr-2">
              {sortedAppointments.pending.map((app) => (
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

      <section className="bg-white rounded-xl shadow-sm p-6 flex flex-col max-h-[76vh] sm:order-1 md:order-none lg:order-none">
        <h3 className="text-xl font-semibold mb-4 text-[#0065A8] border-b-2 border-[#54BEFF] pb-2 sticky top-0 bg-white">
          Upcoming Appointments
        </h3>
        <div className="flex-1 overflow-y-auto min-h-0">
          {isLoading ? (
            <ul className="space-y-4 pr-2">
              {Array.from({ length: 1 }).map((_, index) => (
                <li
                  key={index}
                  className="bg-white rounded-lg shadow-md p-6 my-4 border-l-4 border-[#0065A8] hover:shadow-lg transition-shadow flex flex-col fade-in delay-300 animate-pulse"
                >
                  {/* Teacher Section Skeleton */}
                  <div className="mb-4 fade-in delay-100">
                    <p className="h-4 bg-gray-300 rounded w-40 mb-2"></p>
                    <div className="flex items-center">
                      <div className="w-8 sm:w-10 md:w-12 h-8 sm:h-10 md:h-12 bg-gray-200 rounded-full mr-3 border-2 border-[#54BEFF]"></div>
                      <div className="h-4 bg-gray-300 rounded w-40"></div>
                    </div>
                  </div>
                  {/* Student(s) Section Skeleton */}
                  <div className="mt-4 fade-in delay-200">
                    <p className="h-4 bg-gray-300 rounded w-40 mb-2"></p>
                    <div className="flex flex-wrap items-center gap-3">
                      {Array.from({ length: 3 }).map((_, index) => (
                        <div
                          key={index}
                          className="flex items-center bg-gray-50 rounded-full px-3 py-1"
                        >
                          <div className="w-8 sm:w-10 md:w-12 h-8 sm:h-10 md:h-12 bg-gray-200 rounded-full mr-2 border-2 border-[#54BEFF]"></div>
                          <div className="h-3 bg-gray-300 rounded w-20"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Details Section Skeleton */}
                  <div className="grid grid-cols-2 gap-4 mt-4 fade-in delay-300">
                    <div>
                      <div className="h-4 bg-gray-300 rounded w-40 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-24"></div>
                    </div>
                    <div>
                      <div className="h-4 bg-gray-300 rounded w-40 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-24"></div>
                    </div>
                    <div>
                      <div className="h-4 bg-gray-300 rounded w-40 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-24"></div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : sortedAppointments?.upcoming?.length > 0 ? (
            <ul className="">
              {sortedAppointments.upcoming.map((app) => (
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
    return localStorage.getItem("userRole")?.toLowerCase() || "";
  });

  if (!role) return <p>Loading...</p>;

  return (
    <div className="min-h-screen overflow-hidden p-3 sm:p-5 lg:p-7">
      <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold 
                 mb-4 sm:mb-6 lg:mb-8 
                 text-center text-[#0065A8]
                 transition-all duration-300">
        Appointments
      </h2>
      <div className="bg-[#dceffa] rounded-lg sm:rounded-xl 
                  p-4 sm:p-5 lg:p-6 
                  shadow-sm overflow-y-auto transparent-scroll
                  h-[calc(100vh-7rem)] sm:h-[calc(100vh-8rem)]
                  transition-all duration-300">
        {role === "student" ? (
          <StudentAppointments />
        ) : role === "faculty" ? (
          <TeacherAppointments />
        ) : (
          <p>No appointments available for your role.</p>
        )}
      </div>
    </div>
  );
}

export default Appointments;
