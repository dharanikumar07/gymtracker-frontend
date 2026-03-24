import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, Send } from 'lucide-react';
import { toast } from 'sonner';
import ThemeToggle from '../../components/ThemeToggle';
import { useForgotPasswordMutation } from './http/authQueries';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');

    const { mutate: forgotPassword, isPending: loading } = useForgotPasswordMutation(
        () => {
            toast.success('Recovery link dispatched to your email.');
            navigate('/login');
        },
        (err) => {
            console.error(err);
            toast.error(err.response?.data?.message || 'Verification failed');
        }
    );

    const handleSubmit = (e) => {
        e.preventDefault();
        forgotPassword({ email });
    };

    return (
        <div className="min-h-screen bg-background text-foreground font-sans px-4 flex items-center justify-center">
            <div className="fixed top-4 right-4 z-50">
                <ThemeToggle />
            </div>
            <div className="w-full max-w-sm">
                <div className="bg-card border border-border p-6 sm:p-8 rounded-3xl shadow-sm space-y-8 animate-in fade-in zoom-in-95 duration-500">
                    <div className="text-center space-y-1">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-4">
                            <Mail className="w-8 h-8" />
                        </div>
                        <h2 className="text-2xl font-black uppercase tracking-tight">Reset Password</h2>
                        <p className="text-muted-foreground text-xs font-medium">We will send a password reset link.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-1 group">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-0.5" htmlFor="email">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                                <input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    className="w-full bg-transparent border-b border-border focus:border-emerald-500 outline-none transition-all duration-300 py-3 pl-7 text-sm"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-11 bg-primary text-white rounded-xl font-black text-[11px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 hover:bg-primary/90 shadow-lg shadow-primary/20 disabled:opacity-50"
                            >
                                {loading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <>Send Link <Send className="w-4 h-4" /></>
                                )}
                            </button>

                            <Link to="/login" className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors py-2">
                                <ArrowLeft className="w-3.5 h-3.5" /> Back to Base
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
