import React from 'react';
import { User, Target, Activity, ChevronDown, Dumbbell, Zap, Wind, ShieldCheck } from 'lucide-react';
import { cn } from '../../../lib/utils';

const Step1 = ({ data, updateData }) => {
    const goals = [
        { id: 'muscle_gain', label: 'Muscle', icon: Target },
        { id: 'weight_loss', label: 'Loss', icon: Activity },
        { id: 'maintenance', label: 'Maintain', icon: User },
    ];

    const activities = [
        { id: 'strength_training', label: 'Strength', icon: Dumbbell },
        { id: 'cardio', label: 'Cardio', icon: Zap },
        { id: 'flexibility', label: 'Yoga', icon: Wind },
        { id: 'balance', label: 'Core', icon: ShieldCheck },
    ];

    const labelClasses = "text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em] mb-1 block ml-0.5";
    const inputClasses = "w-full h-10 px-3 bg-secondary/20 border border-border rounded-xl focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none transition-all text-sm font-semibold appearance-none";

    return (
        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Minimal Header */}
            <div>
                <h3 className="text-xl font-bold tracking-tight text-foreground uppercase italic leading-none">Vital Stats</h3>
                <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider mt-1.5 opacity-60">Physical Parameters</p>
            </div>

            {/* Metrics Grid - 2x2 Compact */}
            <div className="grid grid-cols-2 gap-x-3 gap-y-3 pt-1">
                <div className="space-y-1">
                    <label className={labelClasses}>Age</label>
                    <input 
                        type="number" 
                        className={inputClasses}
                        value={data.age || ''}
                        onChange={(e) => updateData({ age: e.target.value })}
                        placeholder="Years"
                    />
                </div>
                <div className="space-y-1">
                    <label className={labelClasses}>Gender</label>
                    <div className="relative">
                        <select 
                            className={inputClasses}
                            value={data.gender || ''}
                            onChange={(e) => updateData({ gender: e.target.value })}
                        >
                            <option value="">Select</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                    </div>
                </div>
                <div className="space-y-1">
                    <label className={labelClasses}>Height (cm)</label>
                    <input 
                        type="number" 
                        className={inputClasses}
                        value={data.height || ''}
                        onChange={(e) => updateData({ height: e.target.value })}
                        placeholder="175"
                    />
                </div>
                <div className="space-y-1">
                    <label className={labelClasses}>Weight (kg)</label>
                    <input 
                        type="number" 
                        className={inputClasses}
                        value={data.weight || ''}
                        onChange={(e) => updateData({ weight: e.target.value })}
                        placeholder="70"
                    />
                </div>
            </div>

            {/* Goal Select - Slim Horizontal */}
            <div className="space-y-2 pt-1">
                <label className={labelClasses}>Target Objective</label>
                <div className="flex gap-2">
                    {goals.map((goal) => {
                        const Icon = goal.icon;
                        const active = data.fitness_goal === goal.id;
                        return (
                            <button
                                key={goal.id}
                                onClick={() => updateData({ fitness_goal: goal.id })}
                                className={cn(
                                    "flex-1 flex items-center justify-center h-10 rounded-xl border transition-all gap-1.5",
                                    active 
                                        ? "border-primary bg-primary/5 text-primary font-bold shadow-sm shadow-primary/10" 
                                        : "border-border bg-card text-muted-foreground hover:border-muted-foreground/30"
                                )}
                            >
                                <Icon className="w-3.5 h-3.5" />
                                <span className="text-[10px] uppercase tracking-tight">{goal.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Activity Focus - Compact Grid */}
            <div className="space-y-2 pt-1">
                <label className={labelClasses}>Primary Training</label>
                <div className="grid grid-cols-2 gap-2">
                    {activities.map((act) => {
                        const Icon = act.icon;
                        const active = data.physical_activity_type === act.id;
                        return (
                            <button
                                key={act.id}
                                onClick={() => updateData({ physical_activity_type: act.id })}
                                className={cn(
                                    "flex items-center px-3 h-10 rounded-xl border transition-all gap-2.5",
                                    active 
                                        ? "border-primary bg-primary/5 text-primary shadow-sm shadow-primary/10" 
                                        : "border-border bg-card text-muted-foreground"
                                )}
                            >
                                <div className={cn(
                                    "w-6 h-6 rounded-lg flex items-center justify-center",
                                    active ? "bg-primary/10" : "bg-secondary"
                                )}>
                                    <Icon className="w-3 h-3" />
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-widest">{act.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Step1;
