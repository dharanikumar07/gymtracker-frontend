import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Loader2, ArrowRight, Chrome } from 'lucide-react';
import { toast } from 'sonner';
import ThemeToggle from '../../components/ThemeToggle';
import { useAuthStore } from '../../store/authStore';
import { getSocialRedirectApi } from './http/authApi';
import { useLoginMutation } from './http/authQueries';

const Login = () => {
    const navigate = useNavigate();
    const login = useAuthStore((state) => state.login);
    const [socialLoading, setSocialLoading] = useState(false);
    const [formData, setFormData] = useState({ email: '', password: '' });
    const { mutateAsync: loginMutation, isPending: loading } = useLoginMutation();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await loginMutation(formData);
            const { user, access_token, refresh_token } = response.data;

            // Log in with both tokens
            await login(user, access_token, refresh_token);

            toast.success('Welcome back!');

            // Redirection logic based on onboarding status
            if (user && user.is_onboarding_completed) {
                navigate('/dashboard');
            } else {
                navigate('/onboarding');
            }
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Invalid credentials');
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
                        <h2 className="text-2xl font-black tracking-tight uppercase">Sign In</h2>
                        <p className="text-muted-foreground text-xs font-medium">Continue your fitness journey.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-5">
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

                            <div className="space-y-1 group">
                                <div className="flex justify-between items-center px-0.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground" htmlFor="password">
                                        Password
                                    </label>
                                    <Link to="/forgot-password" hidden className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">
                                        Forgot?
                                    </Link>
                                </div>
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
                                <div className="flex justify-end pt-1">
                                    <Link to="/forgot-password" title="Forgot Password" className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">
                                        Forgot Password?
                                    </Link>
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
                                <>Sign In <ArrowRight className="w-4 h-4" /></>
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
                        New here?{' '}
                        <Link to="/register" className="text-primary font-black uppercase tracking-wide hover:underline ml-1">
                            Create account
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
