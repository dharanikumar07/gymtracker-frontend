import React, { useState, useEffect } from 'react';
import { 
    Wallet, 
    TrendingDown, 
    Plus, 
    ArrowUpRight, 
    ShoppingCart, 
    Calendar,
    IndianRupee,
    Filter,
    Loader2,
    PieChart,
    ChevronRight,
    ArrowRight
} from 'lucide-react';
import api from '../../../lib/api';
import { cn } from '../../../lib/utils';

const Expenses = () => {
    const [loading, setLoading] = useState(true);
    const [expenseData, setExpenseData] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.get('/get-expenses');
                setExpenseData(response.data);
            } catch (err) {
                console.error("Failed to fetch expenses", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Syncing Ledger...</p>
            </div>
        );
    }

    const totalSpent = expenseData?.history.reduce((sum, item) => sum + item.amount, 0) || 0;

    return (
        <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 animate-in fade-in duration-700 pb-32">
            
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black text-foreground tracking-tighter uppercase italic italic-none">
                        Fitness Finance
                    </h1>
                    <p className="text-muted-foreground font-medium text-sm">
                        Total investment in your physical transformation.
                    </p>
                </div>

                <button className="h-12 px-6 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                    <Plus className="w-4 h-4" /> Add New Expense
                </button>
            </div>

            {/* Top Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total Spent Card */}
                <div className="col-span-1 md:col-span-2 bg-zinc-950 border border-zinc-800 rounded-[2.5rem] p-8 text-white relative overflow-hidden group shadow-2xl">
                    <div className="relative z-10 space-y-6">
                        <div className="flex items-center gap-3">
                            <Wallet className="w-5 h-5 text-primary" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Total Monthly Spend</span>
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-black italic tracking-tighter text-white">₹{totalSpent.toLocaleString()}</span>
                                <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">March 2026</span>
                            </div>
                            <p className="text-xs text-zinc-500 font-medium">+12% from last month</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                <span className="text-[10px] font-bold uppercase text-zinc-300">Under Budget</span>
                            </div>
                        </div>
                    </div>
                    {/* Abstract Decoration */}
                    <div className="absolute bottom-0 right-0 w-48 h-48 bg-primary/10 rounded-full -mb-24 -mr-24 blur-3xl group-hover:bg-primary/20 transition-all duration-700" />
                </div>

                {/* Quick Breakdown Card */}
                <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm flex flex-col justify-between">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <PieChart className="w-5 h-5 text-primary" />
                            <h3 className="text-xs font-black uppercase tracking-widest text-foreground">Top Categories</h3>
                        </div>
                        <div className="space-y-3">
                            {[
                                { cat: 'Supplements', percent: 65, color: 'bg-primary' },
                                { cat: 'Membership', percent: 25, color: 'bg-blue-500' },
                                { cat: 'Others', percent: 10, color: 'bg-zinc-400' },
                            ].map((item, i) => (
                                <div key={i} className="space-y-1.5">
                                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-tight">
                                        <span className="text-muted-foreground">{item.cat}</span>
                                        <span className="text-foreground">{item.percent}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                                        <div className={cn("h-full rounded-full", item.color)} style={{ width: `${item.percent}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <button className="mt-6 flex items-center gap-2 text-[10px] font-black uppercase text-primary hover:underline">
                        Detailed Analysis <ArrowRight className="w-3 h-3" />
                    </button>
                </div>
            </div>

            {/* Bottom Section: Transaction History & Category Filter */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent History Table */}
                <div className="lg:col-span-2 bg-card border border-border rounded-[2.5rem] overflow-hidden flex flex-col shadow-sm">
                    <div className="p-6 border-b border-border flex items-center justify-between bg-secondary/20">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-4 bg-primary rounded-full" />
                            <h3 className="text-sm font-black uppercase tracking-widest text-foreground">Spending Stream</h3>
                        </div>
                        <div className="flex items-center gap-2">
                            <button className="p-2 hover:bg-secondary rounded-lg text-muted-foreground transition-colors">
                                <Filter className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 divide-y divide-border">
                        {expenseData?.history.map((item) => (
                            <div key={item.id} className="flex items-center justify-between p-5 hover:bg-secondary/30 transition-colors group">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center border border-border group-hover:bg-primary/10 group-hover:border-primary/20 transition-all">
                                        <ShoppingCart className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-foreground group-hover:text-primary transition-colors">{item.note}</p>
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{item.category} • {item.date}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-black text-foreground italic">₹{item.amount.toLocaleString()}</p>
                                    <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-tighter flex items-center justify-end gap-1">
                                        Verified <ArrowUpRight className="w-2.5 h-2.5" />
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <div className="p-4 bg-secondary/10 border-t border-border">
                        <button className="w-full py-2 text-[10px] font-black uppercase text-muted-foreground hover:text-foreground tracking-widest transition-colors">
                            View All Transactions
                        </button>
                    </div>
                </div>

                {/* Secondary Sidebar Stats */}
                <div className="space-y-6">
                    <div className="bg-card border border-border rounded-[2.5rem] p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <Calendar className="w-5 h-5 text-primary" />
                            <h3 className="text-xs font-black uppercase tracking-widest text-foreground">Recurring Costs</h3>
                        </div>
                        <div className="space-y-4">
                            {[
                                { item: 'Gym Membership', price: '2,000', frequency: 'Monthly' },
                                { item: 'Coaching', price: '5,000', frequency: 'Quarterly' },
                            ].map((recurring, i) => (
                                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-secondary/30 border border-transparent hover:border-border transition-all group">
                                    <div>
                                        <p className="text-xs font-black text-foreground uppercase">{recurring.item}</p>
                                        <p className="text-[9px] text-muted-foreground font-bold uppercase">{recurring.frequency}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs font-black text-foreground italic">₹{recurring.price}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Pro Insight Card */}
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-[2.5rem] p-6 text-center space-y-3">
                        <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center mx-auto text-white">
                            <TrendingDown className="w-5 h-5" />
                        </div>
                        <h4 className="text-sm font-black uppercase tracking-tight text-emerald-600 dark:text-emerald-400">Budget Alert</h4>
                        <p className="text-[10px] text-muted-foreground font-medium leading-relaxed">
                            You've optimized your supplement spending by 15% this month. Great job on the bulk purchase!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Expenses;
