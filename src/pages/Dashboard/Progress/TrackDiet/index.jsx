import React, { useState, useEffect, useMemo } from 'react';
import { 
    Calendar as CalendarIcon, Loader2, Save, Utensils, 
    ChevronLeft, ChevronRight, PieChart, Zap, 
    Flame, Target, Scale, CheckCircle2, History
} from 'lucide-react';
import api from '../../../../lib/api';
import { cn } from '../../../../lib/utils';
import { toast } from 'sonner';
import Calendar from '../../../../components/Calendar';

const MEALS = ['breakfast', 'lunch', 'dinner', 'snack'];

const TrackDiet = () => {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [meals, setMeals] = useState({});
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);

    // Week navigation logic
    const weekDays = useMemo(() => {
        const baseDate = new Date(selectedDate);
        const day = baseDate.getDay();
        const diff = baseDate.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(baseDate.setDate(diff));
        return Array.from({ length: 7 }, (_, i) => {
            const date = new Date(monday);
            date.setDate(monday.getDate() + i);
            const iso = date.toISOString().split('T')[0];
            return {
                date: iso,
                dayNum: date.getDate(),
                dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
                isToday: iso === new Date().toISOString().split('T')[0]
            };
        });
    }, [selectedDate]);

    const fetchData = async (date) => {
        try {
            setLoading(true);
            const response = await api.get('/diet/tracking', { params: { date } });
            setMeals(response.data.meals || {});
        } catch (err) {
            console.error(err);
            toast.error("Dietary sync failed");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(selectedDate);
    }, [selectedDate]);

    const handleUpdateLog = (mealType, idx, updates) => {
        setMeals(prev => {
            const newMeals = { ...prev };
            const item = { ...newMeals[mealType][idx] };
            
            // Initialize 'logged' if it doesn't exist
            if (!item.logged) {
                item.logged = {
                    diet_plan_item_uuid: item.diet_plan_item_uuid,
                    quantity: item.prescribed.quantity,
                    unit: item.prescribed.unit,
                    calories: item.prescribed.calories,
                    macros: { ...item.prescribed.macros },
                    notes: ''
                };
            }
            
            item.logged = { ...item.logged, ...updates };
            newMeals[mealType][idx] = item;
            return newMeals;
        });
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const logs = [];
            Object.values(meals).forEach(mealItems => {
                mealItems.forEach(item => {
                    if (item.logged) {
                        logs.push({
                            diet_plan_item_uuid: item.diet_plan_item_uuid,
                            actual_quantity: item.logged.quantity,
                            unit: item.logged.unit,
                            calories: item.logged.calories,
                            protein: item.logged.macros.p,
                            carbs: item.logged.macros.c,
                            fats: item.logged.macros.f,
                            notes: item.logged.notes
                        });
                    }
                });
            });

            await api.post('/diet/tracking', {
                date: selectedDate,
                logs: logs
            });
            toast.success("Diet logs committed successfully");
        } catch (err) {
            console.error(err);
            toast.error("Failed to save progress");
        } finally {
            setSaving(false);
        }
    };

    // Calculate totals
    const totals = useMemo(() => {
        const t = { target: { cal: 0, p: 0, c: 0, f: 0 }, actual: { cal: 0, p: 0, c: 0, f: 0 } };
        Object.values(meals).forEach(mealItems => {
            mealItems.forEach(item => {
                t.target.cal += item.prescribed.calories;
                t.target.p += item.prescribed.macros.p;
                t.target.c += item.prescribed.macros.c;
                t.target.f += item.prescribed.macros.f;
                
                if (item.logged) {
                    t.actual.cal += parseInt(item.logged.calories || 0);
                    t.actual.p += parseInt(item.logged.macros.p || 0);
                    t.actual.c += parseInt(item.logged.macros.c || 0);
                    t.actual.f += parseInt(item.logged.macros.f || 0);
                }
            });
        });
        return t;
    }, [meals]);

    return (
        <div className="h-full flex flex-col space-y-6 font-sans">
            
            {/* Header / Week Strip */}
            <div className="bg-card border border-border rounded-[2.5rem] p-4 shadow-sm relative">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 px-2">
                    <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setIsCalendarOpen(!isCalendarOpen)}>
                        <div className="w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20 shrink-0 group-hover:scale-105 transition-transform">
                            <CalendarIcon className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-foreground uppercase tracking-tight italic leading-none">
                                {new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </h3>
                            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-1 mt-1">
                                <div className="w-1 h-1 rounded-full bg-primary animate-pulse" /> Dietary Intake
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center justify-center bg-secondary/30 rounded-2xl p-1 gap-1 flex-1 max-w-md mx-auto lg:mx-0">
                        {weekDays.map((day) => (
                            <button
                                key={day.date}
                                onClick={() => setSelectedDate(day.date)}
                                className={cn(
                                    "flex-1 flex flex-col items-center py-1.5 rounded-xl transition-all border",
                                    selectedDate === day.date ? "bg-primary border-primary text-white shadow-sm" : "bg-transparent border-transparent text-muted-foreground hover:bg-background hover:text-primary"
                                )}
                            >
                                <span className="text-[7px] font-black uppercase tracking-widest mb-0.5">{day.dayName}</span>
                                <span className="text-xs font-black italic">{day.dayNum}</span>
                            </button>
                        ))}
                    </div>

                    <button 
                        onClick={handleSave}
                        disabled={saving}
                        className="h-10 px-6 bg-primary text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 shrink-0"
                    >
                        {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                        Save Logs
                    </button>
                </div>

                {isCalendarOpen && (
                    <div className="absolute top-full left-0 mt-2 z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
                        <Calendar 
                            selectedDate={selectedDate}
                            onSelect={(date) => { setSelectedDate(date); setIsCalendarOpen(false); }}
                        />
                    </div>
                )}
            </div>

            {/* Macro Summary Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-card border border-border p-6 rounded-[2rem] shadow-sm relative overflow-hidden group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                            <Flame className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Calories</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <h4 className="text-3xl font-black text-foreground italic leading-none">{totals.actual.cal}</h4>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">/ {totals.target.cal} kcal</span>
                    </div>
                    <div className="mt-4 h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-orange-500 transition-all duration-1000" style={{ width: `${Math.min(100, (totals.actual.cal / totals.target.cal) * 100 || 0)}%` }} />
                    </div>
                </div>

                {['protein', 'carbs', 'fats'].map((macro, idx) => {
                    const key = macro[0]; // p, c, f
                    const colors = { protein: 'bg-blue-500', carbs: 'bg-amber-500', fats: 'bg-rose-500' };
                    const textColors = { protein: 'text-blue-500', carbs: 'text-amber-500', fats: 'text-rose-500' };
                    return (
                        <div key={macro} className="bg-card border border-border p-6 rounded-[2rem] shadow-sm">
                            <div className="flex justify-between items-center mb-4">
                                <span className={cn("text-[10px] font-black uppercase tracking-widest", textColors[macro])}>{macro}</span>
                                <PieChart className="w-4 h-4 text-muted-foreground/20" />
                            </div>
                            <div className="flex items-baseline gap-2">
                                <h4 className="text-2xl font-black text-foreground italic leading-none">{totals.actual[key]}g</h4>
                                <span className="text-[10px] font-bold text-muted-foreground uppercase">/ {totals.target[key]}g</span>
                            </div>
                            <div className="mt-4 h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                                <div className={cn("h-full transition-all duration-1000", colors[macro])} style={{ width: `${Math.min(100, (totals.actual[key] / totals.target[key]) * 100 || 0)}%` }} />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Daily Meals Logging */}
            <div className="space-y-6 pb-24">
                {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center gap-4 text-muted-foreground/40 italic">
                        <Loader2 className="w-8 h-8 animate-spin" />
                        <p className="text-[10px] font-black uppercase tracking-widest">Synchronizing Protocols...</p>
                    </div>
                ) : Object.values(meals).every(m => m.length === 0) ? (
                    <div className="py-24 border-2 border-dashed border-border rounded-[3rem] flex flex-col items-center justify-center text-center bg-secondary/5 mx-auto max-w-sm mt-10">
                        <Utensils className="w-8 h-8 text-muted-foreground/20 mb-4" />
                        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground italic px-10">No dietary protocol registered for this date</p>
                    </div>
                ) : (
                    MEALS.map(mealType => {
                        const items = meals[mealType] || [];
                        if (items.length === 0) return null;
                        return (
                            <div key={mealType} className="space-y-4">
                                <h3 className="px-4 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground italic flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary" /> {mealType} EXECUTION
                                </h3>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    {items.map((item, idx) => (
                                        <div key={item.diet_plan_item_uuid} className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm hover:border-primary/10 transition-all p-5">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h4 className="text-sm font-black text-foreground uppercase italic leading-none mb-1">{item.food_name}</h4>
                                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Target: {item.prescribed.quantity}{item.prescribed.unit} • {item.prescribed.calories}kcal</p>
                                                </div>
                                                <div className={cn(
                                                    "w-8 h-8 rounded-xl flex items-center justify-center transition-all border",
                                                    item.logged ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-secondary text-muted-foreground border-border"
                                                )}>
                                                    <CheckCircle2 className="w-4.5 h-4.5" />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-3 gap-3">
                                                <div className="space-y-1">
                                                    <label className="text-[8px] font-black uppercase text-muted-foreground tracking-widest ml-1">Actual Qty</label>
                                                    <div className="flex bg-secondary/20 border border-border rounded-xl overflow-hidden focus-within:ring-1 focus-within:ring-primary/30">
                                                        <input 
                                                            type="number" className="w-full h-9 px-2 bg-transparent text-xs font-black outline-none border-none text-center"
                                                            value={item.logged?.quantity ?? item.prescribed.quantity}
                                                            onChange={(e) => handleUpdateLog(mealType, idx, { quantity: e.target.value })}
                                                        />
                                                        <div className="bg-background border-l border-border px-2 flex items-center text-[8px] font-black uppercase text-primary">{item.prescribed.unit}</div>
                                                    </div>
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[8px] font-black uppercase text-muted-foreground tracking-widest ml-1">Actual Kcal</label>
                                                    <input 
                                                        type="number" className="w-full h-9 px-2 bg-secondary/20 border border-border rounded-xl text-xs font-black outline-none focus:ring-1 focus:ring-primary/30 text-center"
                                                        value={item.logged?.calories ?? item.prescribed.calories}
                                                        onChange={(e) => handleUpdateLog(mealType, idx, { calories: e.target.value })}
                                                    />
                                                </div>
                                                <div className="flex items-end pb-1.5 px-2">
                                                    <div className="flex gap-2 w-full justify-between">
                                                        {['p', 'c', 'f'].map(m => (
                                                            <div key={m} className="text-center">
                                                                <p className="text-[7px] font-black text-muted-foreground uppercase">{m}</p>
                                                                <p className="text-[10px] font-black text-foreground">{item.logged?.macros[m] ?? item.prescribed.macros[m]}g</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default TrackDiet;
