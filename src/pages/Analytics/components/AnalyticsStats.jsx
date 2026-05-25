import React from 'react';
import { cn } from '../../../lib/utils';
export const SectionHeader = ({ icon: Icon, label }) => (
    <div className="flex items-center gap-2 px-1">
        <Icon className="w-3 h-3 text-muted-foreground" />
        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">{label}</span>
    </div>
);

export const StatCard = ({ icon: Icon, label, value, subValue, colorClass, trend }) => (
    
    <div className="bg-card border border-border/50 rounded-2xl p-4 flex flex-col gap-2 group hover:border-primary/20 transition-all shadow-sm">
        <div className="flex items-center justify-between mb-1">
            <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center transition-colors", colorClass)}>
                <Icon className="w-4 h-4" />
            </div>
            {trend && (
                <div className="text-[8px] font-black uppercase tracking-widest text-muted-foreground italic">
                    {trend}
                </div>
            )}
        </div>
        <div>
            <p className="text-[9px] font-black uppercase tracking-tight text-muted-foreground mb-0.5">{label}</p>
            <div className="flex items-baseline gap-2 flex-wrap">
                <h4 className="text-[15px] font-black tracking-tighter text-foreground truncate max-w-full">{value}</h4>
                {subValue && <span className="text-[8px] font-bold text-muted-foreground uppercase whitespace-nowrap">{subValue}</span>}
            </div>
        </div>
    </div>
);

export const ProgressCircle = ({ percentage, label, icon: Icon, colorClass, secondaryLabel }) => {
    const radius = 32;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className="flex items-center gap-5 p-4 rounded-3xl bg-secondary/10 border border-border/20">
            <div className="relative w-16 h-16 shrink-0">
                <svg className="w-full h-full transform -rotate-90">
                    <circle cx="32" cy="32" r={radius} stroke="currentColor" strokeWidth="4" fill="transparent" className="text-secondary" />
                    <circle 
                        cx="32" cy="32" r={radius} 
                        stroke="currentColor" strokeWidth="4" 
                        fill="transparent" 
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        className={cn("transition-all duration-1000", colorClass)} 
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <Icon className={cn("w-4 h-4", colorClass.replace('text-', 'text-'))} />
                </div>
            </div>
            <div className="min-w-0">
                <p className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-0.5">{label}</p>
                <h4 className="text-lg font-black text-foreground leading-none mb-1">{percentage}%</h4>
                <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest truncate">{secondaryLabel}</p>
            </div>
        </div>
    );
};
