import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';

const Calendar = ({ selectedDate, onSelect, className }) => {
    const current = selectedDate ? new Date(selectedDate) : new Date();
    const [viewDate, setViewDate] = useState(new Date(current.getFullYear(), current.getMonth(), 1));

    const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const monthName = viewDate.toLocaleString('default', { month: 'long' });

    const totalDays = daysInMonth(year, month);
    const startDay = firstDayOfMonth(year, month);

    // Get previous month days for padding
    const prevMonthLastDay = daysInMonth(year, month - 1);
    const prevMonthDays = [];
    for (let i = startDay - 1; i >= 0; i--) {
        prevMonthDays.push({
            day: prevMonthLastDay - i,
            currentMonth: false,
            dateStr: new Date(year, month - 1, prevMonthLastDay - i).toISOString().split('T')[0]
        });
    }

    // Current month days
    const currentMonthDays = [];
    for (let d = 1; d <= totalDays; d++) {
        currentMonthDays.push({
            day: d,
            currentMonth: true,
            dateStr: `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
        });
    }

    // Next month padding
    const totalSlots = 42; // 6 rows
    const nextMonthDays = [];
    const remaining = totalSlots - (prevMonthDays.length + currentMonthDays.length);
    for (let d = 1; d <= remaining; d++) {
        nextMonthDays.push({
            day: d,
            currentMonth: false,
            dateStr: new Date(year, month + 1, d).toISOString().split('T')[0]
        });
    }

    const allDays = [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];

    return (
        <div className={cn("p-3 bg-card border border-border rounded-xl shadow-md w-[280px]", className)}>
            <div className="flex items-center justify-between mb-4 px-1">
                <button 
                    onClick={() => setViewDate(new Date(year, month - 1, 1))}
                    className="h-7 w-7 flex items-center justify-center rounded-md border border-border hover:bg-secondary transition-colors"
                >
                    <ChevronLeft className="h-4 w-4" />
                </button>
                <div className="text-sm font-semibold">
                    {monthName} {year}
                </div>
                <button 
                    onClick={() => setViewDate(new Date(year, month + 1, 1))}
                    className="h-7 w-7 flex items-center justify-center rounded-md border border-border hover:bg-secondary transition-colors"
                >
                    <ChevronRight className="h-4 w-4" />
                </button>
            </div>

            <div className="grid grid-cols-7 gap-0 mb-2">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                    <div key={d} className="h-8 flex items-center justify-center text-[10px] font-medium text-muted-foreground">
                        {d}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-0">
                {allDays.map((d, i) => {
                    const isSelected = selectedDate === d.dateStr;
                    const isToday = new Date().toISOString().split('T')[0] === d.dateStr;
                    
                    return (
                        <button
                            key={i}
                            onClick={() => onSelect(d.dateStr)}
                            className={cn(
                                "h-9 w-9 text-xs flex items-center justify-center rounded-md transition-all relative",
                                !d.currentMonth && "text-muted-foreground/30",
                                d.currentMonth && !isSelected && "hover:bg-secondary text-foreground",
                                isSelected && "bg-primary text-primary-foreground font-semibold shadow-sm",
                                isToday && !isSelected && "bg-secondary text-foreground font-bold"
                            )}
                        >
                            {d.day}
                            {isToday && !isSelected && (
                                <div className="absolute bottom-1 w-1 h-1 rounded-full bg-primary" />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default Calendar;
