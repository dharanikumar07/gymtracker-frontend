import React, { useState } from 'react';
import {
    Plus,
    X,
    Loader2,
    Trash2,
    Dumbbell,
    Timer,
    Zap,
    CheckCircle2
} from 'lucide-react';
import { cn } from '../../../../lib/utils';
import { useWorkoutLog } from '../context/WorkoutLogContext';
import { Button } from '../../../../components/ui/button';
import { toast } from 'sonner';

const METRICS_TYPES = [
    { key: 'strength', label: 'Strength', icon: Dumbbell },
    { key: 'timed_sets', label: 'Timed Sets', icon: Timer },
    { key: 'endurance', label: 'Endurance', icon: Zap },
];

const getDefaultMetrics = (type) => {
    switch (type) {
        case 'strength': return { sets: 3, reps: 10, rest: 60, weight_unit: 'kg' };
        case 'timed_sets': return { sets: 3, duration: 60, duration_unit: 'seconds', rest: 60 };
        case 'endurance': return { duration: 30, duration_unit: 'minutes' };
        default: return {};
    }
};

const buildSets = (type, count) => {
    return type === 'strength'
        ? Array.from({ length: count }, () => ({ weight: '', reps: '', completed: false }))
        : type === 'timed_sets'
            ? Array.from({ length: count }, () => ({ duration: '', completed: false }))
            : [{ duration: '', completed: false }];
};

const compileMetricsData = (metricsType, sets, templateMetrics) => {
    if (metricsType === 'strength') {
        return {
            sets: sets.map((s, index) => ({
                weight: Number(s.weight) || 0,
                reps: Number(s.reps) || 0,
                completed: s.completed,
                order: index + 1,
            })),
            rest: templateMetrics.rest || 0,
        };
    }
    if (metricsType === 'timed_sets') {
        return {
            sets: sets.map((s, index) => ({
                duration: Number(s.duration) || 0,
                completed: s.completed,
                order: index + 1,
            })),
            duration_unit: templateMetrics.duration_unit || 'seconds',
            rest: templateMetrics.rest || 0,
        };
    }
    if (metricsType === 'endurance') {
        return {
            duration: Number(sets[0]?.duration) || 0,
            duration_unit: templateMetrics.duration_unit || 'minutes',
            completed: sets[0]?.completed || false,
            order: 1,
        };
    }
    return {};
};

const AddWorkoutCard = ({ onClose }) => {
    const { saveLog, metricsDefaults } = useWorkoutLog();
    const [exerciseName, setExerciseName] = useState('');
    const [metricsType, setMetricsType] = useState('strength');
    const [templateMetrics, setTemplateMetrics] = useState(getDefaultMetrics('strength'));
    const [sets, setSets] = useState(() => buildSets('strength', 3));
    const [isSaving, setIsSaving] = useState(false);

    const availableMetricTypes = METRICS_TYPES.filter(t => 
        metricsDefaults?.metrics_types?.includes(t.key)
    );

    const handleMetricsTypeChange = (newType) => {
        setMetricsType(newType);
        const defaults = getDefaultMetrics(newType);
        setTemplateMetrics(defaults);
        setSets(buildSets(newType, defaults.sets || 1));
    };

    const updateSet = (index, field, value) => {
        setSets(prev => prev.map((s, i) => i === index ? { ...s, [field]: value } : s));
    };

    const addSet = () => {
        const lastSet = sets[sets.length - 1];
        setSets([...sets, { ...lastSet, completed: false }]);
    };

    const removeSet = (index) => {
        setSets(prev => prev.filter((_, i) => i !== index));
    };

    const handleSave = () => {
        if (!exerciseName.trim()) {
            toast.error('Exercise name is required');
            return;
        }
        setIsSaving(true);
        const compiled = compileMetricsData(metricsType, sets, templateMetrics);
        saveLog([{
            slot_uuid: null,
            exercise_name: exerciseName.trim(),
            metrics_type: metricsType,
            metrics_data: compiled,
            type: 'additional',
            status: 'completed',
        }], {
            onSuccess: () => {
                setIsSaving(false);
                toast.success('Additional workout saved!');
                onClose();
            },
            onError: () => {
                setIsSaving(false);
                toast.error('Failed to save workout');
            },
        });
    };

    const durationUnit = templateMetrics.duration_unit || 'seconds';
    const isEndurance = metricsType === 'endurance';
    const completedCount = sets.filter(s => s.completed).length;
    const midIndex = Math.ceil(sets.length / 2);
    const leftSets = sets.slice(0, midIndex);
    const rightSets = sets.slice(midIndex);

    const renderSetEntry = (set, idx, actualIdx) => (
        <div key={actualIdx} className={cn("flex items-center gap-2 p-1.5 rounded-xl transition-all", set.completed ? "bg-emerald-500/5 ring-1 ring-emerald-500/20" : "bg-secondary/30")}>
            <div className="w-6 h-6 flex items-center justify-center shrink-0 bg-background/50 rounded-full">
                <span className={cn("text-[10px] font-black", set.completed ? "text-emerald-600" : "text-muted-foreground/40")}>{actualIdx + 1}</span>
            </div>
            <div className="flex-1 flex items-center gap-1.5 min-w-0">
                {metricsType === 'strength' ? (
                    <>
                        <div className="flex-1 relative">
                            <input type="number" placeholder="0" disabled={set.completed} className="w-full h-8 bg-background border-none rounded-lg px-2 text-[12px] font-black text-center outline-none focus:ring-1 ring-primary/20 transition-all placeholder:text-muted-foreground/15 disabled:opacity-50" value={set.weight} onChange={(e) => updateSet(actualIdx, 'weight', e.target.value)} />
                            <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] font-black text-emerald-600 dark:text-emerald-500 uppercase">kg</span>
                        </div>
                        <div className="flex-1 relative">
                            <input type="number" placeholder="0" disabled={set.completed} className="w-full h-8 bg-background border-none rounded-lg px-2 text-[12px] font-black text-center outline-none focus:ring-1 ring-primary/20 transition-all placeholder:text-muted-foreground/15 disabled:opacity-50" value={set.reps} onChange={(e) => updateSet(actualIdx, 'reps', e.target.value)} />
                            <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] font-black text-emerald-600 dark:text-emerald-500 uppercase">reps</span>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 relative">
                        <input type="number" placeholder="0" disabled={set.completed} className="w-full h-8 bg-background border-none rounded-lg px-2 text-[12px] font-black text-center outline-none focus:ring-1 ring-primary/20 transition-all placeholder:text-muted-foreground/15 disabled:opacity-50" value={set.duration} onChange={(e) => updateSet(actualIdx, 'duration', e.target.value)} />
                        <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] font-black text-emerald-600 dark:text-emerald-500 uppercase">{durationUnit.slice(0, 3)}</span>
                    </div>
                )}
            </div>
            <div className="flex items-center gap-1 shrink-0">
                {set.completed ? (
                    <div className="w-8 h-8 flex items-center justify-center text-emerald-500/50">
                        <CheckCircle2 className="w-4 h-4" />
                    </div>
                ) : (
                    sets.length > 1 && (
                        <button onClick={() => removeSet(actualIdx)} className="w-8 h-8 flex items-center justify-center text-red-500 hover:text-red-700 transition-colors">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )
                )}
                <button 
                    onClick={() => updateSet(actualIdx, 'completed', !set.completed)} 
                    disabled={set.completed || isSaving}
                    className={cn(
                        "h-8 flex items-center justify-center gap-1.5 px-2.5 rounded-lg border transition-all relative overflow-hidden group/tick", 
                        set.completed ? "bg-emerald-500 border-emerald-500 shadow-sm cursor-default" : "bg-transparent border-muted-foreground/20 hover:border-emerald-500/50"
                    )}
                >
                    {set.completed ? (
                        <>
                            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-white fill-none stroke-current stroke-[3] transition-all" style={{ strokeLinecap: 'round', strokeLinejoin: 'round' }}>
                                <circle cx="12" cy="12" r="10" className="animate-[draw-circle_0.4s_ease-out_forwards]" style={{ strokeDasharray: 63, strokeDashoffset: 63 }} />
                                <path d="M7 13l3 3 7-7" className="animate-[draw-check_0.3s_ease-out_0.3s_forwards]" style={{ strokeDasharray: 20, strokeDashoffset: 20 }} />
                            </svg>
                            <span className="text-[10px] font-black text-white uppercase tracking-widest animate-in fade-in slide-in-from-left-2 duration-300">Done</span>
                        </>
                    ) : (
                        <div className="flex items-center gap-1.5">
                           <span className="text-[10px] font-black uppercase text-muted-foreground/20 group-hover/tick:text-emerald-500/50 transition-colors tracking-widest">Log</span>
                        </div>
                    )}
                </button>
            </div>
        </div>
    );

    return (
        <div className="bg-card border-2 border-primary/30 rounded-2xl shadow-lg overflow-hidden animate-in zoom-in-95 duration-300">
            <style>{`
                @keyframes draw-circle { to { stroke-dashoffset: 0; } }
                @keyframes draw-check { to { stroke-dashoffset: 0; } }
            `}</style>

            {/* Compact Header */}
            <div className="px-3 pt-3 pb-2">
                <div className="flex items-center justify-between mb-2 px-1">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                            <Plus className="w-4 h-4 text-primary" />
                        </div>
                        <h4 className="text-[13px] font-black uppercase tracking-tight text-foreground">New Exercise</h4>
                    </div>
                    <button onClick={onClose} disabled={isSaving} className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground/30 hover:text-foreground hover:bg-secondary/50 transition-all"><X className="w-4 h-4" /></button>
                </div>
                <input value={exerciseName} placeholder="What are you training?" onChange={(e) => setExerciseName(e.target.value)} disabled={isSaving} className="w-full h-9 px-3 bg-background border-none rounded-xl text-[12px] font-black text-foreground outline-none ring-1 ring-border focus:ring-2 ring-primary/20 transition-all placeholder:text-muted-foreground/30" autoFocus />
            </div>

            {/* Compact Metric Navigator */}
            <div className="px-3 pb-2">
                <div className="flex gap-1.5 p-1 bg-secondary/30 rounded-xl border border-border">
                    {availableMetricTypes.map(({ key, label, icon: Icon }) => {
                        const isActive = metricsType === key;
                        return (
                            <button key={key} onClick={() => handleMetricsTypeChange(key)} disabled={isSaving} className={cn("flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex-1", isActive ? "bg-background text-primary shadow-sm ring-1 ring-border" : "text-muted-foreground hover:bg-secondary")}>
                                <Icon className="w-3.5 h-3.5 shrink-0" />
                                <span className={cn("transition-all", isActive ? "block" : "hidden sm:block")}>{label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Compact Sets Section */}
            <div className="px-3 pb-3">
                <div className="flex items-center justify-between mb-2 px-1">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50">Log Sets</span>
                    </div>
                    {!isEndurance && <Button variant="ghost" size="compact" onClick={addSet} className="h-7 px-2 text-primary font-black uppercase tracking-widest"><Plus className="w-3 h-3 mr-1" />Add Sets</Button>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="space-y-1.5">{leftSets.map((set, idx) => renderSetEntry(set, idx, idx))}</div>
                    {rightSets.length > 0 && <div className="space-y-1.5">{rightSets.map((set, idx) => renderSetEntry(set, idx, midIndex + idx))}</div>}
                </div>
            </div>

            {/* Footer with Finish Button */}
            <div className="px-3 py-2.5 border-t border-border/40 flex items-center justify-between bg-secondary/5">
                <div className="flex items-center gap-2 px-1">
                    <span className="text-[9px] font-black uppercase tracking-widest text-foreground/30">Progress</span>
                    <span className="text-[11px] font-black text-foreground">{completedCount}/{sets.length}</span>
                </div>
                <Button onClick={handleSave} disabled={isSaving || !exerciseName.trim()} className="h-8 px-6 rounded-xl font-black uppercase tracking-widest shadow-md shadow-primary/20 transition-all text-[10px]"><CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />Finish</Button>
            </div>
        </div>
    );
};

export default AddWorkoutCard;
