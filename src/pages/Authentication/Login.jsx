import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Loader2, Chrome, Activity } from 'lucide-react';
import { toast } from 'sonner';
import ThemeToggle from '../../components/ThemeToggle';
import { getSocialRedirectApi } from './http/authApi';
import { useLoginMutation } from './http/authQueries';

const Login = () => {
    const [socialLoading, setSocialLoading] = useState(false);
    const [formData, setFormData] = useState({ email: '', password: '' });

    const loginMutation = useLoginMutation();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        loginMutation.mutate(formData);
    };

    const socialLogin = async (provider) => {
        try {
            setSocialLoading(true);
            const response = await getSocialRedirectApi(provider);
            window.location.href = response.data.url;
        } catch (err) {
            toast.error('Connection failed. Please try again.');
            setSocialLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-background font-sans selection:bg-primary/20 p-4 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute inset-0 opacity-5 pointer-events-none -z-10">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-foreground rounded-full animate-[spin_60s_linear_infinite]" />
            </div>

            {/* Theme Toggle */}
            <div className="fixed top-6 right-6 z-20">
                <ThemeToggle />
            </div>

            <div className="max-w-[420px] w-full animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="bg-card border border-border p-8 rounded-3xl shadow-2xl relative overflow-hidden space-y-6 backdrop-blur-sm">
                    {/* Header */}
                    <div className="space-y-1 text-center">
                        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center mx-auto mb-3">
                            <Activity className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight text-foreground">Welcome Back</h2>
                        <p className="text-muted-foreground text-sm font-medium">Sign in to your GymOS account</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1" htmlFor="email">Email Address</label>
                            <div className="relative group">
                                <input
                                    id="email"
                                    type="email"
                                    className="w-full h-11 bg-transparent border-b border-border focus:border-primary outline-none transition-colors px-0 text-foreground text-sm font-medium placeholder:text-muted-foreground/30"
                                    placeholder="name@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                                <Mail className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none" />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground" htmlFor="password">Password</label>
                                <Link to="/forgot-password" size="sm" className="text-[10px] font-bold uppercase tracking-widest text-primary hover:underline">Forgot?</Link>
                            </div>
                            <div className="relative group">
                                <input
                                    id="password"
                                    type="password"
                                    className="w-full h-11 bg-transparent border-b border-border focus:border-primary outline-none transition-colors px-0 text-foreground text-sm font-medium placeholder:text-muted-foreground/30"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                                <Lock className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none" />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loginMutation.isPending}
                            className="w-full h-11 bg-foreground text-background rounded-xl font-bold text-xs uppercase tracking-widest hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4"
                        >
                            {loginMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Sign In <ArrowRight className="w-4 h-4" /></>}
                        </button>
                    </form>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-border"></div>
                        </div>
                        <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-tighter">
                            <span className="bg-card px-3 text-muted-foreground">OR</span>
                        </div>
                    </div>

                    <button 
                        onClick={() => socialLogin('google')}
                        disabled={socialLoading}
                        className="w-full h-11 bg-secondary/50 border border-border rounded-xl font-bold text-[11px] uppercase tracking-wider flex items-center justify-center gap-3 hover:bg-secondary transition-colors"
                    >
                        {socialLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Chrome className="w-4 h-4 text-primary" />} 
                        Sign in with Google
                    </button>

                    <p className="text-center text-xs text-muted-foreground font-medium border-t border-border/50 pt-4">
                        New here? <Link to="/register" className="text-primary font-bold hover:underline">Create an account</Link>
                    </p>
                </div>
                
                <p className="text-center text-[10px] text-muted-foreground font-mono uppercase tracking-widest mt-8">
                    © 2026 GymOS Inc. System Stable.
                </p>
            </div>
        </div>
    );
};

export default Login;
