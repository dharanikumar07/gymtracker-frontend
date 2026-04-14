import React from 'react';
import { cn } from '../../../../lib/utils';
import { useWorkoutLog } from '../context/WorkoutLogContext';
import { format, isSameDay, isToday } from 'date-fns';

const DaySelector = () => {
    const {
        selectedDate,
        setSelectedDate,
        weekDates,
    } = useWorkoutLog();

    const handleDayClick = (date) => {
        setSelectedDate(date);
    };

    return (
        <div className="bg-card border border-border rounded-xl p-1 shadow-sm">
            <div className="grid grid-cols-7 gap-1">
                {weekDates.map((date, idx) => {
                    const isActive = isSameDay(date, selectedDate);
                    const today = isToday(date);

                    return (
                        <button
                            key={idx}
                            onClick={() => handleDayClick(date)}
                            className={cn(
                                "py-2.5 rounded-lg transition-all flex flex-col items-center justify-center gap-0.5 relative",
                                isActive
                                    ? "bg-primary text-white shadow-md shadow-primary/20 scale-[1.02] z-10"
                                    : "text-muted-foreground hover:bg-secondary/40"
                            )}
                        >
                            <span className="text-[10px] font-black uppercase tracking-[0.1em]">
                                {format(date, 'eee')}
                            </span>
                            <span className={cn(
                                "text-[12px] font-black leading-none",
                                isActive ? "text-white" : "text-foreground"
                            )}>
                                {format(date, 'd')}
                            </span>
                            {/* Today dot indicator */}
                            {today && !isActive && (
                                <div className="absolute bottom-1 w-1 h-1 rounded-full bg-primary" />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default DaySelector;
