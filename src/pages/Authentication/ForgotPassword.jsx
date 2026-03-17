import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, Send } from 'lucide-react';
import { toast } from 'sonner';
import ThemeToggle from '../../components/ThemeToggle';
import { forgotPasswordApi } from './http/authApi';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await forgotPasswordApi({ email });
            toast.success('Recovery link dispatched to your email.');
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Verification failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 text-foreground font-sans">
            <div className="absolute top-8 right-8">
                <ThemeToggle />
            </div>

            <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in-95 duration-500">
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-4">
                        <Mail className="w-8 h-8" />
                    </div>
                    <h2 className="text-3xl font-black uppercase italic tracking-tighter">Recover Access</h2>
                    <p className="text-muted-foreground text-sm font-medium">Re-verify your protocol identity.</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-card border border-border p-8 rounded-[2.5rem] shadow-xl space-y-6">
                    <div className="space-y-2 group">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 group-focus-within:text-primary transition-colors" htmlFor="email">
                            Registered Email
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <input
                                id="email"
                                type="email"
                                placeholder="name@agency.com"
                                className="w-full h-14 pl-12 pr-4 bg-secondary/50 border border-border rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-sm"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-14 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>Send Reset Token <Send className="w-4 h-4" /></>
                        )}
                    </button>

                    <Link to="/login" className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
                        <ArrowLeft className="w-3.5 h-3.5" /> Back to Base
                    </Link>
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;
