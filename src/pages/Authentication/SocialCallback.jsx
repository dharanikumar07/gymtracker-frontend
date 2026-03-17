import React, { useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { ShieldCheck, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '../../store/authStore';
import { socialCallbackApi } from './http/authApi';

const SocialCallback = () => {
    const { provider } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const login = useAuthStore((state) => state.login);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const params = new URLSearchParams(location.search);
    const code = params.get('code');

    const handleCallback = async () => {
        if (!code) {
            setError('Authorization code missing');
            return;
        }

        if (loading) return;
        setLoading(true);

        try {
            const response = await socialCallbackApi(provider, code);
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
        } finally {
            setLoading(false);
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
        <div className="min-h-screen flex items-center justify-center bg-background p-4 text-foreground font-sans">
            <div className="w-full max-w-md bg-card border border-border p-10 rounded-[3rem] shadow-2xl text-center space-y-8 relative overflow-hidden">
                {!error ? (
                    <div className="space-y-6 py-4">
                        <div className="relative inline-block">
                            <div className="w-20 h-20 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                            <ShieldCheck className="absolute inset-0 m-auto w-8 h-8 text-primary animate-pulse" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-black uppercase italic tracking-tighter text-foreground">Authorizing</h2>
                            <p className="text-muted-foreground text-sm font-medium italic uppercase tracking-widest">Verifying {provider} protocol...</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6 py-4 animate-in zoom-in-95 duration-500">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-rose-500/10 text-rose-500">
                            <AlertCircle className="w-10 h-10" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-black uppercase italic tracking-tighter">Handshake Error</h2>
                            <p className="text-muted-foreground text-sm font-medium">{error}</p>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">Returning to base...</p>
                    </div>
                )}
                
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl" />
            </div>
        </div>
    );
};

export default SocialCallback;
