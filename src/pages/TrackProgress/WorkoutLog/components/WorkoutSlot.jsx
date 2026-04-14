import React, { useState } from 'react';
import { 
    Plus, 
    Trash2,
    CheckCircle2,
    Dumbbell,
    SkipForward,
    Loader2,
    Timer,
    Zap
} from 'lucide-react';
import { cn } from '../../../../lib/utils';
import { useWorkoutLog } from '../context/WorkoutLogContext';
import { Button } from '../../../../components/ui/button';

const WorkoutSlot = ({ slot, isPending, isCompleted }) => {
    const { saveLog, isSaving, deleteSlot } = useWorkoutLog();
    
    const [localSets, setLocalSets] = useState(() => {
        const metricsData = slot.metrics_data || {};
        const setsFromData = metricsData.sets;
        
        if (Array.isArray(setsFromData)) {
            return setsFromData.map((s, idx) => ({
                ...s,
                id: s.id || `set-${idx}-${Date.now()}`
            }));
        }

        const setCount = Number(metricsData.sets) || 1;
        return Array.from({ length: setCount }, (_, idx) => ({
            id: `set-${idx}-${Date.now()}`,
            reps: metricsData.reps || 0,
            weight: metricsData.weight || 0,
            duration: metricsData.duration || 0,
            completed: false
        }));
    });

    const triggerSync = (currentSets, status = 'completed') => {
        saveLog([{
            slot_uuid: slot.slot_uuid || slot.uuid,
            exercise_name: slot.exercise_name,
            metrics_type: slot.metrics_type || 'strength',
            metrics_data: {
                ...(slot.metrics_data || {}),
                sets: currentSets.map(({ id, ...rest }, index) => ({
                    ...rest,
                    order: index + 1
                }))
            },
            status: status,
            type: slot.type || (isCompleted ? 'additional' : 'routine')
        }]);
    };

    const addSet = () => {
        const lastSet = localSets[localSets.length - 1];
        setLocalSets([
            ...localSets, 
            { ...lastSet, id: `new-set-${Date.now()}`, completed: false }
        ]);
    };

    const removeSet = (id) => {
        if (localSets.length > 1) {
            const filtered = localSets.filter(s => s.id !== id);
            setLocalSets(filtered);
            triggerSync(filtered);
        }
    };

    const updateSet = (id, field, value) => {
        const updated = localSets.map(s => 
            s.id === id ? { ...s, [field]: field === 'completed' ? value : (parseFloat(value) || 0) } : s
        );
        setLocalSets(updated);
        
        // Immediate sync if marking as completed
        if (field === 'completed' && value === true) {
            triggerSync(updated);
        }
    };

    const handleFinish = (status = 'completed') => {
        triggerSync(localSets, status);
    };

    const handleDelete = () => {
        if (window.confirm('Are you sure you want to delete this exercise from your log?')) {
            deleteSlot(slot.slot_uuid || slot.uuid);
        }
    };

    const metricsType = slot.metrics_type || 'strength';
    const durationUnit = slot.metrics_data?.duration_unit || (metricsType === 'endurance' ? 'min' : 'sec');
    const midIndex = Math.ceil(localSets.length / 2);

    const renderSetRow = (set, idx, actualIdx) => (
        <div 
            key={set.id} 
            className={cn(
                "flex items-center gap-2 p-1.5 rounded-xl transition-all duration-300",
                set.completed ? "bg-emerald-500/5 ring-1 ring-emerald-500/20" : "bg-secondary/30"
            )}
        >
            <div className="w-6 h-6 flex items-center justify-center shrink-0 bg-background/50 rounded-full">
                <span className={cn(
                    "text-[10px] font-black transition-colors duration-300",
                    set.completed ? "text-emerald-600" : "text-muted-foreground/40"
                )}>
                    {actualIdx + 1}
                </span>
            </div>

            <div className="flex-1 flex items-center gap-1.5 min-w-0">
                {metricsType === 'strength' ? (
                    <>
                        <div className="flex-1 relative">
                            <input 
                                type="number" 
                                placeholder="0"
                                disabled={set.completed}
                                className="w-full h-8 bg-background border-none rounded-lg px-2 text-[12px] font-black text-center outline-none focus:ring-1 ring-primary/20 transition-all placeholder:text-muted-foreground/15 disabled:opacity-50"
                                value={set.weight || ''}
                                onChange={(e) => updateSet(set.id, 'weight', e.target.value)}
                            />
                            <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] font-black text-emerald-600 dark:text-emerald-500 uppercase">kg</span>
                        </div>
                        <div className="flex-1 relative">
                            <input 
                                type="number" 
                                placeholder="0"
                                disabled={set.completed}
                                className="w-full h-8 bg-background border-none rounded-lg px-2 text-[12px] font-black text-center outline-none focus:ring-1 ring-primary/20 transition-all placeholder:text-muted-foreground/15 disabled:opacity-50"
                                value={set.reps || ''}
                                onChange={(e) => updateSet(set.id, 'reps', e.target.value)}
                            />
                            <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] font-black text-emerald-600 dark:text-emerald-500 uppercase">reps</span>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 relative">
                        <input 
                            type="number" 
                            placeholder="0"
                            disabled={set.completed}
                            className="w-full h-8 bg-background border-none rounded-lg px-2 text-[12px] font-black text-center outline-none focus:ring-1 ring-primary/20 transition-all placeholder:text-muted-foreground/15 disabled:opacity-50"
                            value={set.duration || ''}
                            onChange={(e) => updateSet(set.id, 'duration', e.target.value)}
                        />
                        <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] font-black text-emerald-600 dark:text-emerald-500 uppercase">
                            {durationUnit.slice(0, 3)}
                        </span>
                    </div>
                )}
            </div>

            <div className="flex items-center gap-1 shrink-0">
                {set.completed ? (
                    <div className="w-8 h-8 flex items-center justify-center text-emerald-500/50">
                        <CheckCircle2 className="w-4 h-4" />
                    </div>
                ) : (
                    localSets.length > 1 && (
                        <button 
                            onClick={() => removeSet(set.id)}
                            disabled={isSaving}
                            className="w-8 h-8 flex items-center justify-center text-red-500 hover:text-red-700 transition-colors disabled:opacity-30"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )
                )}
                <button 
                    onClick={() => updateSet(set.id, 'completed', !set.completed)}
                    disabled={set.completed || isSaving}
                    className={cn(
                        "h-8 flex items-center justify-center rounded-lg border transition-all relative overflow-hidden",
                        set.completed 
                            ? "bg-emerald-500 border-emerald-500 shadow-sm w-8 cursor-default" 
                            : "bg-emerald-500/5 border-emerald-600/30 text-emerald-600 hover:bg-emerald-500/10 px-2.5"
                    )}
                >
                    {set.completed ? (
                        <svg 
                            viewBox="0 0 24 24" 
                            className="w-4 h-4 text-white fill-none stroke-current stroke-[3] transition-all"
                            style={{ strokeLinecap: 'round', strokeLinejoin: 'round' }}
                        >
                            <circle 
                                cx="12" cy="12" r="10" 
                                className="animate-[draw-circle_0.4s_ease-out_forwards]"
                                style={{ strokeDasharray: 63, strokeDashoffset: 63 }}
                            />
                            <path 
                                d="M7 13l3 3 7-7" 
                                className="animate-[draw-check_0.3s_ease-out_0.3s_forwards]"
                                style={{ strokeDasharray: 20, strokeDashoffset: 20 }}
                            />
                        </svg>
                    ) : (
                        <span className="text-[10px] font-black uppercase tracking-widest">Done</span>
                    )}
                </button>
            </div>
        </div>
    );

    return (
        <div className="bg-card border border-border rounded-2xl p-3 sm:p-4 shadow-sm hover:shadow-md transition-all duration-300 relative group overflow-hidden">
            <style>{`
                @keyframes draw-circle {
                    to { stroke-dashoffset: 0; }
                }
                @keyframes draw-check {
                    to { stroke-dashoffset: 0; }
                }
            `}</style>

            {/* Exercise Header */}
            <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        {metricsType === 'strength' ? <Dumbbell className="w-5 h-5 text-primary" /> : 
                         metricsType === 'timed_sets' ? <Timer className="w-5 h-5 text-primary" /> : 
                         <Zap className="w-5 h-5 text-primary" />}
                    </div>
                    <div className="min-w-0">
                        <h4 className="text-[14px] font-black uppercase tracking-tight text-foreground truncate leading-tight">
                            {slot.exercise_name}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[7px] font-black text-primary/60 uppercase tracking-widest bg-primary/5 px-1.5 py-0.5 rounded-md">
                                {slot.meta_data?.target_muscles?.[0] || metricsType}
                            </span>
                            <div className="w-0.5 h-0.5 rounded-full bg-border" />
                            <span className="text-[8px] font-black text-muted-foreground/40 uppercase">
                                {localSets.length} Sets
                            </span>
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center gap-1">
                    {!isCompleted && (
                        <Button 
                            variant="ghost" 
                            size="compact"
                            onClick={addSet}
                            disabled={isSaving}
                            className="h-8 px-2 text-primary hover:bg-primary/5 font-black uppercase tracking-widest"
                        >
                            <Plus className="w-3 h-3 mr-1" />
                            Add Sets
                        </Button>
                    )}
                    <button 
                        onClick={handleDelete}
                        disabled={isSaving}
                        className="w-8 h-8 flex items-center justify-center text-muted-foreground/30 hover:text-red-500 transition-colors rounded-lg hover:bg-red-500/5"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Set Logging Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-3 gap-y-1.5">
                <div className="space-y-1.5">
                    {localSets.slice(0, midIndex).map((set, idx) => renderSetRow(set, idx, idx))}
                </div>
                <div className="space-y-1.5">
                    {localSets.slice(midIndex).map((set, idx) => renderSetRow(set, idx, midIndex + idx))}
                </div>
            </div>

            {/* Controls & Footer */}
            <div className="mt-4 flex items-center justify-between gap-3 border-t border-border/40 pt-3">
                <div className="flex items-center gap-2.5">
                    <div className={cn(
                        "w-2 h-2 rounded-full",
                        localSets.every(s => s.completed) ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" : "bg-muted"
                    )} />
                    <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/60">
                        {localSets.filter(s => s.completed).length}/{localSets.length} Logged
                    </span>
                </div>
                
                <div className="flex items-center gap-2">
                    {isPending && (
                        <Button 
                            variant="secondary"
                            size="compact"
                            onClick={() => handleFinish('skipped')}
                            disabled={isSaving}
                            className="bg-orange-500/5 text-orange-600 hover:bg-orange-500/10 border-none font-black uppercase tracking-widest h-8 rounded-xl px-4"
                        >
                            <SkipForward className="w-3.5 h-3.5 mr-1" />
                            Skip
                        </Button>
                    )}
                    <Button 
                        size="compact"
                        onClick={() => handleFinish('completed')}
                        disabled={isSaving}
                        className={cn(
                            "font-black uppercase tracking-widest h-8 px-6 rounded-xl transition-all duration-300",
                            localSets.every(s => s.completed)
                                ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20"
                                : "bg-primary text-white shadow-primary/20"
                        )}
                    >
                        {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5 mr-1" />}
                        <span>{isCompleted ? 'Update' : 'Finish'}</span>
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default WorkoutSlot;
