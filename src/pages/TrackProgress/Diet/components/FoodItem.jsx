import React, { useState } from 'react';
import { Check, X, Loader2 } from 'lucide-react';
import { cn } from '../../../../lib/utils';
import { useDiet } from '../context/DietContext';

const FoodItem = ({ item }) => {
    const { saveLog, formattedDate } = useDiet();
    const prescribed = item.prescribed || {};
    const isLogged = !!item.logged;

    const [quantity, setQuantity] = useState(
        item.logged?.quantity || prescribed.quantity || 0
    );
    const [isSaving, setIsSaving] = useState(false);

    // Calculate scaled macros based on quantity vs prescribed quantity
    const scaleFactor = prescribed.quantity > 0 ? quantity / prescribed.quantity : 1;
    const scaledCalories = Math.round((prescribed.calories || 0) * scaleFactor);
    const scaledProtein = Math.round((prescribed.macros?.p || 0) * scaleFactor);
    const scaledCarbs = Math.round((prescribed.macros?.c || 0) * scaleFactor);
    const scaledFats = Math.round((prescribed.macros?.f || 0) * scaleFactor);

    const handleLog = () => {
        setIsSaving(true);
        saveLog([{
            diet_plan_item_uuid: item.diet_plan_item_uuid,
            actual_quantity: Number(quantity) || prescribed.quantity || 0,
            unit: prescribed.unit || 'g',
            calories: scaledCalories,
            protein: scaledProtein,
            carbs: scaledCarbs,
            fats: scaledFats,
            food_name: item.food_name,
        }], {
            onSettled: () => setIsSaving(false),
        });
    };

    return (
        <div className={cn(
            "p-3 rounded-xl transition-all",
            isLogged
                ? "bg-primary/5 border border-primary/15"
                : "bg-secondary/20 border border-transparent"
        )}>
            {/* Row 1: Food name + action */}
            <div className="flex items-center justify-between gap-2 mb-2">
                <div className="min-w-0">
                    <h4 className="text-[11px] font-bold text-foreground truncate">
                        {item.food_name}
                    </h4>
                    <span className="text-[9px] font-semibold text-muted-foreground">
                        {prescribed.quantity}{prescribed.unit}
                    </span>
                </div>

                <button
                    onClick={handleLog}
                    disabled={isSaving}
                    className={cn(
                        "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all",
                        isLogged
                            ? "bg-primary text-white"
                            : "border border-primary/30 text-primary/40 hover:bg-primary/5 hover:text-primary"
                    )}
                >
                    {isSaving ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                        <Check className="w-3.5 h-3.5" />
                    )}
                </button>
            </div>

            {/* Row 2: Quantity input (when not logged) or logged info */}
            {!isLogged ? (
                <>
                    {/* Prescribed macros */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <MacroPill label="P" value={prescribed.macros?.p || 0} />
                        <MacroPill label="C" value={prescribed.macros?.c || 0} />
                        <MacroPill label="F" value={prescribed.macros?.f || 0} />
                        <span className="text-[8px] font-bold text-muted-foreground/60 ml-auto">
                            {prescribed.calories || 0} kcal
                        </span>
                    </div>

                    {/* Editable quantity */}
                    <div className="flex items-center gap-2 mt-2">
                        <label className="text-[8px] font-bold uppercase text-muted-foreground tracking-wider shrink-0">
                            Qty:
                        </label>
                        <div className="relative flex-1 max-w-[120px]">
                            <input
                                type="number"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                className="w-full h-7 bg-background border border-border rounded-lg px-2 pr-6 text-[11px] font-bold text-center text-foreground outline-none focus:border-primary/50"
                            />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[8px] font-bold text-foreground/30 uppercase">
                                {prescribed.unit || 'g'}
                            </span>
                        </div>
                    </div>
                </>
            ) : (
                <>
                    {/* Logged values */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <MacroPill label="P" value={item.logged.macros?.p || 0} active />
                        <MacroPill label="C" value={item.logged.macros?.c || 0} active />
                        <MacroPill label="F" value={item.logged.macros?.f || 0} active />
                        <span className="text-[8px] font-bold text-primary/70 ml-auto">
                            {item.logged.calories || 0} kcal
                        </span>
                    </div>
                    <p className="text-[8px] font-semibold text-primary/50 mt-1">
                        Logged: {item.logged.quantity}{item.logged.unit}
                    </p>
                </>
            )}
        </div>
    );
};

const MacroPill = ({ label, value, active }) => (
    <span className={cn(
        "text-[8px] font-bold px-1.5 py-0.5 rounded",
        active
            ? "bg-primary/10 text-primary"
            : "bg-secondary/40 text-muted-foreground"
    )}>
        {label}: {value}g
    </span>
);

export default FoodItem;
