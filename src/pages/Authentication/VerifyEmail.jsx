import React, { useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, XCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import ThemeToggle from '../../components/ThemeToggle';
import { useVerifyEmailMutation } from './http/authQueries';

const VerifyEmail = () => {
    const { uuid, hash } = useParams();
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuthStore();
    const verifyMutation = useVerifyEmailMutation();
    const hasRequested = useRef(false);

    useEffect(() => {
        if (!authLoading && user && user.is_email_verified) {
            navigate(user.is_onboarding_completed ? '/dashboard' : '/onboarding');
        }
    }, [user, authLoading, navigate]);

    useEffect(() => {
        if (uuid && hash && !hasRequested.current) {
            hasRequested.current = true;
            verifyMutation.mutate({ uuid, hash });
        }
    }, [uuid, hash, verifyMutation]);

    return (
        <div className="h-screen w-full flex items-center justify-center bg-background font-sans relative overflow-hidden">
             {/* Theme Toggle */}
             <div className="absolute top-6 right-6 z-20">
                <ThemeToggle />
            </div>

            {/* Background Texture */}
            <div className="absolute inset-0 opacity-5 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-foreground rounded-full animate-[spin_60s_linear_infinite]" />
            </div>

            <div className="max-w-md w-full text-center space-y-8 p-8 relative z-10">
                {verifyMutation.isPending && (
                    <div className="space-y-6">
                        <div className="relative inline-flex">
                            <div className="w-16 h-16 rounded-full border-4 border-muted border-t-primary animate-spin" />
                            <ShieldCheck className="absolute inset-0 m-auto w-6 h-6 text-primary animate-pulse" />
                        </div>
                        <div className="space-y-3">
                            <h2 className="text-3xl font-black tracking-tighter uppercase text-foreground">
                                Verifying<span className="text-primary">.</span>
                            </h2>
                            <p className="text-muted-foreground font-medium text-lg">
                                Synchronizing your credentials...
                            </p>
                        </div>
                    </div>
                )}

                {verifyMutation.isSuccess && (
                    <div className="space-y-6 animate-in zoom-in-95 duration-500">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/10 text-emerald-500">
                            <CheckCircle className="w-10 h-10" />
                        </div>
                        <div className="space-y-3">
                            <h2 className="text-3xl font-black tracking-tighter uppercase text-foreground">
                                Verified<span className="text-emerald-500">.</span>
                            </h2>
                            <p className="text-muted-foreground font-medium text-lg">
                                Access granted. Redirecting to base...
                            </p>
                        </div>
                        <button 
                            onClick={() => navigate('/dashboard')}
                            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary hover:underline mt-4"
                        >
                            Manual Override <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                    </div>
                )}

                {verifyMutation.isError && (
                    <div className="space-y-6 animate-in zoom-in-95 duration-500">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-rose-500/10 text-rose-500">
                            <XCircle className="w-10 h-10" />
                        </div>
                        <div className="space-y-3">
                            <h2 className="text-3xl font-black tracking-tighter uppercase text-foreground">
                                Error<span className="text-rose-500">.</span>
                            </h2>
                            <p className="text-muted-foreground font-medium text-lg">
                                Verification link is invalid or expired.
                            </p>
                        </div>
                        <Link 
                            to="/login"
                            className="inline-flex h-12 px-8 bg-foreground text-background rounded-lg font-bold text-sm tracking-wide hover:opacity-90 transition-all items-center justify-center mt-4"
                        >
                            Return to Login
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VerifyEmail;
