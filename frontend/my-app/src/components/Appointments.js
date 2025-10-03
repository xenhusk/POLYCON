import React from 'react';
import AppointmentsPage from '../pages/Appointments';

// Delegate to the updated Appointments page so both routes and component usage
// share the same stacked layout and carousel UI.
const Appointments = React.memo(() => <AppointmentsPage />);

Appointments.displayName = 'Appointments';
export default Appointments;
