import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
    Calendar as CalendarIcon,
    Loader2,
    LayoutDashboard,
    Activity,
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { useExpensesQuery } from './http/expenseQueries';
import Calendar from '../../../components/Calendar';

import ManageExpenses from './ManageExpenses';
import TrackExpenses from './TrackExpenses';

const Expenses = () => {
    const [activeTab, setActiveTab] = useState('manage'); 
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    const [isMainCalendarOpen, setIsMainCalendarOpen] = useState(false);
    const calendarRef = useRef(null);

    const { data: expenseData, isLoading: loading } = useExpensesQuery(selectedDate);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (calendarRef.current && !calendarRef.current.contains(event.target)) {
                setIsMainCalendarOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const weekDays = useMemo(() => {
        const baseDate = new Date(selectedDate);
        const day = baseDate.getDay();
        const diff = baseDate.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(baseDate.setDate(diff));
        return Array.from({ length: 7 }, (_, i) => {
            const date = new Date(monday);
            date.setDate(monday.getDate() + i);
            const iso = date.toISOString().split('T')[0];
            return {
                date: iso,
                dayNum: date.getDate(),
                dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
                isToday: iso === new Date().toISOString().split('T')[0]
            };
        });
    }, [selectedDate]);

    const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    if (loading && !expenseData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Syncing Ledger...</p>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col p-2 sm:p-4 lg:p-6 space-y-4 animate-in fade-in duration-500 font-sans">
            
            {/* Header Card */}
            <div className="shrink-0 bg-card border border-border rounded-[2rem] p-3 shadow-sm relative">
                <div className="flex flex-col gap-4">
                    {/* Tabs */}
                    <div className="flex p-1 bg-secondary/50 rounded-2xl w-full sm:w-fit border border-border/50 shadow-inner mx-auto sm:mx-0">
                        <button 
                            onClick={() => setActiveTab('manage')} 
                            className={cn("flex items-center justify-center gap-2 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all", 
                            activeTab === 'manage' ? "bg-primary text-white shadow-lg shadow-primary/20 scale-105" : "text-muted-foreground hover:text-foreground")}
                        >
                            <LayoutDashboard className="w-3.5 h-3.5" />
                            <span>Manage</span>
                        </button>
                        <button 
                            onClick={() => setActiveTab('track')} 
                            className={cn("flex items-center justify-center gap-2 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all", 
                            activeTab === 'track' ? "bg-primary text-white shadow-lg shadow-primary/20 scale-105" : "text-muted-foreground hover:text-foreground")}
                        >
                            <Activity className="w-3.5 h-3.5" />
                            <span>Track</span>
                        </button>
                    </div>

                    {/* Week Strip - Only in Track tab */}
                    {activeTab === 'track' && (
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-border/50 pt-3">
                            <div className="flex items-center gap-3 px-2 cursor-pointer group" onClick={() => setIsMainCalendarOpen(!isMainCalendarOpen)}>
                                <div className="w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20 shrink-0 group-hover:scale-105 transition-transform">
                                    <CalendarIcon className="w-5 h-5" />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-sm font-black text-foreground uppercase tracking-tight italic truncate leading-none mb-1">
                                        {formatDate(selectedDate)}
                                    </h3>
                                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-1">
                                        <div className="w-1 h-1 rounded-full bg-primary animate-pulse" /> Select Date
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center justify-center bg-secondary/30 rounded-2xl p-1 gap-0.5 flex-1 sm:max-w-sm mx-auto sm:mx-0">
                                {weekDays.map((day) => {
                                    const isActive = selectedDate === day.date;
                                    return (
                                        <button 
                                            key={day.date} 
                                            onClick={() => setSelectedDate(day.date)} 
                                            className={cn("flex-1 flex flex-col items-center py-2 rounded-xl transition-all", 
                                            isActive ? "bg-primary text-white shadow-sm" : "bg-transparent text-muted-foreground hover:bg-background hover:text-primary")}
                                        >
                                            <span className="text-[7px] font-black uppercase tracking-widest mb-0.5">{day.dayName}</span>
                                            <span className="text-xs font-black italic">{day.dayNum}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {isMainCalendarOpen && activeTab === 'track' && (
                    <div ref={calendarRef} className="absolute top-full left-0 mt-2 z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
                        <Calendar selectedDate={selectedDate} onSelect={(date) => { setSelectedDate(date); setIsMainCalendarOpen(false); }} />
                    </div>
                )}
            </div>

            {/* Tab Content */}
            <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide">
                {activeTab === 'manage' && (
                    <ManageExpenses expenseData={expenseData} />
                )}
                {activeTab === 'track' && (
                    <TrackExpenses expenseData={expenseData} selectedDate={selectedDate} formatDate={formatDate} />
                )}
            </div>
        </div>
    );
};

export default Expenses;