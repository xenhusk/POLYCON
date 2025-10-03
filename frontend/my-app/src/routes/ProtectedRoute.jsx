import React from "react";
import { Navigate, Outlet } from "react-router-dom";

/**
 * Centralized route guard.
 * - Checks authentication via localStorage flag or userEmail presence
 * - Optionally enforces role(s)
 */
const ProtectedRoute = ({ roles }) => {
  const isAuthed = localStorage.getItem("isAuthenticated") === "true" || !!localStorage.getItem("userEmail");
  const userRole = localStorage.getItem("userRole");

  if (!isAuthed) {
    return <Navigate to="/" replace />;
  }

  if (roles && roles.length > 0 && !roles.includes(userRole)) {
    // If role mismatch, send to a safe default
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;


