import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, CalendarDays, X } from 'lucide-react';
import { cn } from '../lib/utils';

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const YEARS = Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - 20 + i);

const DatePicker = ({ value, onChange, placeholder = "Select Date", triggerClassName }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [viewDate, setViewDate] = useState(value ? new Date(value) : new Date());
    const containerRef = useRef(null);
    const triggerRef = useRef(null);

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    const daysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
    const firstDayOfMonth = (y, m) => new Date(y, m, 1).getDay();

    const currentMonthDays = Array.from({ length: daysInMonth(year, month) }, (_, i) => i + 1);
    const prevMonthDaysCount = firstDayOfMonth(year, month);
    const prevMonthLastDay = daysInMonth(year, month - 1);
    const prevMonthPadding = Array.from({ length: prevMonthDaysCount }, (_, i) => prevMonthLastDay - prevMonthDaysCount + i + 1);

    const totalCells = 42;
    const nextMonthPadding = Array.from({ length: totalCells - (currentMonthDays.length + prevMonthPadding.length) }, (_, i) => i + 1);

    const handleSelect = (d, mOffset = 0) => {
        const selectedDate = new Date(year, month + mOffset, d);
        onChange(selectedDate.toISOString().split('T')[0]);
        setIsOpen(false);
    };

    const handleNextMonth = (e) => { e.stopPropagation(); setViewDate(new Date(year, month + 1, 1)); };
    const handlePrevMonth = (e) => { e.stopPropagation(); setViewDate(new Date(year, month - 1, 1)); };

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target) && !triggerRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        if (isOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const CalendarUI = (
        <div 
            ref={containerRef}
            className={cn(
                "bg-card border border-border rounded-2xl shadow-2xl p-4 w-[280px] z-[9999] animate-in zoom-in-95 duration-200",
                "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 sm:absolute sm:left-0 sm:top-full sm:mt-2 sm:translate-x-0 sm:translate-y-0"
            )}
        >
            <div className="flex items-center justify-between mb-4">
                <button onClick={handlePrevMonth} className="p-1 hover:bg-secondary rounded-lg transition-colors"><ChevronLeft className="w-4 h-4"/></button>
                <div className="text-[11px] font-black uppercase tracking-widest text-foreground">
                    {MONTHS[month]} {year}
                </div>
                <button onClick={handleNextMonth} className="p-1 hover:bg-secondary rounded-lg transition-colors"><ChevronRight className="w-4 h-4"/></button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                    <div key={d} className="h-8 flex items-center justify-center text-[9px] font-black text-muted-foreground/40">{d}</div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
                {prevMonthPadding.map(d => (
                    <button key={`prev-${d}`} onClick={() => handleSelect(d, -1)} className="h-8 w-8 text-[10px] font-black text-muted-foreground/20 hover:bg-secondary rounded-lg transition-all">{d}</button>
                ))}
                {currentMonthDays.map(d => {
                    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                    const isSelected = value === dateStr;
                    return (
                        <button 
                            key={d} 
                            onClick={() => handleSelect(d)} 
                            className={cn(
                                "h-8 w-8 text-[10px] font-black rounded-lg transition-all flex items-center justify-center",
                                isSelected ? "bg-primary text-white shadow-lg shadow-primary/20 scale-110" : "text-foreground hover:bg-secondary hover:text-primary"
                            )}
                        >
                            {d}
                        </button>
                    );
                })}
                {nextMonthPadding.map(d => (
                    <button key={`next-${d}`} onClick={() => handleSelect(d, 1)} className="h-8 w-8 text-[10px] font-black text-muted-foreground/20 hover:bg-secondary rounded-lg transition-all">{d}</button>
                ))}
            </div>
            
            <button 
                onClick={() => setIsOpen(false)}
                className="mt-4 w-full h-8 flex sm:hidden items-center justify-center bg-secondary/50 text-[10px] font-black uppercase tracking-widest rounded-xl text-muted-foreground"
            >
                Close
            </button>
        </div>
    );

    return (
        <div className="relative">
            <button
                ref={triggerRef}
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "w-full flex items-center justify-between px-3 h-9 sm:h-8 rounded-lg border border-border bg-secondary/30 text-[11px] sm:text-[10px] font-black text-foreground outline-none transition-all",
                    triggerClassName
                )}
            >
                <span className={!value ? "text-muted-foreground" : ""}>{value || placeholder}</span>
                <CalendarDays className="w-4 h-4 text-muted-foreground ml-2" />
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 bg-background/40 backdrop-blur-sm z-[9998] sm:hidden" onClick={() => setIsOpen(false)} />
                    {CalendarUI}
                </>
            )}
        </div>
    );
};

export default DatePicker;
