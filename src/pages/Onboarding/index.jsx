import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    ArrowRight, 
    ArrowLeft, 
    Loader2, 
    Dumbbell, 
    Star,
    CreditCard,
    Check,
    User,
    Activity
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';
import { useAuthStore } from '../../store/authStore';
import { useOnboardingStore } from '../../store/onboardingStore';
import { useQueryClient } from '@tanstack/react-query';
import { useCompleteOnboardingMutation } from './http/onboardingQueries';
import { fetchPhysicalActivityApi } from './http/onboardingApi';
import { QUERY_KEYS } from '../../constants/query.constants';
import ThemeToggle from '../../components/ThemeToggle';
import LeftBanner from './components/LeftBanner';

import Step1 from './components/Step1';
import Step2 from './components/Step2';
import Step3 from './components/Step3';

const STEPS = [
    { title: 'Profile', icon: User },
    { title: 'Routine', icon: Star },
    { title: 'Expenses', icon: CreditCard }
];

const STEP_TITLES = {
    1: { title: 'Personal Details', desc: 'Tell us about yourself' },
    2: { title: 'Weekly Routine', desc: 'Build your workout plan' },
    3: { title: 'Budget Setup', desc: 'Track your expenses' }
};

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
    const queryClient = useQueryClient();
    const completeOnboardingMutation = useCompleteOnboardingMutation();

    const handleNext = async () => {
        if (step === 1) {
            setLoading(true);
            const activityType = formData.physical_activity_type === 'flexibility' ? 'yoga' : formData.physical_activity_type;
            
            queryClient.fetchQuery({
                queryKey: QUERY_KEYS.ONBOARDING.PHYSICAL_ACTIVITY(activityType),
                queryFn: () => fetchPhysicalActivityApi(activityType),
            }).then((activityData) => {
                const scheduleKey = activityData.physical_activity_type;
                updateFormData({
                    weekly_split: activityData[scheduleKey],
                    onboarding_config: {
                        units: activityData.units,
                        metrics_types: activityData.metrics_types,
                    },
                });
                setStepsStatus({ 'step-1': true });
                setStep(2);
            }).catch(() => toast.error("Failed to load workout routine"))
              .finally(() => setLoading(false));
        } else if (step === 2) {
            setStepsStatus({ 'step-2': true });
            setStep(3);
        } else if (step === 3) {
            setStepsStatus({ 'step-3': true });
            handleFinalSubmit({ ...stepsStatus, 'step-3': true });
        }
    };

    const handleSkip = () => {
        step === 1 ? (setStepsStatus({ 'step-1': false }), setStep(2)) :
        step === 2 ? (setStepsStatus({ 'step-2': false }), setStep(3)) :
        (setStepsStatus({ 'step-3': false }), handleFinalSubmit({ ...stepsStatus, 'step-3': false }));
    };

    const handleFinalSubmit = async (finalStepsStatus) => {
        setLoading(true);
        completeOnboardingMutation.mutateAsync({
            profile: {
                age: formData.age,
                gender: formData.gender,
                height: formData.height,
                weight: formData.weight,
                fitness_goal: formData.fitness_goal,
                physical_activity_type: formData.physical_activity_type
            },
            plan: formData.plan,
            routine: formData.weekly_split,
            expenses: formData.fixed_expenses || [],
            steps_completed: finalStepsStatus
        }).then(() => {
            resetOnboarding();
            fetchUser();
            toast.success('Welcome to GymOS!');
            navigate('/dashboard');
        }).catch(() => toast.error('Failed to complete onboarding'))
          .finally(() => setLoading(false));
    };

    const handleBack = () => {
        step > 1 && setStep(step - 1);
    };

    return (
        <div className="h-screen bg-background text-foreground flex overflow-hidden">
            {/* Left Banner */}
            <LeftBanner />

            {/* Right Side - Static Header/Progress, Scrollable Content */}
            <div className="flex-1 flex flex-col h-full">
                {/* Header - Static */}
                <header className="border-b border-border shrink-0">
                    <div className="flex items-center justify-between px-6 sm:px-10 h-16 max-w-3xl mx-auto w-full">
                        <div className="flex items-center gap-3 lg:hidden">
                            <div className="w-10 h-10 bg-primary rounded-xl border-2 dark:border-primary/50 dark:bg-white/10 flex items-center justify-center">
                                <Activity className="w-5 h-5 text-white dark:text-primary" />
                            </div>
                            <span className="text-lg font-black uppercase tracking-tight italic">GymOS</span>
                        </div>
                        <div className="hidden lg:block" />
                        <div className="flex items-center gap-4">
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:block">
                                Step {step} of 3
                            </span>
                            <ThemeToggle />
                        </div>
                    </div>
                </header>

                {/* Progress Steps - Static */}
                <div className="border-b border-border px-6 sm:px-10 py-4 max-w-3xl mx-auto w-full shrink-0">
                    <div className="flex items-center justify-between gap-4">
                        {STEPS.map((s, i) => {
                            const stepNum = i + 1;
                            const isCompleted = step > stepNum;
                            const isCurrent = step === stepNum;
                            const Icon = s.icon;
                            
                            return (
                                <React.Fragment key={stepNum}>
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300",
                                            isCompleted ? "bg-primary text-white" : 
                                            isCurrent ? "bg-primary text-white shadow-lg shadow-primary/30" : 
                                            "bg-secondary text-muted-foreground"
                                        )}>
                                            {isCompleted ? (
                                                <Check className="w-4 h-4" />
                                            ) : (
                                                <Icon className="w-5 h-5" />
                                            )}
                                        </div>
                                        <div className="hidden sm:block">
                                            <p className={cn(
                                                "text-xs font-bold uppercase tracking-wide transition-colors",
                                                isCurrent ? "text-foreground" : "text-muted-foreground"
                                            )}>
                                                {s.title}
                                            </p>
                                            <p className="text-[9px] text-muted-foreground">
                                                {isCompleted ? "Completed" : isCurrent ? "In Progress" : "Pending"}
                                            </p>
                                        </div>
                                    </div>
                                    {i < STEPS.length - 1 && (
                                        <div className={cn(
                                            "flex-1 h-0.5 rounded-full transition-all duration-500",
                                            step > stepNum ? "bg-primary" : "bg-secondary"
                                        )} />
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>
                </div>

                {/* Main Content - Scrollable */}
                <div className="flex-1 overflow-y-auto h-0 min-h-0">
                    <div className="px-6 sm:px-10 py-8 max-w-xl mx-auto w-full">
                        {/* Title */}
                        <div className="mb-8">
                            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-foreground mb-2">
                                {STEP_TITLES[step].title}
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                {STEP_TITLES[step].desc}
                            </p>
                        </div>

                        {/* Step Content */}
                        <div className="mb-8">
                            {step === 1 && <Step1 data={formData} updateData={updateFormData} />}
                            {step === 2 && <Step2 data={formData} updateData={updateFormData} />}
                            {step === 3 && <Step3 data={formData} updateData={updateFormData} />}
                        </div>

                        {/* Navigation - Same Line */}
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={handleSkip}
                                disabled={loading}
                                className="h-12 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors shrink-0"
                            >
                                {step === 3 ? 'Skip' : 'Skip'}
                            </button>
                            
                            <div className="flex-1 flex items-center gap-3">
                                {step > 1 && (
                                    <button 
                                        onClick={handleBack}
                                        disabled={loading}
                                        className="h-12 px-6 bg-secondary hover:bg-secondary/80 rounded-xl font-semibold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shrink-0"
                                    >
                                        <ArrowLeft className="w-4 h-4" /> Back
                                    </button>
                                )}
                                
                                <button 
                                    onClick={handleNext}
                                    disabled={loading}
                                    className="flex-1 h-12 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/30"
                                >
                                    {loading ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <>
                                            {step === 3 ? 'Launch App' : 'Continue'}
                                            <ArrowRight className="w-4 h-4" />
                                        </>
                                    )}
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
