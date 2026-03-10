import React from 'react';
import { 
    Zap, 
    Trophy, 
    Target, 
    Flame, 
    CheckCircle2, 
    ChevronRight, 
    Dumbbell, 
    TrendingUp,
    Calendar,
    ArrowUpRight
} from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';
import { cn } from '../../../lib/utils';

const Overview = () => {
    const { user } = useAuthStore();

    const stats = [
        { label: 'Total Volume', value: '42,500', unit: 'kg', icon: Dumbbell, color: 'text-primary' },
        { label: 'Sets Done', value: '124', unit: 'this week', icon: Target, color: 'text-blue-500' },
        { label: 'Streak', value: '12', unit: 'days', icon: Flame, color: 'text-orange-500' },
        { label: 'PRs Hit', value: '3', unit: 'this month', icon: Trophy, color: 'text-amber-500' },
    ];

    const checklist = [
        { id: 1, task: 'Complete Fitness Profile', completed: true },
        { id: 2, task: 'Set Weekly Workout Split', completed: true },
        { id: 3, task: 'Define Expense Budget', completed: true },
        { id: 4, task: 'Log your first session', completed: false },
        { id: 5, task: 'Hit a new Personal Record', completed: false },
        { id: 6, task: 'Upload a form check video', completed: false },
    ];

    const completedCount = checklist.filter(t => t.completed).length;
    const progressPercentage = (completedCount / checklist.length) * 100;

    return (
        <div className="p-4 lg:p-8 space-y-8 animate-in fade-in duration-700 max-w-[1600px] mx-auto">
            
            {/* 1. Impact Header (Usage Information Style) */}
            <div className="relative overflow-hidden bg-primary/10 border border-primary/20 rounded-[2.5rem] p-6 lg:p-8">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary text-white text-[10px] font-black uppercase tracking-widest">
                            <Zap className="w-3 h-3 fill-white" /> Live Insight
                        </div>
                        <h2 className="text-2xl lg:text-3xl font-black text-foreground uppercase italic tracking-tighter">
                            Welcome back, {user?.name?.split(' ')[0]}!
                        </h2>
                        <p className="text-sm text-muted-foreground font-medium max-w-md leading-relaxed">
                            You've crushed 85% of your volume goal this week. One more session to reach "Elite" status.
                        </p>
                    </div>
                    
                    <div className="bg-background/50 backdrop-blur-md border border-border p-5 rounded-3xl min-w-[280px] shadow-sm">
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Weekly Goal</span>
                            <span className="text-sm font-black text-primary">12,400 / 15,000 kg</span>
                        </div>
                        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: '82%' }} />
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-3 font-medium">You are ahead of 92% of athletes in your weight class.</p>
                    </div>
                </div>
                {/* Decorative background circle */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-20 -mt-20 blur-3xl" />
            </div>

            {/* 2. Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-card border border-border p-6 rounded-[2rem] hover:border-primary/30 transition-all group shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className={cn("w-10 h-10 rounded-2xl bg-secondary flex items-center justify-center transition-colors group-hover:bg-primary/10", stat.color)}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                            <ArrowUpRight className="w-4 h-4 text-muted-foreground/30" />
                        </div>
                        <div className="space-y-0.5">
                            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{stat.label}</p>
                            <div className="flex items-baseline gap-1">
                                <h4 className="text-2xl font-black text-foreground italic">{stat.value}</h4>
                                <span className="text-[10px] font-bold text-muted-foreground uppercase">{stat.unit}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* 3. Getting Started Checklist (Reference Image Style) */}
                <div className="lg:col-span-2 bg-card border border-border rounded-[2.5rem] overflow-hidden flex flex-col shadow-sm">
                    <div className="p-6 border-b border-border flex items-center justify-between bg-secondary/20">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-4 bg-primary rounded-full" />
                            <h3 className="text-sm font-black uppercase tracking-widest text-foreground">Athelete Roadmap</h3>
                        </div>
                        <span className="text-[10px] font-black text-muted-foreground uppercase">{completedCount} / {checklist.length} Completed</span>
                    </div>
                    
                    <div className="px-6 py-4 bg-secondary/10">
                        <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${progressPercentage}%` }} />
                        </div>
                    </div>

                    <div className="flex-1 divide-y divide-border">
                        {checklist.map((item) => (
                            <div key={item.id} className="flex items-center justify-between p-5 hover:bg-secondary/30 transition-colors group cursor-pointer">
                                <div className="flex items-center gap-4">
                                    {item.completed ? (
                                        <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                        </div>
                                    ) : (
                                        <div className="w-6 h-6 rounded-full border-2 border-dashed border-border flex items-center justify-center text-[10px] font-black text-muted-foreground group-hover:border-primary transition-colors">
                                            {item.id}
                                        </div>
                                    )}
                                    <span className={cn(
                                        "text-sm font-bold transition-colors",
                                        item.completed ? "text-muted-foreground line-through decoration-primary/30" : "text-foreground group-hover:text-primary"
                                    )}>
                                        {item.task}
                                    </span>
                                </div>
                                <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary transition-all group-hover:translate-x-1" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* 4. Quick Actions / Today's Plan */}
                <div className="space-y-6">
                    <div className="bg-zinc-950 border border-zinc-800 rounded-[2.5rem] p-8 text-white relative overflow-hidden group shadow-2xl">
                        <div className="relative z-10 space-y-6">
                            <div className="flex items-center gap-3">
                                <Calendar className="w-5 h-5 text-primary" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Scheduled for Today</span>
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-3xl font-black italic uppercase tracking-tighter leading-none">
                                    Legs & <br/>Shoulders
                                </h3>
                                <p className="text-xs text-zinc-500 font-medium">6 Exercises • 24 Sets • ~75 mins</p>
                            </div>
                            <button className="w-full h-14 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3">
                                Start Session <TrendingUp className="w-4 h-4" />
                            </button>
                        </div>
                        {/* Abstract shapes for "Premium" feel */}
                        <div className="absolute bottom-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mb-16 -mr-16 blur-2xl group-hover:bg-primary/20 transition-all duration-700" />
                    </div>

                    <div className="bg-card border border-border rounded-[2.5rem] p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <TrendingUp className="w-5 h-5 text-primary" />
                            <h3 className="text-xs font-black uppercase tracking-widest text-foreground">Recent Progress</h3>
                        </div>
                        <div className="space-y-4">
                            {[
                                { lift: 'Bench Press', change: '+5.0kg', date: 'Yesterday' },
                                { lift: 'Squat', change: '+2.5kg', date: '3 days ago' },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-secondary/30 border border-transparent hover:border-border transition-all">
                                    <div>
                                        <p className="text-xs font-black text-foreground uppercase italic">{item.lift}</p>
                                        <p className="text-[9px] text-muted-foreground font-bold uppercase">{item.date}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs font-black text-emerald-500">{item.change}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Overview;
