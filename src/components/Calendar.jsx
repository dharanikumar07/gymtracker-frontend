import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays, X } from 'lucide-react';
import { cn } from '../lib/utils';

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const YEARS = Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - 20 + i);

const Calendar = ({ selectedDate, onSelect, className, triggerClassName, triggerContent }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [viewDate, setViewDate] = useState(new Date());
    const [isSelectingMonth, setIsSelectingMonth] = useState(false);
    const [isSelectingYear, setIsSelectingYear] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
                setIsSelectingMonth(false);
                setIsSelectingYear(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const current = selectedDate ? new Date(selectedDate) : new Date();
    const selectedMonth = current.getMonth();
    const selectedYear = current.getFullYear();

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    const daysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
    const firstDayOfMonth = (y, m) => new Date(y, m, 1).getDay();

    const totalDays = daysInMonth(year, month);
    const startDay = firstDayOfMonth(year, month);

    const prevMonthLastDay = daysInMonth(year, month - 1);
    const prevMonthDays = [];
    for (let i = startDay - 1; i >= 0; i--) {
        prevMonthDays.push({
            day: prevMonthLastDay - i,
            currentMonth: false,
            dateStr: new Date(year, month - 1, prevMonthLastDay - i).toISOString().split('T')[0]
        });
    }

    const currentMonthDays = [];
    for (let d = 1; d <= totalDays; d++) {
        currentMonthDays.push({
            day: d,
            currentMonth: true,
            dateStr: `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
        });
    }

    const totalSlots = 42;
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

    const handleSelect = (date) => {
        onSelect(date);
        setIsOpen(false);
        setIsSelectingMonth(false);
        setIsSelectingYear(false);
    };

    const handleClear = (e) => {
        e.stopPropagation();
        onSelect('');
        setIsOpen(false);
    };

    const handlePrevMonth = () => {
        setViewDate(new Date(year, month - 1, 1));
    };

    const handleNextMonth = () => {
        setViewDate(new Date(year, month + 1, 1));
    };

    const handleMonthSelect = (m) => {
        setViewDate(new Date(year, m, 1));
        setIsSelectingMonth(false);
    };

    const handleYearSelect = (y) => {
        setViewDate(new Date(y, month, 1));
        setIsSelectingYear(false);
    };

    return (
        <div ref={containerRef} className={cn("relative", className)}>
            {triggerClassName && triggerContent !== undefined ? (
                <div
                    onClick={() => setIsOpen(!isOpen)}
                    className={triggerClassName}
                >
                    <span className={selectedDate ? "text-foreground" : "text-muted-foreground"}>
                        {selectedDate || triggerContent}
                    </span>
                    <div className="flex items-center gap-2">
                        {selectedDate && (
                            <span
                                onClick={handleClear}
                                className="p-1 hover:bg-secondary rounded-md transition-colors cursor-pointer"
                            >
                                <X className="w-3.5 h-3.5 text-muted-foreground" />
                            </span>
                        )}
                        <CalendarDays className="w-4 h-4 text-muted-foreground" />
                    </div>
                </div>
            ) : null}

            {isOpen && (
                <div className={cn("p-4 bg-card border border-border rounded-xl shadow-lg w-[300px] absolute top-full left-0 mt-2 z-50", !triggerClassName && className)}>
                    <div className="flex items-center justify-between mb-4">
                        <button 
                            onClick={handlePrevMonth}
                            className="h-8 w-8 flex items-center justify-center rounded-md border border-border hover:bg-secondary transition-colors"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>

                        <div className="flex items-center gap-1">
                            <button 
                                onClick={() => setIsSelectingMonth(!isSelectingMonth)}
                                className="px-2 py-1 text-sm font-medium rounded-md hover:bg-secondary transition-colors"
                            >
                                {MONTHS[month]}
                            </button>
                            <button 
                                onClick={() => setIsSelectingYear(!isSelectingYear)}
                                className="px-2 py-1 text-sm font-medium rounded-md hover:bg-secondary transition-colors"
                            >
                                {year}
                            </button>
                        </div>

                        <button 
                            onClick={handleNextMonth}
                            className="h-8 w-8 flex items-center justify-center rounded-md border border-border hover:bg-secondary transition-colors"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>

                    {isSelectingMonth && (
                        <div className="grid grid-cols-3 gap-2 mb-4 p-2 bg-secondary/30 rounded-lg">
                            {MONTHS.map((m, i) => (
                                <button
                                    key={m}
                                    onClick={() => handleMonthSelect(i)}
                                    className={cn(
                                        "px-2 py-1.5 text-xs font-medium rounded-md transition-colors",
                                        month === i ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
                                    )}
                                >
                                    {m.slice(0, 3)}
                                </button>
                            ))}
                        </div>
                    )}

                    {isSelectingYear && (
                        <div className="mb-4 p-2 bg-secondary/30 rounded-lg max-h-48 overflow-y-auto">
                            <div className="grid grid-cols-4 gap-1">
                                {YEARS.map((y) => (
                                    <button
                                        key={y}
                                        onClick={() => handleYearSelect(y)}
                                        className={cn(
                                            "px-2 py-1.5 text-xs font-medium rounded-md transition-colors",
                                            year === y ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
                                        )}
                                    >
                                        {y}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                            <div key={d} className="h-8 flex items-center justify-center text-[10px] font-medium text-muted-foreground">
                                {d}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                        {allDays.map((d, i) => {
                            const isSelected = selectedDate === d.dateStr;
                            const isToday = new Date().toISOString().split('T')[0] === d.dateStr;
                            
                            return (
                                <button
                                    key={i}
                                    onClick={() => handleSelect(d.dateStr)}
                                    className={cn(
                                        "h-8 w-8 text-xs flex items-center justify-center rounded-md transition-all relative",
                                        !d.currentMonth && "text-muted-foreground/30",
                                        d.currentMonth && !isSelected && "hover:bg-secondary text-foreground",
                                        isSelected && "bg-primary text-primary-foreground font-semibold shadow-sm",
                                        isToday && !isSelected && "bg-secondary text-foreground font-bold"
                                    )}
                                >
                                    {d.day}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Calendar;
