import React from 'react';
import { 
    Wallet,
    TrendingUp,
    TrendingDown,
    Receipt,
    Loader2,
    ArrowUpRight
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { useExpenseAnalyticsQuery } from './http/analyticsQueries';

const ExpenseAnalytics = () => {
    const [period, setPeriod] = React.useState('month');
    const { data, isLoading } = useExpenseAnalyticsQuery(period);

    const expenseData = data?.data;

    const getProgressColor = (percent) => {
        if (percent >= 100) return 'text-red-500';
        if (percent >= 80) return 'text-yellow-500';
        return 'text-green-500';
    };

    const getProgressBg = (percent) => {
        if (percent >= 100) return 'bg-red-500';
        if (percent >= 80) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    const getCategoryColor = (index) => {
        const colors = [
            'bg-blue-500',
            'bg-purple-500',
            'bg-pink-500',
            'bg-orange-500',
            'bg-cyan-500',
            'bg-green-500',
        ];
        return colors[index % colors.length];
    };

    if (isLoading && !expenseData) {
        return (
            <div className="flex items-center justify-center h-40">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
        );
    }

    const stats = expenseData?.stats || {};
    const budgetPercent = stats.budget > 0 ? (stats.total_spent / stats.budget) * 100 : 0;

    return (
        <div className="space-y-4">
            {/* Period Selector */}
            <div className="flex gap-2">
                {['week', 'month'].map((p) => (
                    <button
                        key={p}
                        onClick={() => setPeriod(p)}
                        className={cn(
                            "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all",
                            period === p 
                                ? "bg-primary text-white" 
                                : "bg-card border border-border text-muted-foreground hover:bg-secondary"
                        )}
                    >
                        {p === 'week' ? 'This Week' : 'This Month'}
                    </button>
                ))}
            </div>

            {/* Budget Overview */}
            <div className="bg-card border border-border rounded-3xl p-5">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center">
                            <Wallet className="w-6 h-6 text-red-500" />
                        </div>
                        <div>
                            <h3 className="text-[12px] font-black uppercase italic text-foreground">
                                {expenseData?.active_plan?.name || 'Budget Overview'}
                            </h3>
                            <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">
                                {period === 'week' ? 'This Week' : 'This Month'}
                            </p>
                        </div>
                    </div>
                    <div className={cn(
                        "flex items-center gap-1 px-3 py-1.5 rounded-full text-[9px] font-black uppercase",
                        stats.remaining >= 0 ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                    )}>
                        {stats.remaining >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {stats.remaining >= 0 ? 'Under Budget' : 'Over Budget'}
                    </div>
                </div>

                {/* Budget Ring */}
                <div className="flex items-center justify-center mb-4">
                    <div className="relative w-36 h-36">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="72" cy="72" r="64" strokeWidth="12" stroke="currentColor" className="text-secondary" fill="none" />
                            <circle
                                cx="72"
                                cy="72"
                                r="64"
                                strokeWidth="12"
                                strokeLinecap="round"
                                stroke="currentColor"
                                className={cn(
                                    "transition-all duration-1000",
                                    budgetPercent >= 100 ? 'text-red-500' : budgetPercent >= 80 ? 'text-yellow-500' : 'text-green-500'
                                )}
                                fill="none"
                                strokeDasharray={`${Math.min(budgetPercent, 100) * 4} 402`}
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-2xl font-black italic text-foreground">₹{(stats.total_spent || 0).toLocaleString()}</span>
                            <span className="text-[7px] font-black uppercase text-muted-foreground">of ₹{(stats.budget || 0).toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-secondary/30 rounded-2xl p-3 text-center">
                        <p className="text-[7px] font-black uppercase text-muted-foreground mb-1">Spent</p>
                        <p className="text-[16px] font-black italic text-foreground">₹{(stats.total_spent || 0).toLocaleString()}</p>
                    </div>
                    <div className="bg-secondary/30 rounded-2xl p-3 text-center">
                        <p className="text-[7px] font-black uppercase text-muted-foreground mb-1">Remaining</p>
                        <p className={cn("text-[16px] font-black italic", (stats.remaining || 0) >= 0 ? 'text-green-500' : 'text-red-500')}>
                            ₹{Math.abs(stats.remaining || 0).toLocaleString()}
                        </p>
                    </div>
                    <div className="bg-secondary/30 rounded-2xl p-3 text-center">
                        <p className="text-[7px] font-black uppercase text-muted-foreground mb-1">Daily Avg</p>
                        <p className="text-[16px] font-black italic text-foreground">₹{Math.round(stats.avg_daily || 0).toLocaleString()}</p>
                    </div>
                </div>
            </div>

            {/* Daily Spending Chart */}
            <div className="bg-card border border-border rounded-3xl p-5">
                <h3 className="text-[11px] font-black uppercase italic text-foreground mb-4">Daily Spending</h3>
                <div className="flex items-end justify-between gap-1 h-32">
                    {expenseData?.days?.map((day, i) => {
                        const maxAmount = Math.max(...(expenseData.days.map(d => d.amount)), stats.avg_daily || 1);
                        const height = (day.amount / maxAmount) * 100;
                        return (
                            <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                <div className="w-full flex items-end justify-center h-24">
                                    <div 
                                        className={cn(
                                            "w-full max-w-6 rounded-t-lg transition-all",
                                            day.amount > stats.avg_daily 
                                                ? "bg-red-500" 
                                                : day.amount > 0 
                                                    ? "bg-red-500/60" 
                                                    : "bg-secondary"
                                        )}
                                        style={{ height: `${Math.max(height, day.amount > 0 ? 10 : 4)}%` }}
                                    />
                                </div>
                                <span className="text-[7px] font-black uppercase text-muted-foreground">{day.day_name}</span>
                                <span className="text-[8px] font-bold text-muted-foreground">₹{day.amount}</span>
                            </div>
                        );
                    })}
                </div>
                {/* Average line */}
                <div className="mt-2 flex items-center gap-2 text-[8px] font-black text-muted-foreground">
                    <div className="w-4 h-0.5 bg-primary rounded" />
                    Avg: ₹{Math.round(stats.avg_daily || 0)}
                </div>
            </div>

            {/* Category Breakdown */}
            <div className="bg-card border border-border rounded-3xl p-5">
                <h3 className="text-[11px] font-black uppercase italic text-foreground mb-4">Category Breakdown</h3>
                <div className="space-y-3">
                    {expenseData?.category_breakdown?.length > 0 ? expenseData.category_breakdown.map((cat, i) => (
                        <div key={i} className="space-y-1">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <div className={cn("w-3 h-3 rounded-full", getCategoryColor(i))} />
                                    <span className="text-[10px] font-black text-foreground uppercase">{cat.category}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[9px] font-bold text-muted-foreground">{cat.percentage}%</span>
                                    <span className="text-[11px] font-black italic text-foreground">₹{cat.total.toLocaleString()}</span>
                                </div>
                            </div>
                            <div className="h-2 bg-secondary/50 rounded-full overflow-hidden">
                                <div 
                                    className={cn("h-full rounded-full transition-all", getCategoryColor(i))}
                                    style={{ width: `${cat.percentage}%` }}
                                />
                            </div>
                        </div>
                    )) : (
                        <div className="text-center py-8">
                            <Receipt className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
                            <p className="text-[9px] font-black uppercase text-muted-foreground italic">No expense data</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Biggest Expense */}
            {expenseData?.biggest_expense && (
                <div className="bg-card border border-border rounded-3xl p-5">
                    <h3 className="text-[11px] font-black uppercase italic text-foreground mb-4">Biggest Expense</h3>
                    <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-2xl">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500">
                                <ArrowUpRight className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[12px] font-black text-foreground uppercase italic">{expenseData.biggest_expense.name}</p>
                                <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">
                                    {new Date(expenseData.biggest_expense.date).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                        <p className="text-[18px] font-black italic text-red-500">₹{expenseData.biggest_expense.amount.toLocaleString()}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExpenseAnalytics;