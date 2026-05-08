import React from 'react';
import { cn } from '../../../../lib/utils';
import { useDietLog } from '../context/DietLogContext';
import { format, isSameDay, isToday } from 'date-fns';

const DaySelector = () => {
    const { selectedDate, setSelectedDate, weekDates } = useDietLog();

    return (
        <div className="bg-card border border-border/50 rounded-2xl p-1.5 shadow-sm">
            <div className="grid grid-cols-7 gap-1">
                {weekDates.map((date, idx) => {
                    const isActive = isSameDay(date, selectedDate);
                    const today = isToday(date);

                    return (
                        <button
                            key={idx}
                            onClick={() => setSelectedDate(date)}
                            className={cn(
                                "flex flex-col items-center justify-center gap-0.5 py-2 rounded-xl transition-all relative",
                                isActive
                                    ? "bg-primary text-white shadow-md shadow-primary/20 scale-[1.02]"
                                    : today
                                        ? "bg-primary/5 text-foreground hover:bg-primary/10"
                                        : "text-muted-foreground hover:bg-secondary/40"
                            )}
                        >
                            <span className={cn(
                                "text-[8px] font-black uppercase tracking-widest",
                                isActive ? "text-white/70" : "text-muted-foreground/50"
                            )}>
                                {format(date, 'eee')}
                            </span>
                            <span className={cn(
                                "text-[13px] font-black leading-none",
                                isActive ? "text-white" : "text-foreground"
                            )}>
                                {format(date, 'd')}
                            </span>
                            {today && !isActive ? (
                                <div className="absolute bottom-1 w-1 h-1 rounded-full bg-primary" />
                            ) : null}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default DaySelector;
