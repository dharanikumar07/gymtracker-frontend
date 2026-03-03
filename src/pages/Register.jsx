import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Chrome, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '../lib/api';
import ThemeToggle from '../components/ThemeToggle';
import { useAuthStore } from '../store/authStore';

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

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await api.post('/register', formData);
            const { user, access_token } = response.data;
            
            login(user, access_token);
            
            toast.success('Account created successfully!');
            navigate('/onboarding');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const socialLogin = (provider) => {
        window.location.href = `http://127.0.0.1:8000/auth/redirect/${provider}`;
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 font-sans transition-colors duration-300">
            <ThemeToggle />
            <div className="w-full max-w-md space-y-6 bg-card p-8 rounded-2xl shadow-xl border border-border">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Join GymOS</h1>
                    <p className="text-muted-foreground">Start your transformation today</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-foreground" htmlFor="name">Full Name</label>
                        <div className="relative">
                            <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                            <input
                                id="name"
                                type="text"
                                placeholder="John Doe"
                                className="w-full pl-10 pr-4 py-2.5 bg-secondary/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-foreground" htmlFor="email">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                            <input
                                id="email"
                                type="email"
                                placeholder="name@example.com"
                                className="w-full pl-10 pr-4 py-2.5 bg-secondary/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-foreground" htmlFor="password">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                                <input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    className="w-full pl-10 pr-4 py-2.5 bg-secondary/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-foreground" htmlFor="password_confirmation">Confirm</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                                <input
                                    id="password_confirmation"
                                    type="password"
                                    placeholder="••••••••"
                                    className="w-full pl-10 pr-4 py-2.5 bg-secondary/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
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
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-all group disabled:opacity-70"
                    >
                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                            <>
                                Create Account
                                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-border"></span>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    <button 
                        onClick={() => socialLogin('google')}
                        className="flex items-center justify-center gap-2 py-2.5 border border-border rounded-lg hover:bg-secondary transition-colors text-foreground font-medium"
                    >
                        <Chrome className="h-5 w-5 text-primary" />
                        <span>Google</span>
                    </button>
                </div>

                <p className="text-center text-sm text-muted-foreground">
                    Already a member?{' '}
                    <Link to="/login" className="font-semibold text-primary hover:underline">
                        Sign In
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
