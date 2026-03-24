import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const PublicRoute = () => {
  const { user, loading } = useAuthStore();
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

  if (token && user) {
    if (user.is_onboarding_completed) {
      return <Navigate to="/dashboard" replace />;
    }
    return <Navigate to="/onboarding" replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
