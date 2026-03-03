import React from 'react';
import { User, Target, Activity, ChevronDown, Dumbbell, Zap, Wind, ShieldCheck } from 'lucide-react';
import { cn } from '../../lib/utils';

const Step1 = ({ data, updateData }) => {
    const goals = [
        { id: 'muscle_gain', label: 'Muscle Gain', icon: Target },
        { id: 'weight_loss', label: 'Weight Loss', icon: Activity },
        { id: 'maintenance', label: 'Maintenance', icon: User },
    ];

    const activities = [
        { id: 'strength_training', label: 'Strength Training', icon: Dumbbell },
        { id: 'cardio', label: 'Cardio Training', icon: Zap },
        { id: 'flexibility', label: 'Flexibility & Yoga', icon: Wind },
        { id: 'balance', label: 'Balance & Core', icon: ShieldCheck },
    ];

    const inputClasses = "w-full h-10 px-3 bg-secondary text-foreground border border-border rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all text-sm font-medium appearance-none";
    const labelClasses = "text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1.5 block";

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Vital Metrics Grid */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className={labelClasses}>Age</label>
                    <input 
                        type="number" 
                        className={inputClasses}
                        value={data.age || ''}
                        onChange={(e) => updateData({ age: e.target.value })}
                        placeholder="24"
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
                            <option value="">Select Gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
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

            {/* Fitness Goal */}
            <div className="space-y-4">
                <label className={labelClasses}>Primary Fitness Goal</label>
                <div className="grid grid-cols-3 gap-3">
                    {goals.map((goal) => {
                        const Icon = goal.icon;
                        const active = data.fitness_goal === goal.id;
                        return (
                            <button
                                key={goal.id}
                                onClick={() => updateData({ fitness_goal: goal.id })}
                                className={cn(
                                    "flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all gap-2 group bg-background",
                                    active 
                                        ? "border-primary bg-primary/5 text-primary scale-[1.02]" 
                                        : "border-border text-muted-foreground hover:border-muted-foreground"
                                )}
                            >
                                <Icon className={cn("w-5 h-5 transition-transform group-hover:scale-110", active ? "text-primary" : "text-muted-foreground")} />
                                <span className={cn("text-[9px] font-black uppercase tracking-widest text-center", active ? "text-primary" : "text-muted-foreground")}>
                                    {goal.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Activity Focus */}
            <div className="space-y-2">
                <label className={labelClasses}>Physical Activity Focus</label>
                <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                        {activities.find(a => a.id === data.physical_activity_type)?.icon ? (
                            React.createElement(activities.find(a => a.id === data.physical_activity_type).icon, { className: "w-4 h-4" })
                        ) : (
                            <Activity className="w-4 h-4" />
                        )}
                    </div>
                    <select 
                        className={cn(inputClasses, "pl-11 pr-10 h-12 border-2 focus:border-primary bg-background")}
                        value={data.physical_activity_type || ''}
                        onChange={(e) => updateData({ physical_activity_type: e.target.value })}
                    >
                        <option value="" disabled>Select your primary focus</option>
                        {activities.map((activity) => (
                            <option key={activity.id} value={activity.id} className="bg-background text-foreground">
                                {activity.label}
                            </option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
            </div>
        </div>
    );
};

export default Step1;
