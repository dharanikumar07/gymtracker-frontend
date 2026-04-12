import React from 'react';
import { 
    Layers, 
    Target, 
    Timer, 
    RefreshCcw, 
    ChevronDown,
    Activity,
    Clock,
    Moon,
    Dumbbell,
    Check,
    AlertCircle
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

export const METRIC_METHODS = {
    STRENGTH: 'strength',
    TIMED_SET: 'timed_sets',
    ENDURANCE: 'endurance',
    REST: 'rest'
};

const METRIC_CONFIG = {
    strength: { label: 'Strength', icon: Layers },
    timed_sets: { label: 'Timed Sets', icon: Timer },
    endurance: { label: 'Endurance', icon: Activity },
    rest: { label: 'Rest', icon: Moon },
};

const getDefaultData = (type) => {
    switch (type) {
        case METRIC_METHODS.STRENGTH:
            return { sets: 4, reps: 12, rest: 60, weight: '', weight_unit: 'kg' };
        case METRIC_METHODS.TIMED_SET:
            return { sets: 3, duration: 60, duration_unit: 'seconds', rest: 60 };
        case METRIC_METHODS.ENDURANCE:
            return { duration: 30, duration_unit: 'minutes' };
        case METRIC_METHODS.REST:
        default:
            return {};
    }
};

const WorkoutMetricEditor = ({ metrics, units, onUpdate, errors }) => {
    const metricsTypes = metrics?.available_metrics || ['strength', 'timed_sets', 'endurance', 'rest'];
    const category = metrics?.type || METRIC_METHODS.STRENGTH;
    const data = metrics?.data || {};

    const updateData = (updates) => {
        onUpdate({
            ...metrics,
            data: { ...data, ...updates }
        });
    };

    const changeMethod = (newMethod) => {
        // MERGE logic: Use defaults for missing fields but keep existing ones
        const defaults = getDefaultData(newMethod);
        onUpdate({ 
            type: newMethod, 
            data: { ...defaults, ...data } 
        });
    };

    const inputClasses = (hasError) => cn(
        "h-9 border rounded-xl px-2 text-[11px] font-black outline-none focus:ring-1 transition-all text-center text-foreground w-full",
        hasError ? "bg-red-500/10 border-red-500/50 focus:ring-red-500/20" : "bg-secondary/50 border-border focus:ring-primary/20"
    );
    
    const labelClasses = (hasError) => cn(
        "text-[8px] font-black uppercase tracking-widest mb-1 ml-1 flex items-center gap-1",
        hasError ? "text-red-500" : "text-muted-foreground"
    );

    const renderUnitDropdown = (value, options, onSelect) => (
        <Popover>
            <PopoverTrigger asChild>
                <button className="h-9 px-2 min-w-[50px] bg-secondary/20 border-l border-border text-[9px] font-black text-primary outline-none flex items-center justify-center gap-1 hover:bg-secondary/40 transition-colors uppercase">
                    {value}
                    <ChevronDown className="w-3 h-3 opacity-50" />
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-32 p-1 bg-card border border-border rounded-xl shadow-xl z-50" align="end">
                <div className="flex flex-col gap-0.5">
                    {options.map((opt) => (
                        <button
                            key={opt}
                            onClick={() => onSelect(opt)}
                            className={cn(
                                "flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tight transition-colors text-left",
                                value === opt ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                            )}
                        >
                            {opt}
                            {value === opt && <Check className="w-3 h-3" />}
                        </button>
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    );

    return (
        <div className="space-y-4 w-full">
            <div className="flex gap-1.5 p-1 bg-secondary/30 rounded-xl border border-border overflow-x-auto no-scrollbar justify-start items-center">
                {metricsTypes.map((type) => {
                    const config = METRIC_CONFIG[type] || METRIC_CONFIG.strength;
                    const isActive = category === type;
                    return (
                        <button
                            key={type}
                            onClick={() => changeMethod(type)}
                            className={cn(
                                "flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-tight transition-all shrink-0",
                                isActive 
                                    ? "bg-background text-primary shadow-sm ring-1 ring-border" 
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

            <div className="flex flex-wrap items-end gap-3">
                
                {(category === METRIC_METHODS.STRENGTH || category === METRIC_METHODS.TIMED_SET) && (
                    <div className="w-16">
                        <label className={labelClasses(errors?.sets)}><Layers className="w-2.5 h-2.5"/> Sets</label>
                        <input 
                            type="number" className={inputClasses(errors?.sets)} 
                            value={data.sets || ''} 
                            onChange={(e) => updateData({ sets: parseInt(e.target.value) || 0 })}
                        />
                    </div>
                )}

                {category === METRIC_METHODS.STRENGTH && (
                    <div className="w-16">
                        <label className={labelClasses(errors?.reps)}><Target className="w-2.5 h-2.5"/> Reps</label>
                        <input 
                            type="number" className={inputClasses(errors?.reps)} 
                            value={data.reps || ''} 
                            onChange={(e) => updateData({ reps: parseInt(e.target.value) || 0 })}
                        />
                    </div>
                )}

                {category === METRIC_METHODS.STRENGTH && (
                    <div className="flex flex-col">
                        <label className={labelClasses(false)}><Dumbbell className="w-2.5 h-2.5"/> Weight</label>
                        <div className="flex bg-secondary/50 border border-border rounded-xl overflow-hidden focus-within:ring-1 focus-within:ring-primary/20">
                            <input 
                                type="number" 
                                className="h-9 bg-transparent w-16 text-[11px] font-black text-center outline-none border-none" 
                                value={data.weight || ''} 
                                placeholder="0"
                                onChange={(e) => updateData({ weight: e.target.value })}
                            />
                            {renderUnitDropdown(
                                data.weight_unit || 'kg', 
                                units?.weight_units || ['kg', 'lbs'], 
                                (val) => updateData({ weight_unit: val })
                            )}
                        </div>
                    </div>
                )}

                {(category === METRIC_METHODS.TIMED_SET || category === METRIC_METHODS.ENDURANCE) && (
                    <div className="flex flex-col">
                        <label className={labelClasses(errors?.duration)}><Clock className="w-2.5 h-2.5"/> Duration</label>
                        <div className="flex bg-secondary/50 border border-border rounded-xl overflow-hidden focus-within:ring-1 focus-within:ring-primary/20">
                            <input 
                                type="number" className="h-9 bg-transparent w-16 text-[11px] font-black text-center outline-none border-none" 
                                value={data.duration || ''} 
                                onChange={(e) => updateData({ duration: parseInt(e.target.value) || 0 })}
                            />
                            {renderUnitDropdown(
                                data.duration_unit || 'minutes', 
                                units?.duration_units || ['seconds', 'minutes'], 
                                (val) => updateData({ duration_unit: val })
                            )}
                        </div>
                    </div>
                )}

                {(category === METRIC_METHODS.STRENGTH || category === METRIC_METHODS.TIMED_SET) && (
                    <div className="w-20">
                        <label className={labelClasses(errors?.rest)}><RefreshCcw className="w-2.5 h-2.5"/> Rest (s)</label>
                        <input 
                            type="number" className={inputClasses(errors?.rest)} 
                            value={data.rest || ''} 
                            onChange={(e) => updateData({ rest: parseInt(e.target.value) || 0 })}
                        />
                    </div>
                )}
            </div>
            
            {errors && (
                <div className="flex flex-wrap gap-2 mt-2">
                    {Object.entries(errors).map(([field, msg]) => (
                        field !== 'exercise_name' && (
                            <span key={field} className="text-[7px] font-black uppercase text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                                <AlertCircle className="w-2 h-2" /> {field}: {msg}
                            </span>
                        )
                    ))}
                </div>
            )}
        </div>
    );
};

export default WorkoutMetricEditor;
