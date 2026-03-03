import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = () => {
  const { user, loading } = useAuthStore();
  const location = useLocation();
  const token = localStorage.getItem('access_token');

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

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!user) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background text-foreground">
        <p className="text-sm font-bold text-red-500">Failed to load user profile. Please refresh.</p>
      </div>
    );
  }

  const isOnboardingPage = location.pathname === '/onboarding';
  const completed = (user.is_onboarding_completed === true);

  if (!completed && !isOnboardingPage) {
    return <Navigate to="/onboarding" replace />;
  }

  if (completed && isOnboardingPage) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
