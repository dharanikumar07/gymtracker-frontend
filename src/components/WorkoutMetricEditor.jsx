import React from 'react';
import { 
    Layers, 
    Target, 
    Timer, 
    RefreshCcw, 
    ChevronDown,
    Activity,
    Clock
} from 'lucide-react';
import { cn } from '../lib/utils';

export const METRIC_METHODS = {
    STRENGTH: 'strength',
    TIMED_SET: 'timed_sets',
    ENDURANCE: 'endurance',
    REST: 'rest'
};

const WorkoutMetricEditor = ({ metrics, units, onUpdate }) => {
    // metrics looks like: { type: 'strength', data: { sets: 4, reps: 12, rest: 60 } }
    const category = metrics?.type || METRIC_METHODS.STRENGTH;
    const data = metrics?.data || {};

    const updateData = (updates) => {
        onUpdate({
            ...metrics,
            data: { ...data, ...updates }
        });
    };

    const changeMethod = (newMethod) => {
        let newData = {};
        switch (newMethod) {
            case METRIC_METHODS.STRENGTH:
                newData = { sets: 4, reps: 12, rest: 60 };
                break;
            case METRIC_METHODS.TIMED_SET:
                newData = { sets: 3, duration: 60, duration_unit: 'seconds', rest: 60 };
                break;
            case METRIC_METHODS.ENDURANCE:
                newData = { duration: 30, duration_unit: 'minutes' };
                break;
            case METRIC_METHODS.REST:
                newData = {};
                break;
        }
        onUpdate({ type: newMethod, data: newData });
    };

    const inputClasses = "h-9 bg-secondary/50 border border-border rounded-xl px-2 text-[11px] font-black outline-none focus:ring-1 focus:ring-primary/20 transition-all text-center text-foreground w-full";
    const labelClasses = "text-[8px] font-black uppercase text-muted-foreground tracking-widest mb-1 ml-1 flex items-center gap-1";

    if (category === METRIC_METHODS.REST) {
        return (
            <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground italic">Rest Day</span>
                <button 
                    onClick={() => changeMethod(METRIC_METHODS.STRENGTH)}
                    className="text-[9px] font-black text-primary uppercase tracking-widest hover:underline"
                >
                    Change to Workout
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-4 w-full">
            {/* Method Selector Tabs */}
            <div className="flex gap-1 p-1 bg-secondary/30 rounded-xl border border-border w-fit">
                {Object.entries({
                    [METRIC_METHODS.STRENGTH]: { label: 'Strength', icon: Layers },
                    [METRIC_METHODS.TIMED_SET]: { label: 'Timed Sets', icon: Timer },
                    [METRIC_METHODS.ENDURANCE]: { label: 'Endurance', icon: Activity },
                }).map(([key, info]) => (
                    <button
                        key={key}
                        onClick={() => changeMethod(key)}
                        className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-tight transition-all",
                            category === key 
                                ? "bg-background text-primary shadow-sm ring-1 ring-border" 
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <info.icon className="w-3 h-3" />
                        {info.label}
                    </button>
                ))}
            </div>

            {/* Dynamic Inputs */}
            <div className="flex flex-wrap items-end gap-3">
                
                {/* Sets */}
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

                {/* Reps */}
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

                {/* Duration & Units */}
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
                                    {units?.duration_units?.map(u => <option key={u} value={u}>{u}</option>)}
                                </select>
                                <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-primary pointer-events-none" />
                            </div>
                        </div>
                    </div>
                )}

                {/* Rest */}
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
