import React from 'react';
import { Dumbbell, UtensilsCrossed, Wallet, TrendingUp, Flame } from 'lucide-react';
import { cn } from '../../../lib/utils';

const getProgressColor = (percent) => percent >= 100 ? 'text-red-500' : percent >= 80 ? 'text-yellow-500' : 'text-green-500';
const getProgressBg = (percent) => percent >= 100 ? 'bg-red-500' : percent >= 80 ? 'bg-yellow-500' : 'bg-green-500';

const Overview = ({ data }) => {
    if (!data) return <div className="flex items-center justify-center h-40"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

    const { fitness, diet, expenses, overall } = data;

    return (
        <div className="space-y-4">
            <div className="bg-card border border-border rounded-3xl p-6">
                <div className="flex items-center justify-center">
                    <div className="relative w-40 h-40">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="80" cy="80" r="70" strokeWidth="12" stroke="currentColor" className="text-secondary" fill="none" />
                            <circle cx="80" cy="80" r="70" strokeWidth="12" strokeLinecap="round" stroke="currentColor"
                                className={cn("transition-all duration-1000", overall?.progress >= 80 ? 'text-green-500' : overall?.progress >= 50 ? 'text-yellow-500' : 'text-primary')}
                                fill="none" strokeDasharray={`${(overall?.progress || 0) * 4.4} 440`}
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-3xl font-black italic text-foreground">{overall?.progress || 0}%</span>
                            <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Overall</span>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-3 mt-4">
                    {[{ label: 'Fitness', data: fitness }, { label: 'Diet', data: diet }, { label: 'Budget', data: expenses }].map(({ label, data: item }) => (
                        <div key={label} className="text-center">
                            <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">{label}</p>
                            <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                                <div className={cn("h-full rounded-full transition-all", getProgressBg(item?.progress))} style={{ width: `${item?.progress || 0}%` }} />
                            </div>
                            <p className={cn("text-[11px] font-black italic mt-1", getProgressColor(item?.progress))}>{item?.progress || 0}%</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-card border border-border rounded-3xl p-5">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                            <Dumbbell className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-[12px] font-black uppercase italic text-foreground">Fitness</h3>
                            <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">{fitness?.has_plan ? fitness.plan_name : 'No active plan'}</p>
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
                    </div>
                </div>

                <div className="bg-card border border-border rounded-3xl p-5">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center">
                            <UtensilsCrossed className="w-6 h-6 text-green-500" />
                        </div>
                        <div>
                            <h3 className="text-[12px] font-black uppercase italic text-foreground">Diet</h3>
                            <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">{diet?.has_plan ? diet.plan_name : 'No active plan'}</p>
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
                            <p className={cn("text-[16px] font-black italic", (diet?.target_calories - diet?.consumed) >= 0 ? 'text-green-500' : 'text-red-500')}>{diet?.target_calories - diet?.consumed || 0}</p>
                            <p className="text-[7px] font-bold text-muted-foreground">kcal</p>
                        </div>
                    </div>
                </div>

                <div className="bg-card border border-border rounded-3xl p-5">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center">
                            <Wallet className="w-6 h-6 text-red-500" />
                        </div>
                        <div>
                            <h3 className="text-[12px] font-black uppercase italic text-foreground">Budget</h3>
                            <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">{expenses?.has_plan ? expenses.plan_name : 'No active plan'}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-secondary/30 rounded-2xl p-3 text-center">
                            <p className="text-[7px] font-black uppercase text-muted-foreground mb-1">Spent</p>
                            <p className="text-[16px] font-black italic text-foreground">₹{(expenses?.spent || 0).toLocaleString()}</p>
                        </div>
                        <div className="bg-secondary/30 rounded-2xl p-3 text-center">
                            <p className="text-[7px] font-black uppercase text-muted-foreground mb-1">Remaining</p>
                            <p className={cn("text-[16px] font-black italic", (expenses?.remaining || 0) >= 0 ? 'text-green-500' : 'text-red-500')}>₹{Math.abs(expenses?.remaining || 0).toLocaleString()}</p>
                        </div>
                    </div>
                </div>

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
                            <Flame className="w-4 h-4 text-yellow-300 mx-auto mb-1" />
                            <p className="text-[16px] font-black italic">{fitness?.streak || 0}</p>
                            <p className="text-[7px] font-black uppercase text-white/70">Day Streak</p>
                        </div>
                        <div className="bg-white/10 rounded-2xl p-3 text-center backdrop-blur-sm">
                            <TrendingUp className="w-4 h-4 text-green-300 mx-auto mb-1" />
                            <p className="text-[16px] font-black italic">{Math.round((overall?.progress || 0))}%</p>
                            <p className="text-[7px] font-black uppercase text-white/70">Overall</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Overview;
