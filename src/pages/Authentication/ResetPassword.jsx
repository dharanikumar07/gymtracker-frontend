import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Lock, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import ThemeToggle from '../../components/ThemeToggle';
import { useResetPasswordMutation } from './http/authQueries';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');
    const email = searchParams.get('email');
    
    const [formData, setFormData] = useState({
        email: email || '',
        password: '',
        password_confirmation: '',
        token: token || ''
    });
    const { mutateAsync: resetPassword, isPending: loading } = useResetPasswordMutation();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.email || !formData.token) {
            toast.error('Invalid or expired reset link');
            return;
        }
        try {
            await resetPassword(formData);
            toast.success('Access key updated successfully.');
            navigate('/login');
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Protocol update failed');
        }
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
                            <Lock className="w-8 h-8" />
                        </div>
                        <h2 className="text-2xl font-black uppercase tracking-tight">Create New Password</h2>
                        <p className="text-muted-foreground text-xs font-medium">Set a strong password for your account.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-5">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-0.5">
                                    Account
                                </label>
                                <p className="w-full bg-transparent border-b border-border py-3 text-sm text-foreground/80 truncate">
                                    {formData.email || 'Invalid or missing email in reset link'}
                                </p>
                            </div>

                            <div className="space-y-1 group">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-0.5" htmlFor="password">
                                    New Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                                    <input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        className="w-full bg-transparent border-b border-border focus:border-emerald-500 outline-none transition-all duration-300 py-3 pl-7 text-sm"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-1 group">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-0.5" htmlFor="password_confirmation">
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                                    <input
                                        id="password_confirmation"
                                        type="password"
                                        placeholder="••••••••"
                                        className="w-full bg-transparent border-b border-border focus:border-emerald-500 outline-none transition-all duration-300 py-3 pl-7 text-sm"
                                        value={formData.password_confirmation}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !formData.email || !formData.token}
                            className="w-full h-11 bg-primary text-white rounded-xl font-black text-[11px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 hover:bg-primary/90 shadow-lg shadow-primary/20 disabled:opacity-50"
                        >
                            {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <>Update Password <ArrowRight className="w-4 h-4" /></>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
