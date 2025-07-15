import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./Components/Navbar";
import Home from "./pages/Home";
import GiveInterview from "./pages/GiveInterview";
import Interview from "./pages/Interview";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Footer from "./Components/Footer";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isLoggedIn, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }
  
  return isLoggedIn ? children : <Navigate to="/login" replace />;
};

const AppContent = () => {
  const { isLoggedIn } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/select-preferences" element={
            <ProtectedRoute>
              <GiveInterview />
            </ProtectedRoute>
          } />
          <Route path="/interview" element={
            <ProtectedRoute>
              <Interview />
            </ProtectedRoute>
          } />
          <Route path="/login" element={
            isLoggedIn ? <Navigate to="/" replace /> : <Login />
          } />
          <Route path="/signup" element={
            isLoggedIn ? <Navigate to="/" replace /> : <Signup />
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}
