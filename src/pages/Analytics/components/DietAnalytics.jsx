import React from 'react';
import { useState } from 'react';
import { UtensilsCrossed, Flame, Loader2, Coffee, Sun, Moon, Cookie } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { useDietQuery } from '../http/queries';

const getMealIcon = (mealType) => {
    switch (mealType?.toLowerCase()) {
        case 'breakfast': return <Coffee className="w-4 h-4" />;
        case 'lunch': return <Sun className="w-4 h-4" />;
        case 'dinner': return <Moon className="w-4 h-4" />;
        case 'snack': return <Cookie className="w-4 h-4" />;
        default: return <UtensilsCrossed className="w-4 h-4" />;
    }
};

const Diet = () => {
    const [period, setPeriod] = useState('week');
    const { data, isLoading } = useDietQuery(period);
    const dietData = data?.data;

    if (isLoading && !dietData) return <div className="flex items-center justify-center h-40"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

    const targets = dietData?.active_plan?.targets || {};

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
                    <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center">
                        <Flame className="w-6 h-6 text-green-500" />
                    </div>
                    <div>
                        <h3 className="text-[12px] font-black uppercase italic text-foreground">Today's Nutrition</h3>
                        <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">{dietData?.active_plan?.name || 'No active plan'}</p>
                    </div>
                </div>

                <div className="flex items-center justify-center mb-4">
                    <div className="relative w-32 h-32">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="64" cy="64" r="56" strokeWidth="10" stroke="currentColor" className="text-secondary" fill="none" />
                            <circle cx="64" cy="64" r="56" strokeWidth="10" strokeLinecap="round" stroke="currentColor" className="text-green-500 transition-all duration-1000" fill="none" strokeDasharray={`${(dietData?.today?.calories / targets.calories * 352) || 0} 352`} />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-2xl font-black italic text-foreground">{dietData?.today?.calories || 0}</span>
                            <span className="text-[7px] font-black uppercase text-muted-foreground">/ {targets.calories || 2000} kcal</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                    {[
                        { label: 'Protein', value: dietData?.today?.protein, target: targets.protein, color: 'blue' },
                        { label: 'Carbs', value: dietData?.today?.carbs, target: targets.carbs, color: 'yellow' },
                        { label: 'Fat', value: dietData?.today?.fat, target: targets.fat, color: 'pink' },
                    ].map((macro, i) => (
                        <div key={i} className="bg-secondary/30 rounded-2xl p-3 text-center">
                            <p className="text-[7px] font-black uppercase text-muted-foreground mb-1">{macro.label}</p>
                            <p className="text-[16px] font-black italic text-foreground">{macro.value || 0}g</p>
                            <p className="text-[7px] font-bold text-muted-foreground">/ {macro.target || 0}g</p>
                            <div className="h-1 bg-secondary/50 rounded-full mt-2 overflow-hidden">
                                <div className={cn("h-full rounded-full", `bg-${macro.color}-500`)} style={{ width: `${Math.min(((macro.value || 0) / (macro.target || 1)) * 100, 100)}%` }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Diet;
