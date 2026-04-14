import React, { useState, useRef, useEffect } from 'react';
import { 
    Dumbbell, 
    Calendar as CalendarIcon, 
    Info, 
    Activity, 
    Plus, 
    Loader2,
    AlertCircle,
    CheckCircle2,
    Zap,
    Target
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { WorkoutLogProvider, useWorkoutLog } from './context/WorkoutLogContext';
import DaySelector from './components/DaySelector';
import WorkoutSlot from './components/WorkoutSlot';
import AddWorkoutCard from './components/AddWorkoutCard';
import { Calendar } from '../../../components/ui/calendar';

import { format } from 'date-fns';

const WorkoutLogContent = () => {
    const { 
        activePlan, 
        logs, 
        pending,
        summary,
        selectedDate,
        setSelectedDate,
        selectedDay, 
        weekDates,
        isLoading 
    } = useWorkoutLog();

    const [isAddingWorkout, setIsAddingWorkout] = useState(false);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const calendarRef = useRef(null);

    // Close calendar on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (calendarRef.current && !calendarRef.current.contains(event.target)) {
                setIsCalendarOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (isLoading && !activePlan) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[300px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary/40" />
            </div>
        );
    }

    if (!activePlan && !isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[300px] p-6 text-center bg-secondary/10 rounded-2xl border border-dashed border-border">
                <AlertCircle className="w-6 h-6 text-muted-foreground/30 mb-2" />
                <h3 className="text-[12px] font-black uppercase text-foreground">No Active Plan</h3>
                <p className="text-[10px] text-muted-foreground mt-1 max-w-[180px]">Activate a plan in Routine tab.</p>
            </div>
        );
    }

    return (
        <div className="space-y-5 pb-20 w-full mx-auto px-4 sm:px-6">
            {/* Redesigned Plan Card */}
            <div className="bg-card border border-border p-4 sm:p-5 rounded-2xl shadow-sm space-y-5">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-primary flex items-center justify-center shrink-0 shadow-md shadow-primary/20">
                            <Activity className="w-4.5 h-4.5 sm:w-5.5 sm:h-5.5 text-white" />
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-0.5 sm:mb-1 whitespace-nowrap overflow-hidden">
                                <span className="text-[7px] sm:text-[8px] font-black uppercase text-primary tracking-widest bg-primary/10 px-1.5 sm:px-2 py-0.5 rounded-md shrink-0">
                                    Active Plan
                                </span>
                                <span className="text-[8px] sm:text-[9px] font-bold text-muted-foreground uppercase tracking-widest truncate">
                                    {activePlan?.meta_data?.physical_activity_type?.replace('_', ' ')}
                                </span>
                            </div>
                            <h2 className="text-[14px] sm:text-[18px] font-black uppercase tracking-tight text-foreground truncate leading-tight">
                                {activePlan?.name}
                            </h2>
                        </div>
                    </div>

                    {/* Selected Date Indicator & Popover Calendar */}
                    <div className="relative shrink-0" ref={calendarRef}>
                        <button 
                            onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                            className={cn(
                                "flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl border transition-all outline-none",
                                isCalendarOpen 
                                    ? "bg-primary text-white border-primary shadow-md shadow-primary/20" 
                                    : "bg-secondary/40 border-border/50 text-foreground hover:bg-secondary/60"
                            )}
                        >
                            <CalendarIcon className={cn("w-3.5 h-3.5 sm:w-4 sm:h-4", isCalendarOpen ? "text-white" : "text-primary")} />
                            <span className="text-[10px] sm:text-[12px] font-black uppercase whitespace-nowrap">
                                {format(selectedDate, 'dd MMM')}
                            </span>
                        </button>

                        {isCalendarOpen && (
                            <div className="absolute right-0 top-full mt-2 z-[100] bg-card border border-border rounded-2xl shadow-xl shadow-black/10 animate-in fade-in zoom-in-95 duration-200 min-w-[280px] sm:min-w-[300px]">
                                <Calendar 
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={(date) => {
                                        if (date) {
                                            setSelectedDate(date);
                                            setIsCalendarOpen(false);
                                        }
                                    }}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Plan Metadata Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 sm:pt-5 border-t border-border/40">
                    <div className="space-y-1.5 px-1">
                        <span className="text-[7px] sm:text-[8px] font-black uppercase text-muted-foreground tracking-[0.2em] block">
                            Plan Duration
                        </span>
                        <div className="flex items-center gap-2 sm:gap-3 text-[11px] sm:text-[13px] font-black text-foreground">
                            <span className="font-bold">
                                {activePlan?.start_date ? format(new Date(activePlan.start_date), 'dd MMM yyyy') : 'Not set'}
                            </span>
                            <span className="text-muted-foreground/30">—</span>
                            <span className="font-bold">
                                {activePlan?.end_date ? format(new Date(activePlan.end_date), 'dd MMM yyyy') : 'Not set'}
                            </span>
                        </div>
                    </div>

                    {/* Ultra-Compact Green Information Card */}
                    <div className="bg-emerald-500/5 rounded-xl py-1.5 px-3 border border-emerald-500/10 flex items-center gap-2.5 group hover:bg-emerald-500/10 transition-colors self-center md:justify-self-end h-fit w-fit max-w-full">
                        <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                            <Info className="w-3.5 h-3.5 text-emerald-500" />
                        </div>
                        <p className="text-[9px] sm:text-[10px] font-bold text-foreground/60 whitespace-nowrap overflow-hidden text-ellipsis">
                            Pick a date to view your logs for that week.
                        </p>
                    </div>
                </div>
            </div>

            {/* Restored Day Selector without header */}
            <DaySelector />

            {/* Exercises List Header */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                        <div className="w-1 h-3.5 bg-primary rounded-full" />
                        <h3 className="text-[11px] font-black uppercase tracking-[0.15em] text-foreground">
                            {selectedDay}'s Routine
                        </h3>
                    </div>
                    <button 
                        onClick={() => setIsAddingWorkout(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white text-[9px] font-black uppercase tracking-widest rounded-lg transition-all shadow-md shadow-primary/20 hover:shadow-primary/30"
                    >
                        <Plus className="w-3 h-3" />
                        <span>Add Exercise</span>
                    </button>
                </div>

                {isAddingWorkout && (
                    <div className="animate-in slide-in-from-top-2 duration-300">
                        <AddWorkoutCard onClose={() => setIsAddingWorkout(false)} />
                    </div>
                )}

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center min-h-[200px] bg-secondary/5 rounded-2xl border border-dashed border-border">
                        <Loader2 className="w-6 h-6 animate-spin text-primary/40 mb-2" />
                        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">Loading Logs...</p>
                    </div>
                ) : (logs.length === 0 && pending.length === 0) ? (
                    <div className="bg-secondary/5 border border-border rounded-2xl p-10 flex flex-col items-center text-center">
                        <CheckCircle2 className="w-6 h-6 text-muted-foreground/20 mb-2" />
                        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">No activities scheduled</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {/* Render completed logs */}
                        {logs.map((log) => (
                            <WorkoutSlot 
                                key={`log-${log.uuid}-${selectedDate}`} 
                                slot={log} 
                                isCompleted 
                            />
                        ))}
                        
                        {/* Render pending templates */}
                        {pending.map((item) => (
                            <WorkoutSlot 
                                key={`pending-${item.slot_uuid}-${selectedDate}`} 
                                slot={item} 
                                isPending 
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const WorkoutLog = () => {
    return (
        <WorkoutLogProvider>
            <WorkoutLogContent />
        </WorkoutLogProvider>
    );
};

export default WorkoutLog;
