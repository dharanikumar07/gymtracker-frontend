import React, { useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { ShieldCheck, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '../../store/authStore';
import { useSocialCallbackMutation } from './http/authQueries';
import ThemeToggle from '../../components/ThemeToggle';

const SocialCallback = () => {
    const { provider } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const login = useAuthStore((state) => state.login);
    const [error, setError] = useState(null);
    const { mutateAsync: socialCallback, isPending: loading } = useSocialCallbackMutation();

    const params = new URLSearchParams(location.search);
    const code = params.get('code');

    const handleCallback = async () => {
        if (!code) {
            setError('Authorization code missing');
            return;
        }

        if (loading) return;

        try {
            const response = await socialCallback({ provider, code });
            const { user, access_token, refresh_token } = response.data;
            
            await login(user, access_token, refresh_token);
            toast.success(`Successfully authenticated with ${provider}`);
            
            if (user.is_onboarding_completed) {
                navigate('/dashboard');
            } else {
                navigate('/onboarding');
            }
        } catch (err) {
            console.error('Social auth error:', err);
            setError(err.response?.data?.message || 'Authentication failed. Please try again.');
            toast.error('Social authentication failed');
            setTimeout(() => navigate('/login'), 3000);
        }
    };

    // Automatically trigger the callback once per (provider, code) combo without using useEffect.
    if (code && typeof window !== 'undefined') {
        const uniqueKey = `social_callback_${provider}_${code}`;
        window.__handledSocialCallbacks = window.__handledSocialCallbacks || {};
        if (!window.__handledSocialCallbacks[uniqueKey] && !loading && !error) {
            window.__handledSocialCallbacks[uniqueKey] = true;
            // Fire asynchronously to avoid side effects during render
            setTimeout(() => {
                handleCallback();
            }, 0);
        }
    }

    return (
        <div className="min-h-screen bg-background p-4 text-foreground font-sans flex items-center justify-center">
            <div className="fixed top-4 right-4 z-50">
                <ThemeToggle />
            </div>
            <div className="w-full max-w-sm bg-card border border-border p-8 rounded-3xl shadow-sm text-center space-y-8">
                {!error ? (
                    <div className="space-y-6 py-4">
                        <div className="relative inline-block">
                            <div className="w-16 h-16 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                            <ShieldCheck className="absolute inset-0 m-auto w-7 h-7 text-primary animate-pulse" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-xl font-black uppercase tracking-tight text-foreground">Authorizing</h2>
                            <p className="text-muted-foreground text-xs font-medium uppercase tracking-widest">Verifying {provider} login...</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6 py-4 animate-in zoom-in-95 duration-500">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-500">
                            <AlertCircle className="w-8 h-8" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-xl font-black uppercase tracking-tight">Authentication Error</h2>
                            <p className="text-muted-foreground text-xs font-medium uppercase tracking-widest text-rose-500">{error}</p>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">Redirecting to sign in...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SocialCallback;
