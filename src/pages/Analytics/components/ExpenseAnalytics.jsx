import React from 'react';
import { useState } from 'react';
import { Wallet, TrendingUp, TrendingDown, Receipt, Loader2, ArrowUpRight } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { useExpenseQuery } from '../http/queries';

const getCategoryColor = (index) => ['bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-orange-500', 'bg-cyan-500', 'bg-green-500'][index % 6];

const Expense = () => {
    const [period, setPeriod] = useState('month');
    const { data, isLoading } = useExpenseQuery(period);
    const expenseData = data?.data;

    if (isLoading && !expenseData) return <div className="flex items-center justify-center h-40"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

    const stats = expenseData?.stats || {};
    const budgetPercent = stats.budget > 0 ? (stats.total_spent / stats.budget) * 100 : 0;

    return (
        <div className="space-y-4">
            <div className="flex gap-2">
                {['week', 'month'].map((p) => (
                    <button key={p} onClick={() => setPeriod(p)} className={cn(
                        "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all",
                        period === p ? "bg-primary text-white" : "bg-card border border-border text-muted-foreground hover:bg-secondary"
                    )}>{p === 'week' ? 'This Week' : 'This Month'}</button>
                ))}
            </div>

            <div className="bg-card border border-border rounded-3xl p-5">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center">
                            <Wallet className="w-6 h-6 text-red-500" />
                        </div>
                        <div>
                            <h3 className="text-[12px] font-black uppercase italic text-foreground">{expenseData?.active_plan?.name || 'Budget Overview'}</h3>
                            <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">{period === 'week' ? 'This Week' : 'This Month'}</p>
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

                <div className="flex items-center justify-center mb-4">
                    <div className="relative w-36 h-36">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="72" cy="72" r="64" strokeWidth="12" stroke="currentColor" className="text-secondary" fill="none" />
                            <circle cx="72" cy="72" r="64" strokeWidth="12" strokeLinecap="round" stroke="currentColor"
                                className={cn("transition-all duration-1000", budgetPercent >= 100 ? 'text-red-500' : budgetPercent >= 80 ? 'text-yellow-500' : 'text-green-500')}
                                fill="none" strokeDasharray={`${Math.min(budgetPercent, 100) * 4} 402`}
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-2xl font-black italic text-foreground">₹{(stats.total_spent || 0).toLocaleString()}</span>
                            <span className="text-[7px] font-black uppercase text-muted-foreground">of ₹{(stats.budget || 0).toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                    {[
                        { label: 'Spent', value: `₹${(stats.total_spent || 0).toLocaleString()}` },
                        { label: 'Remaining', value: `₹${Math.abs(stats.remaining || 0).toLocaleString()}`, color: (stats.remaining || 0) >= 0 ? 'text-green-500' : 'text-red-500' },
                        { label: 'Daily Avg', value: `₹${Math.round(stats.avg_daily || 0).toLocaleString()}` },
                    ].map(({ label, value, color }, i) => (
                        <div key={i} className="bg-secondary/30 rounded-2xl p-3 text-center">
                            <p className="text-[7px] font-black uppercase text-muted-foreground mb-1">{label}</p>
                            <p className={cn("text-[16px] font-black italic", color || 'text-foreground')}>{value}</p>
                        </div>
                    ))}
                </div>
            </div>

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
                                <div className={cn("h-full rounded-full transition-all", getCategoryColor(i))} style={{ width: `${cat.percentage}%` }} />
                            </div>
                        </div>
                    )) : (
                        <div className="py-8 text-center">
                            <Receipt className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
                            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground italic">No expense data</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Expense;
