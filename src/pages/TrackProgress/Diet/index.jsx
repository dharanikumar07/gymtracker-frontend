import React from 'react';
import { Loader2, UtensilsCrossed } from 'lucide-react';
import { format, isToday } from 'date-fns';
import { cn } from '../../../lib/utils';
import { DietProvider, useDiet } from './context/DietContext';
import DietPlanCard from './components/DietPlanCard';
import MacroSummary from './components/MacroSummary';
import MealSection from './components/MealSection';

// ─── Day Selector (reuses WorkoutLog pattern) ───
const DaySelector = () => {
    const { weekDates, selectedDate, setSelectedDate } = useDiet();
    const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

    return (
        <div className="grid grid-cols-7 gap-1.5">
            {weekDates.map((date, idx) => {
                const isSelected = format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
                const today = isToday(date);

                return (
                    <button
                        key={idx}
                        onClick={() => setSelectedDate(date)}
                        className={cn(
                            "flex flex-col items-center gap-0.5 py-2.5 rounded-xl transition-all relative",
                            isSelected
                                ? "bg-primary text-white shadow-sm"
                                : "text-muted-foreground hover:bg-secondary/50"
                        )}
                    >
                        <span className="text-[9px] font-black uppercase tracking-wider">
                            {DAY_LABELS[idx]}
                        </span>
                        <span className={cn(
                            "text-[13px] font-black leading-none",
                            isSelected ? "text-white" : "text-foreground"
                        )}>
                            {format(date, 'd')}
                        </span>
                        {today && !isSelected ? (
                            <div className="absolute bottom-1 w-1 h-1 rounded-full bg-primary" />
                        ) : null}
                    </button>
                );
            })}
        </div>
    );
};

// ─── Main Content ───
const DietContent = () => {
    const {
        plan,
        availablePlans,
        meals,
        consumed,
        isLoading,
        isFetching,
        selectedDay,
    } = useDiet();

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[300px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary/40" />
            </div>
        );
    }

    const hasMeals = Object.values(meals).some(items => items.length > 0);
    const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];

    return (
        <div className="space-y-4 pb-20 w-full mx-auto px-4 sm:px-6 lg:px-8">
            {/* Plan Card (always visible) */}
            <DietPlanCard plan={plan} availablePlans={availablePlans} />

            {/* Tracking section (only when plan exists) */}
            {plan ? (
                <>
                    {/* Day selector */}
                    <div className="bg-card border border-border rounded-2xl shadow-sm p-3">
                        <DaySelector />
                        {isFetching ? (
                            <div className="flex justify-center mt-2">
                                <div className="w-3 h-3 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                            </div>
                        ) : null}
                    </div>

                    {/* Macro summary */}
                    <MacroSummary consumed={consumed} plan={plan} />

                    {/* Meal sections */}
                    {hasMeals ? (
                        <div className="space-y-3">
                            {mealTypes.map(mealType => (
                                <MealSection
                                    key={mealType}
                                    mealType={mealType}
                                    items={meals[mealType] || []}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="bg-secondary/5 border border-border rounded-2xl p-10 flex flex-col items-center text-center">
                            <UtensilsCrossed className="w-6 h-6 text-muted-foreground/20 mb-2" />
                            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">
                                No meals for {selectedDay}
                            </p>
                            <p className="text-[9px] text-muted-foreground/60 mt-1">
                                This day has no items in your diet plan
                            </p>
                        </div>
                    )}
                </>
            ) : null}
        </div>
    );
};

const Diet = () => (
    <DietProvider>
        <DietContent />
    </DietProvider>
);

export default Diet;
