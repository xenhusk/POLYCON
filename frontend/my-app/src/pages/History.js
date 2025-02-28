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
    <div className="h-screen overflow-hidden p-8 
      md-px:p-6 sm-px:p-4
      fade-in">
      <h2 className="text-3xl font-bold mb-8 text-center text-[#0065A8] 
        md-px:text-2xl md-px:mb-6 
        sm-px:text-xl sm-px:mb-5 
        fade-in delay-100">
        Session History
      </h2>

      <div className="bg-[#dceffa] rounded-xl p-6 shadow-sm h-[calc(100vh-8rem)] overflow-y-auto 
        md-px:p-5 
        sm-px:p-4 
        fade-in delay-200">
        {isLoading ? (
          <ul className="space-y-4">
            {Array.from({ length: 2 }).map((_, index) => (
              <li
                key={index}
                className="bg-white rounded-lg p-4 shadow hover:shadow-lg transition-shadow 
                  cursor-pointer border-l-4 border-[#0065A8] 
                  md-px:p-4 sm-px:p-3 
                  fade-in delay-300 animate-pulse"
              >
                {/* Teacher Section Skeleton */}
                <div className="flex items-center mb-2">
                  <div className="w-12 h-12 bg-gray-200 rounded-full mr-3
                    md-px:w-12 md-px:h-12 
                    sm-px:w-10 sm-px:h-10 
                    xs:w-8 xs:h-8" />
                  <div className="space-y-2">
                    {/* Teacher name */}
                    <div className="h-4 bg-gray-300 rounded w-32
                      md-px:h-4 md-px:w-32
                      sm-px:h-3.5 sm-px:w-28
                      xs:h-3 xs:w-24" />
                    {/* Department */}
                    <div className="h-3 bg-gray-300 rounded w-24
                      md-px:h-3 md-px:w-24
                      sm-px:h-2.5 sm-px:w-20
                      xs:h-2 xs:w-16" />
                  </div>
                </div>

                {/* Session Date Skeleton */}
                <div className="h-3 bg-gray-200 rounded w-40 mb-4
                  md-px:h-3 md-px:mb-4
                  sm-px:h-2.5 sm-px:mb-3
                  xs:h-2 xs:mb-2" />

                {/* Students Section Skeleton */}
                <div className="h-3 bg-gray-300 rounded w-24 mb-2
                  md-px:h-3 md-px:mb-2
                  sm-px:h-2.5 sm-px:mb-1.5
                  xs:h-2 xs:mb-1" />
                <div className="flex flex-wrap items-center gap-3 mb-4
                  md-px:gap-3 md-px:mb-4
                  sm-px:gap-2 sm-px:mb-3
                  xs:gap-1.5 xs:mb-2">
                  {Array.from({ length: 3 }).map((__, i) => (
                    <div
                      key={i}
                      className="flex items-center bg-gray-50 rounded-full px-3 py-1
                        md-px:px-3 md-px:py-1
                        sm-px:px-2 sm-px:py-0.5
                        xs:px-1.5 xs:py-0.5"
                    >
                      <div className="w-8 h-8 rounded-full mr-2 bg-gray-200
                        md-px:w-8 md-px:h-8 md-px:mr-2
                        sm-px:w-7 sm-px:h-7 sm-px:mr-1.5
                        xs:w-6 xs:h-6 xs:mr-1" />
                      <div className="h-3 bg-gray-300 rounded w-20
                        md-px:h-3 md-px:w-20
                        sm-px:h-2.5 sm-px:w-16
                        xs:h-2 xs:w-14" />
                    </div>
                  ))}
                </div>

                {/* Summary Skeleton */}
                <div className="h-3 bg-gray-300 rounded w-24 mb-2
                  md-px:h-3 md-px:mb-2
                  sm-px:h-2.5 sm-px:mb-1.5
                  xs:h-2 xs:mb-1" />
                <div className="h-3 bg-gray-200 rounded w-full mb-1
                  md-px:h-3 md-px:mb-1
                  sm-px:h-2.5 sm-px:mb-0.5
                  xs:h-2 xs:mb-0.5" />
                <div className="h-3 bg-gray-200 rounded w-3/4
                  md-px:h-3
                  sm-px:h-2.5
                  xs:h-2" />
              </li>
            ))}
          </ul>
        ) : error ? (
          <div className="text-red-500 text-center text-base
            md-px:text-base
            sm-px:text-sm
            xs:text-xs">
            <p>Error loading history</p>
            <button
              onClick={() => refetch()}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600
                md-px:px-4 md-px:py-2
                sm-px:px-3 sm-px:py-1.5
                xs:px-2 xs:py-1"
            >
              Try Again
            </button>
          </div>
        ) : sessions.length > 0 ? (
          <ul className="space-y-4 
            md-px:space-y-4
            sm-px:space-y-3
            xs:space-y-2">
            {sessions.map((session, index) => (
              <HistoryItem
                key={session.session_id}
                session={session}
                className={`fade-in delay-${(index + 3) * 100}`}
              />
            ))}
          </ul>
        ) : (
          <div className="text-center text-gray-500 italic text-lg
            md-px:text-base
            sm-px:text-sm
            xs:text-xs">
            <p>No session history available</p>
            <button
              onClick={() => refetch()}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600
                md-px:px-4 md-px:py-2
                sm-px:px-3 sm-px:py-1.5
                xs:px-2 xs:py-1"
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
