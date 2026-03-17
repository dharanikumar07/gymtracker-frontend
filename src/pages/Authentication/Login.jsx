import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Loader2, ArrowRight, Chrome } from 'lucide-react';
import { toast } from 'sonner';
import ThemeToggle from '../../components/ThemeToggle';
import { useAuthStore } from '../../store/authStore';
import { loginApi, getSocialRedirectApi } from './http/authApi';

const Login = () => {
    const navigate = useNavigate();
    const login = useAuthStore((state) => state.login);
    const [loading, setLoading] = useState(false);
    const [socialLoading, setSocialLoading] = useState(false);
    const [formData, setFormData] = useState({ email: '', password: '' });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await loginApi(formData);
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
        } finally {
            setLoading(false);
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
        <div className="min-h-screen flex flex-col lg:flex-row bg-background text-foreground font-sans selection:bg-primary/30">
            {/* Left Side - Visual Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-zinc-950 relative overflow-hidden items-center justify-center p-12">
                <div className="relative z-10 space-y-6 max-w-lg">
                    <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/20">
                        <ArrowRight className="w-8 h-8 text-white -rotate-45" />
                    </div>
                    <h1 className="text-6xl font-black tracking-tighter text-white uppercase italic leading-none">
                        Forge Your <br /> <span className="text-primary">Limitless</span> Self.
                    </h1>
                    <p className="text-zinc-400 text-lg font-medium leading-relaxed">
                        Precision tracking for elite athletes. Log your routine, monitor your nutrition, and crush your personal records with GymOS.
                    </p>
                </div>
                
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full -mr-48 -mt-48 blur-3xl" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full -ml-32 -mb-32 blur-3xl" />
            </div>

            {/* Right Side - Login Form */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 relative">
                <div className="absolute top-8 right-8">
                    <ThemeToggle />
                </div>

                <div className="w-full max-w-md space-y-10">
                    <div className="space-y-2">
                        <h2 className="text-4xl font-black tracking-tighter uppercase italic text-foreground">Sign In</h2>
                        <p className="text-muted-foreground font-medium">Continue your evolution.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2 group">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 group-focus-within:text-primary transition-colors" htmlFor="email">
                                    Email Protocol
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
                                <div className="flex justify-between items-center ml-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-focus-within:text-primary transition-colors" htmlFor="password">
                                        Access Key
                                    </label>
                                    <Link to="/forgot-password" size="sm" className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">
                                        Lost Key?
                                    </Link>
                                </div>
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
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-14 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>Verify Identity <ArrowRight className="w-4 h-4" /></>
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
                        className="w-full h-14 bg-card border border-border rounded-2xl font-bold text-sm flex items-center justify-center gap-3 hover:bg-secondary transition-all disabled:opacity-50"
                    >
                        {socialLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Chrome className="w-5 h-5" />} 
                        Continue with Google
                    </button>

                    <p className="text-center text-sm font-medium text-muted-foreground">
                        New Recruit?{' '}
                        <Link to="/register" className="text-primary font-black uppercase tracking-widest hover:underline ml-1">
                            Register Here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
