import React, { useState, useRef, useEffect } from 'react';
import { 
    Wallet, 
    Dumbbell, 
    TrendingUp, 
    Flame, 
    Calendar as CalendarIcon,
    Loader2,
    CalendarDays,
    ArrowDownRight,
    Trophy,
    SkipForward,
    PieChart,
    Target,
    Settings2,
    Activity
} from 'lucide-react';
import { useAnalytics } from '../context/AnalyticsContext';
import { useAnalyticsOverviewQuery } from '../http/queries';
import { StatCard, ProgressCircle } from '../components/AnalyticsStats';
import { format } from 'date-fns';
import { cn } from '../../../lib/utils';
import { Calendar } from '../../../components/ui/calendar';

const PlanDetailCard = ({ title, icon: Icon, details, colorClass }) => (
    <div className="flex-1 bg-card border border-border/50 rounded-[2.5rem] p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
            <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg", colorClass)}>
                <Icon className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-[14px] font-black uppercase tracking-tight text-foreground">{title}</h3>
        </div>
        
        <div className="grid grid-cols-2 gap-y-4 gap-x-6">
            {details.map((item, idx) => (
                <div key={idx} className="min-w-0">
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">{item.label}</p>
                    <p className="text-[11px] font-bold text-foreground truncate uppercase italic">
                        {item.value || 'N/A'}
                    </p>
                </div>
            ))}
        </div>
    </div>
);

const Overview = () => {
    const { selectedDate, setSelectedDate, formattedDate } = useAnalytics();
    const { data, isLoading } = useAnalyticsOverviewQuery(formattedDate);
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

    if (isLoading && !data) {
        return (
            <div className="h-full flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    const overview = data?.data;
    const { expense, workout, date_range } = overview || {};

    const budgetDetails = [
        { label: 'Name', value: expense?.plan_details?.name },
        { label: 'Start Date', value: expense?.plan_details?.start_date ? format(new Date(expense.plan_details.start_date), 'dd MMM yyyy') : null },
        { label: 'Cycle Period', value: expense?.plan_details?.cycle_period },
        { label: 'Budget Amount', value: expense?.plan_details?.budget_amount ? `₹${expense.plan_details.budget_amount.toLocaleString()}` : null },
    ];

    const workoutDetails = [
        { label: 'Name', value: workout?.plan_details?.name },
        { label: 'Start Date', value: workout?.plan_details?.start_date ? format(new Date(workout.plan_details.start_date), 'dd MMM yyyy') : null },
        { label: 'End Date', value: workout?.plan_details?.end_date ? format(new Date(workout.plan_details.end_date), 'dd MMM yyyy') : 'N/A' },
        { label: 'Activity Type', value: workout?.plan_details?.pa_type },
    ];

    return (
        <div className="space-y-6">
            {/* Top Common Date Picker */}
            <div className="flex justify-end">
                <div className="relative shrink-0" ref={calendarRef}>
                    <button 
                        onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                        className={cn(
                            "flex items-center gap-2 h-10 px-5 rounded-xl border transition-all",
                            isCalendarOpen 
                                ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" 
                                : "bg-secondary/40 border-transparent text-foreground hover:bg-secondary/60 active:scale-95 shadow-sm"
                        )}
                    >
                        <CalendarIcon className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                            {format(selectedDate, 'MMMM yyyy')}
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

            {/* Core Adherence Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <ProgressCircle 
                    percentage={expense?.percentage_used || 0} 
                    label="Wallet Consumption" 
                    secondaryLabel="Of Monthly Budget"
                    icon={Wallet} 
                    colorClass="text-emerald-500" 
                />
                <ProgressCircle 
                    percentage={Math.min((workout?.score / 3) || 0, 100).toFixed(0)} 
                    label="Training Adherence" 
                    secondaryLabel={`Rank: ${workout?.discipline_rank || 'Recruit'}`}
                    icon={Dumbbell} 
                    colorClass="text-primary" 
                />
            </div>

            {/* Expense Specific Metrics */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                    <PieChart className="w-3 h-3 text-muted-foreground" />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Financial Health</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    <StatCard 
                        icon={TrendingUp} 
                        label="Daily Spent" 
                        value={`₹${expense?.avg_daily_spend?.toLocaleString()}`}
                        subValue="Avg spend / day"
                        colorClass="bg-primary/10 text-primary"
                    />
                    <StatCard 
                        icon={Target} 
                        label="Top Leak" 
                        value={expense?.top_category || 'N/A'}
                        subValue="Highest spending"
                        colorClass="bg-amber-500/10 text-amber-500"
                    />
                    <StatCard 
                        icon={Wallet} 
                        label="Remaining" 
                        value={`₹${expense?.remaining_budget?.toLocaleString()}`}
                        subValue="Available cash"
                        colorClass="bg-emerald-500/10 text-emerald-500"
                    />
                    <StatCard 
                        icon={ArrowDownRight} 
                        label="Total Spent" 
                        value={`₹${expense?.total_spent?.toLocaleString()}`}
                        subValue="This cycle"
                        colorClass="bg-blue-500/10 text-blue-500"
                    />
                    <StatCard 
                        icon={Trophy} 
                        label="Efficiency" 
                        value={`${100 - (expense?.percentage_used || 0)}%`}
                        subValue="Budget remaining"
                        colorClass="bg-purple-500/10 text-purple-500"
                    />
                </div>
            </div>

            {/* Workout Specific Metrics */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                    <Trophy className="w-3 h-3 text-muted-foreground" />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Physical Vitality</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <StatCard 
                        icon={SkipForward} 
                        label="Skipped" 
                        value={`${workout?.skipped_count || 0}`}
                        subValue="Sessions missed"
                        colorClass="bg-red-500/10 text-red-500"
                    />
                    <StatCard 
                        icon={CalendarIcon} 
                        label="Weakest Link" 
                        value={workout?.most_skipped_week || 'None'}
                        subValue="Most skipped week"
                        colorClass="bg-orange-500/10 text-orange-500"
                    />
                    <StatCard 
                        icon={Flame} 
                        label="Current Heat" 
                        value={`${workout?.streak?.current || 0} Days`}
                        subValue="Current streak"
                        colorClass="bg-primary/10 text-primary"
                    />
                    <StatCard 
                        icon={Trophy} 
                        label="All-Time Max" 
                        value={`${workout?.streak?.lifetime || 0} Days`}
                        subValue="Lifetime record"
                        colorClass="bg-emerald-500/10 text-emerald-500"
                    />
                </div>
            </div>

            {/* Plan Info Section */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                    <Settings2 className="w-3 h-3 text-muted-foreground" />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Plan Details</span>
                </div>
                <div className="flex flex-col lg:flex-row gap-4">
                    <PlanDetailCard 
                        title="Budget Plan" 
                        icon={Wallet} 
                        details={budgetDetails}
                        colorClass="bg-emerald-600 shadow-emerald-600/20"
                    />
                    <PlanDetailCard 
                        title="Workout Plan" 
                        icon={Activity} 
                        details={workoutDetails}
                        colorClass="bg-primary shadow-primary/20"
                    />
                </div>
            </div>

            {/* Empty State Guard */}
            {!expense?.has_plan && !workout?.has_plan && (
                <div className="bg-secondary/10 border-2 border-dashed border-border rounded-[2.5rem] p-10 text-center">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] leading-relaxed">
                        No active plans found for this period
                    </p>
                </div>
            )}
        </div>
    );
};

export default Overview;
