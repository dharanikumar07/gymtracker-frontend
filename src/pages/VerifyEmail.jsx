import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, UserCheck } from 'lucide-react';
import api from '../lib/api';
import { toast } from 'sonner';
import { useAuthStore } from '../store/authStore';

const VerifyEmail = () => {
    const { uuid, hash } = useParams();
    const navigate = useNavigate();
    const { login, user, loading } = useAuthStore();
    const [status, setStatus] = useState('idle'); // idle, verifying, success, error

    // Redirect if already logged in and verified
    useEffect(() => {
        if (!loading && user?.is_email_verified) {
            const timer = setTimeout(() => {
                if (user.is_onboarding_completed) {
                    navigate('/dashboard');
                } else {
                    navigate('/onboarding');
                }
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [user, loading, navigate]);

    const handleVerify = async () => {
        setStatus('verifying');
        try {
            const response = await api.get(`/verify-email/${uuid}/${hash}`);
            const { user: verifiedUser, access_token, refresh_token, message, already_verified } = response.data;
            
            if (already_verified) {
                toast.info('You have already verified your email.');
            } else {
                toast.success(message);
            }
            
            if (verifiedUser && access_token && refresh_token) {
                await login(verifiedUser, access_token, refresh_token);
                setStatus('success');
                
                // Redirection logic based on onboarding status
                setTimeout(() => {
                    if (verifiedUser.is_onboarding_completed) {
                        navigate('/dashboard');
                    } else {
                        navigate('/onboarding');
                    }
                }, 1500);
            }
        } catch (error) {
            console.error('Verification error:', error);
            toast.error(error.response?.data?.message || 'Verification failed');
            setStatus('error');
        }
    };

    // Prevent "Content Flash": Show spinner if loading OR if we are about to auto-redirect
    const isAutoRedirecting = !loading && user?.is_email_verified && status === 'idle';

    if (loading || isAutoRedirecting) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-foreground">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground animate-pulse font-medium">
                    {isAutoRedirecting ? 'Redirecting you to your destination...' : 'Checking your account status...'}
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 text-foreground">
            <div className="w-full max-w-md bg-card p-8 rounded-2xl shadow-xl border border-border text-center space-y-6 animate-in fade-in zoom-in duration-300">
                {status === 'idle' && (
                    <>
                        <div className="flex justify-center">
                            <div className="bg-primary/10 p-4 rounded-full">
                                <UserCheck className="h-12 w-12 text-primary" />
                            </div>
                        </div>
                        <h1 className="text-3xl font-bold">Verify your email</h1>
                        <p className="text-muted-foreground text-lg">
                            Ready to start your fitness journey? Click the button below to verify your account.
                        </p>
                        <button
                            onClick={handleVerify}
                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 rounded-lg transition-all shadow-lg hover:shadow-primary/20"
                        >
                            Verify Email Address
                        </button>
                    </>
                )}

                {status === 'verifying' && (
                    <div className="py-8">
                        <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto mb-4" />
                        <h1 className="text-2xl font-bold">Verifying...</h1>
                        <p className="text-muted-foreground">Please wait while we confirm your account.</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="py-8">
                        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                        <h1 className="text-2xl font-bold">Account Verified!</h1>
                        <p className="text-muted-foreground">Welcome to GymOS! Redirecting you now...</p>
                    </div>
                )}

                {status === 'error' && (
                    <div className="py-8">
                        <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
                        <h1 className="text-2xl font-bold">Verification Failed</h1>
                        <p className="text-muted-foreground mb-6">The verification link is invalid or has expired.</p>
                        <Link to="/login" className="inline-block px-6 py-2 bg-secondary text-foreground font-semibold rounded-lg hover:bg-secondary/80 transition-colors">
                            Go to Login
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VerifyEmail;
