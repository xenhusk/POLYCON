import React, { useEffect, useState, useCallback } from 'react';
import { useSocket } from '../../hooks/useSocket';

const StudentAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Use the improved hook
  const { isConnected, on, off } = useSocket('http://localhost:5001');
  
  // Create a function to fetch appointments
  const fetchAppointments = useCallback(async () => {
    try {
      const userID = localStorage.getItem('userID');
      if (!userID) {
        console.error('No user ID found');
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      const response = await fetch(`http://localhost:5001/bookings/get_bookings?role=student&userID=${userID}&status=confirmed`);
      
      if (!response.ok) throw new Error('Failed to fetch appointments');
      
      const data = await response.json();
      setAppointments(data);
      console.log('Appointments fetched:', data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Fetch appointments on mount
  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);
  
  // Set up socket listener after connection is established
  useEffect(() => {
    // Only set up listeners if socket is connected
    if (isConnected) {
      console.log('Setting up booking_update listener');
      
      // Handle booking updates
      const handleBookingUpdate = (data) => {
        console.log('Booking update received:', data);
        fetchAppointments();
      };
      
      // Register event handler
      on('booking_update', handleBookingUpdate);
      
      // Clean up the listener when component unmounts
      return () => {
        console.log('Removing booking_update listener');
        off('booking_update', handleBookingUpdate);
      };
    }
  }, [isConnected, on, off, fetchAppointments]);
  
  if (isLoading) return <div className="p-4 text-center">Loading appointments...</div>;
  
  return (
    <div className="student-appointments p-4">
      <h2 className="text-xl font-semibold mb-4">Your Appointments</h2>
      {isConnected && <div className="text-xs text-green-500 mb-2">Real-time updates enabled</div>}
      
      {appointments.length === 0 ? (
        <p className="text-gray-500">No appointments scheduled.</p>
      ) : (
        <ul className="space-y-4">
          {appointments.map((appointment) => (
            <li key={appointment.id} className="border p-4 rounded shadow-sm hover:shadow-md transition-shadow">
              <h3 className="font-medium text-lg">{appointment.title || "Consultation"}</h3>
              <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                <p><span className="font-medium">Date:</span> {new Date(appointment.date).toLocaleDateString()}</p>
                <p><span className="font-medium">Time:</span> {appointment.time}</p>
                <p><span className="font-medium">Faculty:</span> {appointment.faculty_name}</p>
                <p><span className="font-medium">Status:</span> 
                  <span className={`ml-1 ${
                    appointment.status === 'confirmed' ? 'text-green-600' : 
                    appointment.status === 'pending' ? 'text-yellow-600' : 
                    'text-red-600'
                  }`}>
                    {appointment.status}
                  </span>
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default StudentAppointments;
