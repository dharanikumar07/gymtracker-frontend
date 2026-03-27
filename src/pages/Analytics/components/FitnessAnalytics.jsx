import React from 'react';
import { useState } from 'react';
import { Dumbbell, Flame, Target, TrendingUp, Loader2 } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { useFitnessQuery } from '../http/queries';

const Fitness = () => {
    const [period, setPeriod] = useState('week');
    const { data, isLoading } = useFitnessQuery(period);
    const fitnessData = data?.data;

    if (isLoading && !fitnessData) return <div className="flex items-center justify-center h-40"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

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
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <Dumbbell className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-[12px] font-black uppercase italic text-foreground">{fitnessData?.active_plan?.name || 'Fitness Analytics'}</h3>
                        <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">{period === 'week' ? 'This Week' : 'This Month'} Summary</p>
                    </div>
                </div>
                <div className="grid grid-cols-4 gap-3">
                    {[
                        { icon: Dumbbell, label: 'Workouts', value: fitnessData?.stats?.total_workouts || 0, color: 'text-primary' },
                        { icon: TrendingUp, label: 'Volume (kg)', value: (fitnessData?.stats?.total_volume || 0).toLocaleString(), color: 'text-green-500' },
                        { icon: Target, label: 'Total Reps', value: fitnessData?.stats?.total_reps || 0, color: 'text-orange-500' },
                        { icon: Flame, label: 'Avg Min', value: Math.round(fitnessData?.stats?.avg_duration || 0), color: 'text-red-500' },
                    ].map(({ icon: Icon, label, value, color }, i) => (
                        <div key={i} className="bg-secondary/30 rounded-2xl p-3 text-center">
                            <Icon className={cn("w-4 h-4 mx-auto mb-1", color)} />
                            <p className="text-[18px] font-black italic text-foreground">{value}</p>
                            <p className="text-[7px] font-black uppercase text-muted-foreground">{label}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-card border border-border rounded-3xl p-5">
                <h3 className="text-[11px] font-black uppercase italic text-foreground mb-4">Daily Activity</h3>
                <div className="flex items-end justify-between gap-2 h-32">
                    {fitnessData?.days?.map((day, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                            <div className="w-full flex items-end justify-center h-24">
                                <div className={cn(
                                    "w-full max-w-8 rounded-t-lg transition-all",
                                    day.is_today ? "bg-primary" : day.workouts > 0 ? "bg-primary/60" : "bg-secondary"
                                )} style={{ height: `${Math.max(day.workouts * 30, day.workouts > 0 ? 20 : 4)}%` }} />
                            </div>
                            <span className={cn("text-[7px] font-black uppercase", day.is_today ? "text-primary" : "text-muted-foreground")}>{day.day_name}</span>
                            <span className="text-[8px] font-bold text-muted-foreground">{day.workouts}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Fitness;
