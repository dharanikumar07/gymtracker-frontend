import React, { useState, useRef, useEffect } from 'react';
import { ExpenseLogProvider, useExpenseLog } from './ExpenseLogContext';
import BudgetSummary from './components/BudgetSummary';
import CommitmentSlide from './components/CommitmentSlide';
import DailyExpenseLog from './components/DailyExpenseLog';
import { Calendar } from '../../../components/ui/calendar';
import { format } from 'date-fns';
import { CreditCard, Loader2, Calendar as CalendarIcon, Wallet, ArrowUpRight, Info } from 'lucide-react';
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

    const InfoCard = () => (
        <div className="flex items-center gap-2 px-1.5 py-1.5 bg-emerald-500/5 border border-emerald-500/10 rounded-xl animate-in fade-in slide-in-from-top-1 duration-500">
            <div className="w-4 h-4 rounded-full bg-emerald-600/10 flex items-center justify-center shrink-0">
                <Info className="w-2.5 h-2.5 text-emerald-600" />
            </div>
            <p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest leading-tight italic">
                Switch dates to browse your financial history
            </p>
        </div>
    );

    return (
        <div className="space-y-4 animate-in fade-in duration-500">
            {/* Redesigned Header: Plan Details Left, Date Picker Right */}
            <div className="bg-card border border-border rounded-[2rem] p-4 sm:p-5 shadow-sm">
                <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between gap-4">
                        {/* Left Side: Plan Details */}
                        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                            <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-600/20">
                                <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                            </div>
                            <div className="min-w-0">
                                {planSummary ? (
                                    <>
                                        <h2 className="text-[13px] sm:text-[15px] font-black uppercase tracking-tight text-foreground truncate leading-none mb-1 sm:mb-1.5">
                                            {planSummary.name}
                                        </h2>
                                        <div className="flex items-center gap-2 sm:gap-3">
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-emerald-600">
                                                    ₹{planSummary.total_amount.toLocaleString()}
                                                </span>
                                                <span className="hidden sm:inline text-[8px] font-bold text-muted-foreground/40 uppercase tracking-widest">Budget</span>
                                            </div>
                                            <div className="w-0.5 h-0.5 sm:w-1 sm:h-1 bg-border rounded-full" />
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-blue-500">
                                                    {planSummary.remaining_days}d
                                                </span>
                                                <span className="hidden sm:inline text-[8px] font-bold text-muted-foreground/40 uppercase tracking-widest">Left</span>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <h2 className="text-[13px] sm:text-[15px] font-black uppercase tracking-tight text-foreground truncate leading-none mb-1 sm:mb-1.5">
                                            No Active Plan
                                        </h2>
                                        <p className="text-[8px] font-bold text-muted-foreground/40 uppercase tracking-widest text-nowrap">Setup budget in settings</p>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Laptop: Info Card - Rendered Between */}
                        <div className="hidden md:flex flex-1 justify-center px-4">
                            <InfoCard />
                        </div>

                        {/* Right Side: Date Picker */}
                        <div className="flex items-center gap-3 shrink-0">
                            <div className="hidden sm:block text-right">
                                <p className="text-[10px] font-black uppercase text-foreground">
                                    {format(selectedDate, 'dd MMMM')}
                                </p>
                                <p className="text-[8px] font-bold text-muted-foreground/40 uppercase tracking-widest">
                                    {format(selectedDate, 'EEEE')}
                                </p>
                            </div>
                            
                            <div className="relative" ref={calendarRef}>
                                <button 
                                    onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                                    className={cn(
                                        "flex items-center gap-2 h-9 sm:h-10 px-3 sm:px-4 rounded-xl border transition-all",
                                        isCalendarOpen 
                                            ? "bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-600/20" 
                                            : "bg-secondary/40 border-transparent text-foreground hover:bg-secondary/60 active:scale-95"
                                    )}
                                >
                                    <CalendarIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                    <span className="text-[9px] font-black uppercase tracking-widest whitespace-nowrap sm:hidden">
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

                    {/* Mobile: Info Card - Rendered Below */}
                    <div className="md:hidden flex justify-start">
                        <InfoCard />
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
    return <ExpenseLogContent />;
};

export default ExpenseLog;
