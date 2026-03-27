import React, { useState, useMemo } from 'react';
import { Calendar, Loader2, Check, Dumbbell, ChevronLeft, ChevronRight, Save } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { useRoutineTrackingQuery, useLogWorkoutMutation } from '../http/queries';
import { format, addDays, subDays } from 'date-fns';

const TrackWorkout = () => {
    const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [workoutData, setWorkoutData] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    
    const { data, isLoading, isFetching } = useRoutineTrackingQuery(selectedDate);
    const logWorkout = useLogWorkoutMutation();
    
    const exercises = data?.data?.exercises || [];
    const dayLabel = data?.data?.day ? data.data.day.toUpperCase() : '';

    const computedWorkoutData = useMemo(() => {
        const initialData = {};
        exercises.forEach(ex => {
            initialData[ex.slot_uuid] = {
                sets: ex.performed_metrics || []
            };
        });
        return initialData;
    }, [exercises]);

    React.useEffect(() => {
        setWorkoutData(computedWorkoutData);
    }, [computedWorkoutData]);

    const handleDateChange = (direction) => {
        const currentDate = new Date(selectedDate);
        const newDate = direction === 'prev' ? subDays(currentDate, 1) : addDays(currentDate, 1);
        setSelectedDate(format(newDate, 'yyyy-MM-dd'));
    };

    const handleAddSet = (slotUuid) => {
        const currentSets = workoutData[slotUuid]?.sets || [];
        setWorkoutData(prev => ({
            ...prev,
            [slotUuid]: { sets: [...currentSets, { reps: 0, weight: 0 }] }
        }));
    };

    const handleUpdateSet = (slotUuid, setIndex, field, value) => {
        setWorkoutData(prev => ({
            ...prev,
            [slotUuid]: {
                sets: prev[slotUuid].sets.map((set, idx) => 
                    idx === setIndex ? { ...set, [field]: parseFloat(value) || 0 } : set
                )
            }
        }));
    };

    const handleRemoveSet = (slotUuid, setIndex) => {
        setWorkoutData(prev => ({
            ...prev,
            [slotUuid]: {
                sets: prev[slotUuid].sets.filter((__, idx) => idx !== setIndex)
            }
        }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        const tracking = Object.entries(workoutData)
            .filter(([, data]) => data.sets.length > 0)
            .map(([slot_uuid, data]) => ({
                slot_uuid,
                performed_metrics: data.sets
            }));
        
        if (tracking.length > 0) {
            await logWorkout.mutateAsync({ date: selectedDate, tracking });
        }
        setIsSaving(false);
    };

    return (
        <div className="space-y-4">
            <div className="bg-card border border-border rounded-3xl p-5">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Dumbbell className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-[12px] font-black uppercase italic text-foreground">Track Workout</h3>
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Log your daily exercises</p>
                    </div>
                </div>
                
                <div className="flex items-center justify-between gap-2 p-3 bg-secondary/30 rounded-2xl">
                    <button 
                        onClick={() => handleDateChange('prev')}
                        className="p-2 hover:bg-secondary rounded-xl transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4 text-primary" />
                    </button>
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">{dayLabel}</span>
                        <input 
                            type="date" 
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="bg-transparent text-[11px] font-bold outline-none text-foreground"
                        />
                    </div>
                    <button 
                        onClick={() => handleDateChange('next')}
                        className="p-2 hover:bg-secondary rounded-xl transition-colors"
                    >
                        <ChevronRight className="w-4 h-4 text-primary" />
                    </button>
                </div>
            </div>

            {isLoading || isFetching ? (
                <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Loading...</p>
                </div>
            ) : exercises.length === 0 ? (
                <div className="bg-card border border-border rounded-3xl p-5">
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <Dumbbell className="w-10 h-10 text-muted-foreground/30 mb-3" />
                        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Rest Day</p>
                        <p className="text-[9px] text-muted-foreground/60 mt-1">No exercises scheduled for this day</p>
                    </div>
                </div>
            ) : (
                <div className="space-y-3">
                    {exercises.map((exercise) => {
                        const sets = workoutData[exercise.slot_uuid]?.sets || [];
                        return (
                            <div key={exercise.slot_uuid} className="bg-card border border-border rounded-3xl p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="text-[11px] font-black uppercase text-foreground">{exercise.exercise_name}</h4>
                                    <span className="text-[9px] font-bold text-muted-foreground uppercase">{exercise.metrics_type}</span>
                                </div>
                                
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-[9px] font-bold text-muted-foreground uppercase">
                                        <span className="w-8 text-center">Set</span>
                                        <span className="flex-1">Weight</span>
                                        <span className="flex-1">Reps</span>
                                        <span className="w-8"></span>
                                    </div>
                                    
                                    {sets.map((set, idx) => (
                                        <div key={idx} className="flex items-center gap-2">
                                            <span className="w-8 text-center text-[10px] font-black text-primary">{idx + 1}</span>
                                            <input
                                                type="number"
                                                value={set.weight || ''}
                                                onChange={(e) => handleUpdateSet(exercise.slot_uuid, idx, 'weight', e.target.value)}
                                                placeholder="kg"
                                                className="flex-1 bg-secondary/30 rounded-xl px-3 py-2 text-[11px] font-bold outline-none text-foreground placeholder:text-muted-foreground/50"
                                            />
                                            <input
                                                type="number"
                                                value={set.reps || ''}
                                                onChange={(e) => handleUpdateSet(exercise.slot_uuid, idx, 'reps', e.target.value)}
                                                placeholder="reps"
                                                className="flex-1 bg-secondary/30 rounded-xl px-3 py-2 text-[11px] font-bold outline-none text-foreground placeholder:text-muted-foreground/50"
                                            />
                                            <button
                                                onClick={() => handleRemoveSet(exercise.slot_uuid, idx)}
                                                className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-colors"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                    
                                    <button
                                        onClick={() => handleAddSet(exercise.slot_uuid)}
                                        className="w-full mt-2 p-2 text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 hover:bg-primary/20 rounded-xl transition-colors"
                                    >
                                        + Add Set
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                    
                    <button
                        onClick={handleSave}
                        disabled={isSaving || Object.keys(workoutData).length === 0}
                        className={cn(
                            "w-full flex items-center justify-center gap-2 p-4 rounded-3xl font-black uppercase tracking-wider transition-all",
                            "bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20",
                            (isSaving || Object.keys(workoutData).length === 0) && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        {isSaving ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Save className="w-4 h-4" />
                        )}
                        <span className="text-[11px]">{isSaving ? 'Saving...' : 'Save Workout'}</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default TrackWorkout;
