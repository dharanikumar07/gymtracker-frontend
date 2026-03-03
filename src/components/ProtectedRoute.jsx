import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const token = localStorage.getItem('access_token');

  // 1. Show loading while fetching /me
  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Initializing...</p>
        </div>
      </div>
    );
  }

  // 2. If no token, always force login
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. If token exists but user data failed to load, show an error or retry
  if (!user) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background text-foreground">
        <p className="text-sm font-bold text-red-500">Failed to load user profile. Please refresh.</p>
      </div>
    );
  }

  // 4. Handle strict Onboarding redirection
  const isOnboardingPage = location.pathname === '/onboarding';
  const completed = (user.is_onboarding_completed === true);

  if (!completed && !isOnboardingPage) {
    // Force user to onboarding if not done
    return <Navigate to="/onboarding" replace />;
  }

  if (completed && isOnboardingPage) {
    // Prevent user from going back to onboarding if already completed
    return <Navigate to="/dashboard" replace />;
  }

  // 5. Allow access to the requested protected route
  return <Outlet />;
};

export default ProtectedRoute;
