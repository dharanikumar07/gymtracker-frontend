import React from 'react';
import { Mail, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import ThemeToggle from '../../components/ThemeToggle';

const RegistrationSuccess = () => {
    return (
        <div className="min-h-screen bg-background text-foreground px-4 flex items-center justify-center">
            <div className="fixed top-4 right-4 z-50">
                <ThemeToggle />
            </div>
            <div className="w-full max-w-sm">
                <div className="bg-card p-6 sm:p-8 rounded-3xl shadow-sm border border-border text-center space-y-6">
                    <div className="flex justify-center">
                        <div className="bg-primary/10 p-3 rounded-2xl">
                            <Mail className="h-8 w-8 text-primary" />
                        </div>
                    </div>
                    
                    <h1 className="text-2xl font-black uppercase tracking-tight">Check your email</h1>
                    
                    <p className="text-muted-foreground text-xs font-medium leading-relaxed">
                        We sent a verification link to your email. Open it to activate your account and start your journey.
                    </p>

                    <div className="pt-2 space-y-6">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                            Didn't receive the email? Check your spam folder.
                        </p>
                        
                        <Link 
                            to="/login" 
                            className="flex items-center justify-center gap-2 text-primary font-black uppercase text-[10px] tracking-widest hover:underline group"
                        >
                            <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-1 transition-transform" />
                            Back to sign in
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegistrationSuccess;
