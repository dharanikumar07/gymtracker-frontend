import React, { useState, useMemo } from 'react';
import { UtensilsCrossed, Loader2, Calendar, ChevronLeft, ChevronRight, Save, Check, X, Coffee, Sun, Moon, Cookie } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { useDietTrackingQuery, useLogDietMutation } from '../http/queries';
import { format, addDays, subDays } from 'date-fns';

const mealIcons = {
    breakfast: Coffee,
    lunch: Sun,
    dinner: Moon,
    snack: Cookie
};

const mealLabels = {
    breakfast: 'Breakfast',
    lunch: 'Lunch',
    dinner: 'Dinner',
    snack: 'Snack'
};

const TrackDiet = () => {
    const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [dietData, setDietData] = useState({});
    const [expandedMeal, setExpandedMeal] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    
    const { data, isLoading, isFetching } = useDietTrackingQuery(selectedDate);
    const logDiet = useLogDietMutation();
    
    const meals = data?.data?.meals || {};
    const dayLabel = data?.data?.day ? data.data.day.toUpperCase() : '';

    const computedDietData = useMemo(() => {
        const initialData = {};
        Object.entries(meals).forEach(([, items]) => {
            items.forEach(item => {
                initialData[item.diet_plan_item_uuid] = {
                    logged: !!item.logged,
                    quantity: item.logged?.quantity || item.prescribed?.quantity || 0,
                    unit: item.logged?.unit || item.prescribed?.unit || 'g',
                    calories: item.logged?.calories || item.prescribed?.calories || 0,
                    protein: item.logged?.macros?.p || item.prescribed?.macros?.p || 0,
                    carbs: item.logged?.macros?.c || item.prescribed?.macros?.c || 0,
                    fats: item.logged?.macros?.f || item.prescribed?.macros?.f || 0,
                    notes: item.logged?.notes || ''
                };
            });
        });
        return initialData;
    }, [meals]);

    React.useEffect(() => {
        setDietData(computedDietData);
    }, [computedDietData]);

    const handleDateChange = (direction) => {
        const currentDate = new Date(selectedDate);
        const newDate = direction === 'prev' ? subDays(currentDate, 1) : addDays(currentDate, 1);
        setSelectedDate(format(newDate, 'yyyy-MM-dd'));
    };

    const toggleFood = (itemUuid) => {
        setDietData(prev => ({
            ...prev,
            [itemUuid]: {
                ...prev[itemUuid],
                logged: !prev[itemUuid]?.logged
            }
        }));
    };

    const handleUpdateFood = (itemUuid, field, value) => {
        setDietData(prev => {
            const current = prev[itemUuid] || {};
            return {
                ...prev,
                [itemUuid]: {
                    ...current,
                    [field]: value
                }
            };
        });
    };

    const handleSave = async () => {
        setIsSaving(true);
        const logs = Object.entries(dietData)
            .filter(([, data]) => data.logged)
            .map(([itemUuid, data]) => ({
                diet_plan_item_uuid: itemUuid,
                actual_quantity: data.quantity,
                unit: data.unit,
                calories: data.calories,
                protein: data.protein,
                carbs: data.carbs,
                fats: data.fats,
                notes: data.notes,
                food_name: data.food_name
            }));
        
        if (logs.length > 0) {
            await logDiet.mutateAsync({ date: selectedDate, logs });
        }
        setIsSaving(false);
    };

    const hasAnyMeals = Object.values(meals).some(items => items.length > 0);
    const loggedCount = Object.values(dietData).filter(d => d.logged).length;

    return (
        <div className="space-y-4">
            <div className="bg-card border border-border rounded-3xl p-5">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                        <UtensilsCrossed className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                        <h3 className="text-[12px] font-black uppercase italic text-foreground">Track Diet</h3>
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Log your daily meals</p>
                    </div>
                </div>
                
                <div className="flex items-center justify-between gap-2 p-3 bg-secondary/30 rounded-2xl">
                    <button 
                        onClick={() => handleDateChange('prev')}
                        className="p-2 hover:bg-secondary rounded-xl transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4 text-green-500" />
                    </button>
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-green-500" />
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">{dayLabel}</span>
                        <input 
                            type="date" 
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="bg-transparent text-[11px] font-bold outline-none text-foreground"
                        />
                    </div>
                    <button 
                        onClick={() => handleDateChange('next')}
                        className="p-2 hover:bg-secondary rounded-xl transition-colors"
                    >
                        <ChevronRight className="w-4 h-4 text-green-500" />
                    </button>
                </div>
            </div>

            {isLoading || isFetching ? (
                <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-green-500 mb-2" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Loading...</p>
                </div>
            ) : !hasAnyMeals ? (
                <div className="bg-card border border-border rounded-3xl p-5">
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <UtensilsCrossed className="w-10 h-10 text-muted-foreground/30 mb-3" />
                        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">No Diet Plan</p>
                        <p className="text-[9px] text-muted-foreground/60 mt-1">Create a diet plan in Manage Diet</p>
                    </div>
                </div>
            ) : (
                <div className="space-y-3">
                    {['breakfast', 'lunch', 'dinner', 'snack'].map((mealType) => {
                        const items = meals[mealType] || [];
                        const Icon = mealIcons[mealType];
                        const isExpanded = expandedMeal === mealType;
                        const mealLogged = items.filter(item => dietData[item.diet_plan_item_uuid]?.logged).length;
                        
                        if (items.length === 0) return null;
                        
                        return (
                            <div key={mealType} className="bg-card border border-border rounded-3xl overflow-hidden">
                                <button
                                    onClick={() => setExpandedMeal(isExpanded ? null : mealType)}
                                    className="w-full flex items-center justify-between p-4 hover:bg-secondary/30 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "w-8 h-8 rounded-xl flex items-center justify-center",
                                            mealType === 'breakfast' && "bg-orange-500/10",
                                            mealType === 'lunch' && "bg-yellow-500/10",
                                            mealType === 'dinner' && "bg-purple-500/10",
                                            mealType === 'snack' && "bg-pink-500/10"
                                        )}>
                                            <Icon className={cn(
                                                "w-4 h-4",
                                                mealType === 'breakfast' && "text-orange-500",
                                                mealType === 'lunch' && "text-yellow-500",
                                                mealType === 'dinner' && "text-purple-500",
                                                mealType === 'snack' && "text-pink-500"
                                            )} />
                                        </div>
                                        <div className="text-left">
                                            <h4 className="text-[11px] font-black uppercase text-foreground">{mealLabels[mealType]}</h4>
                                            <p className="text-[9px] font-bold text-muted-foreground">{items.length} item{items.length !== 1 ? 's' : ''}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {mealLogged > 0 && (
                                            <span className="text-[9px] font-bold px-2 py-1 rounded-full bg-green-500/10 text-green-500">
                                                {mealLogged}/{items.length}
                                            </span>
                                        )}
                                        {isExpanded ? (
                                            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
                                        ) : (
                                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                        )}
                                    </div>
                                </button>
                                
                                {isExpanded && (
                                    <div className="p-4 pt-0 space-y-2 border-t border-border/30">
                                        {items.map((item) => {
                                            const foodData = dietData[item.diet_plan_item_uuid] || {};
                                            const isLogged = foodData.logged;
                                            
                                            return (
                                                <div key={item.diet_plan_item_uuid} className={cn(
                                                    "p-3 rounded-2xl transition-all",
                                                    isLogged ? "bg-green-500/10 border border-green-500/20" : "bg-secondary/30"
                                                )}>
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-[10px] font-bold text-foreground">{item.food_name}</span>
                                                        <button
                                                            onClick={() => toggleFood(item.diet_plan_item_uuid)}
                                                            className={cn(
                                                                "w-6 h-6 rounded-full flex items-center justify-center transition-colors",
                                                                isLogged 
                                                                    ? "bg-green-500 text-white" 
                                                                    : "bg-secondary text-muted-foreground hover:bg-green-500/20"
                                                            )}
                                                        >
                                                            {isLogged ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                                                        </button>
                                                    </div>
                                                    
                                                    {isLogged && (
                                                        <div className="grid grid-cols-4 gap-2 mt-2">
                                                            <div>
                                                                <label className="text-[8px] font-bold text-muted-foreground uppercase">Qty</label>
                                                                <input
                                                                    type="number"
                                                                    value={foodData.quantity || ''}
                                                                    onChange={(e) => handleUpdateFood(item.diet_plan_item_uuid, 'quantity', e.target.value)}
                                                                    className="w-full bg-background/50 rounded-lg px-2 py-1 text-[10px] font-bold outline-none"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="text-[8px] font-bold text-muted-foreground uppercase">Cal</label>
                                                                <input
                                                                    type="number"
                                                                    value={foodData.calories || ''}
                                                                    onChange={(e) => handleUpdateFood(item.diet_plan_item_uuid, 'calories', e.target.value)}
                                                                    className="w-full bg-background/50 rounded-lg px-2 py-1 text-[10px] font-bold outline-none"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="text-[8px] font-bold text-muted-foreground uppercase">P</label>
                                                                <input
                                                                    type="number"
                                                                    value={foodData.protein || ''}
                                                                    onChange={(e) => handleUpdateFood(item.diet_plan_item_uuid, 'protein', e.target.value)}
                                                                    className="w-full bg-background/50 rounded-lg px-2 py-1 text-[10px] font-bold outline-none"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="text-[8px] font-bold text-muted-foreground uppercase">C</label>
                                                                <input
                                                                    type="number"
                                                                    value={foodData.carbs || ''}
                                                                    onChange={(e) => handleUpdateFood(item.diet_plan_item_uuid, 'carbs', e.target.value)}
                                                                    className="w-full bg-background/50 rounded-lg px-2 py-1 text-[10px] font-bold outline-none"
                                                                />
                                                            </div>
                                                        </div>
                                                    )}
                                                    
                                                    {!isLogged && (
                                                        <div className="flex gap-3 text-[9px] text-muted-foreground mt-1">
                                                            <span>P: {item.prescribed?.macros?.p || 0}g</span>
                                                            <span>C: {item.prescribed?.macros?.c || 0}g</span>
                                                            <span>F: {item.prescribed?.macros?.f || 0}g</span>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    
                    <button
                        onClick={handleSave}
                        disabled={isSaving || loggedCount === 0}
                        className={cn(
                            "w-full flex items-center justify-center gap-2 p-4 rounded-3xl font-black uppercase tracking-wider transition-all",
                            "bg-green-500 text-white hover:bg-green-600 shadow-lg shadow-green-500/20",
                            (isSaving || loggedCount === 0) && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        {isSaving ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Save className="w-4 h-4" />
                        )}
                        <span className="text-[11px]">{isSaving ? 'Saving...' : `Log Diet (${loggedCount})`}</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default TrackDiet;
