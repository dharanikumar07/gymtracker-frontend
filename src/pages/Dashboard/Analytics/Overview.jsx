import React from 'react';
import { 
    Dumbbell,
    UtensilsCrossed,
    Wallet,
    TrendingUp,
    Flame,
    Target,
    Zap,
    Loader2
} from 'lucide-react';
import { cn } from '../../../lib/utils';

const Overview = ({ data }) => {
    if (!data) {
        return (
            <div className="flex items-center justify-center h-40">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
        );
    }

    const { fitness, diet, expenses, overall } = data;

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

    return (
        <div className="space-y-4">
            {/* Overall Progress Ring */}
            <div className="bg-card border border-border rounded-3xl p-6">
                <div className="flex items-center justify-center">
                    <div className="relative w-40 h-40">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle
                                cx="80"
                                cy="80"
                                r="70"
                                strokeWidth="12"
                                stroke="currentColor"
                                className="text-secondary"
                                fill="none"
                            />
                            <circle
                                cx="80"
                                cy="80"
                                r="70"
                                strokeWidth="12"
                                strokeLinecap="round"
                                stroke="currentColor"
                                className={cn(
                                    "transition-all duration-1000",
                                    overall?.progress >= 80 ? 'text-green-500' : overall?.progress >= 50 ? 'text-yellow-500' : 'text-primary'
                                )}
                                fill="none"
                                strokeDasharray={`${(overall?.progress || 0) * 4.4} 440`}
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-3xl font-black italic text-foreground">{overall?.progress || 0}%</span>
                            <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Overall</span>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-3 mt-4">
                    <div className="text-center">
                        <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">Fitness</p>
                        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                            <div 
                                className={cn("h-full rounded-full transition-all", getProgressBg(fitness?.progress))}
                                style={{ width: `${fitness?.progress || 0}%` }}
                            />
                        </div>
                        <p className={cn("text-[11px] font-black italic mt-1", getProgressColor(fitness?.progress))}>
                            {fitness?.progress || 0}%
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">Diet</p>
                        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                            <div 
                                className={cn("h-full rounded-full transition-all", getProgressBg(diet?.progress))}
                                style={{ width: `${diet?.progress || 0}%` }}
                            />
                        </div>
                        <p className={cn("text-[11px] font-black italic mt-1", getProgressColor(diet?.progress))}>
                            {diet?.progress || 0}%
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">Budget</p>
                        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                            <div 
                                className={cn("h-full rounded-full transition-all", getProgressBg(expenses?.progress))}
                                style={{ width: `${expenses?.progress || 0}%` }}
                            />
                        </div>
                        <p className={cn("text-[11px] font-black italic mt-1", getProgressColor(expenses?.progress))}>
                            {expenses?.progress || 0}%
                        </p>
                    </div>
                </div>
            </div>

            {/* Four Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Fitness Card */}
                <div className="bg-card border border-border rounded-3xl p-5">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                            <Dumbbell className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-[12px] font-black uppercase italic text-foreground">Fitness</h3>
                            <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">
                                {fitness?.has_plan ? fitness.plan_name : 'No active plan'}
                            </p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-secondary/30 rounded-2xl p-3 text-center">
                            <Flame className="w-4 h-4 text-orange-500 mx-auto mb-1" />
                            <p className="text-[16px] font-black italic text-foreground">{fitness?.streak || 0}</p>
                            <p className="text-[7px] font-black uppercase text-muted-foreground">Day Streak</p>
                        </div>
                        <div className="bg-secondary/30 rounded-2xl p-3 text-center">
                            <Dumbbell className="w-4 h-4 text-primary mx-auto mb-1" />
                            <p className="text-[16px] font-black italic text-foreground">{fitness?.this_week || 0}</p>
                            <p className="text-[7px] font-black uppercase text-muted-foreground">This Week</p>
                        </div>
                        <div className="bg-secondary/30 rounded-2xl p-3 text-center col-span-2">
                            <p className="text-[7px] font-black uppercase text-muted-foreground mb-1">Total Volume</p>
                            <p className="text-lg font-black italic text-primary">{(fitness?.total_volume || 0).toLocaleString()} kg</p>
                        </div>
                    </div>
                    <div className="mt-4">
                        <div className="flex justify-between text-[8px] font-black uppercase mb-1">
                            <span className="text-muted-foreground">Progress</span>
                            <span className={getProgressColor(fitness?.progress)}>{fitness?.progress || 0}%</span>
                        </div>
                        <div className="h-2 bg-secondary/50 rounded-full overflow-hidden">
                            <div 
                                className={cn("h-full rounded-full transition-all", getProgressBg(fitness?.progress))}
                                style={{ width: `${fitness?.progress || 0}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Diet Card */}
                <div className="bg-card border border-border rounded-3xl p-5">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center">
                            <UtensilsCrossed className="w-6 h-6 text-green-500" />
                        </div>
                        <div>
                            <h3 className="text-[12px] font-black uppercase italic text-foreground">Diet</h3>
                            <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">
                                {diet?.has_plan ? diet.plan_name : 'No active plan'}
                            </p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-secondary/30 rounded-2xl p-3 text-center">
                            <p className="text-[7px] font-black uppercase text-muted-foreground mb-1">Consumed</p>
                            <p className="text-[16px] font-black italic text-foreground">{diet?.consumed || 0}</p>
                            <p className="text-[7px] font-bold text-muted-foreground">/ {diet?.target_calories || 2000} kcal</p>
                        </div>
                        <div className="bg-secondary/30 rounded-2xl p-3 text-center">
                            <p className="text-[7px] font-black uppercase text-muted-foreground mb-1">Remaining</p>
                            <p className={cn("text-[16px] font-black italic", (diet?.target_calories - diet?.consumed) >= 0 ? 'text-green-500' : 'text-red-500')}>
                                {diet?.target_calories - diet?.consumed || 0}
                            </p>
                            <p className="text-[7px] font-bold text-muted-foreground">kcal</p>
                        </div>
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-2">
                        <div className="bg-blue-500/10 rounded-xl p-2 text-center">
                            <p className="text-[7px] font-black uppercase text-blue-500 mb-0.5">Protein</p>
                            <p className="text-[11px] font-black italic text-foreground">{diet?.protein || 0}g</p>
                        </div>
                        <div className="bg-yellow-500/10 rounded-xl p-2 text-center">
                            <p className="text-[7px] font-black uppercase text-yellow-500 mb-0.5">Carbs</p>
                            <p className="text-[11px] font-black italic text-foreground">{diet?.carbs || 0}g</p>
                        </div>
                        <div className="bg-pink-500/10 rounded-xl p-2 text-center">
                            <p className="text-[7px] font-black uppercase text-pink-500 mb-0.5">Fat</p>
                            <p className="text-[11px] font-black italic text-foreground">{diet?.fat || 0}g</p>
                        </div>
                    </div>
                </div>

                {/* Expenses Card */}
                <div className="bg-card border border-border rounded-3xl p-5">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center">
                            <Wallet className="w-6 h-6 text-red-500" />
                        </div>
                        <div>
                            <h3 className="text-[12px] font-black uppercase italic text-foreground">Budget</h3>
                            <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">
                                {expenses?.has_plan ? expenses.plan_name : 'No active plan'}
                            </p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-secondary/30 rounded-2xl p-3 text-center">
                            <p className="text-[7px] font-black uppercase text-muted-foreground mb-1">Spent</p>
                            <p className="text-[16px] font-black italic text-foreground">₹{(expenses?.spent || 0).toLocaleString()}</p>
                        </div>
                        <div className="bg-secondary/30 rounded-2xl p-3 text-center">
                            <p className="text-[7px] font-black uppercase text-muted-foreground mb-1">Remaining</p>
                            <p className={cn("text-[16px] font-black italic", (expenses?.remaining || 0) >= 0 ? 'text-green-500' : 'text-red-500')}>
                                ₹{Math.abs(expenses?.remaining || 0).toLocaleString()}
                            </p>
                        </div>
                    </div>
                    <div className="mt-4">
                        <div className="flex justify-between text-[8px] font-black uppercase mb-1">
                            <span className="text-muted-foreground">Budget Used</span>
                            <span className={getProgressColor(expenses?.progress)}>₹{(expenses?.budget || 0).toLocaleString()}</span>
                        </div>
                        <div className="h-2 bg-secondary/50 rounded-full overflow-hidden">
                            <div 
                                className={cn("h-full rounded-full transition-all", getProgressBg(expenses?.progress))}
                                style={{ width: `${Math.min(expenses?.progress || 0, 100)}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Quick Stats Card */}
                <div className="bg-gradient-to-br from-primary to-primary/70 border border-primary/20 rounded-3xl p-5 text-white">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-[12px] font-black uppercase italic">Quick Stats</h3>
                            <p className="text-[8px] font-bold text-white/70 uppercase tracking-widest">This Month</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white/10 rounded-2xl p-3 text-center backdrop-blur-sm">
                            <Zap className="w-4 h-4 text-yellow-300 mx-auto mb-1" />
                            <p className="text-[16px] font-black italic">{fitness?.streak || 0}</p>
                            <p className="text-[7px] font-black uppercase text-white/70">Day Streak</p>
                        </div>
                        <div className="bg-white/10 rounded-2xl p-3 text-center backdrop-blur-sm">
                            <Target className="w-4 h-4 text-green-300 mx-auto mb-1" />
                            <p className="text-[16px] font-black italic">{Math.round((overall?.progress || 0))}%</p>
                            <p className="text-[7px] font-black uppercase text-white/70">Overall</p>
                        </div>
                        <div className="bg-white/10 rounded-2xl p-3 text-center backdrop-blur-sm col-span-2">
                            <p className="text-[7px] font-black uppercase text-white/70 mb-1">Today's Spending</p>
                            <p className="text-lg font-black italic">₹{(expenses?.spent_today || 0).toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Overview;