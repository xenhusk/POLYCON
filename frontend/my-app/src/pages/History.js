import React from "react";
import { useQuery } from "react-query";
import HistoryItem from "../components/HistoryItem";
import apiClient from "../utils/apiClient";

function History() {
  const role = localStorage.getItem("userRole")?.toLowerCase();
  const userID =
    role === "faculty"
      ? localStorage.getItem("teacherID")
      : localStorage.getItem("studentID");

  const {
    data: sessions = [],
    isLoading,
    error,
    refetch,
  } = useQuery(
    ["history", role, userID],
    () => apiClient.consultations.getHistory(role, userID),
    {
      enabled: !!role && !!userID,
      staleTime: 30000,
      refetchOnWindowFocus: false,
      select: (data) => {
        if (!Array.isArray(data)) return [];
        return data.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
      },
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
          <ul className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <li
                key={index}
                className="bg-white rounded-lg p-4 shadow hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-[#0065A8] fade-in delay-300 animate-pulse"
              >
                {/* Teacher Section Skeleton */}
                <div className="flex items-center mb-2">
                  <div className="w-12 h-12 bg-gray-200 rounded-full mr-3" />
                  <div className="space-y-2">
                    {/* Teacher name */}
                    <div className="h-4 bg-gray-300 rounded w-32" />
                    {/* Department */}
                    <div className="h-3 bg-gray-300 rounded w-24" />
                  </div>
                </div>

                {/* Session Date Skeleton */}
                <div className="h-3 bg-gray-200 rounded w-40 mb-4" />

                {/* Students Section Skeleton */}
                <div className="h-3 bg-gray-300 rounded w-24 mb-2" />
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  {Array.from({ length: 3 }).map((__, i) => (
                    <div
                      key={i}
                      className="flex items-center bg-gray-50 rounded-full px-3 py-1"
                    >
                      <div className="w-8 h-8 rounded-full mr-2 bg-gray-200" />
                      <div className="h-3 bg-gray-300 rounded w-20" />
                    </div>
                  ))}
                </div>

                {/* Summary Skeleton */}
                <div className="h-3 bg-gray-300 rounded w-24 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-full mb-1" />
                <div className="h-3 bg-gray-200 rounded w-3/4" />
              </li>
            ))}
          </ul>
        ) : error ? (
          // Error State
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
          // Render the actual history
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
          // No sessions found
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
