import React, { useEffect, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { ShieldCheck, AlertCircle } from 'lucide-react';
import { useSocialCallbackMutation } from './http/authQueries';

const SocialCallback = () => {
    const { provider } = useParams();
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const code = params.get('code');
    const hasRequested = useRef(false);

    const socialMutation = useSocialCallbackMutation(provider);

    useEffect(() => {
        if (code && !hasRequested.current) {
            hasRequested.current = true;
            socialMutation.mutate(code);
        }
    }, [code, socialMutation]);

    return (
        <div className="h-screen w-full flex items-center justify-center bg-background font-sans relative overflow-hidden">
            {/* Background Texture */}
            <div className="absolute inset-0 opacity-5 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-foreground rounded-full animate-[spin_60s_linear_infinite]" />
            </div>

            <div className="max-w-md w-full text-center space-y-8 p-8 relative z-10">
                {socialMutation.isPending && (
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
                                Connecting with {provider}...
                            </p>
                        </div>
                    </div>
                )}

                {socialMutation.isError && (
                    <div className="space-y-6 animate-in zoom-in-95 duration-500">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-rose-500/10 text-rose-500">
                            <AlertCircle className="w-10 h-10" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-3xl font-black tracking-tighter uppercase text-foreground">
                                Failed<span className="text-rose-500">.</span>
                            </h2>
                            <p className="text-muted-foreground font-medium">{socialMutation.error?.response?.data?.message || 'Authentication failed'}</p>
                        </div>
                        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground animate-pulse">Redirecting to login...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SocialCallback;
