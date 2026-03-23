import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, Send, ShieldQuestion } from 'lucide-react';
import ThemeToggle from '../../components/ThemeToggle';
import { useForgotPasswordMutation } from './http/authQueries';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const forgotMutation = useForgotPasswordMutation();

    const handleSubmit = (e) => {
        e.preventDefault();
        forgotMutation.mutate({ email });
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-background font-sans selection:bg-primary/20 p-4 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute inset-0 opacity-5 pointer-events-none -z-10">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-foreground rounded-full animate-[spin_120s_linear_infinite]" />
            </div>

            {/* Theme Toggle */}
            <div className="fixed top-6 right-6 z-20">
                <ThemeToggle />
            </div>

            <div className="max-w-[420px] w-full animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="bg-card border border-border p-8 rounded-3xl shadow-2xl relative overflow-hidden space-y-6 backdrop-blur-sm">
                    {!forgotMutation.isSuccess ? (
                        <>
                            {/* Header */}
                            <div className="space-y-1 text-center">
                                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center mx-auto mb-3">
                                    <ShieldQuestion className="w-6 h-6 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold tracking-tight text-foreground">Reset Password</h2>
                                <p className="text-muted-foreground text-sm font-medium">Get a secure link to your inbox</p>
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
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                        <Mail className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none" />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={forgotMutation.isPending}
                                    className="w-full h-11 bg-foreground text-background rounded-xl font-bold text-xs uppercase tracking-widest hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4"
                                >
                                    {forgotMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Send Reset Link <Send className="w-4 h-4" /></>}
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="text-center py-4 space-y-6 animate-in zoom-in-95 duration-500">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
                                <Mail className="w-8 h-8" />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-xl font-bold tracking-tight text-foreground">Check your email</h2>
                                <p className="text-muted-foreground text-sm font-medium leading-relaxed">
                                    If an account exists for <span className="text-foreground font-bold">{email}</span>, you will receive a reset link shortly.
                                </p>
                            </div>
                            <button 
                                onClick={() => forgotMutation.reset()}
                                className="text-xs font-bold text-primary hover:underline uppercase tracking-widest"
                            >
                                Try another email
                            </button>
                        </div>
                    )}

                    <div className="pt-4 border-t border-border/50 text-center">
                        <Link to="/login" className="inline-flex items-center justify-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest">
                            <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
                        </Link>
                    </div>
                </div>

                <p className="text-center text-[10px] text-muted-foreground font-mono uppercase tracking-widest mt-8">
                    © 2026 GymOS Inc. System Stable.
                </p>
            </div>
        </div>
    );
};

export default ForgotPassword;
