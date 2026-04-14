import React from 'react';
import { Flame, Beef, Wheat, Droplets } from 'lucide-react';
import { cn } from '../../../../lib/utils';

const MACROS = [
    { key: 'calories', label: 'Calories', icon: Flame, unit: 'kcal', color: 'orange' },
    { key: 'protein', label: 'Protein', icon: Beef, unit: 'g', color: 'blue' },
    { key: 'carbs', label: 'Carbs', icon: Wheat, unit: 'g', color: 'amber' },
    { key: 'fats', label: 'Fats', icon: Droplets, unit: 'g', color: 'rose' },
];

const COLOR_MAP = {
    orange: { bg: 'bg-orange-500/10', text: 'text-orange-500', bar: 'bg-orange-500', card: 'bg-orange-500/5' },
    blue: { bg: 'bg-blue-500/10', text: 'text-blue-500', bar: 'bg-blue-500', card: 'bg-blue-500/5' },
    amber: { bg: 'bg-amber-500/10', text: 'text-amber-500', bar: 'bg-amber-500', card: 'bg-amber-500/5' },
    rose: { bg: 'bg-rose-500/10', text: 'text-rose-500', bar: 'bg-rose-500', card: 'bg-rose-500/5' },
};

const MacroCard = ({ label, icon: Icon, consumed, target, unit, color }) => {
    const colors = COLOR_MAP[color];
    const pct = target > 0 ? Math.min((consumed / target) * 100, 100) : 0;

    return (
        <div className={cn("px-3 py-3 rounded-xl border border-border/50 min-w-0", colors.card)}>
            <div className="flex items-center gap-2 mb-2">
                <div className={cn("w-6 h-6 rounded-md flex items-center justify-center shrink-0", colors.bg)}>
                    <Icon className={cn("w-3 h-3", colors.text)} />
                </div>
                <span className="text-[7px] font-black uppercase tracking-widest text-muted-foreground leading-none">
                    {label}
                </span>
            </div>
            <div className="mb-2">
                <span className="text-[15px] font-black text-foreground leading-none">
                    {consumed}
                </span>
                <span className="text-[9px] font-bold text-muted-foreground ml-1">
                    / {target}{unit}
                </span>
            </div>
            {/* Progress bar */}
            <div className="w-full h-1.5 bg-secondary/40 rounded-full overflow-hidden">
                <div
                    className={cn("h-full rounded-full transition-all duration-500", colors.bar)}
                    style={{ width: `${pct}%` }}
                />
            </div>
        </div>
    );
};

const MacroSummary = ({ consumed, plan }) => {
    const targets = {
        calories: plan?.target_calories || 0,
        protein: plan?.target_protein || 0,
        carbs: plan?.target_carbs || 0,
        fats: plan?.target_fats || 0,
    };

    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {MACROS.map(({ key, label, icon, unit, color }) => (
                <MacroCard
                    key={key}
                    label={label}
                    icon={icon}
                    consumed={consumed[key] || 0}
                    target={targets[key]}
                    unit={unit}
                    color={color}
                />
            ))}
        </div>
    );
};

export default MacroSummary;
