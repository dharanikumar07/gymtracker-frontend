import React, { useState, useEffect, useMemo } from 'react';
import { 
    ClipboardList, 
    Save, 
    Loader2, 
    Utensils,
    Plus,
    UtensilsCrossed,
    Flame,
    Beef,
    Wheat,
    Droplets,
    Target,
    X
} from 'lucide-react';
import { cn } from '../../../../lib/utils';
import { Button } from "../../../../components/ui/button";
import DietMealItem from './DietMealItem';
import { useDeleteMealSlotMutation } from '../http/queries';

const DAYS_LONG = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DAYS_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

const NutritionStat = ({ label, current, target, unit, icon: Icon, colorClass }) => {
    // Map text colors to their corresponding background colors
    const colorMap = {
        'text-orange-500': 'bg-orange-500',
        'text-blue-500': 'bg-blue-500',
        'text-amber-500': 'bg-amber-500',
        'text-rose-500': 'bg-rose-500'
    };
    
    const bgColor = colorMap[colorClass] || 'bg-primary';
    const bgLight = bgColor + '/10';

    const currentVal = Number(current) || 0;
    const targetVal = Number(target) || 0;
    const percentage = targetVal > 0 ? Math.min((currentVal / targetVal) * 100, 100) : 0;
    
    return (
        <div className="flex-1 min-w-[100px] p-3 rounded-2xl bg-secondary/10 border border-border/50">
            <div className="flex items-center gap-2 mb-2">
                <div className={cn("w-6 h-6 rounded-lg flex items-center justify-center shrink-0", bgLight)}>
                    <Icon className={cn("w-3.5 h-3.5", colorClass)} />
                </div>
                <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">{label}</span>
            </div>
            
            <div className="flex items-baseline gap-1 mb-2">
                <span className="text-[14px] font-black text-foreground leading-none">{Math.round(currentVal)}</span>
                <span className="text-[8px] font-bold text-muted-foreground leading-none">/ {targetVal}{unit}</span>
            </div>

            <div className="h-1.5 w-full bg-secondary/30 rounded-full overflow-hidden">
                <div 
                    className={cn("h-full rounded-full transition-all duration-500", bgColor)}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
};

const ConfirmSwitchModal = ({ isOpen, onConfirm, onDiscard, onCancel, targetDay }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300" onClick={onCancel} />
            <div className="relative bg-card border border-border rounded-[2rem] shadow-2xl w-full max-w-[380px] overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Close Button */}
                <button 
                    onClick={onCancel}
                    className="absolute top-5 right-5 text-red-500 hover:text-red-600 transition-colors z-10"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="p-8 space-y-6">
                    <div className="space-y-2">
                        <h3 className="text-[18px] font-black uppercase tracking-tight text-foreground">Unsaved Changes</h3>
                        <p className="text-[11px] font-bold text-muted-foreground tracking-wider leading-relaxed">
                            You have unsaved changes for the current day. Would you like to save them before switching to <span className="text-primary">{targetDay}</span>?
                        </p>
                    </div>

                    <div className="flex flex-row gap-2 pt-2">
                        <Button 
                            onClick={onDiscard}
                            variant="outline"
                            className="flex-1 h-8 rounded-xl text-[8px] sm:text-[10px] font-black uppercase tracking-widest border-red-500/20 text-red-500 hover:bg-red-500/5 hover:border-red-500/40"
                        >
                            Discard
                        </Button>
                        <Button 
                            onClick={onConfirm}
                            variant="green"
                            className="flex-1 h-8 rounded-xl text-[8px] sm:text-[10px] font-black uppercase tracking-widest shadow-lg shadow-green-500/10"
                        >
                            Save & Continue
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const DietRoutineCard = ({ routine, onSave, isSaving, planUuid }) => {
    const [activeDayIndex, setActiveDayIndex] = useState(0); 
    const [localRoutine, setLocalRoutine] = useState({});
    const [hasChanges, setHasChanges] = useState(false);
    const [expandedIndex, setExpandedIndex] = useState(null); 
    const [pendingDayIndex, setPendingDayIndex] = useState(null); 

    const deleteMutation = useDeleteMealSlotMutation(planUuid);

    const availableUnits = routine?.available_weighted_units || [];

    useEffect(() => {
        if (routine?.routine) {
            setLocalRoutine(routine.routine);
            setHasChanges(false);
        }
    }, [routine]);

    const activeDayKey = DAY_KEYS[activeDayIndex];
    const activeDayName = DAYS_LONG[activeDayIndex];
    const currentMeals = localRoutine[activeDayKey] || [];

    const handleDaySwitch = (idx) => {
        if (idx === activeDayIndex) return;
        if (hasChanges) {
            setPendingDayIndex(idx);
        } else {
            setActiveDayIndex(idx);
            setExpandedIndex(null);
        }
    };

    const confirmSaveAndSwitch = async () => {
        // Only send the data for the current active day
        await onSave({
            plan_uuid: planUuid,
            routine: {
                [activeDayKey]: currentMeals
            }
        });
        
        if (pendingDayIndex !== null) {
            setActiveDayIndex(pendingDayIndex);
            setPendingDayIndex(null);
            setExpandedIndex(null);
            setHasChanges(false);
        }
    };

    const discardAndSwitch = () => {
        if (routine?.routine) {
            setLocalRoutine(routine.routine);
        }
        if (pendingDayIndex !== null) {
            setActiveDayIndex(pendingDayIndex);
            setPendingDayIndex(null);
            setExpandedIndex(null);
            setHasChanges(false);
        }
    };

    // Calculate totals for the selected day from the meals
    const dailyTotals = useMemo(() => {
        return currentMeals.reduce((acc, meal) => {
            acc.calories += Number(meal.calories || 0);
            acc.protein += Number(meal.protein || 0);
            acc.carbs += Number(meal.carbs || 0);
            acc.fats += Number(meal.fats || 0);
            return acc;
        }, { calories: 0, protein: 0, carbs: 0, fats: 0 });
    }, [currentMeals]);

    const targets = routine?.routine?.total_targets || routine?.total_targets || { calories: 0, protein: 0, carbs: 0, fats: 0 };

    const handleUpdateMeal = (index, updatedItem) => {
        setLocalRoutine(prev => {
            const newDayMeals = [...(prev[activeDayKey] || [])];
            newDayMeals[index] = updatedItem;
            return { ...prev, [activeDayKey]: newDayMeals };
        });
        setHasChanges(true);
    };

    const handleAddMeal = () => {
        const newMeal = {
            meal_name: '',
            time_period: 'breakfast',
            day: activeDayKey,
            food_data: [],
            calories: 0,
            protein: 0,
            carbs: 0,
            fats: 0
        };
        
        setLocalRoutine(prev => ({
            ...prev,
            [activeDayKey]: [newMeal, ...(prev[activeDayKey] || [])]
        }));
        
        setHasChanges(true);
        setExpandedIndex(0); 
    };

    const handleDeleteMeal = (index) => {
        const mealToDelete = currentMeals[index];
        
        // If the meal has a UUID, it exists in the database, so hit the API
        if (mealToDelete?.uuid) {
            deleteMutation.mutate(mealToDelete.uuid);
        } else {
            // Otherwise just remove it from local state
            setLocalRoutine(prev => ({
                ...prev,
                [activeDayKey]: prev[activeDayKey].filter((_, i) => i !== index)
            }));
            setHasChanges(true);
        }
        setExpandedIndex(null);
    };

    const handleSave = () => {
        // Only send the data for the current active day
        onSave({
            plan_uuid: planUuid,
            routine: {
                [activeDayKey]: currentMeals
            }
        });
        setHasChanges(false);
    };

    return (
        <div className="space-y-4">
            <ConfirmSwitchModal 
                isOpen={pendingDayIndex !== null}
                targetDay={pendingDayIndex !== null ? DAYS_LONG[pendingDayIndex] : ''}
                onConfirm={confirmSaveAndSwitch}
                onDiscard={discardAndSwitch}
                onCancel={() => setPendingDayIndex(null)}
            />

            {/* Header & Day Selector */}
            <div className="bg-card border border-border rounded-2xl shadow-sm p-4 space-y-4">
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <ClipboardList className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-primary" />
                        </div>
                        <h3 className="text-[10px] sm:text-[13px] font-black uppercase italic tracking-tight text-foreground truncate">Weekly Diet Setup</h3>
                    </div>

                    <Button
                        onClick={handleSave}
                        disabled={isSaving || !hasChanges}
                        variant="green"
                        size="compact"
                        className="gap-1.5 rounded-xl h-7 sm:h-8 px-2 sm:px-4 w-fit shrink-0"
                    >
                        {isSaving ? <Loader2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 animate-spin" /> : <Save className="w-2.5 h-2.5 sm:w-3 sm:h-3" />}
                        <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-white whitespace-nowrap">
                            {isSaving ? 'Saving...' : (
                                <>Save<span className="hidden sm:inline"> Changes</span></>
                            )}
                        </span>
                    </Button>
                </div>

                <div className="grid grid-cols-7 gap-1.5 p-1 bg-secondary/30 rounded-2xl">
                    {DAY_KEYS.map((key, idx) => {
                        const isActive = activeDayIndex === idx;
                        const hasItems = localRoutine[key]?.length > 0;
                        
                        return (
                            <button 
                                key={key} 
                                onClick={() => handleDaySwitch(idx)}
                                className={cn(
                                    "py-3 rounded-xl text-[9px] font-black uppercase tracking-tight transition-all flex flex-col items-center gap-1.5 relative",
                                    isActive 
                                        ? "bg-primary text-white shadow-lg shadow-primary/20 scale-105 z-10" 
                                        : "text-muted-foreground hover:bg-secondary/50"
                                )}
                            >
                                <span>{DAYS_SHORT[idx]}</span>
                                {hasItems && (
                                    <div className={cn(
                                        "w-1 h-1 rounded-full",
                                        isActive ? "bg-white" : "bg-primary"
                                    )} />
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Targeted Nutrition Comparison */}
                <div className="pt-4 border-t border-border/50">
                    <div className="flex items-center gap-2 mb-3">
                        <Target className="w-3 h-3 text-muted-foreground" />
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground leading-none">
                            Daily Target Alignment
                        </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <NutritionStat 
                            label="Calories" 
                            current={dailyTotals.calories} 
                            target={targets.calories} 
                            unit="kcal" 
                            icon={Flame} 
                            colorClass="text-orange-500" 
                        />
                        <NutritionStat 
                            label="Protein" 
                            current={dailyTotals.protein} 
                            target={targets.protein} 
                            unit="g" 
                            icon={Beef} 
                            colorClass="text-blue-500" 
                        />
                        <NutritionStat 
                            label="Carbs" 
                            current={dailyTotals.carbs} 
                            target={targets.carbs} 
                            unit="g" 
                            icon={Wheat} 
                            colorClass="text-amber-500" 
                        />
                        <NutritionStat 
                            label="Fats" 
                            current={dailyTotals.fats} 
                            target={targets.fats} 
                            unit="g" 
                            icon={Droplets} 
                            colorClass="text-rose-500" 
                        />
                    </div>
                </div>
            </div>

            {/* Meals List Header */}
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2.5">
                    <span className="text-[10px] font-black uppercase tracking-[0.15em] text-foreground opacity-60">{activeDayName}'s Meals</span>
                    {currentMeals.length > 0 && (
                        <span className="px-1.5 py-0.5 bg-secondary text-[8px] font-black rounded-md text-muted-foreground">
                            {currentMeals.length}
                        </span>
                    )}
                </div>
                <Button 
                    onClick={handleAddMeal}
                    size="compact"
                    className="h-8 gap-1.5 rounded-xl bg-primary text-white hover:bg-primary/90 shadow-md shadow-primary/10"
                >
                    <Plus className="w-3.5 h-3.5" /> 
                    <span className="text-[10px] font-black uppercase tracking-widest">Add Meal</span>
                </Button>
            </div>

            {/* Meals List */}
            <div className="space-y-3">
                {currentMeals.length > 0 ? (
                    currentMeals.map((meal, index) => (
                        <DietMealItem
                            key={meal.uuid || `meal-${activeDayKey}-${index}`}
                            item={meal}
                            index={index}
                            onUpdate={handleUpdateMeal}
                            onDelete={handleDeleteMeal}
                            isExpanded={expandedIndex === index}
                            onToggleExpand={() => setExpandedIndex(expandedIndex === index ? null : index)}
                            units={availableUnits}
                        />
                    ))
                ) : (
                    <div className="bg-secondary/5 border-2 border-dashed border-border rounded-[2.5rem] p-12 flex flex-col items-center text-center">
                        <UtensilsCrossed className="w-10 h-10 text-muted-foreground/20 mb-4" />
                        <h4 className="text-[12px] font-black uppercase text-foreground mb-1">Rest / Free Day</h4>
                        <p className="text-[9px] text-muted-foreground max-w-[200px] leading-relaxed font-bold uppercase tracking-tight mb-6">
                            No meals planned for {activeDayName}.
                        </p>
                        <Button 
                            onClick={handleAddMeal}
                            variant="outline"
                            className="h-10 rounded-xl gap-2 border-primary/20 hover:border-primary/50 text-primary font-black uppercase tracking-widest text-[10px]"
                        >
                            <Plus className="w-4 h-4" />
                            Initialize Day
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DietRoutineCard;
