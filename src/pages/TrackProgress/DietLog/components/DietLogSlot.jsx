import React, { useState, useMemo } from 'react';
import { 
    Utensils,
    CheckCircle2,
    Edit3,
    Clock,
    Flame,
    FileText,
    Trash2,
    ChevronDown,
    ChevronUp,
    Plus,
    Save,
    SkipForward,
    X
} from 'lucide-react';
import { cn } from '../../../../lib/utils';
import { useDietLog } from '../context/DietLogContext';
import { validateDietLog, validateSkipField } from '../validation/validation';
import { toast } from 'sonner';
import FoodCombobox from '../../Diet/components/FoodCombobox';
import { Popover, PopoverTrigger, PopoverContent } from '../../../../components/ui/popover';
import DeleteConfirmModal from '../../../../components/ui/DeleteConfirmModal';

const TIME_PERIODS = [
    { value: 'breakfast', label: 'Breakfast' },
    { value: 'lunch', label: 'Lunch' },
    { value: 'dinner', label: 'Dinner' },
    { value: 'snack', label: 'Snack' },
    { value: 'pre-workout', label: 'Pre-Workout' },
    { value: 'post-workout', label: 'Post-Workout' }
];

const DietLogSlot = ({ meal, isPending, isCompleted }) => {
    const { saveLog, isSaving, activePlan, removeExtraMeal, deleteLog } = useDietLog();
    
    const [isEditing, setIsEditing] = useState(meal.isExtra || false);
    const [syncWithSetup, setSyncWithSetup] = useState(false);
    const [expandedIndex, setExpandedIndex] = useState(0);

    const [mealName, setMealName] = useState(meal.meal_name || '');
    const [timePeriod, setTimePeriod] = useState(meal.time_period || 'breakfast');
    const [isEaten, setIsEaten] = useState(meal.status === 'completed' || false);
    
    const [showSkipModal, setShowSkipModal] = useState(false);
    const [skipReason, setSkipReason] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Local state for food items with full editability
    const [localFoods, setLocalFoods] = useState(() => (meal.food_data || []).map(f => ({
        ...f,
        id: f.id || Math.random().toString(36).substr(2, 9),
        isNew: false,
        quantity: f.quantity || 0,
        calories: f.calories || 0,
        protein: f.protein || 0,
        carbs: f.carbs || 0,
        fats: f.fats || 0,
        nutrition_data: f.nutrition_data || '',
        ratio: {
            cal: (f.calories || 0) / (f.quantity || 1),
            pro: (f.protein || 0) / (f.quantity || 1),
            car: (f.carbs || 0) / (f.quantity || 1),
            fat: (f.fats || 0) / (f.quantity || 1),
        }
    })));

    const hasChangesForSync = useMemo(() => {
        if (meal.isExtra) return false;
        const hasNew = localFoods.some(f => f.isNew);
        const originalCount = (meal.food_data || []).length;
        const currentOriginalCount = localFoods.filter(f => !f.isNew).length;
        return hasNew || originalCount > currentOriginalCount;
    }, [localFoods, meal.food_data, meal.isExtra]);

    const mealTotals = useMemo(() => {
        const totals = localFoods.reduce((acc, food) => ({
            calories: acc.calories + (Number(food.calories) || 0),
            protein: acc.protein + (Number(food.protein) || 0),
            carbs: acc.carbs + (Number(food.carbs) || 0),
            fats: acc.fats + (Number(food.fats) || 0),
        }), { calories: 0, protein: 0, carbs: 0, fats: 0 });

        return {
            calories: Math.round(totals.calories),
            protein: Number(totals.protein.toFixed(2)),
            carbs: Number(totals.carbs.toFixed(2)),
            fats: Number(totals.fats.toFixed(2)),
        };
    }, [localFoods]);

    const [isAnimating, setIsAnimating] = useState(false);

    const triggerSync = (updatedFoods, extraPayload = {}) => {
        const totals = updatedFoods.reduce((acc, food) => ({
            calories: acc.calories + (Number(food.calories) || 0),
            protein: acc.protein + (Number(food.protein) || 0),
            carbs: acc.carbs + (Number(food.carbs) || 0),
            fats: acc.fats + (Number(food.fats) || 0),
        }), { calories: 0, protein: 0, carbs: 0, fats: 0 });

        saveLog([{
            meal_plan_uuid: meal.isExtra ? null : (meal.meal_plan_uuid || meal.uuid),
            uuid: (meal.meal_plan_uuid && !meal.isExtra) ? meal.uuid : null,
            meal_name: mealName,
            time_period: timePeriod,
            calories: Math.round(totals.calories),
            protein: Number(totals.protein.toFixed(2)),
            carbs: Number(totals.carbs.toFixed(2)),
            fats: Number(totals.fats.toFixed(2)),
            sync_with_setup: syncWithSetup,
            food_data: updatedFoods.map(({ ratio, isNew, id, ...rest }) => rest),
            type: meal.type || (meal.isExtra ? 'new' : 'template'),
            status: meal.isExtra ? (isEaten ? 'completed' : 'pending') : (extraPayload.status || 'completed'),
            ...extraPayload
        }]);
    };

    const handleUpdateFoodField = (index, field, value) => {
        setLocalFoods(prev => {
            const updated = prev.map((f, i) => {
                if (i !== index) return f;
                const updatedFood = { ...f, [field]: value };
                if (field === 'quantity' && !f.isNew) {
                    const qty = parseFloat(value) || 0;
                    updatedFood.calories = Math.round(qty * f.ratio.cal);
                    updatedFood.protein = Number((qty * f.ratio.pro).toFixed(2));
                    updatedFood.carbs = Number((qty * f.ratio.car).toFixed(2));
                    updatedFood.fats = Number((qty * f.ratio.fat).toFixed(2));
                }
                return updatedFood;
            });
            return updated;
        });
    };

    const handleAddIngredient = (food) => {
        const newId = Math.random().toString(36).substr(2, 9);
        const newFoods = [{
            ...food,
            id: newId,
            isNew: true,
            nutrition_data: food.nutrition_data || '',
            ratio: {
                cal: (food.calories || 0) / (food.quantity || 1),
                pro: (food.protein || 0) / (food.quantity || 1),
                car: (food.carbs || 0) / (food.quantity || 1),
                fat: (food.fats || 0) / (food.quantity || 1),
            }
        }, ...localFoods];
        setLocalFoods(newFoods);
        setExpandedIndex(0);
        setIsEditing(true);
    };

    const removeIngredient = (e, index) => {
        e.stopPropagation();
        const updatedFoods = localFoods.filter((_, i) => i !== index);
        setLocalFoods(updatedFoods);
        if (expandedIndex === index) setExpandedIndex(null);
        else if (expandedIndex > index) setExpandedIndex(expandedIndex - 1);

        if (isCompleted) {
            triggerSync(updatedFoods);
        }
    };

    const handleToggleComplete = () => {
        const validation = validateDietLog([mealTotals]);
        if (!validation.isValid) {
            toast.error(validation.message);
            return;
        }

        if (!mealName.trim()) {
            toast.error("Meal name is required");
            return;
        }

        setIsAnimating(true);
        setTimeout(() => {
            triggerSync(localFoods);
            setIsAnimating(false);
            setIsEditing(false);
        }, 600);
    };

    const confirmSkip = () => {
        const validation = validateSkipField(skipReason);
        if (!validation.isValid) {
            toast.error(validation.message);
            return;
        }

        triggerSync(localFoods, { status: 'skipped', reason: skipReason });
        setShowSkipModal(false);
    };

    const confirmDelete = () => {
        if (meal.uuid) {
            deleteLog(meal.uuid);
        }
        setShowDeleteConfirm(false);
    };

    const dietType = activePlan?.meta_data?.diet_preference || 'veg';
    const isSkipped = meal.status === 'skipped';

    if (isSkipped) {
        return (
            <div className="w-full bg-card/50 rounded-3xl border border-border/50 overflow-hidden shadow-sm hover:border-emerald-500/20 transition-all duration-300">
                <div className="flex items-start justify-between p-4 sm:p-5">
                    <div className="flex flex-col gap-2 min-w-0">
                        <div className="flex flex-col gap-1">
                            <h4 className="text-[14px] font-black uppercase tracking-tight text-foreground/40 truncate leading-none line-through">
                                {meal.meal_name}
                            </h4>
                            <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1">
                                <Clock className="w-2.5 h-2.5" />
                                {meal.time_period}
                            </span>
                        </div>
                        
                        {meal.reason && (
                            <div className="mt-1 flex gap-2 items-start bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-2.5">
                                <SkipForward className="w-3 h-3 text-emerald-600 shrink-0 mt-0.5" />
                                <p className="text-[10px] font-bold text-emerald-600/80 italic leading-tight">
                                    "{meal.reason}"
                                </p>
                            </div>
                        )}
                    </div>

                    <button 
                        onClick={() => setShowDeleteConfirm(true)}
                        className="w-8 h-8 flex items-center justify-center text-red-500 hover:text-red-700 transition-all shrink-0"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
                {showDeleteConfirm && (
                    <DeleteConfirmModal
                        title="Remove Log Entry?"
                        message={`Are you sure you want to delete the log for "${meal.meal_name}"?`}
                        onCancel={() => setShowDeleteConfirm(false)}
                        onConfirm={confirmDelete}
                    />
                )}
            </div>
        );
    }

    return (
        <div className={cn(
            "w-full bg-card rounded-3xl border border-border overflow-hidden transition-all duration-300 shadow-sm",
            isCompleted && !isEditing && "opacity-80"
        )}>
            {/* Slot Header */}
            <div className="flex items-center justify-between gap-4 p-4 sm:p-5 bg-secondary/5 border-b border-border/50">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className={cn(
                        "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-lg transition-all",
                        isCompleted ? "bg-emerald-600 shadow-emerald-600/20" : "bg-emerald-600 shadow-emerald-600/20"
                    )}>
                        <Utensils className="w-5 h-5 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                        {(isPending || isEditing) ? (
                            <div className="space-y-1">
                                <input 
                                    value={mealName}
                                    onChange={(e) => setMealName(e.target.value)}
                                    placeholder="Meal Name..."
                                    className="w-full bg-transparent border-none text-[15px] font-black uppercase tracking-tight text-foreground outline-none p-0 h-auto placeholder:text-foreground/20"
                                />
                                <div className="flex items-center gap-2">
                                    <Clock className="w-2.5 h-2.5 text-foreground/40" />
                                    {meal.isExtra ? (
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <button className="text-[10px] font-black text-foreground/60 dark:text-foreground/80 uppercase tracking-widest outline-none p-0 cursor-pointer hover:text-emerald-600 transition-colors">
                                                    {TIME_PERIODS.find(p => p.value === timePeriod)?.label || timePeriod}
                                                </button>
                                            </PopoverTrigger>
                                            <PopoverContent align="start" className="w-[180px] p-2 bg-card border-border rounded-2xl shadow-2xl">
                                                <div className="flex flex-col gap-1">
                                                    {TIME_PERIODS.map((period) => (
                                                        <button
                                                            key={period.value}
                                                            onClick={() => setTimePeriod(period.value)}
                                                            className={cn(
                                                                "w-full px-3 py-2 text-left rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                                                timePeriod === period.value 
                                                                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20" 
                                                                    : "text-foreground/60 hover:bg-secondary/80 hover:text-foreground"
                                                            )}
                                                        >
                                                            {period.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </PopoverContent>
                                        </Popover>
                                    ) : (
                                        <span className="text-[10px] font-black text-foreground/60 dark:text-foreground/80 uppercase tracking-widest">
                                            {timePeriod}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <>
                                <h4 className={cn(
                                    "text-[15px] font-black uppercase tracking-tight truncate leading-none mb-1",
                                    isCompleted ? "text-emerald-600" : "text-foreground"
                                )}>
                                    {mealName}
                                </h4>
                                <span className="text-[10px] font-black text-foreground/60 dark:text-foreground/80 uppercase tracking-widest flex items-center gap-1">
                                    <Clock className="w-2.5 h-2.5" />
                                    {timePeriod}
                                </span>
                            </>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Sync Toggle */}
                    {(isPending || isEditing) && hasChangesForSync && (
                        <div className="flex items-center gap-2">
                            <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest min-w-[36px] text-right">
                                Sync
                            </span>
                            <button 
                                onClick={() => setSyncWithSetup(!syncWithSetup)}
                                className={cn(
                                    "relative inline-flex h-4.5 w-8 shrink-0 cursor-pointer items-center rounded-full transition-colors",
                                    syncWithSetup ? "bg-emerald-600" : "bg-secondary"
                                )}
                            >
                                <span className={cn(
                                    "pointer-events-none block h-3.5 w-3.5 rounded-full bg-white shadow-lg transition-transform",
                                    syncWithSetup ? "translate-x-4" : "translate-x-0.5"
                                )} />
                            </button>
                        </div>
                    )}

                    {/* Action Icons */}
                    {isPending && (
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => setShowSkipModal(true)}
                                className="w-8 h-8 flex items-center justify-center text-orange-500 hover:text-orange-600 hover:bg-orange-500/5 rounded-lg transition-all"
                            >
                                <SkipForward className="w-4 h-4" />
                            </button>
                            {meal.isExtra && (
                                <button 
                                    onClick={() => removeExtraMeal(meal.uuid)}
                                    className="w-8 h-8 flex items-center justify-center text-red-500 hover:text-red-700 transition-all"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    )}

                    {!isPending && (
                        <button 
                            onClick={() => setShowDeleteConfirm(true)}
                            className="w-8 h-8 flex items-center justify-center text-red-500 hover:text-red-700 transition-all shrink-0"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}

                    {!isEditing && isCompleted && (
                        <button 
                            onClick={() => setIsEditing(true)}
                            className="w-8 h-8 flex items-center justify-center text-foreground/40 hover:text-foreground transition-all"
                        >
                            <Edit3 className="w-4 h-4" />
                        </button>
                    )}
                    
                    {(isPending || isEditing) ? (
                        meal.isExtra ? (
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-[9px] font-black uppercase text-emerald-600 tracking-widest">
                                        Eaten
                                    </span>
                                    <button 
                                        onClick={() => setIsEaten(!isEaten)}
                                        className={cn(
                                            "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors shadow-lg",
                                            isEaten ? "bg-emerald-600" : "bg-secondary"
                                        )}
                                    >
                                        <span className={cn(
                                            "pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg transition-transform",
                                            isEaten ? "translate-x-4.5" : "translate-x-0.5"
                                        )} />
                                    </button>
                                </div>
                                
                                <button 
                                    onClick={handleToggleComplete}
                                    disabled={isSaving || isAnimating}
                                    className="h-8 px-3 flex items-center justify-center rounded-lg transition-all relative overflow-hidden min-w-[50px] bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 active:scale-95 group"
                                >
                                    {isAnimating ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="relative w-3 h-3">
                                                <svg className="absolute inset-0 w-full h-full -rotate-90">
                                                    <circle cx="6" cy="6" r="5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="32" className="animate-[drawCircle_0.6s_ease-out_forwards]" />
                                                </svg>
                                                <svg className="absolute inset-0 w-full h-full">
                                                    <path d="M4 6l1.5 1.5 3-3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="10" className="animate-[drawTick_0.3s_0.3s_ease-out_forwards]" />
                                                </svg>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1.5">
                                            <Save className="w-3 h-3" />
                                            <span className="text-[9px] font-black uppercase tracking-wider">Save</span>
                                        </div>
                                    )}
                                </button>
                            </div>
                        ) : (
                            <button 
                                onClick={handleToggleComplete}
                                disabled={isSaving || isAnimating}
                                className="h-7 px-3 flex items-center justify-center rounded-lg transition-all relative overflow-hidden min-w-[50px] bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 active:scale-95 group"
                            >
                                {isAnimating ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="relative w-3 h-3">
                                            <svg className="absolute inset-0 w-full h-full -rotate-90">
                                                <circle cx="6" cy="6" r="5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="32" className="animate-[drawCircle_0.6s_ease-out_forwards]" />
                                            </svg>
                                            <svg className="absolute inset-0 w-full h-full">
                                                <path d="M4 6l1.5 1.5 3-3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="10" className="animate-[drawTick_0.3s_0.3s_ease-out_forwards]" />
                                            </svg>
                                        </div>
                                    </div>
                                ) : (
                                    <span className="text-[9px] font-black uppercase tracking-wider">Done</span>
                                )}
                            </button>
                        )
                    ) : (
                        <div className="w-9 h-9 flex items-center justify-center text-emerald-600 bg-emerald-600/10 rounded-xl">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                    )}
                </div>
            </div>

            <div className="p-4 sm:p-5 space-y-6">
                {/* Total Summary */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <MacroTotal label="Total Cals" value={mealTotals.calories} icon={Flame} color="text-orange-500" unit="" />
                    <MacroTotal label="Protein" value={mealTotals.protein} color="text-blue-500" unit="g" />
                    <MacroTotal label="Carbs" value={mealTotals.carbs} color="text-amber-500" unit="g" />
                    <MacroTotal label="Fats" value={mealTotals.fats} color="text-rose-500" unit="g" />
                </div>

                {/* Ingredient Accordion */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/60 dark:text-foreground/80 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                            Ingredients
                        </h5>
                        
                        <FoodCombobox 
                            onSelect={handleAddIngredient} 
                            dietType={dietType}
                            renderTrigger={(onClick) => (
                                <button 
                                    onClick={onClick}
                                    className="flex items-center gap-1.5 h-7 px-3 rounded-lg bg-emerald-600 text-white text-[8px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/10"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>Add Ingredient</span>
                                </button>
                            )}
                        />
                    </div>
                    
                    <div className="space-y-3">
                        {localFoods.map((food, idx) => {
                            const isExpanded = expandedIndex === idx;
                            return (
                                <div key={food.id} className="bg-secondary/30 border border-border/40 rounded-3xl overflow-hidden transition-all duration-300">
                                    {/* Accordion Header - Reduced Padding */}
                                    <div 
                                        onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                                        className="p-2.5 flex flex-col gap-1.5 cursor-pointer hover:bg-emerald-600/5 transition-colors"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3 min-w-0">
                                                {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-emerald-600" /> : <ChevronDown className="w-3.5 h-3.5 text-foreground/30" />}
                                                <span className="text-[12px] font-black text-foreground uppercase tracking-tight truncate">
                                                    {food.name}
                                                </span>
                                            </div>
                                            
                                            <div className="flex items-center gap-1">
                                                <span className="text-[9px] font-black text-emerald-600 bg-emerald-600/10 px-2 py-0.5 rounded-lg whitespace-nowrap">
                                                    {food.calories} kcal
                                                </span>
                                                <button 
                                                    onClick={(e) => removeIngredient(e, idx)}
                                                    className="text-red-500 hover:text-red-500/60 transition-all p-1"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 pl-6.5">
                                            <HeaderMacro label="P" value={food.protein} color="text-blue-500" />
                                            <HeaderMacro label="C" value={food.carbs} color="text-amber-500" />
                                            <HeaderMacro label="F" value={food.fats} color="text-rose-500" />
                                        </div>
                                    </div>

                                    {/* Accordion Content */}
                                    {isExpanded && (
                                        <div className="px-5 pb-5 space-y-4 animate-in slide-in-from-top-1 duration-200 border-t border-border/20 pt-4">
                                            {/* Idea: Symmetrical 2-column then 3-column macros */}
                                            <div className="grid grid-cols-2 gap-4">
                                                <EditField label="Quantity" value={food.quantity} unit={food.unit} onChange={(val) => handleUpdateFoodField(idx, 'quantity', val)} disabled={!isEditing && isCompleted} />
                                                <EditField label="Calories" value={food.calories} unit="kcal" onChange={(val) => handleUpdateFoodField(idx, 'calories', val)} disabled={!isEditing && isCompleted} />
                                            </div>

                                            <div className="grid grid-cols-3 gap-3">
                                                <EditField label="Protein" value={food.protein} unit="g" onChange={(val) => handleUpdateFoodField(idx, 'protein', val)} disabled={!isEditing && isCompleted} />
                                                <EditField label="Carbs" value={food.carbs} unit="g" onChange={(val) => handleUpdateFoodField(idx, 'carbs', val)} disabled={!isEditing && isCompleted} />
                                                <EditField label="Fats" value={food.fats} unit="g" onChange={(val) => handleUpdateFoodField(idx, 'fats', val)} disabled={!isEditing && isCompleted} />
                                            </div>

                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-[9px] font-black uppercase tracking-widest text-foreground/40 px-1 flex items-center gap-1.5">
                                                    <FileText className="w-2.5 h-2.5" />
                                                    Nutritional Data
                                                </label>
                                                <textarea 
                                                    value={food.nutrition_data}
                                                    onChange={(e) => handleUpdateFoodField(idx, 'nutrition_data', e.target.value)}
                                                    disabled={!isEditing && isCompleted}
                                                    placeholder="Add extra info..."
                                                    className="w-full bg-background/50 border border-border/60 focus:border-emerald-600/50 rounded-2xl p-3 text-[11px] font-bold outline-none transition-all resize-none h-16 placeholder:text-foreground/10"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Skip Modal - Compact Shadcn-style */}
            {showSkipModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <div 
                        className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300" 
                        onClick={() => setShowSkipModal(false)}
                    />
                    <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-[340px] overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-5 space-y-4">
                            <div className="flex flex-col gap-1.5">
                                <h3 className="text-[14px] font-black uppercase tracking-tight text-foreground">Skip Meal</h3>
                                <p className="text-[11px] text-muted-foreground font-medium leading-relaxed">
                                    Provide a brief reason for skipping <span className="text-foreground font-bold">"{meal.meal_name}"</span>.
                                </p>
                            </div>
                            
                            <textarea 
                                autoFocus
                                placeholder="e.g. Not hungry, ate out..."
                                className="w-full h-24 bg-secondary/20 border border-border rounded-xl p-3 text-[12px] font-bold outline-none focus:border-emerald-600/50 transition-all resize-none placeholder:text-foreground/20"
                                value={skipReason}
                                onChange={(e) => setSkipReason(e.target.value)}
                            />
                        </div>
                        
                        <div className="flex border-t border-border divide-x divide-border">
                            <button 
                                onClick={() => setShowSkipModal(false)} 
                                className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest text-foreground/40 hover:bg-secondary/50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={confirmSkip} 
                                className="flex-1 py-3 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-600 hover:text-white text-[10px] font-black uppercase tracking-widest transition-all"
                            >
                                Skip Meal
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <DeleteConfirmModal
                    title="Remove Log Entry?"
                    message={`Are you sure you want to delete the log for "${meal.meal_name}"?`}
                    onCancel={() => setShowDeleteConfirm(false)}
                    onConfirm={confirmDelete}
                />
            )}

            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes drawCircle { from { stroke-dashoffset: 32; } to { stroke-dashoffset: 0; } }
                @keyframes drawTick { from { stroke-dashoffset: 10; } to { stroke-dashoffset: 0; } }
            `}} />
        </div>
    );
};

const HeaderMacro = ({ label, value, color }) => (
    <div className="flex items-center gap-1">
        <span className={cn("text-[7px] font-black uppercase", color)}>{label}</span>
        <span className="text-[10px] font-bold text-foreground/40 dark:text-foreground/60">{value}g</span>
    </div>
);

const MacroTotal = ({ label, value, icon: Icon, color, unit }) => (
    <div className="bg-secondary/20 rounded-2xl p-3 border border-border/50">
        <p className="text-[9px] font-black uppercase tracking-widest text-foreground/60 dark:text-foreground/80 mb-1">{label}</p>
        <div className="flex items-center gap-1.5">
            {Icon ? <Icon className={cn("w-3 h-3", color)} /> : <div className={cn("w-1.5 h-1.5 rounded-full", color.replace('text', 'bg'))} />}
            <span className="text-[14px] font-black text-foreground">{value}{unit}</span>
        </div>
    </div>
);

const EditField = ({ label, value, unit, onChange, disabled }) => (
    <div className="flex flex-col gap-1.5">
        <label className="text-[9px] font-black uppercase tracking-widest text-foreground/60 px-1 truncate">{label}</label>
        <div className="relative">
            <input 
                type="number"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                className="w-full bg-background/50 border border-border/60 focus:border-emerald-600/50 rounded-2xl px-3 h-9 text-[13px] font-black outline-none transition-all pr-12"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[8px] font-black text-foreground/40 dark:text-foreground/50 uppercase select-none tracking-widest">{unit}</span>
        </div>
    </div>
);

export default DietLogSlot;
