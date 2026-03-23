import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Chrome, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import ThemeToggle from '../../components/ThemeToggle';
import { useAuthStore } from '../../store/authStore';
import { registerApi, getSocialRedirectApi } from './http/authApi';

const Register = () => {
    const navigate = useNavigate();
    const login = useAuthStore((state) => state.login);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: ''
    });
    const [loading, setLoading] = useState(false);
    const [socialLoading, setSocialLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await registerApi(formData);
            toast.success('Registration successful! Please check your email for verification.');
            navigate('/registration-success');
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Registration failed');
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
                        <User className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-6xl font-black tracking-tighter text-white uppercase italic leading-none">
                        Join the <br /> <span className="text-primary">Vanguard</span>.
                    </h1>
                    <p className="text-zinc-400 text-lg font-medium leading-relaxed">
                        Start your journey with the most advanced fitness OS. Personalize your training, master your nutrition, and track your evolution.
                    </p>
                </div>
                
                {/* Decorative background elements */}
                <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full -ml-48 -mt-48 blur-3xl" />
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mb-32 blur-3xl" />
            </div>

            {/* Right Side - Register Form */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 relative">
                <div className="absolute top-8 right-8">
                    <ThemeToggle />
                </div>

                <div className="w-full max-w-md space-y-10">
                    <div className="space-y-2">
                        <h2 className="text-4xl font-black tracking-tighter uppercase italic text-foreground">Create Account</h2>
                        <p className="text-muted-foreground font-medium">Initiate your transformation protocol.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2 group">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 group-focus-within:text-primary transition-colors" htmlFor="name">
                                    Full Identity
                                </label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <input
                                        id="name"
                                        type="text"
                                        placeholder="John "
                                        className="w-full h-14 pl-12 pr-4 bg-secondary/50 border border-border rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-sm"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 group">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 group-focus-within:text-primary transition-colors" htmlFor="email">
                                    Email Address
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

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2 group">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 group-focus-within:text-primary transition-colors" htmlFor="password">
                                        Access Key
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
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-14 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>Deploy Protocol <ArrowRight className="w-4 h-4" /></>
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
                        Already Enlisted?{' '}
                        <Link to="/login" className="text-primary font-black uppercase tracking-widest hover:underline ml-1">
                            Login Here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
