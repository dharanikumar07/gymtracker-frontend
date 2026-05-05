import React, { useState } from 'react';
import { 
    UtensilsCrossed, 
    Flame, 
    Dumbbell, 
    Scale, 
    Leaf, 
    Drumstick, 
    Loader2, 
    Calendar as CalendarIcon
} from 'lucide-react';
import { cn } from '../../../../lib/utils';
import { useSavePlanMutation } from '../http/queries';
import { format, addDays } from 'date-fns';
import { Calendar } from '../../../../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../../../../components/ui/popover';
import { validateNewPlanCard } from '../validation';

const GOALS = [
    { id: 'weight_loss', label: 'Weight Loss', icon: Flame, desc: 'Caloric deficit' },
    { id: 'muscle_gain', label: 'Weight Gain', icon: Dumbbell, desc: 'Caloric surplus' },
    { id: 'maintenance', label: 'Maintenance', icon: Scale, desc: 'Balanced intake' },
];

const PREFERENCES = [
    { id: 'veg', label: 'Vegetarian', icon: Leaf },
    { id: 'non_veg', label: 'Non-Vegetarian', icon: Drumstick },
];

const CreateDietPlan = () => {
    const savePlanMutation = useSavePlanMutation();
    const [goal, setGoal] = useState('maintenance');
    const [preference, setPreference] = useState('veg');
    const [planName, setPlanName] = useState('');
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(addDays(new Date(), 30));
    const [isActive, setIsActive] = useState(true);
    const [errors, setErrors] = useState({});

    const handleSave = () => {
        const payload = {
            name: planName,
            type: 'diet',
            start_date: format(startDate, 'yyyy-MM-dd'),
            end_date: format(endDate, 'yyyy-MM-dd'),
            is_active: isActive,
            meta_data: {
                goal,
                diet_preference: preference
            }
        };

        const validation = validateNewPlanCard(payload);
        
        if (!validation.isValid) {
            setErrors(validation.errors);
            return;
        }

        setErrors({});
        savePlanMutation.mutate(payload);
    };

    const isSaving = savePlanMutation.isPending;

    return (
        <div className="space-y-6 w-full">
            {/* Card 1: Header - Minimal & Professional */}
            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
                        <UtensilsCrossed className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-[18px] font-black uppercase tracking-tight text-foreground leading-none mb-1">
                            Create Diet Plan
                        </h2>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-70">
                            Configure your goals and nutritional preferences
                        </p>
                    </div>
                </div>
            </div>

            {/* Card 2: Configuration - Compact & Structured */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-8">
                
                {/* 1. Goal Selection - Clean Grid Cards */}
                <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 mb-2 block">
                        What is your primary goal?
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {GOALS.map(({ id, label, icon: Icon, desc }) => (
                            <button
                                key={id}
                                onClick={() => setGoal(id)}
                                disabled={isSaving}
                                className={cn(
                                    "flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all group",
                                    goal === id
                                        ? "border-primary bg-primary/5 shadow-md shadow-primary/5"
                                        : "border-border/50 bg-secondary/10 hover:border-border hover:bg-secondary/30"
                                )}
                            >
                                <div className={cn(
                                    "w-10 h-10 rounded-xl flex items-center justify-center transition-colors shrink-0",
                                    goal === id ? "bg-primary text-white" : "bg-secondary/50 text-muted-foreground/60"
                                )}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div className="min-w-0">
                                    <p className={cn(
                                        "text-[11px] font-black uppercase tracking-tight truncate",
                                        goal === id ? "text-primary" : "text-foreground"
                                    )}>
                                        {label}
                                    </p>
                                    <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest truncate">
                                        {desc}
                                    </p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* 2. Diet Preference - Modern Segmented Control */}
                <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 mb-2 block">
                        Dietary Preference
                    </label>
                    <div className="inline-flex p-1.5 bg-secondary/20 rounded-2xl border border-border/50 w-full sm:w-auto sm:min-w-[400px]">
                        {PREFERENCES.map(({ id, label, icon: Icon }) => (
                            <button
                                key={id}
                                onClick={() => setPreference(id)}
                                disabled={isSaving}
                                className={cn(
                                    "flex-1 flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                    preference === id
                                        ? "bg-background text-primary shadow-sm border border-border/40"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <Icon className={cn("w-3.5 h-3.5", preference === id ? "text-primary" : "text-muted-foreground/40")} />
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 3. Plan Name - Focused Input */}
                <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 mb-2 block">
                        Personalize your plan name
                    </label>
                    <div className="max-w-md">
                        <input
                            type="text"
                            value={planName}
                            onChange={(e) => {
                                setPlanName(e.target.value);
                                if (errors.name) setErrors(prev => ({ ...prev, name: null }));
                            }}
                            placeholder="e.g. 2026 Transformation Plan"
                            disabled={isSaving}
                            className={cn(
                                "w-full h-11 px-5 bg-background border-2 rounded-2xl text-[13px] font-bold text-foreground outline-none transition-all placeholder:text-muted-foreground/30 shadow-inner",
                                errors.name ? "border-red-500/50 focus:border-red-500" : "border-border/50 focus:border-primary/50"
                            )}
                        />
                        {errors.name && (
                            <p className="text-[9px] font-bold text-red-500 uppercase tracking-widest mt-1.5 ml-1">
                                {errors.name}
                            </p>
                        )}
                    </div>
                </div>

                {/* 4. Action Row: Dates & Active Toggle - Single Line */}
                <div className="pt-6 border-t-2 border-dashed border-border/50">
                    <div className="flex flex-wrap items-end gap-5">
                        <div className="flex-1 min-w-[200px]">
                            <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1 mb-2 block">
                                Start Date
                            </label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <button
                                        className={cn(
                                            "w-full h-10 px-4 flex items-center gap-3 bg-secondary/10 border border-border rounded-xl text-[11px] font-bold text-foreground outline-none hover:bg-secondary/20 transition-all"
                                        )}
                                    >
                                        <CalendarIcon className="w-4 h-4 text-muted-foreground/50 shrink-0" />
                                        {format(startDate, 'PPP')}
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={startDate}
                                        onSelect={setStartDate}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="flex-1 min-w-[200px]">
                            <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1 mb-2 block">
                                End Date
                            </label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <button
                                        className={cn(
                                            "w-full h-10 px-4 flex items-center gap-3 bg-secondary/10 border border-border rounded-xl text-[11px] font-bold text-foreground outline-none hover:bg-secondary/20 transition-all"
                                        )}
                                    >
                                        <CalendarIcon className="w-4 h-4 text-muted-foreground/50 shrink-0" />
                                        {format(endDate, 'PPP')}
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={endDate}
                                        onSelect={setEndDate}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="flex flex-col">
                            <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1 mb-2 block">
                                Status
                            </label>
                            <div className="flex items-center gap-4 h-10 px-5 bg-secondary/10 rounded-xl border border-border/50">
                                <span className="text-[10px] font-black uppercase tracking-widest text-foreground whitespace-nowrap">
                                    Active Plan
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setIsActive(!isActive)}
                                    className={cn(
                                        "relative inline-flex h-4.5 w-8 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-300",
                                        isActive ? "bg-green-500" : "bg-muted-foreground/30"
                                    )}
                                >
                                    <span
                                        className={cn(
                                            "pointer-events-none block h-3.5 w-3.5 rounded-full bg-white shadow-md transition-transform duration-300",
                                            isActive ? "translate-x-4" : "translate-x-0.5"
                                        )}
                                    />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 5. Right Aligned Save Button */}
                <div className="flex justify-end pt-2">
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center justify-center gap-2.5 h-10 px-6 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-[11px] hover:bg-primary/90 transition-all disabled:opacity-50 shadow-lg shadow-primary/20 active:scale-95 group"
                    >
                        {isSaving ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <UtensilsCrossed className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                        )}
                        <span>{isSaving ? 'Creating...' : 'Finalize Plan'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateDietPlan;
