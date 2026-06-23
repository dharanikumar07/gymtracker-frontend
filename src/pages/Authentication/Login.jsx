import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Loader2, ArrowRight, Chrome, Play, User, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import ThemeToggle from '../../components/ThemeToggle';
import { useAuthStore } from '../../store/authStore';
import { getSocialRedirectApi, generateDemoApi, registerDemoApi } from './http/authApi';
import { useLoginMutation } from './http/authQueries';

const DemoPreview = ({ onBack, onLogin }) => {
    const [credentials, setCredentials] = useState(null);
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const generate = async () => {
        setGenerating(true);
        try {
            const res = await generateDemoApi();
            setCredentials(res.data);
        } catch {
            toast.error('Failed to generate demo credentials');
        } finally {
            setGenerating(false);
        }
    };

    // Generate on mount
    React.useEffect(() => { generate(); }, []);

    const handleChange = (field, value) => {
        setCredentials(prev => ({ ...prev, [field]: value }));
    };

    const handleStart = async () => {
        if (!credentials?.name || !credentials?.email || !credentials?.password) {
            toast.error('All fields are required');
            return;
        }
        setLoading(true);
        try {
            const res = await registerDemoApi(credentials);
            onLogin(res.data);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create demo account');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="space-y-1">
                <h2 className="text-2xl font-black">Try Demo</h2>
                <p className="text-muted-foreground text-xs font-medium">
                    Free for 7 days. Edit details below if you want.
                </p>
            </div>

            {!credentials ? (
                <div className="flex items-center justify-center py-10">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
            ) : (
                <div className="space-y-5">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-muted-foreground ml-0.5">Name</label>
                        <div className="relative">
                            <User className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                            <input
                                type="text"
                                value={credentials.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                                className="w-full bg-transparent border-b border-border focus:border-emerald-500 outline-none transition-all duration-300 py-3 pl-7 text-sm"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-muted-foreground ml-0.5">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                            <input
                                type="email"
                                value={credentials.email}
                                onChange={(e) => handleChange('email', e.target.value)}
                                className="w-full bg-transparent border-b border-border focus:border-emerald-500 outline-none transition-all duration-300 py-3 pl-7 text-sm"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-muted-foreground ml-0.5">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={credentials.password}
                                onChange={(e) => handleChange('password', e.target.value)}
                                className="w-full bg-transparent border-b border-border focus:border-emerald-500 outline-none transition-all duration-300 py-3 pl-7 pr-8 text-sm"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-0 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground transition-colors"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={generate}
                        disabled={generating}
                        className="flex items-center gap-1.5 text-[10px] font-black text-primary hover:underline"
                    >
                        <RefreshCw className={`w-3 h-3 ${generating ? 'animate-spin' : ''}`} />
                        Regenerate
                    </button>
                </div>
            )}

            <div className="flex flex-col gap-3">
                <button
                    onClick={handleStart}
                    disabled={loading || !credentials}
                    className="w-full h-11 bg-primary text-white rounded-xl font-black text-[11px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 hover:bg-primary/90 shadow-lg shadow-primary/20 disabled:opacity-50"
                >
                    {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <>Start Demo <Play className="w-4 h-4" /></>
                    )}
                </button>

                <button
                    onClick={onBack}
                    className="text-sm text-muted-foreground font-semibold hover:text-foreground transition-colors"
                >
                    Back to Sign In
                </button>
            </div>
        </div>
    );
};

const Login = () => {
    const navigate = useNavigate();
    const login = useAuthStore((state) => state.login);
    const [socialLoading, setSocialLoading] = useState(false);
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [showDemo, setShowDemo] = useState(false);
    const { mutateAsync: loginMutation, isPending: loading } = useLoginMutation();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleLoginSuccess = async (data) => {
        const { user, access_token, refresh_token } = data;
        await login(user, access_token, refresh_token);
        toast.success('Welcome!');
        if (user?.is_onboarding_completed) {
            navigate('/dashboard');
        } else {
            navigate('/onboarding');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await loginMutation(formData);
            await handleLoginSuccess(response.data);
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
            <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
                {!showDemo && (
                    <button
                        onClick={() => setShowDemo(true)}
                        className="h-9 px-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 hover:bg-emerald-500/20 transition-all"
                    >
                        <Play className="w-3.5 h-3.5" />
                        Try Demo
                    </button>
                )}
                <ThemeToggle />
            </div>
            <div className="w-full max-w-sm">
                <div className="flex items-center justify-center gap-2.5 mb-6">
                    <img src="/vexo-image.png" alt="Vexo" className="w-10 h-10 rounded-xl" />
                    <span className="text-xl font-black tracking-tight text-foreground">Vexo</span>
                </div>
                <div className="bg-card border border-border rounded-3xl shadow-sm p-6 sm:p-8">
                    {showDemo ? (
                        <DemoPreview
                            onBack={() => setShowDemo(false)}
                            onLogin={handleLoginSuccess}
                        />
                    ) : (
                        <div className="space-y-8">
                            <div className="space-y-1">
                                <h2 className="text-2xl font-black">Sign In</h2>
                                <p className="text-muted-foreground text-xs font-medium">Continue your fitness journey.</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-5">
                                    <div className="space-y-1 group">
                                        <label className="text-[10px] font-black text-muted-foreground ml-0.5" htmlFor="email">
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
                                            <label className="text-[10px] font-black text-muted-foreground" htmlFor="password">
                                                Password
                                            </label>
                                            <Link to="/forgot-password" hidden className="text-[10px] font-black text-primary hover:underline">
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
                                            <Link to="/forgot-password" title="Forgot Password" className="text-[10px] font-black text-primary hover:underline">
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
                                <div className="relative flex justify-center text-[10px] font-black">
                                    <span className="bg-card px-4 text-muted-foreground">or</span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <button
                                    onClick={() => socialLogin('google')}
                                    disabled={socialLoading}
                                    className="w-full h-11 bg-background border border-border rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-secondary/40 transition-all disabled:opacity-50"
                                >
                                    {socialLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Chrome className="w-4 h-4" />}
                                    Continue with Google
                                </button>

                                <button
                                    onClick={() => setShowDemo(true)}
                                    className="w-full h-11 bg-emerald-500/10 border border-emerald-500/20 rounded-xl font-semibold text-sm text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-2 hover:bg-emerald-500/20 transition-all"
                                >
                                    <Play className="w-4 h-4" />
                                    Try as Demo User
                                </button>
                            </div>

                            <p className="text-center text-sm text-muted-foreground">
                                New here?{' '}
                                <Link to="/register" className="text-primary font-black hover:underline ml-1">
                                    Create account
                                </Link>
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Login;
