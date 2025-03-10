import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useQuery } from "react-query";
import AppointmentItem from "../components/AppointmentItem";
import { useSocket } from "../hooks/useSocket";

// Fetch student appointments via React Query
const fetchStudentAppointments = async () => {
  const studentID = localStorage.getItem("studentID");
  // Artificial 2-second delay:
  await new Promise((resolve) => setTimeout(resolve, 2000));
  const res = await fetch(
    `http://localhost:5001/bookings/get_bookings?role=student&userID=${studentID}`
  );
  if (!res.ok) throw new Error("Network response was not ok");
  return res.json();
};

function StudentAppointments() {
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
  const socket = useSocket("http://localhost:5001");

  useEffect(() => {
    const categorizedAppointments = { pending: [], upcoming: [] };
    bookings.forEach((booking) => {
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

    categorizedAppointments.pending.sort(
      (a, b) => new Date(a.created_at) - new Date(b.created_at)
    );
    categorizedAppointments.upcoming.sort(
      (a, b) => new Date(a.schedule) - new Date(b.schedule)
    );

    setAppointments(categorizedAppointments);
  }, [bookings]);

  useEffect(() => {
    if (socket) {
      const handleBookingUpdate = (data) => {
        console.log("Booking update received:", data);
        // Refetch on any booking update, including creates
        refetch();
      };

      socket.on("booking_updated", handleBookingUpdate);
      return () => socket.off("booking_updated", handleBookingUpdate);
    }
  }, [socket, refetch]);

  return (
    <div className="grid grid-cols-1 gap-5 h-full sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2">
      {/* Pending Appointments Section */}
      <section className="bg-white rounded-xl shadow-sm p-6 flex flex-col max-h-[76vh] sm:order-1 md:order-1 lg:order-none">
        <h3 className="text-xl font-semibold mb-4 text-[#0065A8] border-b-2 border-[#54BEFF] pb-2 sticky top-0 bg-white z-10">
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
                    <p className="h-4 bg-gray-300 rounded w-40 mb-2">
                    </p>
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
                      <div className="h-4 bg-gray-300 rounded w-40 mb-2">
                      </div>
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
        <h3 className="text-xl font-semibold mb-4 text-[#0065A8] border-b-2 border-[#54BEFF] pb-2 sticky top-0 bg-white z-10">
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
                    <p className="h-4 bg-gray-300 rounded w-40 mb-2">
                      Student(s)
                    </p>
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
                      <div className="h-4 bg-gray-300 rounded w-40 mb-2">
                      </div>
                      <div className="h-3 bg-gray-200 rounded w-24"></div>
                    </div>
                    <div>
                      <div className="h-4 bg-gray-300 rounded w-40 mb-2">
                      </div>
                      <div className="h-3 bg-gray-200 rounded w-24"></div>
                    </div>
                    <div>
                      <div className="h-4 bg-gray-300 rounded w-40 mb-2">
                      </div>
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
    `http://localhost:5001/bookings/get_bookings?role=faculty&userID=${teacherID}`
  );
  if (!res.ok) throw new Error("Network response was not ok");
  return res.json();
};

function TeacherAppointments() {
  const {
    data: appointments = [],
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
  const socket = useSocket("http://localhost:5001");

  // Memoize the sorted appointments
  const sortedData = useMemo(() => {
    const upcomingApps = appointments
      .filter((app) => app.status === "confirmed")
      .sort((a, b) => new Date(a.schedule) - new Date(b.schedule));

    const pendingApps = appointments
      .filter((app) => app.status === "pending")
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    return {
      upcoming: upcomingApps,
      pending: pendingApps,
    };
  }, [appointments]);

  useEffect(() => {
    setSortedAppointments(sortedData);
  }, [sortedData]);

  const handleBookingUpdate = useCallback(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    if (socket) {
      socket.on("booking_updated", handleBookingUpdate);
      return () => socket.off("booking_updated", handleBookingUpdate);
    }
  }, [socket, handleBookingUpdate]);

  const handleConfirmClick = (bookingID) => {
    setConfirmInputs((prev) => ({
      ...prev,
      [bookingID]: { schedule: "", venue: "" },
    }));
  };

  async function confirmBooking(bookingID, schedule, venue) {
    if (!schedule || !venue) {
      throw new Error(
        "Schedule and venue are required to confirm the booking."
      );
    }
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
      throw new Error(result.error || "Unknown error");
    }
  }

  async function cancelBooking(bookingID) {
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
      throw new Error(result.error || "Unknown error");
    }
  }

  async function startSession(appointment) {
    const teacherID = localStorage.getItem("teacherID");
    const studentIDs = appointment.info.map((student) => student.ID);
    const teacherInfo = appointment.teacher
      ? encodeURIComponent(JSON.stringify(appointment.teacher))
      : "";
    const studentInfo = appointment.info
      ? encodeURIComponent(JSON.stringify(appointment.info))
      : "";
    const venue = appointment.venue
      ? encodeURIComponent(appointment.venue)
      : "";
    const sessionUrl = `/session?teacherID=${teacherID}&studentIDs=${studentIDs.join(
      ","
    )}&teacherInfo=${teacherInfo}&studentInfo=${studentInfo}&venue=${venue}&booking_id=${
      appointment.id
    }`;
    window.open(sessionUrl, "_blank");
  }

  return (
    <div
      className="grid grid-cols-1 gap-5 h-full sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2"
    >
      <section className="bg-white rounded-xl shadow-sm p-6 flex flex-col max-h-[76vh] sm:order-1 md:order-none lg:order-none">
        <h3 className="text-xl font-semibold mb-4 text-[#0065A8] border-b-2 border-[#54BEFF] pb-2 top-0 bg-white z-10">
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
                    <p className="h-4 bg-gray-300 rounded w-40 mb-2">
                      Student(s)
                    </p>
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
                      <div className="h-4 bg-gray-300 rounded w-40 mb-2">
                      </div>
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
        <h3 className="text-xl font-semibold mb-4 text-[#0065A8] border-b-2 border-[#54BEFF] pb-2 sticky top-0 bg-white z-10">
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
                    <p className="h-4 bg-gray-300 rounded w-40 mb-2">Teacher</p>
                    <div className="flex items-center">
                      <div className="w-8 sm:w-10 md:w-12 h-8 sm:h-10 md:h-12 bg-gray-200 rounded-full mr-3 border-2 border-[#54BEFF]"></div>
                      <div className="h-4 bg-gray-300 rounded w-40"></div>
                    </div>
                  </div>
                  {/* Student(s) Section Skeleton */}
                  <div className="mt-4 fade-in delay-200">
                    <p className="h-4 bg-gray-300 rounded w-40 mb-2">
                    </p>
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
                      <div className="h-4 bg-gray-300 rounded w-40 mb-2">
                      </div>
                      <div className="h-3 bg-gray-200 rounded w-24"></div>
                    </div>
                    <div>
                      <div className="h-4 bg-gray-300 rounded w-40 mb-2">
                      </div>
                      <div className="h-3 bg-gray-200 rounded w-24"></div>
                    </div>
                    <div>
                      <div className="h-4 bg-gray-300 rounded w-40 mb-2">
                      </div>
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
