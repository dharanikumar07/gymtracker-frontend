import React, { useEffect, useState } from 'react';
import { 
    Dumbbell, 
    Trash2, 
    Plus, 
    Loader2, 
    Activity, 
    Zap, 
    RefreshCcw,
    Wind,
    ShieldCheck
} from 'lucide-react';
import api from '../../lib/api';
import { cn } from '../../lib/utils';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const activityIcons = {
    strength_training: Dumbbell,
    cardio: Zap,
    flexibility: Wind,
    balance: ShieldCheck
};

const Step2 = ({ data, updateData }) => {
    const [activeDay, setActiveDay] = useState('Mon');
    const [loading, setLoading] = useState(true);
    const [prefilledData, setPrefilledData] = useState({});
    
    const selectedActivity = data.physical_activity_type || 'strength_training';

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.get('/onboarding/data');
                setPrefilledData(response.data);
                
                const initialSplit = response.data[selectedActivity] || {};
                updateData({ weekly_split: initialSplit });
            } catch (err) {
                console.error("Failed to fetch onboarding data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [selectedActivity]);

    const handleAddWorkout = (day) => {
        const current = { ...data.weekly_split };
        current[day] = [...(current[day] || []), ''];
        updateData({ weekly_split: current });
    };

    const handleRemoveWorkout = (day, index) => {
        const current = { ...data.weekly_split };
        current[day] = current[day].filter((_, i) => i !== index);
        updateData({ weekly_split: current });
    };

    const handleWorkoutChange = (day, index, val) => {
        const current = { ...data.weekly_split };
        current[day][index] = val;
        updateData({ weekly_split: current });
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground font-black uppercase tracking-widest italic">Generating Routine...</p>
            </div>
        );
    }

    const currentWorkouts = data.weekly_split?.[activeDay] || [];
    const IconComponent = activityIcons[selectedActivity] || Activity;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Context Header */}
            <div className="flex items-center justify-between px-1 bg-muted p-4 rounded-2xl border border-border">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                        <IconComponent className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Workout Focus</h3>
                        <p className="text-sm font-black text-foreground capitalize tracking-tighter">
                            {selectedActivity.replace('_', ' ')} Plan
                        </p>
                    </div>
                </div>
            </div>

            {/* Day Selector */}
            <div className="flex justify-between gap-1">
                {DAYS.map((day) => {
                    const active = activeDay === day;
                    const workouts = data.weekly_split?.[day] || [];
                    const isRest = workouts.length === 1 && workouts[0]?.toLowerCase() === 'rest';
                    const hasActivity = workouts.length > 0 && !isRest;

                    return (
                        <button
                            key={day}
                            onClick={() => setActiveDay(day)}
                            className={cn(
                                "flex-1 flex flex-col items-center justify-center py-4 rounded-2xl border-2 transition-all gap-1.5",
                                active 
                                    ? "border-primary bg-primary/5 text-primary scale-105 shadow-lg shadow-primary/10" 
                                    : "border-transparent bg-secondary text-muted-foreground hover:border-border"
                            )}
                        >
                            <span className="text-[10px] font-black uppercase tracking-widest">{day}</span>
                            <div className={cn(
                                "w-1.5 h-1.5 rounded-full transition-colors",
                                active ? "bg-primary" : (hasActivity ? "bg-emerald-500" : (isRest ? "bg-muted" : "bg-transparent"))
                            )} />
                        </button>
                    );
                })}
            </div>

            {/* Workout Blocks */}
            <div className="space-y-4 min-h-[300px]">
                <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-4 bg-primary rounded-full" />
                        <h3 className="text-xs font-black uppercase tracking-widest text-foreground">
                            {activeDay} Schedule
                        </h3>
                    </div>
                    <button 
                        onClick={() => handleAddWorkout(activeDay)}
                        className="text-[10px] font-black text-primary flex items-center gap-1.5 hover:underline uppercase tracking-widest"
                    >
                        <Plus className="w-3 h-3" /> Add Exercise
                    </button>
                </div>

                <div className="space-y-3">
                    {currentWorkouts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-border rounded-3xl">
                            <RefreshCcw className="w-8 h-8 text-muted mb-3" />
                            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">No Activity</p>
                        </div>
                    ) : (
                        currentWorkouts.map((workout, idx) => {
                            const isRest = workout.toLowerCase() === 'rest';
                            return (
                                <div key={idx} className="group flex items-center gap-3 animate-in slide-in-from-right-4 duration-300" style={{animationDelay: `${idx * 50}ms`}}>
                                    <div className="flex-1 relative">
                                        <input 
                                            type="text"
                                            className={cn(
                                                "w-full h-12 pl-4 pr-12 bg-background border-2 rounded-2xl outline-none text-sm font-bold transition-all",
                                                isRest 
                                                    ? "border-border text-muted-foreground italic" 
                                                    : "border-border text-foreground focus:border-primary shadow-sm"
                                            )}
                                            placeholder="Exercise or 'Rest'"
                                            value={workout}
                                            onChange={(e) => handleWorkoutChange(activeDay, idx, e.target.value)}
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                            {isRest ? (
                                                <RefreshCcw className="w-4 h-4 text-muted-foreground" />
                                            ) : (
                                                <IconComponent className="w-4 h-4 text-primary/30 group-focus-within:text-primary transition-colors" />
                                            )}
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => handleRemoveWorkout(activeDay, idx)}
                                        className="w-12 h-12 flex items-center justify-center text-muted-foreground hover:text-red-500 bg-secondary border border-border rounded-2xl transition-all"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default Step2;
