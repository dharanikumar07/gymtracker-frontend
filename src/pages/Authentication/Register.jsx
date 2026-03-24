import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Chrome, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import ThemeToggle from '../../components/ThemeToggle';
import { getSocialRedirectApi } from './http/authApi';
import { useRegisterMutation } from './http/authQueries';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: ''
    });
    const { mutateAsync: registerMutation, isPending: loading } = useRegisterMutation();
    const [socialLoading, setSocialLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await registerMutation(formData);
            toast.success('Registration successful! Please check your email for verification.');
            navigate('/registration-success');
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Registration failed');
        }
    };

    const socialLogin = async (provider) => {
        try {
            setSocialLoading(true);
            const response = await getSocialRedirectApi(provider);
            window.location.href = response.data.url;
        } catch (err) {
            toast.error('Failed to initiate social login');
            setSocialLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30 px-4 flex items-center justify-center">
            <div className="fixed top-4 right-4 z-50">
                <ThemeToggle />
            </div>
            <div className="w-full max-w-sm">
                <div className="bg-card border border-border rounded-3xl shadow-sm p-6 sm:p-8 space-y-8">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-black tracking-tight uppercase">Create Account</h2>
                        <p className="text-muted-foreground text-xs font-medium">Start your personalized plan.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-5">
                            <div className="space-y-1 group">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-0.5" htmlFor="name">
                                    Name
                                </label>
                                <div className="relative">
                                    <User className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                                    <input
                                        id="name"
                                        type="text"
                                        placeholder="John Doe"
                                        className="w-full bg-transparent border-b border-border focus:border-emerald-500 outline-none transition-all duration-300 py-3 pl-7 text-sm"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

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
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1 group">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-0.5" htmlFor="password">
                                        Password
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
                                        Confirm
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
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-11 bg-primary text-white rounded-xl font-black text-[11px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 hover:bg-primary/90 shadow-lg shadow-primary/20 disabled:opacity-50"
                        >
                            {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <>Create Account <ArrowRight className="w-4 h-4" /></>
                            )}
                        </button>
                    </form>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-border"></div>
                        </div>
                        <div className="relative flex justify-center text-[10px] font-black uppercase">
                            <span className="bg-background px-4 text-muted-foreground tracking-widest">Third-Party Auth</span>
                        </div>
                    </div>

                    <button
                        onClick={() => socialLogin('google')}
                        disabled={socialLoading}
                        className="w-full h-11 bg-background border border-border rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-secondary/40 transition-all disabled:opacity-50"
                    >
                        {socialLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Chrome className="w-4 h-4" />}
                        Continue with Google
                    </button>

                    <p className="text-center text-sm text-muted-foreground">
                        Already have an account?{' '}
                        <Link to="/login" className="text-primary font-black uppercase tracking-wide hover:underline ml-1">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
