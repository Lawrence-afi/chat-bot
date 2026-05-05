import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";

const ProtectedRoute = ({ children }) => {
  const access_token = useAuthStore((state) => state.access_token);
  const hydrated = useAuthStore((state) => state.hydrated);
  const user = useAuthStore((state) => state.user);
  const fetchCurrentUser = useAuthStore((state) => state.fetchCurrentUser);
  const [loadingUser, setLoadingUser] = useState(false);

  useEffect(() => {
    if (!hydrated || !access_token || user || loadingUser) return;

    setLoadingUser(true);
    fetchCurrentUser().finally(() => setLoadingUser(false));
  }, [hydrated, access_token, user, fetchCurrentUser, loadingUser]);

  if (!hydrated) {
    return null;
  }

  if (!access_token) {
    return <Navigate to="/signin" replace />;
  }

  if (!user) {
    return null;
  }

  return children;
};

export default ProtectedRoute;
