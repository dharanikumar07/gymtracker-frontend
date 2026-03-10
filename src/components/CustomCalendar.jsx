import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cn } from '../lib/utils';

const CustomCalendar = ({ selectedDate, onSelect, onClose }) => {
    const current = new Date(selectedDate || new Date());
    const [viewDate, setViewDate] = useState(new Date(current.getFullYear(), current.getMonth(), 1));

    const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const monthName = viewDate.toLocaleString('default', { month: 'long' });

    const days = [];
    const totalDays = daysInMonth(year, month);
    const startDay = firstDayOfMonth(year, month);

    // Padding for start of month
    for (let i = 0; i < startDay; i++) {
        days.push(<div key={`empty-${i}`} className="h-10 w-10" />);
    }

    // Days of month
    for (let d = 1; d <= totalDays; d++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const isSelected = selectedDate === dateStr;
        const isToday = new Date().toISOString().split('T')[0] === dateStr;

        days.push(
            <button
                key={d}
                onClick={() => {
                    onSelect(dateStr);
                    onClose();
                }}
                className={cn(
                    "h-10 w-10 rounded-xl flex items-center justify-center text-xs font-black transition-all",
                    isSelected 
                        ? "bg-primary text-white shadow-lg shadow-primary/30 scale-110 z-10" 
                        : isToday 
                            ? "bg-primary/10 text-primary border border-primary/20" 
                            : "text-foreground hover:bg-secondary hover:text-primary"
                )}
            >
                {d}
            </button>
        );
    }

    const nextMonth = () => setViewDate(new Date(year, month + 1, 1));
    const prevMonth = () => setViewDate(new Date(year, month - 1, 1));

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-card border border-border w-full max-w-[340px] rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="bg-secondary/20 px-6 py-4 flex items-center justify-between border-b border-border/50">
                    <button onClick={prevMonth} className="p-2 hover:bg-background rounded-xl transition-colors">
                        <ChevronLeft className="w-4 h-4 text-muted-foreground" />
                    </button>
                    <h4 className="text-sm font-black uppercase tracking-widest text-foreground italic">
                        {monthName} {year}
                    </h4>
                    <button onClick={nextMonth} className="p-2 hover:bg-background rounded-xl transition-colors">
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </button>
                </div>

                {/* Calendar Grid */}
                <div className="p-6">
                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                            <div key={d} className="h-8 flex items-center justify-center text-[10px] font-black text-muted-foreground/40">
                                {d}
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                        {days}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-secondary/10 flex justify-end">
                    <button 
                        onClick={onClose}
                        className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                    >
                        <X className="w-3 h-3" /> Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CustomCalendar;
