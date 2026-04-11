import React from 'react';
import { ChevronDown, ChevronUp, Plus, Dumbbell } from 'lucide-react';
import { cn } from '../../../../lib/utils';
import WorkoutItem from './WorkoutItem';

const DayCard = ({ 
    day, 
    workouts, 
    isExpanded, 
    onToggle, 
    onAddWorkout, 
    onUpdateWorkout, 
    onDeleteWorkout,
    units,
    metricsTypes
}) => {
    const hasWorkouts = workouts.length > 0;

    return (
        <div className={cn(
            "rounded-2xl overflow-hidden border border-border/50 transition-all duration-300",
            isExpanded ? "ring-1 ring-primary/20 shadow-lg bg-card" : "bg-secondary/10"
        )}>
            <button
                onClick={() => onToggle()}
                className={cn(
                    "w-full flex items-center justify-between p-4 transition-all",
                    isExpanded ? "bg-primary/5 border-b border-border/30" : "hover:bg-secondary/40"
                )}
            >
                <div className="flex items-center gap-4">
                    <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center font-black text-[11px] uppercase tracking-wider transition-all",
                        isExpanded ? "bg-primary text-white shadow-md shadow-primary/20 scale-110" : "bg-secondary text-muted-foreground"
                    )}>
                        {day.substring(0, 3)}
                    </div>
                    <div className="text-left">
                        <h4 className="text-[12px] font-black uppercase text-foreground">{day}</h4>
                        {hasWorkouts ? (
                            <span className="text-[9px] font-bold uppercase tracking-widest text-primary/70">
                                {workouts.length} {workouts.length === 1 ? 'exercise' : 'exercises'}
                            </span>
                        ) : (
                            <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50">
                                Rest Day
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {isExpanded ? (
                        <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center border border-border">
                            <ChevronUp className="w-4 h-4 text-primary" />
                        </div>
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-secondary/50 flex items-center justify-center">
                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        </div>
                    )}
                </div>
            </button>
            
            {isExpanded && (
                <div className="p-4 space-y-3 bg-card/50">
                    {hasWorkouts ? (
                        <div className="space-y-2">
                            {workouts.map((workout, idx) => (
                                <WorkoutItem
                                    key={workout.uuid || `new-${idx}`}
                                    workout={workout}
                                    index={idx}
                                    units={units}
                                    metricsTypes={metricsTypes}
                                    onUpdate={onUpdateWorkout}
                                    onDelete={onDeleteWorkout}
                                    isFirst={idx === 0}
                                    isLast={idx === workouts.length - 1}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-center bg-secondary/10 rounded-2xl border-2 border-dashed border-border/50">
                            <Dumbbell className="w-8 h-8 text-muted-foreground/30 mb-2" />
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">No exercises planned</p>
                        </div>
                    )}
                    
                    <button
                        onClick={onAddWorkout}
                        className="w-full h-10 rounded-xl border-2 border-dashed border-primary/20 hover:border-primary/50 hover:bg-primary/5 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary/70 transition-all active:scale-[0.98]"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Add Exercise</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default DayCard;
