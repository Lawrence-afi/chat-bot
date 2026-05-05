import React from "react";
import { Navigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  const hydrated = useAuthStore((state) => state.hydrated);

  // If not hydrated yet, show nothing (or a loading spinner)
  if (!hydrated) {
    return null; // or <div>Loading...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  return children;
};

export default ProtectedRoute;
