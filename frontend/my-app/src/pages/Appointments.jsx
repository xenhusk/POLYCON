import React from 'react';
import { usePreloadedData } from '../context/PreloadContext';
import ReloadButton from '../components/ReloadButton';

function Appointments() {
  const { preloadedData, isLoading, isInitialized } = usePreloadedData();
  const appointments = preloadedData.appointments;

  if (!isInitialized || isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {/* Use preloaded appointments data */}
      {appointments?.map(appointment => (
        <div key={appointment.id}>
          {/* Appointment details */}
        </div>
      ))}
      
      {/* Optional manual reload button */}
      <ReloadButton pageType="appointments" />
    </div>
  );
}

export default Appointments;
