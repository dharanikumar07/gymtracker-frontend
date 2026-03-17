import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Lock, ArrowRight, CheckCircle2, Loader2, Mail } from 'lucide-react';
import { toast } from 'sonner';
import ThemeToggle from '../../components/ThemeToggle';
import { resetPasswordApi } from './http/authApi';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');
    
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        password_confirmation: '',
        token: token || ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await resetPasswordApi(formData);
            toast.success('Access key updated successfully.');
            navigate('/login');
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Protocol update failed');
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
                        <Lock className="w-8 h-8" />
                    </div>
                    <h2 className="text-3xl font-black uppercase italic tracking-tighter">Forge New Key</h2>
                    <p className="text-muted-foreground text-sm font-medium">Update your secure access credentials.</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-card border border-border p-8 rounded-[2.5rem] shadow-xl space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2 group">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 group-focus-within:text-primary transition-colors" htmlFor="email">
                                Identity Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <input
                                    id="email"
                                    type="email"
                                    placeholder="name@agency.com"
                                    className="w-full h-14 pl-12 pr-4 bg-secondary/50 border border-border rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-sm"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2 group">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 group-focus-within:text-primary transition-colors" htmlFor="password">
                                New Access Key
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    className="w-full h-14 pl-12 pr-4 bg-secondary/50 border border-border rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-sm"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2 group">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 group-focus-within:text-primary transition-colors" htmlFor="password_confirmation">
                                Confirm Key
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <input
                                    id="password_confirmation"
                                    type="password"
                                    placeholder="••••••••"
                                    className="w-full h-14 pl-12 pr-4 bg-secondary/50 border border-border rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-sm"
                                    value={formData.password_confirmation}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
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
                            <>Update Key <ArrowRight className="w-4 h-4" /></>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
