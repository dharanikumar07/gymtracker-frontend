import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
    Plus, 
    Calendar as CalendarIcon, 
    Activity, 
    Loader2,
    CheckCircle2,
    AlertCircle
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
        selectedDate,
        setSelectedDate,
        selectedDay, 
        isLoading 
    } = useWorkoutLog();

    const [isAddingWorkout, setIsAddingWorkout] = useState(false);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const calendarRef = useRef(null);

    const inProgressLogs = useMemo(() => logs.filter(l => l.status === 'in_progress'), [logs]);
    const completedLogs = useMemo(() => logs.filter(l => l.status === 'completed'), [logs]);
    const skippedLogs = useMemo(() => logs.filter(l => l.status === 'skipped'), [logs]);

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
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!activePlan && !isLoading) {
        return (
            <div className="w-full flex flex-col items-center justify-center min-h-[300px] p-8 text-center bg-secondary/5 border-2 border-dashed border-border rounded-3xl">
                <AlertCircle className="w-10 h-10 text-foreground/10 mb-4" />
                <h3 className="text-[14px] font-black uppercase text-foreground/40">No Active Workout Plan</h3>
                <p className="text-[11px] text-foreground/20 mt-2 max-w-[200px]">Activate a plan in the Routine tab to start logging.</p>
            </div>
        );
    }

    const hasNoActivities = inProgressLogs.length === 0 && pending.length === 0 && completedLogs.length === 0 && skippedLogs.length === 0 && !isAddingWorkout;

    return (
        <div className="space-y-6 pb-24 w-full mx-auto px-4 sm:px-6 lg:px-8">
            {/* Ultra-Compact Plan Header */}
            <div className="bg-card border border-border rounded-3xl p-3 sm:p-4 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-600/20">
                            <Activity className="w-5 h-5 text-white" />
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-[14px] font-black uppercase tracking-tight text-foreground truncate leading-none mb-1">
                                {activePlan?.name}
                            </h2>
                            <span className="text-[8px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-600/10 px-1.5 py-0.5 rounded">
                                {activePlan?.meta_data?.physical_activity_type?.replace('_', ' ')}
                            </span>
                        </div>
                    </div>

                    <div className="relative shrink-0" ref={calendarRef}>
                        <button 
                            onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                            className={cn(
                                "flex items-center gap-2 px-3 py-2 rounded-xl border transition-all",
                                isCalendarOpen 
                                    ? "bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-600/20" 
                                    : "bg-secondary/40 border-transparent text-foreground hover:bg-secondary/60"
                            )}
                        >
                            <CalendarIcon className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                                {format(selectedDate, 'dd MMM')}
                            </span>
                        </button>

                        {isCalendarOpen && (
                            <div className="absolute right-0 top-full mt-2 z-[100] bg-card border-2 border-border rounded-3xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 min-w-[280px]">
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
            </div>

            <DaySelector />

            {/* Compact Manual Add Action - Right Corner - Solid Green */}
            <div className="pt-2 flex justify-end">
                {!isAddingWorkout ? (
                    <button 
                        onClick={() => setIsAddingWorkout(true)}
                        className="flex items-center justify-center gap-2 h-9 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-lg shadow-emerald-600/10 active:scale-95 group"
                    >
                        <Plus className="w-3.5 h-3.5 text-white group-hover:scale-110 transition-transform" />
                        <span className="text-[9px] font-black uppercase tracking-widest">Add Manual Exercise</span>
                    </button>
                ) : (
                    <div className="w-full animate-in slide-in-from-top-2 duration-300">
                        <AddWorkoutCard onClose={() => setIsAddingWorkout(false)} />
                    </div>
                )}
            </div>


            <div className="space-y-8 mt-6">
                {/* 1. In Progress Section */}
                {inProgressLogs.length > 0 && (
                    <div className="space-y-4">
                        <SectionLabel label="In Progress" count={inProgressLogs.length} active />
                        <div className="flex flex-col gap-4">
                            {inProgressLogs.map((log) => (
                                <WorkoutSlot key={`ip-${log.uuid || log.slot_uuid}-${selectedDate}`} slot={log} isInProgress />
                            ))}
                        </div>
                    </div>
                )}

                {/* 2. Pending Routine Section */}
                {pending.length > 0 && (
                    <div className="space-y-4">
                        <SectionLabel label={`Pending ${selectedDay}'s Routine`} count={pending.length} />
                        <div className="flex flex-col gap-4">
                            {pending.map((item) => (
                                <WorkoutSlot key={`pend-${item.slot_uuid}-${selectedDate}`} slot={item} isPending />
                            ))}
                        </div>
                    </div>
                )}

                {/* 3. Completed Activities */}
                {completedLogs.length > 0 && (
                    <div className="space-y-4">
                        <SectionLabel label="Completed Activities" count={completedLogs.length} color="bg-emerald-600" />
                        <div className="flex flex-col gap-4">
                            {completedLogs.map((log) => (
                                <WorkoutSlot key={`done-${log.uuid || log.slot_uuid}-${selectedDate}`} slot={log} isCompleted />
                            ))}
                        </div>
                    </div>
                )}

                {/* 4. Skipped Activities */}
                {skippedLogs.length > 0 && (
                    <div className="space-y-4">
                        <SectionLabel label="Skipped / Missed" count={skippedLogs.length} color="bg-orange-500" />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {skippedLogs.map((log) => (
                                <WorkoutSlot key={`skip-${log.uuid || log.slot_uuid}-${selectedDate}`} slot={log} />
                            ))}
                        </div>
                    </div>
                )}

                {hasNoActivities && (
                    <div className="py-20 flex flex-col items-center text-center">
                        <CheckCircle2 className="w-10 h-10 text-foreground/5 mb-4" />
                        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-foreground/30">No Activities Scheduled</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const SectionLabel = ({ label, count, color = "bg-emerald-600", active }) => (
    <div className="flex items-center gap-3 px-2">
        <div className={cn("w-2 h-2 rounded-full", color, active && "animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]")} />
        <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-foreground/50">
            {label}
        </h3>
        <span className="text-[9px] font-black text-foreground/30 ml-auto">
            {count} Total
        </span>
    </div>
);

const WorkoutLog = () => {
    return (
        <WorkoutLogProvider>
            <WorkoutLogContent />
        </WorkoutLogProvider>
    );
};

export default WorkoutLog;
