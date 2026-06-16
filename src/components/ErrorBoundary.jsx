import React, { useEffect, useState } from 'react';
import { Shield, RefreshCw, Home, AlertTriangle, Sun, Moon } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return <ErrorFallback onReset={() => this.setState({ hasError: false, error: null })} />;
        }
        return this.props.children;
    }
}

const ErrorFallback = ({ onReset }) => {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        const theme = localStorage.getItem('theme');
        if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            setIsDark(true);
            document.documentElement.classList.add('dark');
        }
    }, []);

    const toggleTheme = () => {
        if (isDark) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
            setIsDark(false);
        } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
            setIsDark(true);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4 font-sans">
            {/* Theme Toggle - Top Right */}
            <div className="absolute top-6 right-6">
                <button
                    onClick={toggleTheme}
                    className="p-2.5 rounded-xl bg-secondary text-muted-foreground hover:text-foreground transition-all border border-border/50 shadow-sm"
                    aria-label="Toggle theme"
                >
                    {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </button>
            </div>

            <div className="w-full max-w-lg text-center">
                {/* Logo */}
                <div className="flex items-center justify-center gap-2.5 mb-12">
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                        <Shield className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-black tracking-tighter uppercase italic text-foreground">
                        GymOS
                    </span>
                </div>

                {/* Error Card */}
                <div className="bg-card border border-border rounded-[2rem] shadow-xl overflow-hidden">
                    <div className="px-8 pt-10 pb-8">
                        {/* Illustration */}
                        <div className="relative w-48 h-48 mx-auto mb-8">
                            {/* Background circle */}
                            <div className="absolute inset-4 rounded-full bg-gradient-to-br from-primary/5 to-primary/10" />

                            {/* Barbell visual */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                <div className="flex items-center gap-1">
                                    <div className="w-4 h-12 rounded-md bg-primary/20 border border-primary/30" />
                                    <div className="w-4 h-16 rounded-md bg-primary/30 border border-primary/40" />
                                    <div className="w-20 h-2.5 rounded-full bg-gradient-to-r from-primary/40 via-primary/60 to-primary/40" />
                                    <div className="w-4 h-16 rounded-md bg-primary/30 border border-primary/40" />
                                    <div className="w-4 h-12 rounded-md bg-primary/20 border border-primary/30" />
                                </div>
                            </div>

                            {/* Warning badge */}
                            <div className="absolute bottom-2 right-6 w-12 h-12 bg-amber-500/10 border-2 border-amber-500/20 rounded-2xl flex items-center justify-center animate-pulse">
                                <AlertTriangle className="w-6 h-6 text-amber-500" />
                            </div>

                            {/* Decorative dots */}
                            <div className="absolute top-6 left-8 w-2 h-2 rounded-full bg-primary/30" />
                            <div className="absolute top-12 right-6 w-1.5 h-1.5 rounded-full bg-primary/20" />
                            <div className="absolute bottom-10 left-4 w-1 h-1 rounded-full bg-primary/40" />
                        </div>

                        {/* Text */}
                        <h1 className="text-[18px] font-black uppercase tracking-tight text-foreground mb-3">
                            Something went wrong
                        </h1>
                        <p className="text-[12px] text-muted-foreground leading-relaxed max-w-xs mx-auto mb-8">
                            An error occurred. Your data is safe.
                        </p>

                        {/* Actions */}
                        <div className="flex items-center justify-center gap-3">
                            <button
                                onClick={() => window.location.reload()}
                                className="flex items-center gap-2 h-10 px-6 rounded-xl bg-primary text-white font-black tracking-widest text-[10px] hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-[0.97]"
                            >
                                <RefreshCw className="w-3.5 h-3.5" />
                                Refresh Page
                            </button>
                            <button
                                onClick={() => {
                                    onReset();
                                    window.location.href = '/dashboard';
                                }}
                                className="flex items-center gap-2 h-10 px-6 rounded-xl bg-secondary text-foreground font-black tracking-widest text-[10px] hover:bg-secondary/80 transition-all active:scale-[0.97] border border-border/50"
                            >
                                <Home className="w-3.5 h-3.5" />
                                Go Home
                            </button>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-8 py-4 bg-secondary/30 border-t border-border/40">
                        <p className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest text-center">
                            If this keeps happening, try clearing your browser cache
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ErrorBoundary;
