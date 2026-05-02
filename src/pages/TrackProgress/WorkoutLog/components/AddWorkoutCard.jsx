import React, { useState } from 'react';
import {
    Plus,
    X,
    Loader2,
    Dumbbell,
    Timer,
    Zap,
    Layers,
    Activity,
    Moon,
    Trash2,
    Scale,
    PlusCircle,
    ChevronDown,
    Check
} from 'lucide-react';
import { cn } from '../../../../lib/utils';
import { useWorkoutLog } from '../context/WorkoutLogContext';
import { toast } from 'sonner';
import { Button } from '../../../../components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../../../../components/ui/popover';

import { validateManualExerciseFields } from '../validation/validation';

const METRIC_CONFIG = {
    strength: { label: 'Strength', icon: Dumbbell },
    timed_sets: { label: 'Timed Sets', icon: Timer },
    endurance: { label: 'Endurance', icon: Activity },
    rest: { label: 'Rest', icon: Moon },
};

const buildSets = (type, count) => {
    const base = { id: `init-${Date.now()}-${Math.random()}`, completed: true, showWeight: false };
    return type === 'strength'
        ? Array.from({ length: count }, (_, i) => ({ ...base, id: `s-${i}`, weight: '', reps: '', weight_unit: 'kg' }))
        : type === 'timed_sets'
            ? Array.from({ length: count }, (_, i) => ({ ...base, id: `t-${i}`, duration: '', duration_unit: 'seconds', weight: '', weight_unit: 'kg' }))
            : [{ ...base, id: 'e-1', duration: '', duration_unit: 'minutes', weight: '', weight_unit: 'kg' }];
};

const AddWorkoutCard = ({ onClose }) => {
    const { saveLog, metricsDefaults } = useWorkoutLog();
    const availableMetrics = (metricsDefaults?.metrics_types || ['strength', 'timed_sets', 'endurance']).filter(t => t !== 'rest');
    
    const [exerciseName, setExerciseName] = useState('');
    const [metricsType, setMetricsType] = useState('strength');
    const [sets, setSets] = useState(() => buildSets('strength', 3));
    const [isSaving, setIsSaving] = useState(false);
    const [errors, setErrors] = useState({ name: null, sets: [] });

    const handleMetricsTypeChange = (newType) => {
        setMetricsType(newType);
        setSets(buildSets(newType, newType === 'endurance' ? 1 : 3));
        setErrors({ name: null, sets: [] });
    };

    const updateSet = (id, field, value) => {
        setSets(prev => prev.map((s) => s.id === id ? { ...s, [field]: value } : s));
        
        // Clear error for this set when user types
        const setIdx = sets.findIndex(s => s.id === id);
        if (errors.sets[setIdx]?.[field]) {
            const newSetsErrors = [...errors.sets];
            newSetsErrors[setIdx] = { ...newSetsErrors[setIdx], [field]: null };
            setErrors(prev => ({ ...prev, sets: newSetsErrors }));
        }
    };

    const removeSet = (id) => {
        if (sets.length > 1) {
            setSets(prev => prev.filter(s => s.id !== id));
            setErrors({ name: errors.name, sets: [] }); // Reset sets errors to re-validate on next save
        }
    };

    const toggleSetWeight = (id) => {
        setSets(prev => prev.map((s) => s.id === id ? { ...s, showWeight: !s.showWeight, weight: !s.showWeight ? s.weight : '' } : s));
    };

    const handleSave = () => {
        const validation = validateManualExerciseFields(exerciseName, sets, metricsType);
        
        if (!validation.isValid) {
            setErrors(validation.errors);
            return;
        }

        setIsSaving(true);
        
        const metricsData = {
            sets: sets.map(s => {
                const setObj = {
                    weight: Number(s.weight) || 0,
                    weight_unit: s.weight_unit || 'kg',
                    completed: true
                };

                if (metricsType === 'strength') {
                    setObj.reps = Number(s.reps) || 0;
                }

                if (metricsType === 'timed_sets' || metricsType === 'endurance') {
                    setObj.duration = Number(s.duration) || 0;
                    setObj.duration_unit = s.duration_unit || (metricsType === 'endurance' ? 'minutes' : 'seconds');
                }

                return setObj;
            })
        };

        saveLog([{ 
            slot_uuid: null, 
            exercise_name: exerciseName.trim(), 
            metrics_type: metricsType, 
            metrics_data: metricsData, 
            type: 'additional', 
            status: 'completed' 
        }], {
            onSuccess: () => { setIsSaving(false); onClose(); },
            onError: () => setIsSaving(false),
        });
    };

    const renderUnitDropdown = (value, options, onSelect) => (
        <Popover>
            <PopoverTrigger asChild>
                <button className="h-full px-2 min-w-[45px] bg-secondary/20 border-l border-border text-[8px] font-black text-emerald-600 outline-none flex items-center justify-center gap-0.5 hover:bg-secondary/40 transition-colors uppercase rounded-r-lg">
                    {value}
                    <ChevronDown className="w-2.5 h-2.5 opacity-50" />
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-28 p-1 bg-card border border-border rounded-xl shadow-xl z-[250]" align="end">
                <div className="flex flex-col gap-0.5">
                    {options.map((opt) => (
                        <button
                            key={opt}
                            onClick={() => onSelect(opt)}
                            className={cn(
                                "flex items-center justify-between px-2 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-tight transition-colors text-left",
                                value === opt ? "bg-emerald-600/10 text-emerald-600" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                            )}
                        >
                            {opt}
                            {value === opt && <Check className="w-2.5 h-2.5" />}
                        </button>
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    );

    return (
        <div className="w-full bg-card border border-border rounded-3xl overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-xl bg-emerald-600/10 flex items-center justify-center">
                            <Plus className="w-3.5 h-3.5 text-emerald-600" />
                        </div>
                        <h3 className="text-[13px] font-black uppercase tracking-tight text-foreground">Add New Exercise</h3>
                    </div>
                    <button 
                        onClick={onClose} 
                        disabled={isSaving} 
                        className="w-8 h-8 flex items-center justify-center text-red-500 hover:scale-125 transition-all duration-200"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="space-y-6">
                    <div className="space-y-1.5">
                        <label className="text-[8px] font-black uppercase tracking-widest text-foreground/30 ml-1">Exercise Identity</label>
                        <input
                            value={exerciseName}
                            placeholder="e.g. Bench Press..."
                            onChange={(e) => {
                                setExerciseName(e.target.value);
                                if (errors.name) setErrors(prev => ({ ...prev, name: null }));
                            }}
                            disabled={isSaving}
                            autoFocus
                            className={cn(
                                "w-full h-9 bg-secondary/10 border rounded-xl px-4 text-[12px] font-black outline-none transition-all placeholder:text-foreground/10",
                                errors.name ? "border-red-500 bg-red-500/5" : "border-border focus:border-emerald-600/50"
                            )}
                        />
                        {errors.name && <p className="text-[8px] font-bold text-red-500 ml-1 uppercase">{errors.name}</p>}
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[8px] font-black uppercase tracking-widest text-foreground/30 ml-1">Training Style</label>
                        <div className="flex gap-1.5 p-1 bg-secondary/30 rounded-xl border border-border overflow-x-auto no-scrollbar">
                            {availableMetrics.map((type) => {
                                const config = METRIC_CONFIG[type] || METRIC_CONFIG.strength;
                                const isActive = metricsType === type;
                                return (
                                    <button
                                        key={type}
                                        onClick={() => handleMetricsTypeChange(type)}
                                        disabled={isSaving}
                                        className={cn(
                                            "flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-tight transition-all shrink-0",
                                            isActive 
                                                ? "bg-background text-emerald-600 shadow-sm ring-1 ring-border" 
                                                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                                        )}
                                    >
                                        <config.icon className="w-3.5 h-3.5 shrink-0" />
                                        <span className={cn(
                                            "transition-all duration-300 truncate",
                                            isActive ? "block" : "hidden sm:block"
                                        )}>
                                            {config.label}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between px-1">
                            <label className="text-[8px] font-black uppercase tracking-widest text-foreground/30">Initial Stats</label>
                            <button 
                                onClick={() => setSets([...sets, { id: `added-${Date.now()}`, weight: '', weight_unit: 'kg', reps: '', duration: '', duration_unit: 'seconds', completed: true, showWeight: false }])}
                                className="flex items-center justify-center sm:justify-start gap-1.5 px-2.5 sm:px-3 h-7 rounded-lg border border-dashed border-emerald-600/30 hover:border-emerald-600 text-emerald-600 transition-all text-[8px] font-black uppercase tracking-widest"
                            >
                                <Plus className="w-3 h-3" />
                                <span className="hidden sm:inline">Add Set</span>
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                            {sets.map((set, idx) => (
                                <div key={set.id} className="bg-secondary/5 border border-border rounded-2xl p-3 space-y-2.5 shadow-sm relative group">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-5 h-5 rounded-full bg-emerald-600/10 flex items-center justify-center text-[9px] font-black text-emerald-600">
                                                {idx + 1}
                                            </div>
                                            <span className="text-[9px] font-black uppercase text-foreground/30 tracking-widest">Set Details</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {(metricsType === 'timed_sets' || metricsType === 'endurance') && (
                                                <button 
                                                    onClick={() => toggleSetWeight(set.id)}
                                                    className={cn(
                                                        "w-7 h-7 flex items-center justify-center rounded-lg border transition-all",
                                                        set.showWeight ? "bg-emerald-600/10 border-emerald-600 text-emerald-600" : "border-border text-foreground/20 hover:text-emerald-600"
                                                    )}
                                                >
                                                    <Scale className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                            <button 
                                                onClick={() => removeSet(set.id)}
                                                className="w-8 h-8 flex items-center justify-center text-red-500 hover:text-red-700 transition-all"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        {(metricsType === 'strength' || set.showWeight) && (
                                            <div className="space-y-1">
                                                <div className={cn(
                                                    "flex bg-transparent border rounded-lg transition-all h-8 items-center",
                                                    errors.sets[idx]?.weight ? "border-red-500 bg-red-500/5" : "border-border focus-within:border-emerald-600"
                                                )}>
                                                    <div className="pl-3 pr-2 border-r border-border h-full flex items-center">
                                                        <Dumbbell className="w-3 h-3 text-foreground/20" />
                                                    </div>
                                                    <input 
                                                        type="number" placeholder="0.00" 
                                                        className="flex-1 bg-transparent text-[12px] font-black outline-none text-right placeholder:text-foreground/5 px-2 ml-2"
                                                        value={set.weight} onChange={(e) => updateSet(set.id, 'weight', e.target.value)}
                                                    />
                                                    {renderUnitDropdown(
                                                        set.weight_unit || 'kg',
                                                        metricsDefaults?.units?.weight_units || ['kg', 'lbs'],
                                                        (val) => updateSet(set.id, 'weight_unit', val)
                                                    )}
                                                </div>
                                                {errors.sets[idx]?.weight && <p className="text-[7px] font-bold text-red-500 ml-1 uppercase">{errors.sets[idx].weight}</p>}
                                            </div>
                                        )}
                                        
                                        {metricsType === 'strength' && (
                                            <div className="space-y-1">
                                                <div className={cn(
                                                    "flex bg-transparent border rounded-lg transition-all h-8 items-center",
                                                    errors.sets[idx]?.reps ? "border-red-500 bg-red-500/5" : "border-border focus-within:border-emerald-600"
                                                )}>
                                                    <div className="pl-3 pr-2 border-r border-border h-full flex items-center">
                                                        <PlusCircle className="w-3 h-3 text-foreground/20" />
                                                    </div>
                                                    <input 
                                                        type="number" placeholder="0" 
                                                        className="flex-1 bg-transparent text-[12px] font-black outline-none text-right placeholder:text-foreground/5 px-2 ml-2"
                                                        value={set.reps} onChange={(e) => updateSet(set.id, 'reps', e.target.value)}
                                                    />
                                                    <div className="px-3 text-[8px] font-black text-emerald-600 uppercase">REPS</div>
                                                </div>
                                                {errors.sets[idx]?.reps && <p className="text-[7px] font-bold text-red-500 ml-1 uppercase">{errors.sets[idx].reps}</p>}
                                            </div>
                                        )}

                                        {(metricsType === 'timed_sets' || metricsType === 'endurance') && (
                                            <div className="space-y-1">
                                                <div className={cn(
                                                    "flex bg-transparent border rounded-lg transition-all h-8 items-center",
                                                    errors.sets[idx]?.duration ? "border-red-500 bg-red-500/5" : "border-border focus-within:border-emerald-600"
                                                )}>
                                                    <div className="pl-3 pr-2 border-r border-border h-full flex items-center">
                                                        <Timer className="w-3 h-3 text-foreground/20" />
                                                    </div>
                                                    <input 
                                                        type="number" placeholder="0" 
                                                        className="flex-1 bg-transparent text-[12px] font-black outline-none text-right placeholder:text-foreground/5 px-2 ml-2"
                                                        value={set.duration} onChange={(e) => updateSet(set.id, 'duration', e.target.value)}
                                                    />
                                                    {renderUnitDropdown(
                                                        set.duration_unit || (metricsType === 'endurance' ? 'minutes' : 'seconds'),
                                                        metricsDefaults?.units?.duration_units || ['seconds', 'minutes'],
                                                        (val) => updateSet(set.id, 'duration_unit', val)
                                                    )}
                                                </div>
                                                {errors.sets[idx]?.duration && <p className="text-[7px] font-bold text-red-500 ml-1 uppercase">{errors.sets[idx].duration}</p>}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-4 py-3 bg-secondary/5 border-t border-border flex items-center justify-end">
                <Button 
                    onClick={handleSave} 
                    disabled={isSaving}
                    className="h-9 px-8 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-600/10 bg-emerald-600 hover:bg-emerald-700"
                >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Exercise"}
                </Button>
            </div>
        </div>
    );
};

export default AddWorkoutCard;
