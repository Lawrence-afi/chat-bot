import React from "react";
import { Navigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";

const ProtectedRoute = ({ children }) => {
  const access_token = useAuthStore((state) => state.access_token);
  const hydrated = useAuthStore((state) => state.hydrated);

  if (!hydrated) {
    return null;
  }

  if (!access_token) {
    return <Navigate to="/signin" replace />;
  }

  return children;
};

export default ProtectedRoute;
