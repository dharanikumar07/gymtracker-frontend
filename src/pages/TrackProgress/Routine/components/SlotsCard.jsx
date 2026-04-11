import React, { useState } from 'react';
import { 
    ClipboardList, 
    Save, 
    Loader2, 
    Dumbbell 
} from 'lucide-react';
import DayCard from './DayCard';
import { cn } from '../../../../lib/utils';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

const SlotsCard = ({ slots, planUuid, onSave, isSaving }) => {
    const [localRoutine, setLocalRoutine] = useState(() => 
        DAY_KEYS.reduce((acc, key) => {
            acc[DAYS[DAY_KEYS.indexOf(key)]] = (slots || [])
                .filter(s => s.day === key)
                .sort((a, b) => a.exercise_order - b.exercise_order);
            return acc;
        }, {})
    );
    const [hasChanges, setHasChanges] = useState(false);
    const [expandedDays, setExpandedDays] = useState(['Monday']);

    const toggleDay = (day) => {
        setExpandedDays(prev => 
            prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
        );
    };

    const handleUpdateWorkout = (day, index, updatedWorkout) => {
        setLocalRoutine(prev => {
            const newDayWorkouts = [...(prev[day] || [])];
            newDayWorkouts[index] = updatedWorkout;
            return { ...prev, [day]: newDayWorkouts };
        });
        setHasChanges(true);
    };

    const handleAddWorkout = (day) => {
        setLocalRoutine(prev => {
            const newWorkout = {
                exercise_name: '',
                metrics_type: 'strength',
                metrics_data: { sets: 3, reps: 10, rest: 60 },
                day: DAY_KEYS[DAYS.indexOf(day)],
                exercise_order: (prev[day]?.length || 0) + 1,
                plan_uuid: planUuid
            };
            return { ...prev, [day]: [...(prev[day] || []), newWorkout] };
        });
        setHasChanges(true);
        !expandedDays.includes(day) ? toggleDay(day) : null;
    };

    const handleDeleteWorkout = (day, index) => {
        setLocalRoutine(prev => ({
            ...prev,
            [day]: prev[day].filter((_, i) => i !== index)
        }));
        setHasChanges(true);
    };

    const handleSave = () => {
        const allSlots = [];
        DAYS.forEach(day => {
            localRoutine[day]?.forEach((w, idx) => {
                allSlots.push({
                    uuid: w.uuid || null,
                    plan_uuid: planUuid,
                    exercise_name: w.exercise_name,
                    exercise_order: idx + 1,
                    day: DAY_KEYS[DAYS.indexOf(day)],
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
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <ClipboardList className="w-4 h-4 text-primary" />
                    </div>
                    <h3 className="text-[12px] font-black uppercase italic tracking-tight text-foreground">Workout Routine</h3>
                </div>
                
                <button
                    onClick={handleSave}
                    disabled={!hasChanges || isSaving}
                    className={cn(
                        "h-8 px-4 rounded-xl flex items-center gap-2 text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg",
                        hasChanges 
                            ? "bg-green-600 text-white shadow-green-600/20 hover:bg-green-700" 
                            : "bg-secondary text-muted-foreground shadow-none cursor-not-allowed"
                    )}
                >
                    {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    <span>{isSaving ? 'Syncing...' : 'Sync Slots'}</span>
                </button>
            </div>

            <div className="grid grid-cols-1 gap-3">
                {DAYS.map((day) => (
                    <DayCard
                        key={day}
                        day={day}
                        workouts={localRoutine[day] || []}
                        isExpanded={expandedDays.includes(day)}
                        onToggle={() => toggleDay(day)}
                        onAddWorkout={() => handleAddWorkout(day)}
                        onUpdateWorkout={(idx, updated) => handleUpdateWorkout(day, idx, updated)}
                        onDeleteWorkout={(idx) => handleDeleteWorkout(day, idx)}
                        units={{ weight_units: ['kg', 'lbs'], duration_units: ['seconds', 'minutes'] }}
                        metricsTypes={['strength', 'timed_sets', 'endurance', 'rest']}
                    />
                ))}
            </div>

            {slots.length === 0 && !hasChanges ? (
                <div className="bg-secondary/10 border-2 border-dashed border-border rounded-[2.5rem] p-10 flex flex-col items-center text-center">
                    <Dumbbell className="w-10 h-10 text-muted-foreground/20 mb-3" />
                    <h4 className="text-[11px] font-black uppercase text-foreground mb-1">No slots defined</h4>
                    <p className="text-[9px] text-muted-foreground max-w-[180px] leading-relaxed font-bold uppercase tracking-tighter">
                        Add exercises to start your routine.
                    </p>
                </div>
            ) : null}
        </div>
    );
};

export default SlotsCard;
