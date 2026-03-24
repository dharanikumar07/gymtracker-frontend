import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
    Calendar as CalendarIcon, 
    Dumbbell, 
    Plus, 
    Trash2, 
    Save, 
    Loader2, 
    ChevronLeft,
    ChevronRight,
    Activity,
    Target,
    Clock,
    Weight,
    Video,
    ExternalLink,
    ChevronDown,
    Scale,
    X
} from 'lucide-react';
import { cn } from '../../../../lib/utils';
import Calendar from '../../../../components/Calendar';
import { useRoutineTrackingQuery, useLogWorkoutMutation, useRoutineQuery } from '../http/progressQueries';

const SetRow = ({ slotUuid, setIndex, set, metricsType, units, onUpdate, onRemove }) => {
    const hasWeight = 'weight' in set && set.weight !== undefined;

    return (
        <div className="grid grid-cols-[32px_1fr_1fr_auto] gap-2 md:gap-3 items-center group animate-in slide-in-from-right-2 duration-300">
            <div className="w-8 h-8 rounded-lg bg-secondary/50 border border-border flex items-center justify-center text-[10px] font-black text-muted-foreground shadow-inner">
                {setIndex + 1}
            </div>
            
            <div className="relative">
                <input 
                    type="number"
                    className="w-full h-9 pl-3 pr-7 bg-secondary/20 border border-border rounded-xl text-center text-xs font-black outline-none focus:ring-1 focus:ring-primary/30 transition-all"
                    value={metricsType === 'timed_sets' ? set.duration : set.reps}
                    onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        onUpdate(slotUuid, setIndex, metricsType === 'timed_sets' ? { duration: val } : { reps: val });
                    }}
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[7px] font-black text-muted-foreground/40 uppercase pointer-events-none">
                    {metricsType === 'timed_sets' ? 'sec' : 'reps'}
                </span>
            </div>

            <div className="relative">
                {hasWeight ? (
                    <div className="flex items-center h-9 bg-secondary/20 border border-border rounded-xl overflow-hidden focus-within:ring-1 focus-within:ring-primary/30 transition-all">
                        <input 
                            type="number"
                            className="flex-1 min-w-0 bg-transparent h-full px-2 text-center text-xs font-black outline-none border-none"
                            value={set.weight}
                            onChange={(e) => onUpdate(slotUuid, setIndex, { weight: parseFloat(e.target.value) || 0 })}
                        />
                        <div className="relative h-full border-l border-border/50">
                            <select 
                                className="h-full pl-1.5 pr-5 bg-primary/5 text-[8px] font-black text-primary outline-none appearance-none cursor-pointer uppercase"
                                value={set.weight_unit || 'kg'}
                                onChange={(e) => onUpdate(slotUuid, setIndex, { weight_unit: e.target.value })}
                            >
                                {units?.weight_units?.map(u => <option key={u} value={u}>{u}</option>)}
                            </select>
                            <ChevronDown className="absolute right-1 top-1/2 -translate-y-1/2 w-2.5 h-2.5 text-primary pointer-events-none" />
                        </div>
                        <button 
                            onClick={() => onUpdate(slotUuid, setIndex, { _removeWeight: true })}
                            className="absolute -top-1 -right-1 w-4 h-4 bg-background border border-border rounded-full flex items-center justify-center text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all shadow-sm z-10"
                        >
                            <X className="w-2 h-2" />
                        </button>
                    </div>
                ) : (
                    <button 
                        onClick={() => onUpdate(slotUuid, setIndex, { weight: 0, weight_unit: 'kg' })}
                        className="w-full h-9 rounded-xl border border-dashed border-border text-[8px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-1.5"
                    >
                        <Plus className="w-2.5 h-2.5" /> Weight
                    </button>
                )}
            </div>

            <button 
                onClick={() => onRemove(slotUuid, setIndex)}
                className="w-8 h-8 flex items-center justify-center text-muted-foreground/30 hover:text-red-500 transition-all"
            >
                <Trash2 className="w-3.5 h-3.5" />
            </button>
        </div>
    );
};

const TrackRoutine = () => {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const { data: routineData, isLoading: loading } = useRoutineTrackingQuery(selectedDate);
    // useRoutineQuery can replace fitnessStore.fetchRoutine if needed, 
    // but here we just need to ensure the data is synced.
    useRoutineQuery(); 
    
    const logMutation = useLogWorkoutMutation();
    
    const [exercises, setExercises] = useState([]);
    const [units, setUnits] = useState(null);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const calendarRef = useRef(null);

    // Sync local state with query data
    useEffect(() => {
        if (routineData) {
            setExercises(routineData.exercises || []);
            setUnits(routineData.units);
        }
    }, [routineData]);

    // Close calendar when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (calendarRef.current && !calendarRef.current.contains(event.target)) {
                setIsCalendarOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const weekDays = useMemo(() => {
        if (!selectedDate) return [];
        try {
            const baseDate = new Date(selectedDate);
            if (isNaN(baseDate.getTime())) return [];
            
            const day = baseDate.getDay();
            const diff = baseDate.getDate() - day + (day === 0 ? -6 : 1);
            const monday = new Date(new Date(selectedDate).setDate(diff));
            
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
        } catch (e) { return []; }
    }, [selectedDate]);

    const handleUpdateSet = (slotUuid, setIndex, updates) => {
        setExercises(prev => prev.map(ex => {
            if (ex.slot_uuid === slotUuid) {
                const performed = [...ex.performed_metrics];
                if (updates._removeWeight) {
                    const newSet = { ...performed[setIndex] };
                    delete newSet.weight;
                    delete newSet.weight_unit;
                    performed[setIndex] = newSet;
                } else {
                    performed[setIndex] = { ...performed[setIndex], ...updates };
                }
                return { ...ex, performed_metrics: performed };
            }
            return ex;
        }));
    };

    const handleAddSet = (slotUuid) => {
        setExercises(prev => prev.map(ex => {
            if (ex.slot_uuid === slotUuid) {
                const performed = Array.isArray(ex.performed_metrics) ? [...ex.performed_metrics] : [];
                const lastSet = performed.length > 0 ? performed[performed.length - 1] : null;
                const newSet = {
                    ...(lastSet?.weight !== undefined ? { weight: lastSet.weight, weight_unit: lastSet.weight_unit } : {}),
                    reps: lastSet?.reps ?? (ex.prescribed_metrics?.reps || 10),
                    duration: lastSet?.duration ?? (ex.prescribed_metrics?.duration || 0),
                    completed: true
                };
                return { ...ex, performed_metrics: [...performed, newSet] };
            }
            return ex;
        }));
    };

    const handleRemoveSet = (slotUuid, setIndex) => {
        setExercises(prev => prev.map(ex => {
            if (ex.slot_uuid === slotUuid) {
                const performed = [...ex.performed_metrics];
                performed.splice(setIndex, 1);
                return { ...ex, performed_metrics: performed };
            }
            return ex;
        }));
    };

    const handleSave = () => {
        const tracking = exercises.map(ex => ({
            slot_uuid: ex.slot_uuid,
            performed_metrics: ex.performed_metrics
        }));
        logMutation.mutate({ date: selectedDate, tracking });
    };

    return (
        <div className="h-full flex flex-col space-y-4 font-sans overflow-hidden max-w-4xl mx-auto w-full pb-20 px-2">
            {/* Optimized Header */}
            <div className="shrink-0 bg-card border border-border rounded-[2.5rem] p-3 shadow-sm relative">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-center gap-3 px-2 cursor-pointer group" onClick={() => setIsCalendarOpen(!isCalendarOpen)}>
                        <div className="w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20 shrink-0 group-hover:scale-105 transition-transform relative">
                            <CalendarIcon className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                            <h3 className="text-sm font-black text-foreground uppercase tracking-tight italic truncate leading-none">
                                {selectedDate ? new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Select Date'}
                            </h3>
                            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-emerald-500 flex items-center gap-1 mt-1">
                                <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" /> Active Protocol
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center justify-center bg-secondary/30 rounded-2xl p-1 gap-1 flex-1">
                        {weekDays.map((day) => {
                            const isActive = selectedDate === day.date;
                            return (
                                <button
                                    key={day.date} onClick={() => setSelectedDate(day.date)}
                                    className={cn(
                                        "flex-1 flex flex-col items-center py-1.5 rounded-xl transition-all border",
                                        isActive ? "bg-primary border-primary text-white shadow-sm" : "bg-transparent border-transparent text-muted-foreground hover:bg-background hover:text-primary"
                                    )}
                                >
                                    <span className="text-[7px] font-black uppercase tracking-widest mb-0.5">{day.dayName}</span>
                                    <span className="text-xs font-black italic">{day.dayNum}</span>
                                </button>
                            );
                        })}
                    </div>

                    <button 
                        onClick={handleSave} disabled={logMutation.isPending || exercises.length === 0}
                        className="h-10 px-6 bg-primary text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                    >
                        {logMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                        Commit
                    </button>
                </div>

                {isCalendarOpen && (
                    <div ref={calendarRef} className="absolute top-full left-0 mt-2 z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
                        <Calendar 
                            selectedDate={selectedDate}
                            onSelect={(date) => {
                                setSelectedDate(date);
                                setIsCalendarOpen(false);
                            }}
                        />
                    </div>
                )}
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar pt-2">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 gap-4">
                        <Loader2 className="w-8 h-8 animate-spin text-primary/40" />
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground animate-pulse">Syncing Protocols...</p>
                    </div>
                ) : exercises.length === 0 ? (
                    <div className="py-24 border-2 border-dashed border-border rounded-[3rem] flex flex-col items-center justify-center text-center bg-secondary/5 mx-auto max-w-sm mt-10">
                        <Activity className="w-8 h-8 text-muted-foreground/20 mb-4" />
                        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground italic px-10">No specific exercises registered for this date</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {exercises.map((ex, idx) => (
                            <div key={ex.slot_uuid} className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm hover:border-primary/10 transition-all">
                                <div className="bg-secondary/10 px-5 py-3 border-b border-border/50 flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-8 h-8 rounded-xl bg-background border border-border flex items-center justify-center text-[10px] font-black text-primary shadow-sm shrink-0">
                                            {idx + 1}
                                        </div>
                                        <div className="truncate">
                                            <h4 className="text-xs font-black text-foreground uppercase tracking-tight italic truncate leading-none mb-1">{ex.exercise_name}</h4>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[7px] font-black uppercase px-1.5 py-0.5 bg-primary/10 text-primary rounded border border-primary/10">
                                                    {ex.metrics_type?.replace('_', ' ')}
                                                </span>
                                                {ex.prescribed_metrics && (
                                                    <span className="text-[7px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                                                        Goal: {ex.prescribed_metrics.sets} x {ex.prescribed_metrics.reps || ex.prescribed_metrics.duration}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        {ex.sample_video_link && (
                                            <a href={ex.sample_video_link} target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-background border border-border rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary transition-all shadow-sm group">
                                                <Video className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                                            </a>
                                        )}
                                        <button onClick={() => handleAddSet(ex.slot_uuid)} className="h-8 px-3 bg-primary text-white rounded-lg font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-1.5 shadow-md shadow-primary/10 hover:scale-105 transition-all">
                                            <Plus className="w-3 h-3" /> Set
                                        </button>
                                    </div>
                                </div>
                                <div className="p-4 md:p-5">
                                    {!ex.performed_metrics || ex.performed_metrics.length === 0 ? (
                                        <button onClick={() => handleAddSet(ex.slot_uuid)} className="w-full py-6 rounded-2xl border border-dashed border-border/50 text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 hover:text-primary hover:bg-primary/5 transition-all italic">
                                            Log first set to start session
                                        </button>
                                    ) : (
                                        <div className="space-y-2">
                                            {ex.performed_metrics.map((set, sIdx) => (
                                                <SetRow key={sIdx} slotUuid={ex.slot_uuid} setIndex={sIdx} set={set} metricsType={ex.metrics_type} units={units} onUpdate={handleUpdateSet} onRemove={handleRemoveSet} />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TrackRoutine;
