import React from 'react';
import { Mail, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const RegistrationSuccess = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 text-foreground">
            <div className="w-full max-w-md bg-card p-8 rounded-2xl shadow-xl border border-border text-center space-y-6">
                <div className="flex justify-center">
                    <div className="bg-primary/10 p-4 rounded-full">
                        <Mail className="h-12 w-12 text-primary" />
                    </div>
                </div>
                
                <h1 className="text-3xl font-bold">Check your email</h1>
                
                <p className="text-muted-foreground text-lg">
                    We've sent a verification link to your email address. Please click the link to verify your account and start your journey.
                </p>

                <div className="pt-4">
                    <p className="text-sm text-muted-foreground mb-6">
                        Didn't receive the email? Check your spam folder.
                    </p>
                    
                    <Link 
                        to="/login" 
                        className="flex items-center justify-center gap-2 text-primary font-semibold hover:underline group"
                    >
                        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default RegistrationSuccess;
