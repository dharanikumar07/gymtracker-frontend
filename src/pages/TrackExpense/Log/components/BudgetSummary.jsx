import React from 'react';
import { Wallet, Calendar, Clock, ArrowUpRight, TrendingUp } from 'lucide-react';
import { cn } from '../../../../lib/utils';

const StatCard = ({ icon: Icon, label, value, subValue, colorClass, trend }) => (
    <div className="bg-card border border-border/50 rounded-2xl p-3 sm:p-4 flex flex-col gap-2 group hover:border-emerald-500/20 transition-all">
        <div className="flex items-center justify-between">
            <div className={cn("w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-colors", colorClass)}>
                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            {trend && (
                <div className="flex items-center gap-1 text-[8px] font-black uppercase text-emerald-500">
                    <TrendingUp className="w-2.5 h-2.5" />
                    {trend}
                </div>
            )}
        </div>
        <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 mb-0.5">{label}</p>
            <div className="flex items-baseline gap-1.5 flex-wrap">
                <h4 className="text-sm sm:text-base font-black tracking-tight text-foreground">{value}</h4>
                {subValue && <span className="text-[8px] font-bold text-muted-foreground/60">{subValue}</span>}
            </div>
        </div>
    </div>
);

const BudgetSummary = ({ planSummary }) => {
    if (!planSummary) {
        return (
            <div className="bg-card border-2 border-dashed border-border/50 rounded-3xl p-8 text-center">
                <div className="w-12 h-12 bg-secondary rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Wallet className="w-6 h-6 text-muted-foreground/20" />
                </div>
                <h4 className="text-[11px] font-black uppercase tracking-widest text-foreground/40">No Active Budget Plan</h4>
                <p className="text-[9px] text-muted-foreground/40 mt-2 max-w-[180px] mx-auto uppercase leading-relaxed font-bold">
                    Go to setup to activate a budget plan and start tracking
                </p>
            </div>
        );
    }

    const spentPercentage = Math.min(100, (planSummary.total_spent / planSummary.total_amount) * 100);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
                <div className="flex flex-col">
                    <h3 className="text-xs font-black uppercase tracking-widest text-foreground">{planSummary.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] font-bold text-muted-foreground italic">Current Plan Overview</span>
                        <div className="h-1 w-1 bg-muted-foreground/20 rounded-full" />
                        <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">Active</span>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-black text-foreground">₹{planSummary.total_amount.toLocaleString()}</p>
                    <p className="text-[8px] font-bold text-muted-foreground/40 uppercase tracking-widest">Total Budget</p>
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <StatCard 
                    icon={Wallet} 
                    label="Available" 
                    value={`₹${planSummary.remaining_amount.toLocaleString()}`}
                    subValue="left"
                    colorClass="bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white"
                />
                <StatCard 
                    icon={Clock} 
                    label="Time Left" 
                    value={`${planSummary.remaining_days} Days`}
                    subValue="remaining"
                    colorClass="bg-blue-500/10 text-blue-500 group-hover:bg-blue-500 group-hover:text-white"
                />
                <StatCard 
                    icon={ArrowUpRight} 
                    label="Spent" 
                    value={`₹${planSummary.total_spent.toLocaleString()}`}
                    subValue={`${spentPercentage.toFixed(0)}% used`}
                    colorClass="bg-amber-500/10 text-amber-500 group-hover:bg-amber-500 group-hover:text-white"
                />
                <StatCard 
                    icon={Calendar} 
                    label="Deadline" 
                    value={new Date(planSummary.to_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    subValue="expiring"
                    colorClass="bg-purple-500/10 text-purple-500 group-hover:bg-purple-500 group-hover:text-white"
                />
            </div>
        </div>
    );
};

export default BudgetSummary;
