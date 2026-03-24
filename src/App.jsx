import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Authentication/Login';
import Register from './pages/Authentication/Register';
import RegistrationSuccess from './pages/Authentication/RegistrationSuccess';
import ForgotPassword from './pages/Authentication/ForgotPassword';
import ResetPassword from './pages/Authentication/ResetPassword';
import VerifyEmail from './pages/Authentication/VerifyEmail';
import SocialCallback from './pages/Authentication/SocialCallback';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Routine from './pages/Dashboard/Routine';
import ProtectedRoute from './components/ProtectedRoute';
import { Toaster } from 'sonner';
import { useUserQuery } from './pages/Authentication/http/authQueries';

function App() {
  // TanStack Query handles fetching user profile on mount automatically
  useUserQuery();

  return (
    <Router>
      <Toaster richColors position="top-right" closeButton />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/registration-success" element={<RegistrationSuccess />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-email/:uuid/:hash" element={<VerifyEmail />} />
        <Route path="/auth/callback/:provider" element={<SocialCallback />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/routine" element={<Routine />} />
        </Route>

        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
