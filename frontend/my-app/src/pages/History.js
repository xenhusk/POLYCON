import React, { useEffect, useState } from 'react';
import AppointmentItem from '../components/AppointmentItem'; // reuse design from appointments
import { useSocket } from '../hooks/useSocket';
import HistoryItem from '../components/HistoryItem';  // Add this import

function History() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const role = localStorage.getItem('userRole')?.toLowerCase();
  const userID = role === 'faculty' ? localStorage.getItem('teacherID') : localStorage.getItem('studentID');
  const socket = useSocket('http://localhost:5001');

  const fetchHistory = async () => {
    try {
      const response = await fetch(`http://localhost:5001/consultation/get_history?role=${role}&userID=${userID}`);
      const data = await response.json();
      console.log('History:', data);
      if (response.ok && Array.isArray(data)) {
        // sort sessions by creation or scheduled time
        const sorted = data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setSessions(sorted);
      } else {
        console.error('Error fetching history:', data.error);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userID) {
      setError('User ID is missing');
      setLoading(false);
      return;
    }
    fetchHistory();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('session_updated', fetchHistory);
      return () => socket.off('session_updated');
    }
  }, [socket]);

  return (
    <div className="h-screen overflow-hidden p-8">
      <h2 className="text-3xl font-bold mb-8 text-[#0065A8]">Session History</h2>
      <div className="bg-[#dceffa] rounded-xl p-6 shadow-sm h-[calc(100vh-8rem)] overflow-y-auto">
        {loading ? (
          <p>Loading history...</p>
        ) : error ? (
          <p>Error: {error}</p>
        ) : sessions.length > 0 ? (
          <ul className="space-y-4">
            {sessions.map(session => (
              <HistoryItem 
                key={session.session_id} 
                session={session}
              />
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 italic">No session history available.</p>
        )}
      </div>
    </div>
  );
}

export default History;
