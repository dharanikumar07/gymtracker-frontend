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
    Dumbbell
} from 'lucide-react';
import { cn } from '../lib/utils';

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

const WorkoutMetricEditor = ({ metrics, units, onUpdate }) => {
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
        onUpdate({ type: newMethod, data: getDefaultData(newMethod) });
    };

    const inputClasses = "h-9 bg-secondary/50 border border-border rounded-xl px-2 text-[11px] font-black outline-none focus:ring-1 focus:ring-primary/20 transition-all text-center text-foreground w-full";
    const labelClasses = "text-[8px] font-black uppercase text-muted-foreground tracking-widest mb-1 ml-1 flex items-center gap-1";

    const availableTypes = metricsTypes;

    return (
        <div className="space-y-4 w-full">
            <div className="flex gap-1 p-1 bg-secondary/30 rounded-xl border border-border overflow-x-auto">
                {availableTypes.map((type) => {
                    const config = METRIC_CONFIG[type] || METRIC_CONFIG.strength;
                    const isRest = type === METRIC_METHODS.REST;
                    return (
                        <button
                            key={type}
                            onClick={() => changeMethod(type)}
                            className={cn(
                                "flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-tight transition-all shrink-0",
                                isRest ? "min-w-[36px] sm:min-w-0 justify-center sm:justify-start" : "",
                                category === type 
                                    ? "bg-background text-primary shadow-sm ring-1 ring-border" 
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <config.icon className="w-3 h-3" />
                            <span className={cn(
                                "sm:inline",
                                category === type ? "" : "hidden"
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
                        <label className={labelClasses}><Layers className="w-2.5 h-2.5"/> Sets</label>
                        <input 
                            type="number" className={inputClasses} 
                            value={data.sets || ''} 
                            onChange={(e) => updateData({ sets: parseInt(e.target.value) || 0 })}
                        />
                    </div>
                )}

                {category === METRIC_METHODS.STRENGTH && (
                    <div className="w-16">
                        <label className={labelClasses}><Target className="w-2.5 h-2.5"/> Reps</label>
                        <input 
                            type="number" className={inputClasses} 
                            value={data.reps || ''} 
                            onChange={(e) => updateData({ reps: parseInt(e.target.value) || 0 })}
                        />
                    </div>
                )}

                {category === METRIC_METHODS.STRENGTH && (
                    <div className="flex flex-col">
                        <label className={labelClasses}><Dumbbell className="w-2.5 h-2.5"/> Weight</label>
                        <div className="flex bg-secondary/50 border border-border rounded-xl overflow-hidden focus-within:ring-1 focus-within:ring-primary/20">
                            <input 
                                type="number" 
                                className="h-9 bg-transparent w-14 text-[11px] font-black text-center outline-none border-none" 
                                value={data.weight || ''} 
                                placeholder="0"
                                onChange={(e) => updateData({ weight: e.target.value })}
                            />
                            <div className="relative border-l border-border">
                                <select 
                                    className="h-9 pl-2 pr-6 bg-secondary/20 text-[9px] font-black text-primary outline-none appearance-none cursor-pointer uppercase"
                                    value={data.weight_unit || 'kg'}
                                    onChange={(e) => updateData({ weight_unit: e.target.value })}
                                >
                                    {(units?.weight_units || ['kg', 'lbs']).map(u => (
                                        <option key={u} value={u}>{u}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-primary pointer-events-none" />
                            </div>
                        </div>
                    </div>
                )}

                {(category === METRIC_METHODS.TIMED_SET || category === METRIC_METHODS.ENDURANCE) && (
                    <div className="flex flex-col">
                        <label className={labelClasses}><Clock className="w-2.5 h-2.5"/> Duration</label>
                        <div className="flex bg-secondary/50 border border-border rounded-xl overflow-hidden focus-within:ring-1 focus-within:ring-primary/20">
                            <input 
                                type="number" className="h-9 bg-transparent w-14 text-[11px] font-black text-center outline-none border-none" 
                                value={data.duration || ''} 
                                onChange={(e) => updateData({ duration: parseInt(e.target.value) || 0 })}
                            />
                            <div className="relative border-l border-border">
                                <select 
                                    className="h-9 pl-2 pr-6 bg-secondary/20 text-[9px] font-black text-primary outline-none appearance-none cursor-pointer uppercase"
                                    value={data.duration_unit || 'minutes'}
                                    onChange={(e) => updateData({ duration_unit: e.target.value })}
                                >
                                    {(units?.duration_units || ['seconds', 'minutes']).map(u => (
                                        <option key={u} value={u}>{u}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-primary pointer-events-none" />
                            </div>
                        </div>
                    </div>
                )}

                {(category === METRIC_METHODS.STRENGTH || category === METRIC_METHODS.TIMED_SET) && (
                    <div className="w-20">
                        <label className={labelClasses}><RefreshCcw className="w-2.5 h-2.5"/> Rest (s)</label>
                        <input 
                            type="number" className={inputClasses} 
                            value={data.rest || ''} 
                            onChange={(e) => updateData({ rest: parseInt(e.target.value) || 0 })}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default WorkoutMetricEditor;
