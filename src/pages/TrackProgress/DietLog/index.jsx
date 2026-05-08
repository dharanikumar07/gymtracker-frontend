import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
    Calendar as CalendarIcon, 
    Utensils, 
    Loader2,
    CheckCircle2,
    AlertCircle,
    Flame,
    Zap,
    Target,
    PieChart,
    Plus
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { Button } from "../../../components/ui/button";
import { DietLogProvider, useDietLog } from './context/DietLogContext';
import DaySelector from './components/DaySelector';
import DietLogSlot from './components/DietLogSlot';
import { Calendar } from '../../../components/ui/calendar';
import { format } from 'date-fns';

const DietLogContent = () => {
    const { 
        activePlan, 
        logs, 
        pending,
        totalTargets,
        summary,
        selectedDate,
        setSelectedDate,
        selectedDay, 
        isLoading,
        handleAddMeal
    } = useDietLog();

    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const calendarRef = useRef(null);

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
                <h3 className="text-[14px] font-black uppercase text-foreground/40">No Active Diet Plan</h3>
                <p className="text-[11px] text-foreground/20 mt-2 max-w-[200px]">Activate a diet plan in the Routine tab to start logging.</p>
            </div>
        );
    }

    const hasNoActivities = logs.length === 0 && pending.length === 0;

    return (
        <div className="space-y-6 pb-24 w-full mx-auto px-4 sm:px-6 lg:px-8">
            {/* Ultra-Compact Plan Header */}
            <div className="bg-card border border-border rounded-3xl p-3 sm:p-4 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-600/20">
                            <Utensils className="w-5 h-5 text-white" />
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-[14px] font-black uppercase tracking-tight text-foreground truncate leading-none mb-1">
                                {activePlan?.name}
                            </h2>
                            <span className="text-[8px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-600/10 px-1.5 py-0.5 rounded">
                                Diet Tracking
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

            {/* Nutrition Progress Overview */}
            {totalTargets && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <CompactStat label="Calories" current={0} target={totalTargets.calories} icon={Flame} color="text-orange-500" bg="bg-orange-500/10" unit="kcal" />
                    <CompactStat label="Protein" current={0} target={totalTargets.protein} icon={Zap} color="text-blue-500" bg="bg-blue-500/10" unit="g" />
                    <CompactStat label="Carbs" current={0} target={totalTargets.carbs} icon={Target} color="text-amber-500" bg="bg-amber-500/10" unit="g" />
                    <CompactStat label="Fats" current={0} target={totalTargets.fats} icon={PieChart} color="text-rose-500" bg="bg-rose-500/10" unit="g" />
                </div>
            )}

            <div className="space-y-8 mt-6">
                {/* 1. Pending Meals Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <SectionLabel label={`Pending ${selectedDay}'s Meals`} count={pending.length} color="bg-emerald-600/50" />
                        <Button 
                            onClick={handleAddMeal}
                            size="compact"
                            className="h-8 gap-1.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/10"
                        >
                            <Plus className="w-3.5 h-3.5" /> 
                            <span className="text-[10px] font-black uppercase tracking-widest">Add Meal</span>
                        </Button>
                    </div>
                    {pending.length > 0 ? (
                        <div className="flex flex-col gap-4">
                            {pending.map((meal) => (
                                <DietLogSlot key={`pend-${meal.uuid}-${selectedDate}`} meal={meal} isPending />
                            ))}
                        </div>
                    ) : (
                        <div className="bg-secondary/5 border-2 border-dashed border-border rounded-[2.5rem] p-8 flex flex-col items-center text-center">
                            <Utensils className="w-8 h-8 text-foreground/5 mb-3" />
                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-foreground/20">No pending meals for today</p>
                        </div>
                    )}
                </div>

                {/* 2. Logged Meals */}
                {logs.length > 0 && (
                    <div className="space-y-4">
                        <SectionLabel label="Logged Meals" count={logs.length} color="bg-emerald-600" />
                        <div className="flex flex-col gap-4">
                            {logs.map((meal) => (
                                <DietLogSlot key={`done-${meal.uuid}-${selectedDate}`} meal={meal} isCompleted />
                            ))}
                        </div>
                    </div>
                )}

                {hasNoActivities && (
                    <div className="py-20 flex flex-col items-center text-center">
                        <CheckCircle2 className="w-10 h-10 text-foreground/5 mb-4" />
                        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-foreground/30">No Meals Scheduled</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const CompactStat = ({ label, current, target, icon: Icon, color, bg, unit }) => {
    const percentage = Math.min(Math.round((current / target) * 100), 100) || 0;
    
    return (
        <div className="bg-card border border-border/50 rounded-2xl p-3 shadow-sm flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
                <div className={cn("w-6 h-6 rounded-lg flex items-center justify-center shrink-0", bg)}>
                    <Icon className={cn("w-3.5 h-3.5", color)} />
                </div>
                <span className="text-[14px] font-black text-foreground leading-none">
                    {percentage}%
                </span>
            </div>
            <div>
                <p className="text-[8px] font-black uppercase tracking-widest text-foreground/60 dark:text-foreground/80 mb-0.5">{label}</p>
                <div className="flex items-baseline gap-1">
                    <span className="text-[11px] font-black text-foreground leading-none">{current}</span>
                    <span className="text-[8px] font-bold text-foreground/40 dark:text-foreground/30">/ {target}{unit}</span>
                </div>
            </div>
            <div className="h-1 w-full bg-secondary/30 rounded-full overflow-hidden">
                <div 
                    className={cn("h-full transition-all duration-500", color.replace('text', 'bg'))}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
};

const SectionLabel = ({ label, count, color = "bg-emerald-600", active }) => (
    <div className="flex items-center gap-3 px-2">
        <div className={cn("w-2 h-2 rounded-full", color, active && "animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]")} />
        <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-foreground/60 dark:text-foreground/80">
            {label}
        </h3>
        <span className="text-[9px] font-black text-foreground/40 dark:text-foreground/30 ml-auto">
            {count} Total
        </span>
    </div>
);

const DietLog = () => {
    return (
        <DietLogProvider>
            <DietLogContent />
        </DietLogProvider>
    );
};

export default DietLog;
