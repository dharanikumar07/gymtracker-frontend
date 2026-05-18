import React, { useState, useRef, useEffect } from 'react';
import { ExpenseLogProvider, useExpenseLog } from './ExpenseLogContext';
import BudgetSummary from './components/BudgetSummary';
import CommitmentSlide from './components/CommitmentSlide';
import DailyExpenseLog from './components/DailyExpenseLog';
import { Calendar } from '../../../components/ui/calendar';
import { format } from 'date-fns';
import { CreditCard, Loader2, Calendar as CalendarIcon, Wallet, ArrowUpRight } from 'lucide-react';
import { cn } from '../../../lib/utils';

const ExpenseLogContent = () => {
    const { 
        logData, 
        isLoading, 
        selectedDate, 
        setSelectedDate, 
        availableCategories 
    } = useExpenseLog();

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

    if (isLoading && !logData) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
            </div>
        );
    }

    const planSummary = logData?.plan_summary;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Redesigned Header: Plan Details Left, Date Picker Right */}
            <div className="bg-card border border-border rounded-[2rem] p-4 sm:p-5 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    {/* Left Side: Plan Details */}
                    <div className="flex items-center gap-4 min-w-0">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-600/20">
                            <Wallet className="w-6 h-6 text-white" />
                        </div>
                        <div className="min-w-0">
                            {planSummary ? (
                                <>
                                    <h2 className="text-[15px] font-black uppercase tracking-tight text-foreground truncate leading-none mb-1.5">
                                        {planSummary.name}
                                    </h2>
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600">
                                                ₹{planSummary.total_amount.toLocaleString()}
                                            </span>
                                            <span className="text-[8px] font-bold text-muted-foreground/40 uppercase tracking-widest">Budget</span>
                                        </div>
                                        <div className="w-1 h-1 bg-border rounded-full" />
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-blue-500">
                                                {planSummary.remaining_days}d
                                            </span>
                                            <span className="text-[8px] font-bold text-muted-foreground/40 uppercase tracking-widest">Left</span>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <h2 className="text-[15px] font-black uppercase tracking-tight text-foreground truncate leading-none mb-1.5">
                                        No Active Plan
                                    </h2>
                                    <p className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest">Setup budget in settings</p>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Right Side: Date Picker */}
                    <div className="flex items-center gap-3 sm:self-center">
                        <div className="hidden sm:block text-right">
                            <p className="text-[10px] font-black uppercase text-foreground">
                                {format(selectedDate, 'dd MMMM')}
                            </p>
                            <p className="text-[8px] font-bold text-muted-foreground/40 uppercase tracking-widest">
                                {format(selectedDate, 'EEEE')}
                            </p>
                        </div>
                        
                        <div className="relative shrink-0" ref={calendarRef}>
                            <button 
                                onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                                className={cn(
                                    "flex items-center gap-2 h-10 px-4 rounded-xl border transition-all",
                                    isCalendarOpen 
                                        ? "bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-600/20" 
                                        : "bg-secondary/40 border-transparent text-foreground hover:bg-secondary/60"
                                )}
                            >
                                <CalendarIcon className="w-4 h-4" />
                                <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap sm:hidden">
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
            </div>

            {/* Section 1: Budget Summary Cards */}
            <BudgetSummary planSummary={planSummary} />

            {/* Section 2: Fixed Commitments (Carousel) */}
            <CommitmentSlide commitments={logData?.fixed_commitments} />

            {/* Section 3: Daily Logs */}
            <DailyExpenseLog 
                dailyLogs={logData?.daily_logs} 
                categories={availableCategories} 
            />
        </div>
    );
};

const ExpenseLog = () => {
    return (
        <ExpenseLogProvider>
            <ExpenseLogContent />
        </ExpenseLogProvider>
    );
};

export default ExpenseLog;
