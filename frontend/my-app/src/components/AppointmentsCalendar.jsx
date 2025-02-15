import React from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const AppointmentsCalendar = () => {
  // ...existing state...

  return (
    <div className="w-full overflow-x-auto"> {/* Force full width and allow horizontal scroll if needed */}
      <div className="min-w-[800px]"> {/* Set minimum width to prevent squishing */}
        <Calendar
          localizer={momentLocalizer(moment)}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{
            height: 'calc(100vh - 250px)',
            width: '100%',
          }}
          views={['month', 'week', 'day']}
          defaultView='month'
        />
      </div>
    </div>
  );
};

export default AppointmentsCalendar;
