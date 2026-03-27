import React, { useState } from 'react';
import { Activity, Loader2, ChevronDown, ChevronUp, Dumbbell } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { useRoutineQuery } from '../http/queries';

const dayOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const Routine = () => {
    const { data, isLoading } = useRoutineQuery();
    const [expandedDay, setExpandedDay] = useState(null);
    
    const routine = data?.data?.routine;

    if (isLoading && !routine) {
        return (
            <div className="flex flex-col items-center justify-center h-60">
                <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Loading...</p>
            </div>
        );
    }

    if (!routine) {
        return (
            <div className="bg-card border border-border rounded-3xl p-5">
                <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Dumbbell className="w-10 h-10 text-muted-foreground/30 mb-3" />
                    <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">No routine found</p>
                    <p className="text-[9px] text-muted-foreground/60 mt-1">Complete onboarding to set up your workout plan</p>
                </div>
            </div>
        );
    }

    const hasAnyWorkouts = dayOrder.some(day => routine[day]?.workouts?.length > 0);
    
    if (!hasAnyWorkouts) {
        return (
            <div className="bg-card border border-border rounded-3xl p-5">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Activity className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-[12px] font-black uppercase italic text-foreground">Weekly Routine</h3>
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Your workout plan</p>
                    </div>
                </div>
                <div className="flex flex-col items-center justify-center py-6 text-center">
                    <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Rest days only</p>
                    <p className="text-[9px] text-muted-foreground/60 mt-1">No exercises scheduled</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="bg-card border border-border rounded-3xl p-5">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Activity className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-[12px] font-black uppercase italic text-foreground">Weekly Routine</h3>
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{data?.data?.plan?.name || 'Your workout plan'}</p>
                    </div>
                </div>
                
                <div className="space-y-2">
                    {dayOrder.map((day) => {
                        const dayData = routine[day];
                        const workouts = dayData?.workouts || [];
                        const isExpanded = expandedDay === day;
                        const hasWorkouts = workouts.length > 0;
                        
                        return (
                            <div key={day} className="rounded-2xl overflow-hidden">
                                <button
                                    onClick={() => setExpandedDay(isExpanded ? null : day)}
                                    className={cn(
                                        "w-full flex items-center justify-between p-3 transition-all",
                                        hasWorkouts ? "bg-secondary/50 hover:bg-secondary/70" : "bg-secondary/20"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-[11px] font-black uppercase text-foreground w-10">{day}</span>
                                        {hasWorkouts && (
                                            <span className={cn(
                                                "text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full",
                                                workouts.length > 0 ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"
                                            )}>
                                                {workouts.length} exercise{workouts.length !== 1 ? 's' : ''}
                                            </span>
                                        )}
                                    </div>
                                    {hasWorkouts && (
                                        isExpanded 
                                            ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
                                            : <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                    )}
                                </button>
                                
                                {isExpanded && hasWorkouts && (
                                    <div className="bg-background/50 p-3 space-y-2 border-t border-border/30">
                                        {workouts.map((workout, idx) => (
                                            <div key={idx} className="flex items-center gap-3 p-2 rounded-xl bg-secondary/30">
                                                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                                                    <span className="text-[9px] font-black text-primary">{idx + 1}</span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[10px] font-bold text-foreground truncate">{workout.name}</p>
                                                    <p className="text-[8px] text-muted-foreground uppercase">{workout.metrics?.type || 'standard'}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Routine;
