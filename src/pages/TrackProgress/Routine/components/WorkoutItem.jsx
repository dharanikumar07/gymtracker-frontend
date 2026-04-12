import React from 'react';
import { Trash2, ChevronDown, AlertCircle } from 'lucide-react';
import WorkoutMetricEditor from '../../../../components/WorkoutMetricEditor';
import { cn } from '../../../../lib/utils';

const WorkoutItem = ({ 
    workout, 
    index, 
    units, 
    metricsTypes, 
    onUpdate, 
    onDelete,
    isExpanded,
    onToggleExpand,
    errors
}) => {
    const handleUpdate = (updates) => {
        onUpdate(index, { ...workout, ...updates });
    };

    const handleMetricsUpdate = (newMetrics) => {
        onUpdate(index, { 
            ...workout, 
            metrics_type: newMetrics.type,
            metrics_data: newMetrics.data 
        });
    };

    const metricsText = () => {
        const { metrics_type, metrics_data } = workout;
        if (metrics_type === 'strength') {
            return `${metrics_data?.sets || 0} sets × ${metrics_data?.reps || 0} reps ${metrics_data?.weight ? `(${metrics_data.weight}${metrics_data.weight_unit || 'kg'})` : ''}`;
        }
        if (metrics_type === 'timed_sets') {
            return `${metrics_data?.sets || 0} sets × ${metrics_data?.duration || 0}${metrics_data?.duration_unit?.charAt(0) || 's'}`;
        }
        if (metrics_type === 'endurance') {
            return `${metrics_data?.duration || 0}${metrics_data?.duration_unit?.charAt(0) || 'm'} hold`;
        }
        return metrics_type?.replace('_', ' ') || 'strength';
    };

    return (
        <div className={cn(
            "border-2 rounded-2xl overflow-hidden transition-all duration-300",
            isExpanded ? "border-primary/30 bg-primary/5 shadow-lg shadow-primary/5" : "border-border bg-secondary/10",
            errors && !isExpanded && "border-red-500/50 bg-red-500/5"
        )}>
            {/* Header: Click to expand, not editable directly */}
            <div 
                className="w-full p-3 flex items-center gap-3 cursor-pointer select-none"
                onClick={onToggleExpand}
            >
                <div className={cn(
                    "w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black shrink-0 transition-colors",
                    errors ? "bg-red-500 text-white" : "bg-primary/10 text-primary"
                )}>
                    {index + 1}
                </div>
                
                <div className="flex-1 min-w-0">
                    <div className="flex flex-col">
                        <p className={cn(
                            "text-[12px] font-black uppercase tracking-tight truncate",
                            !workout.exercise_name && "text-muted-foreground/40 italic",
                            errors?.exercise_name ? "text-red-500" : "text-foreground"
                        )}>
                            {workout.exercise_name || "Exercise Name"}
                        </p>
                        <span className={cn(
                            "text-[9px] font-bold uppercase tracking-widest",
                            errors ? "text-red-400" : "text-muted-foreground"
                        )}>
                            {metricsText()}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(index); }}
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-red-500/70 hover:bg-red-500/10 transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                    <div className={cn(
                        "w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300 relative",
                        isExpanded ? "bg-primary text-white rotate-180" : "bg-secondary text-muted-foreground",
                        errors && !isExpanded && "bg-red-500 text-white"
                    )}>
                        <ChevronDown className="w-4 h-4" />
                        {errors && !isExpanded && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-background flex items-center justify-center">
                                <div className="w-1 h-1 bg-white rounded-full" />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {isExpanded && (
                <div className="px-4 pb-4 pt-2 border-t border-border/50 animate-in slide-in-from-top-2 duration-300">
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between ml-1">
                                <label className={cn(
                                    "text-[9px] font-black uppercase tracking-widest",
                                    errors?.exercise_name ? "text-red-500" : "text-muted-foreground"
                                )}>
                                    Exercise Name {errors?.exercise_name && <span className="text-red-500">*</span>}
                                </label>
                                {errors?.exercise_name && (
                                    <span className="text-[8px] font-bold text-red-500 uppercase tracking-tighter flex items-center gap-0.5">
                                        <AlertCircle className="w-2.5 h-2.5" /> Required
                                    </span>
                                )}
                            </div>
                            <input 
                                className={cn(
                                    "w-full h-10 px-4 bg-background border rounded-xl outline-none text-xs font-semibold transition-all",
                                    errors?.exercise_name ? "border-red-500/50 bg-red-500/5 focus:border-red-500" : "border-border focus:border-primary/50"
                                )}
                                value={workout.exercise_name || ''}
                                placeholder="e.g. Bench Press"
                                onChange={(e) => handleUpdate({ exercise_name: e.target.value })}
                                autoFocus
                            />
                        </div>

                        <div className={cn(
                            "p-3 rounded-2xl border transition-all",
                            errors ? "bg-red-500/5 border-red-500/20" : "bg-background/50 border-border/50"
                        )}>
                            <WorkoutMetricEditor 
                                metrics={{ 
                                    type: workout.metrics_type, 
                                    data: workout.metrics_data,
                                    available_metrics: metricsTypes 
                                }}
                                units={units}
                                onUpdate={handleMetricsUpdate}
                                errors={errors}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WorkoutItem;
