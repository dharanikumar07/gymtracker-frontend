import React, { useState, useEffect, useMemo } from 'react';
import { 
    Plus, Trash2, Save, Loader2, Utensils, 
    ChevronDown, Coffee, Sun, Moon, Apple,
    Zap, Flame, Target, PieChart, Scale,
    Sparkles, CheckCircle2, ArrowRight,
    TrendingUp, Dumbbell, Leaf, LayoutGrid,
    Calendar, ArrowUpRight, Activity
} from 'lucide-react';
import { cn } from '../../../../lib/utils';
import { toast } from 'sonner';
import { 
    useDietRoutineQuery, 
    useGenerateDietPlanMutation, 
    useUpdateDietRoutineMutation,
    useRoutineQuery
} from '../http/progressQueries';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MEALS = ['breakfast', 'lunch', 'dinner', 'snack'];

const mealIcons = {
    breakfast: Coffee,
    lunch: Sun,
    dinner: Moon,
    snack: Apple
};

const ManageDiet = () => {
    const [planUuid, setPlanUuid] = useState(null);
    const { data: dietData, isLoading: loading, error } = useDietRoutineQuery(planUuid);
    const { data: generalRoutineData } = useRoutineQuery();
    
    const [routine, setRoutine] = useState({});
    const [activeDay, setActiveDay] = useState('Mon');
    
    // Setup States
    const [showSetup, setShowSetup] = useState(false);
    const [setupGoal, setSetupGoal] = useState('muscle_gain');
    const [setupType, setSetupType] = useState('veg');

    const generateMutation = useGenerateDietPlanMutation();
    const updateMutation = useUpdateDietRoutineMutation();

    // Sync local state with query data
    useEffect(() => {
        if (dietData?.routine) {
            setRoutine(dietData.routine);
            setShowSetup(false);
        }
        if (error?.response?.status === 404) {
            setShowSetup(true);
        }
    }, [dietData, error]);

    const availablePlans = dietData?.available_plans || generalRoutineData?.available_plans || [];
    const plan = dietData?.plan;

    // --- Real-time Calculations ---
    const dayTotals = useMemo(() => {
        const dayData = routine[activeDay] || {};
        const t = { cal: 0, p: 0, c: 0, f: 0 };
        Object.values(dayData).forEach(mealItems => {
            mealItems.forEach(item => {
                t.cal += Number(item.calories || 0);
                t.p += Number(item.protein || 0);
                t.c += Number(item.carbs || 0);
                t.f += Number(item.fats || 0);
            });
        });
        return t;
    }, [routine, activeDay]);

    const targets = {
        cal: plan?.target_calories || 2400,
        p: plan?.target_protein || 120,
        c: plan?.target_carbs || 300,
        f: plan?.target_fats || 65
    };

    const handleGeneratePlan = () => {
        generateMutation.mutate({
            goal: setupGoal,
            diet_preference: setupType
        }, {
            onSuccess: (response) => {
                setPlanUuid(response.data.plan_uuid);
            }
        });
    };

    const handleSwitchPlan = (uuid) => {
        setPlanUuid(uuid);
    };

    const handleSave = () => {
        updateMutation.mutate({
            plan_uuid: plan.uuid,
            routine: routine
        });
    };

    const updateItem = (mealType, idx, updates) => {
        setRoutine(prev => {
            const newRoutine = { ...prev };
            const dayMeals = { ...newRoutine[activeDay] };
            const mealItems = [...dayMeals[mealType]];
            mealItems[idx] = { ...mealItems[idx], ...updates };
            dayMeals[mealType] = mealItems;
            newRoutine[activeDay] = dayMeals;
            return newRoutine;
        });
    };

    const removeItem = (mealType, idx) => {
        setRoutine(prev => {
            const newRoutine = { ...prev };
            const dayMeals = { ...newRoutine[activeDay] };
            dayMeals[mealType] = dayMeals[mealType].filter((_, i) => i !== idx);
            newRoutine[activeDay] = dayMeals;
            return newRoutine;
        });
    };

    const addItem = (mealType) => {
        setRoutine(prev => {
            const newRoutine = { ...prev };
            const dayMeals = { ...newRoutine[activeDay] };
            const newItem = { food_name: '', quantity: 100, unit: 'g', calories: 0, protein: 0, carbs: 0, fats: 0 };
            dayMeals[mealType] = [...(dayMeals[mealType] || []), newItem];
            newRoutine[activeDay] = dayMeals;
            return newRoutine;
        });
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[500px] gap-6">
                <div className="relative">
                    <div className="w-16 h-16 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                    <Activity className="absolute inset-0 m-auto w-6 h-6 text-primary animate-pulse" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground italic">Calibrating Nutrition Matrix...</p>
            </div>
        );
    }

    if (showSetup) {
        return (
            <div className="max-w-4xl mx-auto py-12 px-6 animate-in zoom-in-95 duration-500">
                <div className="text-center space-y-3 mb-12">
                    <h2 className="text-5xl font-black text-foreground uppercase italic tracking-tighter">
                        Choose Your <span className="text-primary">Path</span>
                    </h2>
                    <p className="text-muted-foreground font-medium text-sm">Select a transformation goal to generate your personalized PTS protocol.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {[
                        { id: 'muscle_gain', label: 'Bulking', desc: 'Surplus calories for hypertrophy.', icon: Flame, color: 'text-orange-500', bg: 'bg-orange-500/10' },
                        { id: 'fat_loss', label: 'Cutting', desc: 'Deficit calories for fat loss.', icon: Target, color: 'text-rose-500', bg: 'bg-rose-500/10' },
                        { id: 'maintenance', label: 'Static', desc: 'Balanced intake for maintenance.', icon: Scale, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                    ].map(goal => (
                        <button
                            key={goal.id}
                            onClick={() => setSetupGoal(goal.id)}
                            className={cn(
                                "relative group p-8 rounded-[3rem] border-2 transition-all text-left flex flex-col gap-6 overflow-hidden",
                                setupGoal === goal.id 
                                    ? "bg-foreground border-foreground text-background shadow-2xl scale-105" 
                                    : "bg-card border-border text-foreground hover:border-primary/50"
                            )}
                        >
                            <div className={cn(
                                "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors shadow-inner",
                                setupGoal === goal.id ? "bg-primary text-white" : goal.bg + " " + goal.color
                            )}>
                                <goal.icon className="w-6 h-6" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-xl font-black uppercase italic tracking-tighter">{goal.label}</h3>
                                <p className={cn("text-[10px] font-bold uppercase tracking-tight", setupGoal === goal.id ? "text-background/60" : "text-muted-foreground")}>{goal.desc}</p>
                            </div>
                            {setupGoal === goal.id && (
                                <div className="absolute top-6 right-6">
                                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                                        <CheckCircle2 className="w-4 h-4 text-white" />
                                    </div>
                                </div>
                            )}
                        </button>
                    ))}
                </div>

                <div className="bg-card border border-border rounded-[3rem] p-10 space-y-10 shadow-sm relative overflow-hidden">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Dietary Preference</label>
                            <div className="flex p-2 bg-secondary/50 rounded-2xl gap-2 border border-border w-fit">
                                {[
                                    { id: 'veg', label: 'Vegetarian', icon: Leaf },
                                    { id: 'nonveg', label: 'Non-Veg', icon: Utensils },
                                ].map(type => (
                                    <button
                                        key={type.id}
                                        onClick={() => setSetupType(type.id)}
                                        className={cn(
                                            "flex items-center gap-3 px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                            setupType === type.id ? "bg-background text-primary shadow-lg border border-border" : "text-muted-foreground hover:text-foreground"
                                        )}
                                    >
                                        <type.icon className="w-4 h-4" />
                                        {type.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={handleGeneratePlan}
                            disabled={generateMutation.isPending}
                            className="h-20 px-12 bg-primary text-white rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-primary/20 hover:scale-[1.05] active:scale-[0.95] transition-all flex items-center gap-4 disabled:opacity-50"
                        >
                            {generateMutation.isPending ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6 fill-current" />}
                            Initialize Protocol <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full -mr-48 -mt-48 blur-3xl" />
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col space-y-8 animate-in fade-in duration-700 p-4 lg:p-8 max-w-[1600px] mx-auto pb-32">
            
            {/* 1. Macro Command Dashboard */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 shrink-0">
                <div className="lg:col-span-1 bg-zinc-950 border border-zinc-800 rounded-[3rem] p-8 text-white relative overflow-hidden flex flex-col justify-between shadow-2xl group">
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
                                <Activity className="w-6 h-6" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Live Status</span>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Protocol Energy</p>
                            <div className="flex items-baseline gap-2">
                                <h4 className="text-5xl font-black italic text-white leading-none">{dayTotals.cal}</h4>
                                <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">kcal</span>
                            </div>
                        </div>
                    </div>
                    <div className="mt-8 pt-6 border-t border-zinc-800/50 flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-2">
                            <div className={cn(
                                "w-2 h-2 rounded-full",
                                Math.abs(dayTotals.cal - targets.cal) < 100 ? "bg-emerald-500 animate-pulse" : "bg-orange-500"
                            )} />
                            <span className="text-[10px] font-black uppercase text-zinc-400">Target: {targets.cal}</span>
                        </div>
                        <button 
                            onClick={handleSave} disabled={updateMutation.isPending}
                            className="h-10 px-6 bg-primary text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                        >
                            {updateMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Sync
                        </button>
                    </div>
                    <div className="absolute bottom-0 right-0 w-48 h-48 bg-primary/10 rounded-full -mb-24 -mr-24 blur-3xl group-hover:bg-primary/20 transition-all duration-700" />
                </div>

                <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { label: 'Protein', key: 'p', color: 'text-blue-500', bg: 'bg-blue-500/10', bar: 'bg-blue-500' },
                        { label: 'Carbs', key: 'c', color: 'text-amber-500', bg: 'bg-amber-500/10', bar: 'bg-amber-500' },
                        { label: 'Fats', key: 'f', color: 'text-rose-500', bg: 'bg-rose-500/10', bar: 'bg-rose-500' },
                    ].map(m => {
                        const percent = Math.min(100, (dayTotals[m.key] / targets[m.key]) * 100);
                        return (
                            <div key={m.label} className="bg-card border border-border rounded-[3rem] p-8 flex flex-col justify-between shadow-sm group hover:border-primary/20 transition-all">
                                <div className="flex justify-between items-start mb-6">
                                    <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center", m.bg, m.color)}>
                                        <PieChart className="w-5 h-5" />
                                    </div>
                                    <span className={cn("text-[10px] font-black uppercase tracking-widest", m.color)}>{m.label}</span>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-baseline gap-2">
                                        <h4 className="text-3xl font-black text-foreground italic leading-none">{dayTotals[m.key]}g</h4>
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase">/ {targets[m.key]}g</span>
                                    </div>
                                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                        <div className={cn("h-full transition-all duration-1000", m.bar)} style={{ width: `${percent}%` }} />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* 2. Global Navigation: Plan & Day */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card border border-border p-3 rounded-[2.5rem] shadow-sm">
                <div className="flex items-center gap-3 w-full md:w-auto px-4 border-r border-border/50">
                    <div className="relative group flex-1 md:flex-none">
                        <select 
                            className="appearance-none h-12 pl-6 pr-14 bg-background border border-border rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] text-foreground outline-none hover:border-primary transition-all min-w-[280px]"
                            value={plan?.uuid}
                            onChange={(e) => handleSwitchPlan(e.target.value)}
                        >
                            {availablePlans.map(p => (
                                <option key={p.plan_uuid} value={p.plan_uuid}>{p.name} {p.is_active ? '• Active' : ''}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    </div>
                    <button 
                        onClick={() => setShowSetup(true)}
                        className="h-12 w-12 rounded-2xl bg-secondary border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-all shadow-sm"
                    >
                        <Plus className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-1 flex gap-1 px-4 overflow-x-auto no-scrollbar scroll-smooth">
                    {DAYS.map((day) => (
                        <button
                            key={day}
                            onClick={() => setActiveDay(day)}
                            className={cn(
                                "flex-1 min-w-[100px] py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all",
                                activeDay === day 
                                    ? "bg-foreground text-background shadow-xl scale-105" 
                                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                            )}
                        >
                            {day}
                        </button>
                    ))}
                </div>
            </div>

            {/* 3. Meal Containers */}
            <div className="space-y-12">
                {MEALS.map(mealType => {
                    const Icon = mealIcons[mealType];
                    const items = routine[activeDay]?.[mealType] || [];
                    const mealCals = items.reduce((sum, i) => sum + Number(i.calories || 0), 0);

                    return (
                        <div key={mealType} className="bg-secondary/10 border border-border rounded-[3.5rem] p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 shadow-sm">
                            <div className="flex items-center justify-between px-4">
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 rounded-3xl bg-background border-2 border-border flex items-center justify-center text-primary shadow-xl">
                                        <Icon className="w-8 h-8" />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-3xl font-black uppercase italic tracking-tighter text-foreground">{mealType}</h3>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{items.length} Elements</span>
                                            <div className="w-1 h-1 rounded-full bg-border" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-primary">{mealCals} kcal</span>
                                        </div>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => addItem(mealType)}
                                    className="h-14 px-8 rounded-3xl bg-primary text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
                                >
                                    <Plus className="w-5 h-5" /> Add Food
                                </button>
                            </div>

                            {/* Food Grid within Meal */}
                            <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
                                {items.length === 0 ? (
                                    <div className="col-span-full h-32 bg-background border-2 border-dashed border-border rounded-[2.5rem] flex flex-col items-center justify-center text-muted-foreground/30 italic">
                                        <Utensils className="w-8 h-8 mb-2" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">No protocol elements registered</span>
                                    </div>
                                ) : (
                                    items.map((item, idx) => (
                                        <div key={idx} className="bg-card border border-border rounded-[2.5rem] p-6 space-y-6 hover:border-primary/30 transition-all shadow-sm group/food relative overflow-hidden">
                                            <div className="flex items-center justify-between relative z-10">
                                                <input 
                                                    className="flex-1 bg-transparent border-none text-lg font-black text-foreground outline-none uppercase tracking-tighter italic placeholder:text-muted-foreground/20 px-0"
                                                    placeholder="Enter Food Identity"
                                                    value={item.food_name}
                                                    onChange={(e) => updateItem(mealType, idx, { food_name: e.target.value })}
                                                />
                                                <button 
                                                    onClick={() => removeItem(mealType, idx)}
                                                    className="w-10 h-10 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center opacity-0 group-hover/food:opacity-100 transition-all hover:bg-red-500 hover:text-white"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 relative z-10">
                                                <div className="space-y-2">
                                                    <label className="text-[9px] font-black uppercase text-muted-foreground ml-4 tracking-widest">Weight/Qty</label>
                                                    <div className="flex bg-background border-2 border-border rounded-2xl overflow-hidden focus-within:border-primary h-14 shadow-inner">
                                                        <input 
                                                            type="number" className="w-full h-full px-4 bg-transparent text-sm font-black outline-none border-none text-center"
                                                            value={item.quantity}
                                                            onChange={(e) => updateItem(mealType, idx, { quantity: e.target.value })}
                                                        />
                                                        <select 
                                                            className="bg-secondary h-full px-4 text-[10px] font-black border-l border-border outline-none appearance-none cursor-pointer uppercase text-primary"
                                                            value={item.unit} onChange={(e) => updateItem(mealType, idx, { unit: e.target.value })}
                                                        >
                                                            {['g', 'kg', 'ml', 'pcs', 'cup'].map(u => <option key={u} value={u}>{u}</option>)}
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[9px] font-black uppercase text-muted-foreground ml-4 tracking-widest">Energy</label>
                                                    <div className="flex items-center bg-background border-2 border-border rounded-2xl overflow-hidden focus-within:border-primary h-14 shadow-inner">
                                                        <input 
                                                            type="number" className="w-full h-full px-4 bg-transparent text-sm font-black outline-none border-none text-center"
                                                            value={item.calories}
                                                            onChange={(e) => updateItem(mealType, idx, { calories: e.target.value })}
                                                        />
                                                        <div className="bg-secondary h-full px-4 flex items-center border-l border-border">
                                                            <Flame className="w-5 h-5 text-orange-500" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-3 gap-3 relative z-10">
                                                {[
                                                    { key: 'protein', label: 'Protein', color: 'bg-blue-500', text: 'text-blue-500' },
                                                    { key: 'carbs', label: 'Carbs', color: 'bg-amber-500', text: 'text-amber-500' },
                                                    { key: 'fats', label: 'Fats', color: 'bg-rose-500', text: 'text-rose-500' },
                                                ].map(macro => (
                                                    <div key={macro.key} className="space-y-2">
                                                        <div className="flex items-center gap-2 ml-3">
                                                            <div className={cn("w-1.5 h-1.5 rounded-full shadow-glow", macro.color)} />
                                                            <span className="text-[8px] font-black uppercase text-muted-foreground tracking-tighter">{macro.label}</span>
                                                        </div>
                                                        <input 
                                                            type="number" className={cn("w-full h-12 bg-background border-2 border-border rounded-2xl text-xs font-black text-center outline-none focus:border-primary", macro.text)}
                                                            value={item[macro.key]}
                                                            onChange={(e) => updateItem(mealType, idx, { [macro.key]: e.target.value })}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                            {/* Decorative Background Accent */}
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover/food:bg-primary/10 transition-all" />
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ManageDiet;
