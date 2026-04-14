import React, { useState } from 'react';
import { Coffee, Sun, Moon, Cookie, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '../../../../lib/utils';
import FoodItem from './FoodItem';

const MEAL_CONFIG = {
    breakfast: { label: 'Breakfast', icon: Coffee, iconBg: 'bg-orange-500/10', iconColor: 'text-orange-500' },
    lunch: { label: 'Lunch', icon: Sun, iconBg: 'bg-yellow-500/10', iconColor: 'text-yellow-500' },
    dinner: { label: 'Dinner', icon: Moon, iconBg: 'bg-purple-500/10', iconColor: 'text-purple-500' },
    snack: { label: 'Snack', icon: Cookie, iconBg: 'bg-pink-500/10', iconColor: 'text-pink-500' },
};

const MealSection = ({ mealType, items }) => {
    const [expanded, setExpanded] = useState(true);
    const config = MEAL_CONFIG[mealType] || MEAL_CONFIG.breakfast;
    const MealIcon = config.icon;

    const loggedCount = items.filter(item => item.logged).length;
    const totalCount = items.length;

    if (totalCount === 0) return null;

    // Calculate meal totals from prescribed
    const mealCalories = items.reduce((sum, item) => {
        const cals = item.logged?.calories || item.prescribed?.calories || 0;
        return sum + cals;
    }, 0);

    return (
        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
            {/* Header */}
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center justify-between p-4 hover:bg-secondary/10 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", config.iconBg)}>
                        <MealIcon className={cn("w-4.5 h-4.5", config.iconColor)} />
                    </div>
                    <div className="text-left">
                        <h3 className="text-[12px] font-black uppercase tracking-tight text-foreground">
                            {config.label}
                        </h3>
                        <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">
                            {totalCount} item{totalCount !== 1 ? 's' : ''} · {mealCalories} kcal
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {loggedCount > 0 ? (
                        <span className={cn(
                            "text-[9px] font-bold px-2 py-0.5 rounded-full",
                            loggedCount === totalCount
                                ? "bg-primary/10 text-primary"
                                : "bg-amber-500/10 text-amber-600"
                        )}>
                            {loggedCount}/{totalCount}
                        </span>
                    ) : null}
                    {expanded
                        ? <ChevronUp className="w-4 h-4 text-muted-foreground/40" />
                        : <ChevronDown className="w-4 h-4 text-muted-foreground/40" />
                    }
                </div>
            </button>

            {/* Food items */}
            {expanded ? (
                <div className="px-4 pb-4 space-y-2 border-t border-border/30 pt-3">
                    {items.map((item) => (
                        <FoodItem key={item.diet_plan_item_uuid} item={item} />
                    ))}
                </div>
            ) : null}
        </div>
    );
};

export default MealSection;
