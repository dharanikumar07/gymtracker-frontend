import React, { useState } from 'react';
import { useParams, useNavigate, Link, Navigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, UserCheck, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '../../store/authStore';
import { useVerifyEmailMutation } from './http/authQueries';
import ThemeToggle from '../../components/ThemeToggle';

const VerifyEmail = () => {
    const { uuid, hash } = useParams();
    const navigate = useNavigate();
    const { login, user, loading: authLoading } = useAuthStore();
    const [status, setStatus] = useState('idle'); // idle, verifying, success, error
    const [hasStarted, setHasStarted] = useState(false);

    const { mutateAsync: verifyEmail } = useVerifyEmailMutation();

    if (!authLoading && user && user.is_email_verified) {
        if (user.is_onboarding_completed) {
            return <Navigate to="/dashboard" replace />;
        }
        return <Navigate to="/onboarding" replace />;
    }

    // Kick off verification once per link params.
    if (uuid && hash && !hasStarted && status === 'idle') {
        setHasStarted(true);
        setTimeout(async () => {
            setStatus('verifying');
            try {
                const response = await verifyEmail({ uuid, hash });
                const { user: userData, access_token, refresh_token } = response.data;
                if (access_token) {
                    await login(userData, access_token, refresh_token);
                }
                setStatus('success');
                toast.success('Identity verified. Welcome to the protocol.');
                setTimeout(() => {
                    if (userData.is_onboarding_completed) {
                        navigate('/dashboard');
                    } else {
                        navigate('/onboarding');
                    }
                }, 3000);
            } catch (err) {
                console.error(err);
                setStatus('error');
                toast.error('Identity verification failed.');
            }
        }, 0);
    }

    return (
        <div className="min-h-screen bg-background p-4 text-foreground font-sans flex items-center justify-center">
            <div className="fixed top-4 right-4 z-50">
                <ThemeToggle />
            </div>
            <div className="w-full max-w-sm bg-card border border-border p-8 rounded-3xl shadow-sm text-center space-y-8 animate-in fade-in duration-500">
                {status === 'verifying' && (
                    <div className="space-y-6 py-4">
                        <div className="relative inline-block">
                            <div className="w-16 h-16 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                            <UserCheck className="absolute inset-0 m-auto w-7 h-7 text-primary animate-pulse" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-xl font-black uppercase tracking-tight">Verifying Identity</h2>
                            <p className="text-muted-foreground text-xs font-medium uppercase tracking-widest">Synchronizing credentials...</p>
                        </div>
                    </div>
                )}

                {status === 'success' && (
                    <div className="space-y-6 py-4 animate-in zoom-in-95 duration-500">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-500">
                            <CheckCircle className="w-8 h-8" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-xl font-black uppercase tracking-tight text-emerald-500">Access Granted</h2>
                            <p className="text-muted-foreground text-xs font-medium uppercase tracking-widest">Redirecting to operations...</p>
                        </div>
                        <div className="pt-2">
                            <button 
                                onClick={() => navigate('/dashboard')}
                                className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary hover:underline"
                            >
                                Manual Override <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                )}

                {status === 'error' && (
                    <div className="space-y-6 py-4 animate-in zoom-in-95 duration-500">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-500">
                            <XCircle className="w-8 h-8" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-xl font-black uppercase tracking-tight text-rose-500">Verification Failed</h2>
                            <p className="text-muted-foreground text-xs font-medium uppercase tracking-widest">Link expired or invalid protocol.</p>
                        </div>
                        <div className="pt-2">
                            <Link 
                                to="/login"
                                className="w-full h-11 bg-primary text-white rounded-xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center hover:bg-primary/90 shadow-lg shadow-primary/20"
                            >
                                Back to Login
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VerifyEmail;
