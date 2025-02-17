import React, { useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import HistoryItem from '../components/HistoryItem';
import apiClient from '../utils/apiClient';

function History() {
  const role = localStorage.getItem('userRole')?.toLowerCase();
  const userID = role === 'faculty' ? localStorage.getItem('teacherID') : localStorage.getItem('studentID');
  
  const { data: sessions = [], isLoading, error, refetch } = useQuery(
    ['history', role, userID],
    () => apiClient.consultations.getHistory(role, userID),
    {
      enabled: !!role && !!userID,
      staleTime: 30000,
      refetchOnWindowFocus: false,
      select: (data) => {
        if (!Array.isArray(data)) return [];
        return data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      }
    }
  );

  if (!role || !userID) {
    return <p className="text-center text-red-500">Missing user information</p>;
  }

  return (
    <div className="h-screen overflow-hidden p-8 fade-in">
      <h2 className="text-3xl font-bold mb-8 text-center text-[#0065A8] fade-in delay-100">
        Session History
      </h2>
      <div className="bg-[#dceffa] rounded-xl p-6 shadow-sm h-[calc(100vh-8rem)] overflow-y-auto fade-in delay-200">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-pulse text-lg text-gray-600">
              Fetching history...
            </div>
          </div>
        ) : error ? (
          <div className="text-red-500 text-center">
            <p>Error loading history</p>
            <button 
              onClick={() => refetch()} 
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Try Again
            </button>
          </div>
        ) : sessions.length > 0 ? (
          <ul className="space-y-4">
            {sessions.map((session, index) => (
              <HistoryItem 
                key={session.session_id} 
                session={session}
                className={`fade-in delay-${(index + 3) * 100}`}
              />
            ))}
          </ul>
        ) : (
          <div className="text-center text-gray-500 italic">
            <p>No session history available</p>
            <button 
              onClick={() => refetch()} 
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Refresh
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default History;
