import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    ArrowRight, 
    ArrowLeft, 
    Loader2, 
    Dumbbell, 
    Star,
    ShieldCheck
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../lib/api';
import ThemeToggle from '../components/ThemeToggle';
import { cn } from '../lib/utils';
import { useAuthStore } from '../store/authStore';
import { useOnboardingStore } from '../store/onboardingStore';

// Import sub-steps
import Step1 from './Onboarding/Step1';
import Step2 from './Onboarding/Step2';
import Step3 from './Onboarding/Step3';

const Onboarding = () => {
    const navigate = useNavigate();
    const fetchUser = useAuthStore((state) => state.fetchUser);
    const { 
        step, 
        setStep, 
        formData, 
        updateFormData, 
        stepsStatus, 
        setStepsStatus, 
        resetOnboarding 
    } = useOnboardingStore();
    
    const [loading, setLoading] = useState(false);

    const handleNext = async () => {
        switch (step) {
            case 1:
                if (!formData.age || !formData.height || !formData.weight) {
                    toast.error("Please fill in all profile fields");
                    return;
                }
                setStepsStatus({ 'step-1': true });
                setStep(2);
                break;
            case 2:
                setStepsStatus({ 'step-2': true });
                setStep(3);
                break;
            case 3:
                setStepsStatus({ 'step-3': true });
                await handleFinalSubmit({ ...stepsStatus, 'step-3': true });
                break;
            default:
                break;
        }
        window.scrollTo(0, 0);
    };

    const handleSkip = async () => {
        switch (step) {
            case 1:
                setStepsStatus({ 'step-1': false });
                setStep(2);
                break;
            case 2:
                setStepsStatus({ 'step-2': false });
                setStep(3);
                break;
            case 3:
                const finalSteps = { ...stepsStatus, 'step-3': false };
                setStepsStatus(finalSteps);
                await handleFinalSubmit(finalSteps);
                break;
            default:
                break;
        }
        window.scrollTo(0, 0);
    };

    const handleFinalSubmit = async (finalStepsStatus) => {
        setLoading(true);
        try {
            const payload = {
                profile: {
                    age: formData.age,
                    gender: formData.gender,
                    height: formData.height,
                    weight: formData.weight,
                    fitness_goal: formData.fitness_goal,
                    physical_activity_type: formData.physical_activity_type
                },
                routine: formData.weekly_split,
                expenses: {
                    track_expenses: formData.track_expenses,
                    expense_categories: formData.expense_categories,
                    expense_details: formData.expense_details
                },
                steps_completed: finalStepsStatus
            };

            await api.post('/onboarding/complete', payload);
            
            // Clear the persisted state on success
            resetOnboarding();
            
            await fetchUser();
            toast.success('Onboarding complete!');
            navigate('/dashboard');
        } catch (err) {
            console.error(err);
            toast.error('Failed to complete onboarding. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    const steps = [
        { title: 'Profile', icon: '01' },
        { title: 'Routine', icon: '02' },
        { title: 'Expenses', icon: '03' }
    ];

    return (
        <div className="min-h-screen w-full flex bg-background text-foreground transition-colors duration-500 font-sans text-foreground">
            <div className="hidden lg:flex w-[35%] bg-secondary relative overflow-hidden flex-col justify-between p-12 border-r border-border transition-colors duration-500">
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-20">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
                            <Dumbbell className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-xl font-black tracking-tighter uppercase italic text-foreground">GymOS</span>
                    </div>
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-[10px] font-black uppercase tracking-widest text-primary border border-primary/20">
                            <Star className="w-3 h-3 fill-primary" /> Professional Grade
                        </div>
                        <h1 className="text-5xl font-black tracking-tighter leading-[0.9] mb-4 text-foreground uppercase italic text-balance">
                            TRANSFORM <br/>
                            YOUR <br/>
                            LIFESTYLE.
                        </h1>
                        <p className="text-muted-foreground text-sm leading-relaxed max-w-xs font-medium">
                            Join elite athletes who monitor their gains, optimize routines, and manage fitness finances with precision.
                        </p>
                    </div>
                </div>
                <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" 
                    style={{ backgroundImage: 'radial-gradient(var(--foreground) 1px, transparent 0)', backgroundSize: '24px 24px' }} 
                />
                <div className="relative z-10 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    <ShieldCheck className="w-3 h-3 text-emerald-500" />
                    Secure & Private Data
                </div>
            </div>

            <div className="flex-1 flex flex-col relative overflow-y-auto bg-background">
                <div className="absolute top-6 right-6 z-50 flex items-center gap-4">
                    <ThemeToggle />
                </div>
                <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-20 py-12 max-w-3xl mx-auto w-full text-foreground">
                    <div className="mb-12">
                        <div className="flex items-center justify-between mb-4 relative">
                            <div className="absolute top-4 left-0 w-full h-[1px] bg-border -z-10" />
                            {steps.map((s, i) => (
                                <div key={i} className="flex flex-col items-center gap-3 bg-background px-4">
                                    <div className={cn(
                                        "w-9 h-9 rounded-full flex items-center justify-center text-[10px] font-black transition-all border-2",
                                        step > i + 1 ? "bg-emerald-500 border-emerald-500 text-white" : (step === i + 1 ? "bg-primary border-primary text-white scale-110 shadow-lg shadow-primary/20" : "bg-background border-border text-muted-foreground")
                                    )}>
                                        {s.icon}
                                    </div>
                                    <span className={cn("text-[10px] font-black uppercase tracking-widest", step === i + 1 ? "text-primary" : "text-muted-foreground")}>
                                        {s.title}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-10">
                        <div className="space-y-2">
                            <h2 className="text-4xl font-black text-foreground tracking-tighter uppercase italic">
                                {step === 1 && "Personal Profile"}
                                {step === 2 && "Weekly Routine"}
                                {step === 3 && "Finance Setup"}
                            </h2>
                            <p className="text-muted-foreground text-sm font-medium">
                                {step === 1 && "Let's calibrate your experience based on your specific metrics."}
                                {step === 2 && "A pre-filled structure based on your goals. Fully editable."}
                                {step === 3 && "Take control of your gym budget and supplement expenses."}
                            </p>
                        </div>

                        <div className="min-h-[400px]">
                            {step === 1 && <Step1 data={formData} updateData={updateFormData} />}
                            {step === 2 && <Step2 data={formData} updateData={updateFormData} />}
                            {step === 3 && <Step3 data={formData} updateData={updateFormData} />}
                        </div>

                        <div className="flex flex-col gap-6 pt-8 border-t border-border">
                            <div className="flex items-center gap-3">
                                {step > 1 && (
                                    <button 
                                        onClick={handleBack}
                                        className="h-12 px-8 bg-secondary text-foreground rounded-xl font-black text-xs uppercase tracking-widest hover:bg-secondary/80 transition-all flex items-center gap-2 border border-border"
                                    >
                                        <ArrowLeft className="h-3 w-3" /> Back
                                    </button>
                                )}
                                <button 
                                    onClick={handleNext}
                                    disabled={loading}
                                    className="flex-1 h-12 bg-primary text-white rounded-xl font-black text-xs uppercase tracking-[0.25em] shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-3"
                                >
                                    {loading ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <>
                                            {step === 3 ? "Launch App" : "Next Step"}
                                            <ArrowRight className="h-4 w-4" />
                                        </>
                                    )}
                                </button>
                            </div>
                            <div className="text-center">
                                <button 
                                    onClick={handleSkip}
                                    className="text-[10px] font-black text-muted-foreground uppercase tracking-widest hover:text-foreground transition-colors"
                                >
                                    Skip this step
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Onboarding;
