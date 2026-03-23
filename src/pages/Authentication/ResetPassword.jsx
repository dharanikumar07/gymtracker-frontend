import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Lock, ArrowRight, Loader2, ShieldCheck, CheckCircle2 } from 'lucide-react';
import ThemeToggle from '../../components/ThemeToggle';
import { useResetPasswordMutation } from './http/authQueries';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        password_confirmation: '',
        token: token || ''
    });

    const resetMutation = useResetPasswordMutation();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        resetMutation.mutate(formData);
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-background font-sans selection:bg-primary/20 p-4 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute inset-0 opacity-5 pointer-events-none -z-10">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-foreground rounded-full animate-[spin_80s_linear_infinite_reverse]" />
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
                            <CheckCircle2 className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight text-foreground">New Password</h2>
                        <p className="text-muted-foreground text-sm font-medium">Create a strong password for your account</p>
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
                                <ShieldCheck className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none" />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1" htmlFor="password">New Password</label>
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

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1" htmlFor="password_confirmation">Confirm Password</label>
                            <div className="relative group">
                                <input
                                    id="password_confirmation"
                                    type="password"
                                    className="w-full h-11 bg-transparent border-b border-border focus:border-primary outline-none transition-colors px-0 text-foreground text-sm font-medium placeholder:text-muted-foreground/30"
                                    placeholder="••••••••"
                                    value={formData.password_confirmation}
                                    onChange={handleChange}
                                    required
                                />
                                <Lock className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none" />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={resetMutation.isPending}
                            className="w-full h-11 bg-foreground text-background rounded-xl font-bold text-xs uppercase tracking-widest hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4"
                        >
                            {resetMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Reset Password <ArrowRight className="w-4 h-4" /></>}
                        </button>
                    </form>
                </div>

                <p className="text-center text-[10px] text-muted-foreground font-mono uppercase tracking-widest mt-8">
                    © 2026 GymOS Inc. System Stable.
                </p>
            </div>
        </div>
    );
};

export default ResetPassword;
