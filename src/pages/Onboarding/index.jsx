import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    ArrowRight, 
    ArrowLeft, 
    Loader2, 
    Check,
    User,
    Activity,
    BicepsFlexed,
    CircleDollarSign,
    ChevronDown,
    LogOut
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';
import { useAuthStore } from '../../store/authStore';
import { useOnboardingStore } from '../../store/onboardingStore';
import { useQueryClient } from '@tanstack/react-query';
import { useCompleteOnboardingMutation, useSaveProfileInformationMutation, useSavePhysicalActivityMutation } from './http/onboardingQueries';
import { fetchPhysicalActivityApi } from './http/onboardingApi';
import { QUERY_KEYS } from '../../constants/query.constants';
import ThemeToggle from '../../components/ThemeToggle';
import LeftBanner from './components/LeftBanner';

import Step1 from './components/Step1';
import Step2 from './components/Step2';
import Step3 from './components/Step3';

const transformRoutineForApi = (formData) => {
    const weeklySplit = {};
    
    Object.entries(formData.weekly_split || {}).forEach(([day, dayData]) => {
        const normalizedDay = day.charAt(0).toUpperCase() + day.slice(1).toLowerCase();
        weeklySplit[normalizedDay] = {
            target_muscles: dayData.target_muscles || [],
            workouts: (dayData.workouts || []).map((workout, idx) => ({
                uuid: workout.uuid || null,
                name: workout.name || '',
                exercise_order: idx + 1,
                sample_video_link: workout.sample_video_link || '',
                metrics: workout.metrics || { type: 'strength', data: {} }
            }))
        };
    });

    return {
        plan: {
            uuid: formData.plan?.uuid || null,
            name: formData.plan?.name || 'My Transformation Plan',
            start_date: formData.plan?.start_date || null,
            end_date: formData.plan?.end_date || null,
            is_active: formData.plan?.is_active ?? true,
            physical_activity_type: formData.physical_activity_type || 'strength_training'
        },
        weekly_split: weeklySplit,
        physical_activity_type: formData.physical_activity_type || 'strength_training'
    };
};

const STEPS = [
    { title: 'Profile', icon: User },
    { title: 'Routine', icon: BicepsFlexed },
    { title: 'Expenses', icon: CircleDollarSign }
];

const STEP_TITLES = {
    1: { title: 'Personal Details', desc: 'Tell us about yourself' },
    2: { title: 'Weekly Routine', desc: 'Build your workout plan' },
    3: { title: 'Budget Setup', desc: 'Track your expenses' }
};

const Onboarding = () => {
    const navigate = useNavigate();
    const fetchUser = useAuthStore((state) => state.fetchUser);
    const { user, logout } = useAuthStore();
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
    const [stepErrors, setStepErrors] = useState({});
    const [direction, setDirection] = useState('forward');
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const queryClient = useQueryClient();
    const completeOnboardingMutation = useCompleteOnboardingMutation();
    const saveProfileMutation = useSaveProfileInformationMutation();
    const savePhysicalActivityMutation = useSavePhysicalActivityMutation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const validateStep1 = () => {
        const errors = {};
        const { age, gender, height, weight, fitness_goal, physical_activity_type } = formData;

        if (!age || age.trim() === '') errors.age = 'Age is required';
        else if (parseFloat(age) < 10 || parseFloat(age) > 120) errors.age = 'Age must be between 10 and 120';

        if (!gender || gender.trim() === '') errors.gender = 'Gender is required';
        else if (!['male', 'female', 'other'].includes(gender)) errors.gender = 'Select a valid gender';

        if (!height || height.trim() === '') errors.height = 'Height is required';
        else if (parseFloat(height) < 50 || parseFloat(height) > 300) errors.height = 'Height must be between 50 and 300 cm';

        if (!weight || weight.trim() === '') errors.weight = 'Weight is required';
        else if (parseFloat(weight) < 20 || parseFloat(weight) > 500) errors.weight = 'Weight must be between 20 and 500 kg';

        if (!fitness_goal || fitness_goal.trim() === '') errors.fitness_goal = 'Fitness goal is required';

        if (!physical_activity_type || physical_activity_type.trim() === '') errors.physical_activity_type = 'Training type is required';

        return errors;
    };

    const goToStep = async (targetStep) => {
        setDirection(targetStep > step ? 'forward' : 'backward');
        
        if (targetStep > step) {
            if (step === 1) {
                const errors = validateStep1();
                if (Object.keys(errors).length > 0) {
                    setStepErrors(errors);
                    return;
                }
            }
        }
        
        setStepErrors({});
        
        if (targetStep === 2 && step === 1) {
            setLoading(true);
            try {
                await saveProfileMutation.mutateAsync({
                    age: formData.age,
                    gender: formData.gender,
                    height: formData.height,
                    weight: formData.weight,
                    fitness_goal: formData.fitness_goal,
                    physical_activity_type: formData.physical_activity_type
                });

                const activityType = formData.physical_activity_type === 'flexibility' ? 'yoga' : formData.physical_activity_type;
                
                const activityData = await queryClient.fetchQuery({
                    queryKey: QUERY_KEYS.ONBOARDING.PHYSICAL_ACTIVITY(activityType),
                    queryFn: () => fetchPhysicalActivityApi(activityType),
                });
                
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
            } catch (error) {
                toast.error("Failed to save profile information");
            } finally {
                setLoading(false);
            }
        } else if (targetStep === 3 && step === 2) {
            setLoading(true);
            try {
                const routinePayload = transformRoutineForApi(formData);
                await savePhysicalActivityMutation.mutateAsync(routinePayload);
                setStepsStatus({ 'step-2': true });
                setStep(3);
            } catch (error) {
                toast.error("Failed to save weekly routine");
            } finally {
                setLoading(false);
            }
        } else {
            setStep(targetStep);
        }
    };

    const handleNext = () => goToStep(step + 1);
    const handleBack = () => goToStep(step - 1);

    const handleSkip = () => {
        setDirection('forward');
        if (step === 1) {
            setStepsStatus({ 'step-1': false });
            setStep(2);
        } else if (step === 2) {
            setStepsStatus({ 'step-2': false });
            setStep(3);
        } else {
            handleFinalSubmit({ ...stepsStatus, 'step-3': false });
        }
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

    const animationClass = direction === 'forward' 
        ? 'animate-in fade-in slide-in-from-right-4 duration-300' 
        : 'animate-in fade-in slide-in-from-left-4 duration-300';

    return (
        <div className="h-screen bg-background text-foreground flex overflow-hidden">
            <LeftBanner />

            <div className="flex-1 flex flex-col h-full">
                <header className="border-b border-border shrink-0">
                    <div className="flex items-center justify-between px-4 sm:px-6 lg:px-10 h-14 sm:h-16 max-w-3xl mx-auto w-full">
                        <div className="flex items-center gap-2 sm:gap-3 lg:hidden">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-lg sm:rounded-xl border-2 dark:border-primary/50 dark:bg-white/10 flex items-center justify-center">
                                <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-white dark:text-primary" />
                            </div>
                            <span className="text-sm sm:text-lg font-black uppercase tracking-tight italic">GymOS</span>
                        </div>
                        <div className="hidden lg:block" />
                        <div className="flex items-center gap-3 sm:gap-4">
                            <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:block">
                                Step {step} of 3
                            </span>
                            
                            <ThemeToggle />

                            <div className="relative">
                                <button 
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-secondary transition-all group"
                                >
                                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary transition-colors">
                                        <span className="text-[9px] sm:text-[10px] font-black text-primary group-hover:text-white uppercase">
                                            {user?.name?.charAt(0) || 'U'}
                                        </span>
                                    </div>
                                    <ChevronDown className={cn("w-3.5 h-3.5 text-muted-foreground transition-transform duration-300 hidden sm:block", isProfileOpen && "rotate-180")} />
                                </button>

                                {isProfileOpen && (
                                    <>
                                        <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)} />
                                        <div className="absolute right-0 mt-2 w-52 bg-card border border-border rounded-2xl shadow-2xl z-20 py-2 animate-in fade-in zoom-in-95 duration-200">
                                            <div className="px-4 py-3 border-b border-border mb-1 bg-secondary/20">
                                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Account</p>
                                                <p className="text-xs font-bold text-foreground truncate">{user?.email}</p>
                                            </div>
                                            <button 
                                                onClick={handleLogout}
                                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/5 transition-colors text-left font-bold"
                                            >
                                                <LogOut className="w-4 h-4" /> Logout
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                <div className="border-b border-border px-4 sm:px-6 lg:px-10 py-3 sm:py-4 max-w-3xl mx-auto w-full shrink-0">
                    <div className="flex items-center justify-between gap-2 sm:gap-4">
                        {STEPS.map((s, i) => {
                            const stepNum = i + 1;
                            const isCompleted = step > stepNum;
                            const isCurrent = step === stepNum;
                            const Icon = s.icon;
                            
                            return (
                                <React.Fragment key={stepNum}>
                                    <button 
                                        onClick={() => stepNum < step && goToStep(stepNum)}
                                        className={cn(
                                            "flex items-center gap-2 sm:gap-3 transition-opacity",
                                            stepNum > step && "opacity-50 cursor-not-allowed"
                                        )}
                                        disabled={stepNum > step}
                                    >
                                        <div className={cn(
                                            "w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center transition-all duration-300",
                                            isCompleted ? "bg-primary text-white" : 
                                            isCurrent ? "bg-primary text-white shadow-lg shadow-primary/30" : 
                                            "bg-secondary text-muted-foreground"
                                        )}>
                                            <Icon className="w-4 sm:w-5 h-4 sm:h-5" />
                                        </div>
                                        <div className="hidden sm:block">
                                            <p className={cn(
                                                "text-[10px] sm:text-xs font-bold uppercase tracking-wide transition-colors",
                                                isCurrent ? "text-foreground" : "text-muted-foreground"
                                            )}>
                                                {s.title}
                                            </p>
                                            <p className="text-[8px] sm:text-[9px] text-muted-foreground">
                                                {isCompleted ? "Completed" : isCurrent ? "In Progress" : "Pending"}
                                            </p>
                                        </div>
                                    </button>
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

                <div className="flex-1 overflow-y-auto h-0 min-h-0">
                    <div className="px-4 sm:px-6 lg:px-10 py-6 sm:py-8 max-w-xl mx-auto w-full">
                        <div className="mb-6 sm:mb-8">
                            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-tight text-foreground mb-1 sm:mb-2">
                                {STEP_TITLES[step].title}
                            </h2>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                                {STEP_TITLES[step].desc}
                            </p>
                        </div>

                        <div className={cn("mb-6 sm:mb-8", animationClass)} key={step}>
                            {step === 1 && <Step1 data={formData} updateData={updateFormData} errors={stepErrors} />}
                            {step === 2 && <Step2 data={formData} updateData={updateFormData} />}
                            {step === 3 && <Step3 data={formData} updateData={updateFormData} />}
                        </div>

                        <div className="flex items-center gap-3 sm:gap-4">
                            <button 
                                onClick={handleSkip}
                                disabled={loading}
                                className="h-10 sm:h-12 px-3 sm:px-4 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors shrink-0"
                            >
                                Skip
                            </button>
                            
                            <div className="flex-1 flex items-center gap-2 sm:gap-3">
                                {step > 1 && (
                                    <button 
                                        onClick={handleBack}
                                        disabled={loading}
                                        className="h-10 sm:h-12 px-4 sm:px-6 bg-secondary hover:bg-secondary/80 rounded-xl font-semibold text-[10px] sm:text-xs uppercase tracking-wider flex items-center gap-1.5 sm:gap-2 transition-all shrink-0"
                                    >
                                        <ArrowLeft className="w-3 sm:w-4 h-3 sm:h-4" /> Back
                                    </button>
                                )}
                                
                                <button 
                                    onClick={handleNext}
                                    disabled={loading}
                                    className="flex-1 h-10 sm:h-12 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-[11px] sm:text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 sm:gap-2 shadow-lg shadow-primary/30"
                                >
                                    {loading ? (
                                        <Loader2 className="w-4 sm:w-4 h-4 sm:h-4 animate-spin" />
                                    ) : (
                                        <>
                                            {step === 3 ? 'Launch App' : 'Continue'}
                                            <ArrowRight className="w-3 sm:w-4 h-3 sm:h-4" />
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
