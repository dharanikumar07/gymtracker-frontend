import React, { useState, useEffect } from 'react';
import { 
    Utensils, 
    Trash2, 
    ChevronDown, 
    ChevronUp,
    Scale,
    Flame,
    Beef,
    Wheat,
    Droplets,
    Plus,
    Check
} from 'lucide-react';
import { cn } from '../../../../lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '../../../../components/ui/popover';
import FoodCombobox from './FoodCombobox';
import { useDiet } from '../context/DietContext';

const IngredientItem = ({ food, index, onUpdate, onDelete, units }) => {
    const inputClasses = "w-full bg-secondary/20 border border-border/40 rounded-lg px-2 h-8 text-[10px] font-bold text-foreground outline-none focus:border-primary/40 focus:bg-background transition-all";
    const labelClasses = "text-[7px] font-black uppercase tracking-widest text-muted-foreground/60 flex items-center gap-1 mb-1 ml-0.5";

    return (
        <div className="group/ingredient p-4 rounded-2xl bg-secondary/5 border border-border/40 hover:border-primary/10 transition-all space-y-4 relative">
            {/* Row 1: Name | Quantity | Calorie */}
            <div className="grid grid-cols-12 gap-3">
                <div className="col-span-12 sm:col-span-5">
                    <label className={labelClasses}>Ingredient Name</label>
                    <input
                        type="text"
                        value={food.name}
                        onChange={(e) => onUpdate(index, 'name', e.target.value)}
                        className={inputClasses}
                        placeholder="e.g. Chicken Breast"
                    />
                </div>
                <div className="col-span-7 sm:col-span-4">
                    <label className={labelClasses}><Scale className="w-2.5 h-2.5" /> Qty & Unit</label>
                    <div className="flex gap-1">
                        <input
                            type="number"
                            value={food.quantity}
                            onChange={(e) => onUpdate(index, 'quantity', e.target.value)}
                            className="w-1/2 bg-secondary/20 border border-border/40 rounded-lg px-2 h-8 text-[10px] font-bold outline-none"
                        />
                        <div className="flex-1">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <button className="w-full h-8 px-2 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-between text-[9px] font-black text-primary uppercase">
                                        <span className="truncate">{food.unit}</span>
                                        <ChevronDown className="w-3 h-3 shrink-0 opacity-50" />
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent className="w-32 p-1" align="end">
                                    <div className="max-h-48 overflow-y-auto">
                                        {units.map((u) => (
                                            <button
                                                key={u.value}
                                                onClick={() => onUpdate(index, 'unit', u.value)}
                                                className={cn(
                                                    "w-full flex items-center justify-between px-2 py-1.5 rounded-md text-[10px] font-bold hover:bg-secondary transition-colors",
                                                    food.unit === u.value ? "bg-primary/5 text-primary" : "text-foreground"
                                                )}
                                            >
                                                {u.label}
                                                {food.unit === u.value && <Check className="w-3 h-3" />}
                                            </button>
                                        ))}
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                </div>
                <div className="col-span-5 sm:col-span-3">
                    <label className={labelClasses}><Flame className="w-2.5 h-2.5" /> Calories</label>
                    <input
                        type="number"
                        value={food.calories}
                        onChange={(e) => onUpdate(index, 'calories', e.target.value)}
                        className={inputClasses}
                    />
                </div>
            </div>

            {/* Row 2: Protein | Carbs | Fats */}
            <div className="grid grid-cols-3 gap-3">
                <div>
                    <label className={labelClasses}><Beef className="w-2.5 h-2.5" /> Protein</label>
                    <input
                        type="number"
                        value={food.protein}
                        onChange={(e) => onUpdate(index, 'protein', e.target.value)}
                        className={inputClasses}
                    />
                </div>
                <div>
                    <label className={labelClasses}><Wheat className="w-2.5 h-2.5" /> Carbs</label>
                    <input
                        type="number"
                        value={food.carbs}
                        onChange={(e) => onUpdate(index, 'carbs', e.target.value)}
                        className={inputClasses}
                    />
                </div>
                <div>
                    <label className={labelClasses}><Droplets className="w-2.5 h-2.5" /> Fats</label>
                    <input
                        type="number"
                        value={food.fats}
                        onChange={(e) => onUpdate(index, 'fats', e.target.value)}
                        className={inputClasses}
                    />
                </div>
            </div>

            {/* Row 3: Nutritional Data */}
            <div className="space-y-1.5">
                <label className={labelClasses}>Extra Nutritional Data</label>
                <textarea
                    value={food.nutrition_data || ''}
                    onChange={(e) => onUpdate(index, 'nutrition_data', e.target.value)}
                    className="w-full bg-secondary/20 border border-border/40 rounded-xl px-3 py-2 text-[10px] font-bold text-foreground outline-none focus:border-primary/40 focus:bg-background transition-all resize-none h-[52px]"
                    placeholder="{ vitamin c: 10mg, fiber: 5g }"
                />
            </div>

            {/* Delete Button (Pure Icon, No Background) */}
            <button 
                onClick={() => onDelete(index)}
                className="absolute top-2 right-2 text-red-500 hover:text-red-500/60 transition-all opacity-100 sm:opacity-0 sm:group-hover/ingredient:opacity-100"
            >
                <Trash2 className="w-3.5 h-3.5" />
            </button>
        </div>
    );
};

const DietMealItem = ({ item, index, onUpdate, onDelete, isExpanded, onToggleExpand, units }) => {
    const [localMeal, setLocalMeal] = useState(item);

    useEffect(() => {
        setLocalMeal(item);
    }, [item]);

    const { activePlan } = useDiet();

    const handleMealChange = (field, value) => {
        const updated = { ...localMeal, [field]: value };
        setLocalMeal(updated);
        onUpdate(index, updated);
    };

    const calculateMealTotals = (foodData) => {
        return foodData.reduce((acc, f) => {
            acc.calories += Number(f.calories || 0);
            acc.protein += Number(f.protein || 0);
            acc.carbs += Number(f.carbs || 0);
            acc.fats += Number(f.fats || 0);
            return acc;
        }, { calories: 0, protein: 0, carbs: 0, fats: 0 });
    };

    const handleFoodUpdate = (foodIndex, field, value) => {
        const newFoodData = [...localMeal.food_data];
        newFoodData[foodIndex] = { ...newFoodData[foodIndex], [field]: value };
        const totals = calculateMealTotals(newFoodData);
        const updated = { ...localMeal, food_data: newFoodData, ...totals };
        setLocalMeal(updated);
        onUpdate(index, updated);
    };

    const handleAddFood = (selectedFood) => {
        const newFood = { 
            name: selectedFood.name || '', 
            quantity: selectedFood.quantity || 100, 
            unit: selectedFood.unit || 'g', 
            calories: selectedFood.calories || 0, 
            protein: selectedFood.protein || 0, 
            carbs: selectedFood.carbs || 0, 
            fats: selectedFood.fats || 0, 
            nutrition_data: selectedFood.nutrition_data || null 
        };
        const newFoodData = [newFood, ...localMeal.food_data];
        const totals = calculateMealTotals(newFoodData);
        const updated = { ...localMeal, food_data: newFoodData, ...totals };
        setLocalMeal(updated);
        onUpdate(index, updated);
    };

    const handleDeleteFood = (foodIndex) => {
        const newFoodData = localMeal.food_data.filter((_, i) => i !== foodIndex);
        const totals = calculateMealTotals(newFoodData);
        const updated = { ...localMeal, food_data: newFoodData, ...totals };
        setLocalMeal(updated);
        onUpdate(index, updated);
    };

    return (
        <div className={cn(
            "bg-card border rounded-2xl transition-all duration-300 overflow-hidden",
            isExpanded ? "border-primary/40 shadow-xl ring-1 ring-primary/5" : "border-border/60 hover:border-border/80 shadow-sm"
        )}>
            {/* Header: Compact style like Routine */}
            <div 
                className={cn(
                    "w-full p-3 flex items-center gap-3 cursor-pointer select-none transition-colors",
                    isExpanded ? "bg-primary/5" : "hover:bg-secondary/5"
                )}
                onClick={onToggleExpand}
            >
                <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all border",
                    isExpanded ? "bg-primary text-white border-primary shadow-primary/20 scale-105" : "bg-secondary/40 text-muted-foreground/30 border-border"
                )}>
                    <Utensils className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0">
                    <h4 className={cn(
                        "text-[11px] font-black uppercase tracking-tight truncate mb-0.5",
                        isExpanded ? "text-primary" : "text-foreground"
                    )}>
                        {item.meal_name || 'Define Meal'}
                    </h4>
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-[8px] font-bold text-muted-foreground uppercase tracking-widest">
                            <span>{item.time_period}</span>
                            <div className="w-1 h-1 rounded-full bg-border" />
                            <span>{item.food_data.length} Ingredients</span>
                        </div>
                        
                        {/* Mobile Macro Summary */}
                        <div className="flex sm:hidden items-center gap-2.5 text-[9px] font-black uppercase opacity-70">
                            <span className="flex items-center gap-0.5"><Flame className="w-2 h-2 text-orange-500" /> {Math.round(item.calories)}</span>
                            <span className="flex items-center gap-0.5"><Beef className="w-2 h-2 text-blue-500" /> {Math.round(item.protein)}</span>
                            <span className="flex items-center gap-0.5"><Wheat className="w-2 h-2 text-amber-500" /> {Math.round(item.carbs)}</span>
                            <span className="flex items-center gap-0.5"><Droplets className="w-2 h-2 text-rose-500" /> {Math.round(item.fats)}</span>
                        </div>
                    </div>
                </div>

                {/* Macro Summary & Actions (Desktop) */}
                <div className="flex items-center gap-4">
                    <div className="hidden sm:flex items-center gap-3 text-[10px] font-black uppercase opacity-60">
                        <span className="flex items-center gap-1"><Flame className="w-2.5 h-2.5 text-orange-500" /> {Math.round(item.calories)}</span>
                        <span className="flex items-center gap-1"><Beef className="w-2.5 h-2.5 text-blue-500" /> {Math.round(item.protein)}</span>
                        <span className="flex items-center gap-1"><Wheat className="w-2.5 h-2.5 text-amber-500" /> {Math.round(item.carbs)}</span>
                        <span className="flex items-center gap-1"><Droplets className="w-2.5 h-2.5 text-rose-500" /> {Math.round(item.fats)}</span>
                    </div>

                    <div className="flex items-center gap-1 border-l border-border/50 pl-3">
                        <button
                            onClick={(e) => { e.stopPropagation(); onDelete(index); }}
                            className="text-red-500 hover:text-red-500/60 transition-all p-1.5"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <div className="text-muted-foreground/30 p-1.5">
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                    </div>
                </div>
            </div>

            {/* Expanded View */}
            {isExpanded && (
                <div className="p-4 pt-1 space-y-6 animate-in slide-in-from-top-2 duration-300 border-t border-border/40 bg-card">
                    <div className="grid grid-cols-12 gap-3 items-end pt-3">
                        <div className="col-span-12 sm:col-span-7">
                            <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1 mb-1 block">Meal Name</label>
                            <input
                                type="text"
                                value={localMeal.meal_name}
                                onChange={(e) => handleMealChange('meal_name', e.target.value)}
                                className="w-full h-9 px-3 bg-secondary/10 border border-border/50 rounded-xl text-[12px] font-bold text-foreground outline-none focus:border-primary/50 transition-all"
                            />
                        </div>
                        <div className="col-span-12 sm:col-span-5">
                            <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1 mb-1 block">Time Period</label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <button className="w-full h-9 px-3 bg-secondary/10 border border-border/50 rounded-xl flex items-center justify-between text-[10px] font-black text-primary uppercase">
                                        {localMeal.time_period}
                                        <ChevronDown className="w-3.5 h-3.5 opacity-50" />
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent className="w-48 p-1" align="end">
                                    {['breakfast', 'lunch', 'dinner', 'snack'].map((p) => (
                                        <button
                                            key={p}
                                            onClick={() => handleMealChange('time_period', p)}
                                            className={cn(
                                                "w-full flex items-center justify-between px-3 py-2 rounded-lg text-[10px] font-bold hover:bg-secondary transition-colors text-left uppercase",
                                                localMeal.time_period === p ? "text-primary bg-primary/5" : "text-foreground"
                                            )}
                                        >
                                            {p}
                                            {localMeal.time_period === p && <Check className="w-3 h-3" />}
                                        </button>
                                    ))}
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between px-1">
                            <h5 className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Ingredients Breakdown</h5>
                            <FoodCombobox 
                                onSelect={handleAddFood} 
                                dietType={activePlan?.meta_data?.diet_preference || 'veg'} 
                            />
                        </div>
                        
                        <div className="grid grid-cols-1 gap-4">
                            {localMeal.food_data.map((food, fIdx) => (
                                <IngredientItem 
                                    key={fIdx} 
                                    food={food} 
                                    index={fIdx} 
                                    onUpdate={handleFoodUpdate} 
                                    onDelete={handleDeleteFood}
                                    units={units}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DietMealItem;
