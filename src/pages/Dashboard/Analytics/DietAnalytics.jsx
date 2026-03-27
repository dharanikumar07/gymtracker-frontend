import React from 'react';
import { 
    UtensilsCrossed,
    Flame,
    Loader2,
    Coffee,
    Sun,
    Moon,
    Cookie
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { useDietAnalyticsQuery } from './http/analyticsQueries';

const DietAnalytics = () => {
    const [period, setPeriod] = React.useState('week');
    const { data, isLoading } = useDietAnalyticsQuery(period);

    const dietData = data?.data;

    const getMealIcon = (mealType) => {
        switch (mealType?.toLowerCase()) {
            case 'breakfast': return <Coffee className="w-4 h-4" />;
            case 'lunch': return <Sun className="w-4 h-4" />;
            case 'dinner': return <Moon className="w-4 h-4" />;
            case 'snack': return <Cookie className="w-4 h-4" />;
            default: return <UtensilsCrossed className="w-4 h-4" />;
        }
    };

    if (isLoading && !dietData) {
        return (
            <div className="flex items-center justify-center h-40">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
        );
    }

    const targets = dietData?.active_plan?.targets || {};

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

            {/* Today's Nutrition */}
            <div className="bg-card border border-border rounded-3xl p-5">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center">
                        <Flame className="w-6 h-6 text-green-500" />
                    </div>
                    <div>
                        <h3 className="text-[12px] font-black uppercase italic text-foreground">Today's Nutrition</h3>
                        <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">
                            {dietData?.active_plan?.name || 'No active plan'}
                        </p>
                    </div>
                </div>

                {/* Calories Ring */}
                <div className="flex items-center justify-center mb-4">
                    <div className="relative w-32 h-32">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="64" cy="64" r="56" strokeWidth="10" stroke="currentColor" className="text-secondary" fill="none" />
                            <circle
                                cx="64"
                                cy="64"
                                r="56"
                                strokeWidth="10"
                                strokeLinecap="round"
                                stroke="currentColor"
                                className="text-green-500 transition-all duration-1000"
                                fill="none"
                                strokeDasharray={`${(dietData?.today?.calories / targets.calories * 352) || 0} 352`}
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-2xl font-black italic text-foreground">{dietData?.today?.calories || 0}</span>
                            <span className="text-[7px] font-black uppercase text-muted-foreground">/ {targets.calories || 2000} kcal</span>
                        </div>
                    </div>
                </div>

                {/* Macros */}
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { label: 'Protein', value: dietData?.today?.protein, target: targets.protein, color: 'blue' },
                        { label: 'Carbs', value: dietData?.today?.carbs, target: targets.carbs, color: 'yellow' },
                        { label: 'Fat', value: dietData?.today?.fat, target: targets.fat, color: 'pink' },
                    ].map((macro, i) => (
                        <div key={i} className="bg-secondary/30 rounded-2xl p-3 text-center">
                            <p className={cn("text-[7px] font-black uppercase text-muted-foreground mb-1")}>{macro.label}</p>
                            <p className="text-[16px] font-black italic text-foreground">{macro.value || 0}g</p>
                            <p className="text-[7px] font-bold text-muted-foreground">/ {macro.target || 0}g</p>
                            <div className="h-1 bg-secondary/50 rounded-full mt-2 overflow-hidden">
                                <div 
                                    className={cn("h-full rounded-full", `bg-${macro.color}-500`)}
                                    style={{ width: `${Math.min(((macro.value || 0) / (macro.target || 1)) * 100, 100)}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Weekly Trend */}
            <div className="bg-card border border-border rounded-3xl p-5">
                <h3 className="text-[11px] font-black uppercase italic text-foreground mb-4">Calorie Trend</h3>
                <div className="flex items-end justify-between gap-1 h-32">
                    {dietData?.days?.map((day, i) => {
                        const maxCal = Math.max(...(dietData.days.map(d => d.calories)), targets.calories || 1);
                        const height = (day.calories / maxCal) * 100;
                        return (
                            <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                <div className="w-full flex items-end justify-center h-24">
                                    <div 
                                        className={cn(
                                            "w-full max-w-6 rounded-t-lg transition-all",
                                            day.is_today 
                                                ? "bg-green-500" 
                                                : day.calories >= targets.calories 
                                                    ? "bg-green-500/60" 
                                                    : day.calories > 0 
                                                        ? "bg-green-500/30" 
                                                        : "bg-secondary"
                                        )}
                                        style={{ height: `${Math.max(height, day.calories > 0 ? 10 : 4)}%` }}
                                    />
                                </div>
                                <span className={cn(
                                    "text-[7px] font-black uppercase",
                                    day.is_today ? "text-green-500" : "text-muted-foreground"
                                )}>
                                    {day.day_name}
                                </span>
                            </div>
                        );
                    })}
                </div>
                {/* Target line */}
                <div className="relative h-0 mt-2">
                    <div className="absolute w-full border-t-2 border-dashed border-muted-foreground/30" style={{ top: `${100 - (targets.calories / Math.max(...(dietData?.days?.map(d => d.calories) || [1]), targets.calories || 1)) * 100}%` }} />
                    <span className="absolute right-0 -top-3 text-[6px] font-black text-muted-foreground">Target</span>
                </div>
            </div>

            {/* Meal Breakdown */}
            <div className="bg-card border border-border rounded-3xl p-5">
                <h3 className="text-[11px] font-black uppercase italic text-foreground mb-4">Meal Breakdown</h3>
                <div className="space-y-2">
                    {dietData?.meal_breakdown?.length > 0 ? dietData.meal_breakdown.map((meal, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-secondary/30 rounded-2xl">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                    {getMealIcon(meal.meal_type)}
                                </div>
                                <div>
                                    <p className="text-[11px] font-black text-foreground uppercase italic">{meal.meal_type}</p>
                                    <p className="text-[8px] font-bold text-muted-foreground">{meal.count} meals</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[14px] font-black italic text-foreground">{meal.calories.toLocaleString()}</p>
                                <p className="text-[8px] font-bold text-muted-foreground">kcal</p>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center py-8">
                            <UtensilsCrossed className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
                            <p className="text-[9px] font-black uppercase text-muted-foreground italic">No meal data</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DietAnalytics;