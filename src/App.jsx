import { useState } from "react";
import SignInScreen from "./components/auth/SignInScreen";
import SignUpScreen from "./components/auth/SignUpScreen";
import { Routes, Route } from "react-router-dom";
import ChatHome from "./pages/ChatHome";
import ProtectedRoute from "./components/shared/ProtectedRoute";

function App() {
  const [activeScreen, setActiveScreen] = useState("signin");

  return (
    <Routes>
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <ChatHome />
          </ProtectedRoute>
        }
      />
      <Route path="/signin" element={<SignInScreen />} />
      <Route path="/signup" element={<SignUpScreen />} />
    </Routes>
  );
}

export default App;
