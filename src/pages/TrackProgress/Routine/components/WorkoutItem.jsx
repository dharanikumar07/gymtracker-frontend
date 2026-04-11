import React, { useState } from 'react';
import { Trash2, GripVertical, ChevronDown, ChevronUp } from 'lucide-react';
import WorkoutMetricEditor from '../../../../components/WorkoutMetricEditor';
import { cn } from '../../../../lib/utils';

const WorkoutItem = ({ 
    workout, 
    index, 
    units, 
    metricsTypes, 
    onUpdate, 
    onDelete,
    isFirst,
    isLast
}) => {
    const [isExpanded, setIsExpanded] = useState(false);

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

    return (
        <div className="bg-secondary/20 rounded-xl overflow-hidden border border-border/30 group">
            <div className="flex items-center gap-2 p-2.5">
                <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-[9px] font-black text-primary">{index + 1}</span>
                </div>
                
                <div className="flex-1 min-w-0">
                    <input
                        type="text"
                        value={workout.exercise_name || ''}
                        onChange={(e) => handleUpdate({ exercise_name: e.target.value })}
                        placeholder="Exercise Name"
                        className="w-full bg-transparent text-[11px] font-bold text-foreground outline-none placeholder:text-muted-foreground/50 border-none p-0 focus:ring-0"
                    />
                    <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[8px] font-black uppercase text-muted-foreground/70 tracking-tighter">
                            {workout.metrics_type?.replace('_', ' ')}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-secondary transition-colors"
                    >
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                    <button
                        onClick={() => onDelete(index)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-red-500/70 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {isExpanded && (
                <div className="p-3 bg-secondary/10 border-t border-border/20">
                    <WorkoutMetricEditor 
                        metrics={{ 
                            type: workout.metrics_type, 
                            data: workout.metrics_data,
                            available_metrics: metricsTypes 
                        }}
                        units={units}
                        onUpdate={handleMetricsUpdate}
                    />
                </div>
            )}
        </div>
    );
};

export default WorkoutItem;
