import React from 'react';
import { Wallet, Calendar, Clock, ArrowUpRight, TrendingUp, ShieldCheck, AlertCircle, Info } from 'lucide-react';
import { cn } from '../../../../lib/utils';

const StatCard = ({ icon: Icon, label, value, subValue, colorClass, trend }) => (
    <div className="bg-card border border-border/50 rounded-2xl p-3 sm:p-4 flex flex-col gap-2 group hover:border-emerald-500/20 transition-all shadow-sm">
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

const BudgetSummary = ({ planSummary, onDateClick, selectedDate }) => {
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
    const safeToSpend = planSummary.safe_to_spend_amount;
    const safePercentage = planSummary.safe_to_spend_percentage;

    return (
        <div className="space-y-4">
            {/* Unified Combined Card */}
            <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-[2rem] p-4 sm:p-5 relative overflow-hidden group">
                {/* Background Accent */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110 duration-700" />
                
                <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-600/20">
                            <ShieldCheck className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tighter leading-none mb-1">
                                ₹{safeToSpend.toLocaleString()}
                            </h2>
                            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 italic">
                                Safe to Spend for daily needs
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 sm:gap-6 border-t sm:border-t-0 sm:border-l border-border/40 pt-4 sm:pt-0 sm:pl-6">
                        <div>
                            <p className="text-[8px] font-black uppercase text-muted-foreground/40 tracking-widest mb-1">Reserved</p>
                            <div className="flex items-center gap-2">
                                <div className="w-1 h-3 bg-blue-500 rounded-full" />
                                <p className="text-[11px] font-black text-foreground italic">₹{planSummary.planned_fixed_total.toLocaleString()}</p>
                            </div>
                        </div>
                        <div>
                            <p className="text-[8px] font-black uppercase text-muted-foreground/40 tracking-widest mb-1">Remaining</p>
                            <div className="flex items-center gap-2">
                                <div className="w-1 h-3 bg-emerald-500 rounded-full" />
                                <p className="text-[11px] font-black text-foreground italic">₹{planSummary.remaining_amount.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-5 h-1.5 bg-secondary/50 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-emerald-500 rounded-full transition-all duration-1000"
                        style={{ width: `${safePercentage}%` }}
                    />
                </div>
            </div>

            {/* Stat Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <StatCard 
                    icon={Wallet} 
                    label="Current Cash" 
                    value={`₹${planSummary.remaining_amount.toLocaleString()}`}
                    subValue="in pocket"
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
                    label="Actual Spent" 
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
