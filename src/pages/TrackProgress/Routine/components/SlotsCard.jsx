import React, { useState, useEffect } from 'react';
import { 
    ClipboardList, 
    Save, 
    Loader2, 
    Dumbbell,
    Plus,
    Moon,
    Coffee,
    Trash2,
    Layout
} from 'lucide-react';
import { cn } from '../../../../lib/utils';
import { Button } from "../../../../components/ui/button";
import WorkoutItem from './WorkoutItem';
import { useDeleteWorkoutSlotMutation } from '../http/queries';
import { toast } from 'sonner';

const DAYS_LONG = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DAYS_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

const RestSlot = ({ workout, index, onDelete, onUpdate }) => (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 border-2 border-primary/20 dark:border-primary/30 group">
        <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
        
        <div className="relative flex flex-col items-center justify-center py-8 px-6">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center mb-4 shadow-lg shadow-primary/10 group-hover:scale-110 transition-transform duration-300">
                <Moon className="w-7 h-7 text-primary" />
            </div>
            
            <h3 className="text-sm font-black uppercase tracking-wider text-foreground mb-1">
                Rest Day
            </h3>
            
            {workout.exercise_name && (
                <p className="text-[11px] font-black uppercase text-primary/60 mb-1 italic">
                    {workout.exercise_name}
                </p>
            )}
            
            <p className="text-[10px] text-muted-foreground text-center max-w-[200px] font-bold uppercase tracking-tight">
                Recovery is part of progress. Take it easy today.
            </p>
            
            <div className="flex items-center gap-3 mt-5 px-4 py-2 bg-secondary/50 dark:bg-secondary/30 rounded-full">
                <div className="flex items-center gap-1.5">
                    <Coffee className="w-3.5 h-3.5 text-primary/70" />
                    <span className="text-[9px] text-muted-foreground font-black uppercase">Recovery</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-primary/40" />
                <div className="flex items-center gap-1.5">
                    <div className="w-3.5 h-3.5 rounded-full bg-primary/20 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    </div>
                    <span className="text-[9px] text-muted-foreground font-black uppercase">Relax</span>
                </div>
            </div>

            <button
                onClick={() => onUpdate(index, { 
                    metrics_type: 'strength' 
                })}
                className="mt-4 px-4 py-2 text-[9px] font-black uppercase tracking-widest text-primary hover:bg-primary/10 rounded-lg transition-colors"
            >
                Back to Workout
            </button>
            
            <button
                onClick={() => onDelete(index)}
                className="absolute top-3 right-3 p-2 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
            >
                <Trash2 className="w-4 h-4 text-red-500" />
            </button>
        </div>
    </div>
);

const SlotsCard = ({ slots, units: apiUnits, metricsTypes: apiMetricsTypes, planUuid, onSave, isSaving }) => {
    const units = apiUnits || { weight_units: ['kg', 'lbs'], duration_units: ['seconds', 'minutes'] };
    const metricsTypes = apiMetricsTypes || ['strength', 'timed_sets', 'endurance', 'rest'];

    const [activeDayIndex, setActiveDayIndex] = useState(0); 
    const [localRoutine, setLocalRoutine] = useState({});
    const [hasChanges, setHasChanges] = useState(false);
    const [expandedIndex, setExpandedIndex] = useState(0); 
    const [errors, setErrors] = useState({});

    const deleteSlotMutation = useDeleteWorkoutSlotMutation(planUuid);

    useEffect(() => {
        const routine = DAY_KEYS.reduce((acc, key) => {
            acc[key] = (slots || [])
                .filter(s => s.day === key)
                .sort((a, b) => a.exercise_order - b.exercise_order);
            return acc;
        }, {});
        setLocalRoutine(routine);
        setHasChanges(false);
        setExpandedIndex(0); 
        setErrors({});
    }, [slots]);

    useEffect(() => {
        setExpandedIndex(0);
    }, [activeDayIndex]);

    const activeDayKey = DAY_KEYS[activeDayIndex];
    const activeDayName = DAYS_LONG[activeDayIndex];
    const currentWorkouts = localRoutine[activeDayKey] || [];

    const validate = () => {
        const newErrors = {};
        let isValid = true;

        DAY_KEYS.forEach(dayKey => {
            const dayWorkouts = localRoutine[dayKey] || [];
            dayWorkouts.forEach((w, idx) => {
                const slotErrors = {};
                
                if (w.metrics_type === 'rest') return;

                if (!w.exercise_name?.trim()) {
                    slotErrors.exercise_name = "Required";
                    isValid = false;
                }

                const data = w.metrics_data || {};
                if (w.metrics_type === 'strength') {
                    if (!data.sets) { slotErrors.sets = "Req"; isValid = false; }
                    if (!data.reps) { slotErrors.reps = "Req"; isValid = false; }
                    if (!data.rest) { slotErrors.rest = "Req"; isValid = false; }
                } else if (w.metrics_type === 'timed_sets') {
                    if (!data.sets) { slotErrors.sets = "Req"; isValid = false; }
                    if (!data.duration) { slotErrors.duration = "Req"; isValid = false; }
                    if (!data.rest) { slotErrors.rest = "Req"; isValid = false; }
                } else if (w.metrics_type === 'endurance') {
                    if (!data.duration) { slotErrors.duration = "Req"; isValid = false; }
                }

                if (Object.keys(slotErrors).length > 0) {
                    newErrors[`${dayKey}-${idx}`] = slotErrors;
                }
            });
        });

        setErrors(newErrors);
        if (!isValid) {
            toast.error("Please fill in all required fields in the routine.");
            const firstErrorKey = Object.keys(newErrors)[0];
            if (firstErrorKey) {
                const [errDay, errIdx] = firstErrorKey.split('-');
                const dayIdx = DAY_KEYS.indexOf(errDay);
                if (dayIdx !== -1) {
                    setActiveDayIndex(dayIdx);
                    setExpandedIndex(parseInt(errIdx));
                }
            }
        }
        return isValid;
    };

    const handleUpdateWorkout = (index, updates) => {
        setLocalRoutine(prev => {
            const newDayWorkouts = [...(prev[activeDayKey] || [])];
            // CRITICAL: Merge updates with the existing workout object to preserve other fields
            newDayWorkouts[index] = { ...newDayWorkouts[index], ...updates };
            return { ...prev, [activeDayKey]: newDayWorkouts };
        });
        setHasChanges(true);
        
        const errorKey = `${activeDayKey}-${index}`;
        if (errors[errorKey]) {
            setErrors(prev => {
                const updated = { ...prev };
                delete updated[errorKey];
                return updated;
            });
        }
    };

    const handleAddWorkout = () => {
        const newWorkout = {
            exercise_name: '',
            metrics_type: 'strength',
            metrics_data: { sets: 3, reps: 10, rest: 60 },
            day: activeDayKey,
            exercise_order: 1, 
            plan_uuid: planUuid,
            meta_data: { target_muscles: [], sample_video_link: null }
        };
        
        setLocalRoutine(prev => {
            const existing = prev[activeDayKey] || [];
            return {
                ...prev,
                [activeDayKey]: [newWorkout, ...existing]
            };
        });
        
        setHasChanges(true);
        setExpandedIndex(0); 
    };

    const handleDeleteWorkout = (index) => {
        const workoutToDelete = currentWorkouts[index];
        if (workoutToDelete?.uuid) {
            deleteSlotMutation.mutate(workoutToDelete.uuid);
        }
        setLocalRoutine(prev => ({
            ...prev,
            [activeDayKey]: prev[activeDayKey].filter((_, i) => i !== index)
        }));
        setHasChanges(true);
        if (expandedIndex === index) {
            setExpandedIndex(null);
        } else if (expandedIndex > index) {
            setExpandedIndex(expandedIndex - 1);
        }
        setErrors({});
    };

    const handleSave = () => {
        if (!validate()) return;

        const allSlots = [];
        DAY_KEYS.forEach(dayKey => {
            localRoutine[dayKey]?.forEach((w, idx) => {
                allSlots.push({
                    uuid: w.uuid || null,
                    plan_uuid: planUuid,
                    exercise_name: w.exercise_name,
                    exercise_order: idx + 1,
                    day: dayKey,
                    metrics_type: w.metrics_type,
                    metrics_data: w.metrics_data,
                    meta_data: w.meta_data || {}
                });
            });
        });
        onSave({ slots: allSlots });
        setHasChanges(false);
    };

    return (
        <div className="space-y-4">
            <div className="bg-card border border-border rounded-2xl shadow-sm p-3 sm:p-4 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <ClipboardList className="w-4.5 h-4.5 text-primary" />
                        </div>
                        <h3 className="text-[13px] font-black uppercase italic tracking-tight text-foreground">Weekly Split</h3>
                    </div>

                    <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        variant="green"
                        size="compact"
                        className="gap-1.5 rounded-xl h-8 px-3 min-w-[100px]"
                    >
                        {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                        <span className="text-[10px] font-black uppercase tracking-widest">
                            {isSaving ? 'Saving...' : 'Save Slots'}
                        </span>
                    </Button>
                </div>

                <div className="grid grid-cols-7 gap-1 p-1 bg-secondary/30 rounded-xl sm:rounded-2xl">
                    {DAY_KEYS.map((key, idx) => {
                        const isActive = activeDayIndex === idx;
                        const hasWorkouts = localRoutine[key]?.length > 0;
                        const hasDayErrors = Object.keys(errors).some(ek => ek.startsWith(`${key}-`));
                        
                        return (
                            <button 
                                key={key} 
                                onClick={() => setActiveDayIndex(idx)}
                                className={cn(
                                    "py-2.5 rounded-lg sm:rounded-xl text-[9px] font-black uppercase tracking-tight transition-all flex flex-col items-center gap-1 relative",
                                    isActive 
                                        ? "bg-primary text-white shadow-lg shadow-primary/20" 
                                        : hasDayErrors
                                            ? "bg-red-500/10 text-red-500 border border-red-500/20"
                                            : "text-muted-foreground hover:bg-secondary/50"
                                )}
                            >
                                <span className="sm:hidden">{DAYS_SHORT[idx].charAt(0)}</span>
                                <span className="hidden sm:block">{DAYS_SHORT[idx]}</span>
                                {hasWorkouts && !hasDayErrors && (
                                    <div className={cn(
                                        "w-1 h-1 rounded-full",
                                        isActive ? "bg-white" : "bg-primary"
                                    )} />
                                )}
                                {hasDayErrors && (
                                    <div className="w-1 h-1 rounded-full bg-red-500 animate-pulse" />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2.5">
                    <span className="text-[10px] font-black uppercase tracking-[0.15em] text-foreground">{activeDayName}'s Exercises</span>
                    {currentWorkouts.length > 0 && (
                        <span className="px-1.5 py-0.5 bg-secondary text-[8px] font-black rounded-md text-muted-foreground">
                            {currentWorkouts.length}
                        </span>
                    )}
                </div>
                <Button 
                    onClick={handleAddWorkout}
                    size="compact"
                    className="h-8 gap-1.5 rounded-xl bg-primary text-white hover:bg-primary/90"
                >
                    <Plus className="w-3.5 h-3.5" /> 
                    <span className="text-[10px] font-black uppercase tracking-widest">Add Slot</span>
                </Button>
            </div>

            <div className="space-y-3">
                {currentWorkouts.length > 0 ? (
                    currentWorkouts.map((workout, index) => (
                        workout.metrics_type === 'rest' ? (
                            <RestSlot 
                                key={workout.uuid || `rest-${index}`} 
                                workout={workout} 
                                index={index}
                                onDelete={handleDeleteWorkout}
                                onUpdate={handleUpdateWorkout}
                            />
                        ) : (
                            <WorkoutItem
                                key={workout.uuid || `slot-${index}`}
                                workout={workout}
                                index={index}
                                units={units}
                                metricsTypes={metricsTypes}
                                onUpdate={handleUpdateWorkout}
                                onDelete={handleDeleteWorkout}
                                isExpanded={expandedIndex === index}
                                onToggleExpand={() => setExpandedIndex(expandedIndex === index ? null : index)}
                                errors={errors[`${activeDayKey}-${index}`]}
                            />
                        )
                    ))
                ) : (
                    <div className="bg-secondary/10 border-2 border-dashed border-border rounded-[2.5rem] p-10 flex flex-col items-center text-center">
                        <Dumbbell className="w-8 h-8 text-muted-foreground/20 mb-3" />
                        <h4 className="text-[11px] font-black uppercase text-foreground mb-1">Rest Day</h4>
                        <p className="text-[9px] text-muted-foreground max-w-[180px] leading-relaxed font-bold uppercase tracking-tight mb-5">
                            No exercises for {activeDayName}.
                        </p>
                        <Button 
                            onClick={handleAddWorkout}
                            variant="outline"
                            className="h-9 rounded-xl gap-2 border-primary/20 hover:border-primary/50 text-primary"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Add First Exercise</span>
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SlotsCard;
