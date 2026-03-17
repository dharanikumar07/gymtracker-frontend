import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, UserCheck, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '../../store/authStore';
import { verifyEmailApi } from './http/authApi';

const VerifyEmail = () => {
    const { uuid, hash } = useParams();
    const navigate = useNavigate();
    const { login, user, loading: authLoading } = useAuthStore();
    const [status, setStatus] = useState('idle'); // idle, verifying, success, error

    // Redirect if already logged in and verified
    useEffect(() => {
        if (!authLoading && user && user.is_email_verified) {
            if (user.is_onboarding_completed) {
                navigate('/dashboard');
            } else {
                navigate('/onboarding');
            }
        }
    }, [user, authLoading, navigate]);

    useEffect(() => {
        const verify = async () => {
            if (status !== 'idle') return;
            
            setStatus('verifying');
            try {
                const response = await verifyEmailApi(uuid, hash);
                const { user: userData, access_token, refresh_token } = response.data;
                
                if (access_token) {
                    await login(userData, access_token, refresh_token);
                }
                
                setStatus('success');
                toast.success('Identity verified. Welcome to the protocol.');
                
                // Wait 3 seconds then redirect
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
        };

        if (uuid && hash) {
            verify();
        }
    }, [uuid, hash, login, navigate, status]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 text-foreground font-sans">
            <div className="w-full max-w-md bg-card border border-border p-10 rounded-[3rem] shadow-2xl text-center space-y-8 relative overflow-hidden">
                {status === 'verifying' && (
                    <div className="space-y-6 py-4">
                        <div className="relative inline-block">
                            <div className="w-20 h-20 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                            <UserCheck className="absolute inset-0 m-auto w-8 h-8 text-primary animate-pulse" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-black uppercase italic tracking-tighter">Verifying Identity</h2>
                            <p className="text-muted-foreground text-sm font-medium">Synchronizing access credentials...</p>
                        </div>
                    </div>
                )}

                {status === 'success' && (
                    <div className="space-y-6 py-4 animate-in zoom-in-95 duration-500">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/10 text-emerald-500">
                            <CheckCircle className="w-10 h-10" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-black uppercase italic tracking-tighter">Access Granted</h2>
                            <p className="text-muted-foreground text-sm font-medium">Redirecting to operations base...</p>
                        </div>
                        <div className="pt-4">
                            <button 
                                onClick={() => navigate('/dashboard')}
                                className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary hover:underline"
                            >
                                Manual Override <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                )}

                {status === 'error' && (
                    <div className="space-y-6 py-4 animate-in zoom-in-95 duration-500">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-rose-500/10 text-rose-500">
                            <XCircle className="w-10 h-10" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-black uppercase italic tracking-tighter">Verification Failed</h2>
                            <p className="text-muted-foreground text-sm font-medium">The link may be expired or invalid.</p>
                        </div>
                        <div className="pt-4 flex flex-col gap-4">
                            <Link 
                                to="/login"
                                className="w-full h-12 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center shadow-lg shadow-primary/20"
                            >
                                Back to Login
                            </Link>
                        </div>
                    </div>
                )}
                
                {/* Decorative background element */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl" />
            </div>
        </div>
    );
};

export default VerifyEmail;
