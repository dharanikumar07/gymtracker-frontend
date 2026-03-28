import React, { useEffect, useState } from 'react';
import { User, Target, Dumbbell, Zap, Wind, ShieldCheck, Check, Loader2, Activity, ChevronDown } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { useFormValidation } from '../../../validation/ValidationWrapper';
import { validationRules } from '../../../validation';
import { useProfileInformationQuery } from '../http/onboardingQueries';
import { useOnboardingStore } from '../../../store/onboardingStore';

const GOALS = [
    { id: 'muscle_gain', label: 'Muscle Gain', icon: Target, desc: 'Increase mass' },
    { id: 'weight_loss', label: 'Weight Loss', icon: Activity, desc: 'Shed calories' },
    { id: 'maintenance', label: 'Maintenance', icon: User, desc: 'Stay active' },
];

const ACTIVITIES = [
    { id: 'strength_training', label: 'Strength', icon: Dumbbell },
    { id: 'cardio', label: 'Cardio', icon: Zap },
    { id: 'flexibility', label: 'Yoga', icon: Wind },
    { id: 'calisthenics', label: 'Core', icon: ShieldCheck },
];

const VALIDATION_SCHEMA = {
    age: { ...validationRules.required('Required'), ...validationRules.min(10), ...validationRules.max(120) },
    gender: { ...validationRules.required('Select gender'), ...validationRules.oneOf(['male', 'female', 'other']) },
    height: { ...validationRules.required('Required'), ...validationRules.min(50), ...validationRules.max(300) },
    weight: { ...validationRules.required('Required'), ...validationRules.min(20), ...validationRules.max(500) },
    fitness_goal: { ...validationRules.required('Select goal') },
    physical_activity_type: { ...validationRules.required('Select training') },
};

const SectionHeader = ({ title }) => (
    <div className="flex items-center gap-2 mb-3">
        <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_10px_rgba(var(--primary))]" />
        <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground">{title}</h3>
    </div>
);

const Step1 = ({ data, updateData }) => {
    const { profileLoaded, setProfileData } = useOnboardingStore();
    const { data: profileData, isLoading: isLoadingProfile } = useProfileInformationQuery();
    const { validateField, hasError } = useFormValidation(VALIDATION_SCHEMA);
    const [spinningGoal, setSpinningGoal] = useState(null);

    useEffect(() => {
        profileData?.data && !profileLoaded && setProfileData(profileData.data);
    }, [profileData, profileLoaded, setProfileData]);

    const handleChange = (field, value) => {
        updateData({ [field]: value });
        validateField(field, value);
        
        if (field === 'physical_activity_type') {
            setSpinningGoal('activity');
            setTimeout(() => setSpinningGoal(null), 200);
        }
        if (field === 'fitness_goal') {
            setSpinningGoal('goal');
            setTimeout(() => setSpinningGoal(null), 200);
        }
    };

    const inputClasses = (field) => cn(
        "w-full h-12 bg-background border rounded-xl px-4 text-sm font-medium outline-none transition-all",
        "border-zinc-400 dark:border-zinc-700",
        "focus:border-primary dark:focus:border-primary focus:ring-2 focus:ring-primary/20",
        "hover:border-zinc-500 dark:hover:border-zinc-600",
        "placeholder:text-muted-foreground",
        hasError(field) ? "border-red-500 bg-red-500/5" : ""
    );

    return isLoadingProfile ? (
        <div className="space-y-8 animate-pulse">
            {/* Profile Information Skeleton */}
            <section>
                <SectionHeader title="Biometric Data" />
                <div className="space-y-3">
                    {/* Row 1: Age & Gender */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <div className="h-3 w-12 bg-secondary rounded" />
                            <div className="h-12 bg-secondary rounded-xl" />
                        </div>
                        <div className="space-y-1.5">
                            <div className="h-3 w-16 bg-secondary rounded" />
                            <div className="h-12 bg-secondary rounded-xl" />
                        </div>
                    </div>
                    {/* Row 2: Height & Weight */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <div className="h-3 w-20 bg-secondary rounded" />
                            <div className="h-12 bg-secondary rounded-xl" />
                        </div>
                        <div className="space-y-1.5">
                            <div className="h-3 w-18 bg-secondary rounded" />
                            <div className="h-12 bg-secondary rounded-xl" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Training Focus Skeleton */}
            <section>
                <SectionHeader title="Training Focus" />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex items-center gap-2.5 p-2.5 rounded-2xl border border-border bg-background">
                            <div className="w-10 h-10 rounded-xl bg-secondary" />
                            <div className="h-3 w-14 bg-secondary rounded" />
                        </div>
                    ))}
                </div>
            </section>

            {/* Primary Objective Skeleton */}
            <section>
                <SectionHeader title="Primary Objective" />
                <div className="grid grid-cols-3 gap-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex flex-col items-center gap-2 p-3 rounded-2xl border-2 border-border bg-background aspect-square justify-center">
                            <div className="w-10 h-10 rounded-xl bg-secondary" />
                            <div className="h-3 w-16 bg-secondary rounded" />
                        </div>
                    ))}
                </div>
            </section>
        </div>
    ) : (
        <div className="space-y-8">
            
            {/* Profile Information */}
            <section>
                <SectionHeader title="Biometric Data" />
                <div className="space-y-3">
                    {/* Row 1: Age & Gender */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground ml-1">Age</label>
                            <div className="relative mt-1">
                                <input
                                    type="number"
                                    value={data.age || ''}
                                    onChange={(e) => handleChange('age', e.target.value)}
                                    placeholder="25"
                                    className={inputClasses('age')}
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground ml-1">Gender</label>
                            <div className="relative mt-1">
                                <select
                                    value={data.gender || ''}
                                    onChange={(e) => handleChange('gender', e.target.value)}
                                    className={cn(inputClasses('gender'), "pr-10 appearance-none cursor-pointer")}
                                >
                                    <option value="">Select</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                            </div>
                        </div>
                    </div>
                    {/* Row 2: Height & Weight */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground ml-1">Height (cm)</label>
                            <div className="relative mt-1">
                                <input
                                    type="number"
                                    value={data.height || ''}
                                    onChange={(e) => handleChange('height', e.target.value)}
                                    placeholder="175"
                                    className={inputClasses('height')}
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground ml-1">Weight (kg)</label>
                            <div className="relative mt-1">
                                <input
                                    type="number"
                                    value={data.weight || ''}
                                    onChange={(e) => handleChange('weight', e.target.value)}
                                    placeholder="70"
                                    className={inputClasses('weight')}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Training Type */}
            <section>
                <SectionHeader title="Training Focus" />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {ACTIVITIES.map((act) => {
                        const Icon = act.icon;
                        const isActive = data.physical_activity_type === act.id;
                        const isSpinning = spinningGoal === 'activity' && isActive;
                        return (
                            <button
                                key={act.id}
                                onClick={() => handleChange('physical_activity_type', act.id)}
                                className={cn(
                                    "relative flex items-center gap-2.5 p-2.5 rounded-2xl border transition-all duration-300",
                                    isActive 
                                        ? "border-primary bg-primary/10 shadow-lg" 
                                        : "border-border bg-background hover:border-primary/50"
                                )}
                            >
                                <div className={cn(
                                    "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                                    isActive ? "bg-primary text-white" : "bg-secondary text-muted-foreground",
                                    isSpinning && "animate-[spin_200ms_linear_2]"
                                )}>
                                    <Icon className={act.id === 'strength_training' ? 'w-5 h-5' : 'w-4 h-4'} />
                                </div>
                                <span className={cn(
                                    "text-[11px] font-medium tracking-tight",
                                    isActive ? "text-primary" : "text-foreground"
                                )}>
                                    {act.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </section>

            {/* Fitness Goal */}
            <section>
                <SectionHeader title="Primary Objective" />
                <div className="grid grid-cols-3 sm:grid-cols-3 gap-3">
                    {GOALS.map((goal) => {
                        const Icon = goal.icon;
                        const isActive = data.fitness_goal === goal.id;
                        const isSpinning = spinningGoal === 'goal' && isActive;
                        return (
                            <button
                                key={goal.id}
                                onClick={() => handleChange('fitness_goal', goal.id)}
                                className={cn(
                                    "relative flex flex-col items-center gap-2 p-3 sm:p-4 rounded-2xl sm:rounded-3xl border-2 transition-all duration-300",
                                    "aspect-square sm:aspect-auto",
                                    isActive 
                                        ? "border-primary bg-primary/10 shadow-lg" 
                                        : "border-border bg-background hover:border-primary/50"
                                )}
                            >
                                <div className={cn(
                                    "w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all",
                                    isActive ? "bg-primary text-white shadow-lg" : "bg-secondary text-muted-foreground",
                                    isSpinning && "animate-[spin_200ms_linear_2]"
                                )}>
                                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                                </div>
                                <div className="text-center space-y-0.5">
                                    <p className={cn(
                                        "text-[10px] sm:text-xs font-medium tracking-wide",
                                        isActive ? "text-primary" : "text-foreground"
                                    )}>
                                        {goal.label}
                                    </p>
                                    <p className="text-[8px] sm:text-[9px] font-medium text-muted-foreground tracking-tight hidden sm:block">
                                        {goal.desc}
                                    </p>
                                </div>
                                {isActive && (
                                    <div className="absolute top-1.5 sm:top-2 right-1.5 sm:right-2">
                                        <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-primary/20 flex items-center justify-center">
                                            <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-primary" />
                                        </div>
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </section>
        </div>
    );
};

export default Step1;
