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
import DashboardLayout from './components/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import { Toaster } from 'sonner';
import { useUserQuery } from './pages/Authentication/http/authQueries';

import Dashboard from './pages/Dashboard/index.jsx';
import Analytics from './pages/Analytics/index.jsx';
import TrackProgress from './pages/TrackProgress/index.jsx';
import TrackExpense from './pages/TrackExpense/index.jsx';
import SettingsPage from './pages/Settings/index.jsx';
import Profile from './pages/Settings/Profile/index.jsx';
import Notifications from './pages/Settings/Notifications/index.jsx';

function App() {
    useUserQuery();

    return (
        <Router>
            <Toaster richColors position="top-right" closeButton />
            <Routes>
                {/* Public Routes */}
                <Route element={<PublicRoute />}>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/registration-success" element={<RegistrationSuccess />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/verify-email/:uuid/:hash" element={<VerifyEmail />} />
                    <Route path="/auth/callback/:provider" element={<SocialCallback />} />
                </Route>

                {/* Protected Routes */}
                <Route element={<ProtectedRoute />}>
                    <Route path="/onboarding" element={<Onboarding />} />
                    
                    <Route element={<DashboardLayout />}>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/analytics" element={<Analytics />} />
                        <Route path="/track-progress" element={<TrackProgress />} />
                        <Route path="/track-expense" element={<TrackExpense />} />
                        <Route path="/settings" element={<SettingsPage />}>
                            <Route index element={<Navigate to="profile" replace />} />
                            <Route path="profile" element={<Profile />} />
                            <Route path="notifications" element={<Notifications />} />
                        </Route>
                    </Route>
                </Route>

                <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
        </Router>
    );
}

export default App;
