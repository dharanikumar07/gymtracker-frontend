import React, { useState, useEffect, useCallback } from 'react';
import { 
    Dumbbell, 
    Trash2, 
    Plus, 
    Save, 
    RefreshCcw,
    Zap,
    Target,
    Loader2,
    CalendarDays,
    GripVertical,
    Weight,
    Timer,
    Activity,
    Video,
    Play,
    ExternalLink
} from 'lucide-react';
import { cn } from '../../../../lib/utils';
import api from '../../../../lib/api';
import { toast } from 'sonner';
import WorkoutMetricEditor from '../../../../components/WorkoutMetricEditor';

// DND Kit Imports
import {
    DndContext, 
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Sortable Item Component
const SortableExercise = ({ ex, idx, units, handleRemoveExercise, handleUpdateExercise, showVideoInput, setShowVideoInput }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: ex.id || `ex-${idx}` });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 0,
        opacity: isDragging ? 0.5 : 1,
    };

    const isVideoVisible = showVideoInput === idx;

    return (
        <div 
            ref={setNodeRef} 
            style={style}
            className={cn(
                "group bg-card border border-border rounded-3xl overflow-hidden transition-all hover:border-primary/30 shadow-sm relative",
                isDragging && "border-primary ring-4 ring-primary/10 shadow-2xl"
            )}
        >
            <div className="bg-secondary/10 px-6 py-4 flex items-center justify-between border-b border-border/50 font-sans">
                <div className="flex items-center gap-4 flex-1">
                    <div 
                        {...attributes} 
                        {...listeners}
                        className="cursor-grab active:cursor-grabbing p-1.5 text-muted-foreground hover:text-primary transition-colors bg-background rounded-lg border border-border"
                    >
                        <GripVertical className="w-4 h-4" />
                    </div>
                    <input 
                        className="bg-transparent border-none text-base font-black text-foreground outline-none uppercase tracking-tight italic flex-1"
                        value={ex.name} 
                        placeholder="Exercise Name..."
                        onChange={(e) => handleUpdateExercise(idx, { name: e.target.value })}
                    />
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                    <button 
                        onClick={() => setShowVideoInput(isVideoVisible ? null : idx)}
                        className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center transition-all border",
                            ex.sample_video_link 
                                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500 shadow-sm" 
                                : "bg-background text-muted-foreground border-border hover:text-primary hover:border-primary/20"
                        )}
                    >
                        <Video className="w-4.5 h-4.5" />
                    </button>
                    
                    <button 
                        onClick={() => handleRemoveExercise(idx)}
                        className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center text-muted-foreground hover:text-red-500 hover:border-red-500/20 transition-all"
                    >
                        <Trash2 className="w-4.5 h-4.5" />
                    </button>
                </div>
            </div>

            {isVideoVisible && (
                <div className="px-6 py-4 bg-primary/5 border-b border-border/50 animate-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center gap-3">
                        <div className="flex-1 relative">
                            <Play className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-primary/50" />
                            <input 
                                className="w-full h-11 pl-11 pr-4 bg-background border border-primary/20 rounded-2xl text-[11px] font-bold outline-none focus:ring-1 focus:ring-primary/30"
                                value={ex.sample_video_link || ''} 
                                placeholder="Paste tutorial video URL..."
                                onChange={(e) => handleUpdateExercise(idx, { sample_video_link: e.target.value })}
                            />
                        </div>
                        {ex.sample_video_link && (
                            <a 
                                href={ex.sample_video_link} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="w-11 h-11 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-105 transition-all"
                            >
                                <ExternalLink className="w-4.5 h-4.5" />
                            </a>
                        )}
                    </div>
                </div>
            )}

            <div className="p-6 bg-card">
                <WorkoutMetricEditor 
                    metrics={ex.metrics}
                    units={units}
                    onUpdate={(newMetrics) => handleUpdateExercise(idx, { metrics: newMetrics })}
                />
            </div>
        </div>
    );
};

const DailyRoutine = ({ data, onUpdate }) => {
    const [selectedDay, setSelectedDay] = useState(() => {
        const daysArr = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return daysArr[new Date().getDay()];
    });

    const [editSplit, setEditSplit] = useState({});
    const [saving, setSaving] = useState(false);
    const [showVideoInput, setShowVideoInput] = useState(null);
    const [units, setUnits] = useState({ 
        weight_units: ['kg', 'lb'],
        duration_units: ['seconds', 'minutes', 'hours']
    });

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Normalize incoming data structure
    useEffect(() => {
        if (data?.routine) {
            const normalized = {};
            Object.keys(data.routine).forEach(day => {
                const dayData = data.routine[day];
                const workouts = dayData.workouts || [];

                normalized[day] = {
                    workouts: workouts.map((ex, i) => ({
                        ...ex,
                        id: ex.uuid || `${day}-${i}-${Math.random()}`
                    }))
                };
            });
            setEditSplit(normalized);
        }
    }, [data]);

    const handleAddExercise = useCallback(() => {
        setEditSplit(prev => {
            const updated = { ...prev };
            const currentDayData = updated[selectedDay] || { workouts: [] };
            
            const newExercise = { 
                id: `new-${Date.now()}-${Math.random()}`,
                name: '', 
                sample_video_link: '',
                metrics: {
                    type: 'strength',
                    data: { sets: 4, reps: 12, rest: 60 }
                }
            };
            
            updated[selectedDay] = {
                ...currentDayData,
                workouts: [...(currentDayData.workouts || []), newExercise]
            };
            
            return updated;
        });
    }, [selectedDay]);

    const handleRemoveExercise = (index) => {
        const updated = { ...editSplit };
        updated[selectedDay].workouts = updated[selectedDay].workouts.filter((_, i) => i !== index);
        setEditSplit(updated);
    };

    const handleUpdateExercise = (index, updates) => {
        const updated = { ...editSplit };
        updated[selectedDay].workouts[index] = { ...updated[selectedDay].workouts[index], ...updates };
        setEditSplit(updated);
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            setEditSplit((prev) => {
                const dayWorkouts = [...prev[selectedDay].workouts];
                const oldIndex = dayWorkouts.findIndex(item => item.id === active.id);
                const newIndex = dayWorkouts.findIndex(item => item.id === over.id);
                
                const updatedWorkouts = arrayMove(dayWorkouts, oldIndex, newIndex);
                return { 
                    ...prev, 
                    [selectedDay]: { ...prev[selectedDay], workouts: updatedWorkouts } 
                };
            });
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.patch('/routine', { 
                plan_uuid: data.plan.uuid,
                routine: editSplit 
            });
            toast.success("Routine updated!");
            if (onUpdate) onUpdate();
        } catch (err) {
            console.error(err);
            toast.error("Failed to save changes.");
        } finally {
            setSaving(false);
        }
    };

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const currentDayData = editSplit[selectedDay] || { workouts: [] };
    const currentExercises = currentDayData.workouts || [];

    return (
        <div className="h-full flex flex-col space-y-6 overflow-hidden font-sans">
            
            <div className="shrink-0 space-y-6">
                {/* Day Selector */}
                <div className="flex justify-between items-center gap-1.5 bg-secondary/20 p-1.5 rounded-[1.8rem] border border-border overflow-x-auto no-scrollbar">
                    {days.map((day) => {
                        const isActive = selectedDay === day;
                        const dayData = editSplit[day] || { workouts: [] };
                        const workouts = dayData.workouts || [];
                        const isRest = workouts.length === 1 && workouts[0].metrics?.type === 'rest';
                        const hasWorkout = workouts.length > 0 && !isRest;

                        return (
                            <button
                                key={day}
                                onClick={() => setSelectedDay(day)}
                                className={cn(
                                    "flex-1 min-w-[70px] py-3.5 rounded-2xl text-[10px] font-black transition-all flex flex-row items-center justify-center gap-2 relative overflow-hidden",
                                    isActive ? "bg-primary text-white shadow-lg shadow-primary/30 scale-105" : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                                )}
                            >
                                {day}
                                {hasWorkout && (
                                    <div className={cn(
                                        "w-1 h-1 rounded-full shrink-0",
                                        isActive ? "bg-white" : "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"
                                    )} />
                                )}
                            </button>
                        );
                    })}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
                    <div className="flex items-center gap-4 text-foreground">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-sm">
                            <CalendarDays className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black uppercase tracking-tighter italic leading-none mb-1">{selectedDay} EXECUTION</h3>
                            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-[0.2em]">Manage your daily workout sequence</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={handleAddExercise}
                            className="flex-1 sm:flex-initial h-12 px-6 bg-secondary text-foreground rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 border border-border hover:bg-secondary/80 transition-all shadow-sm"
                        >
                            <Plus className="w-4 h-4 text-primary" /> Add Exercise
                        </button>
                        <button 
                            onClick={handleSave}
                            disabled={saving}
                            className="flex-1 sm:flex-initial h-12 px-8 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Commit Changes
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar pb-10">
                <div className="space-y-4 pr-1">
                    {currentExercises.length === 0 ? (
                        <div className="py-24 border-2 border-dashed border-border rounded-[3rem] flex flex-col items-center justify-center text-center bg-secondary/10">
                            <div className="w-16 h-16 rounded-full bg-background border border-border flex items-center justify-center text-muted-foreground/30 shadow-sm mb-4">
                                <Activity className="w-8 h-8" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-foreground italic">Recovery Phase</p>
                                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">No exercises registered for {selectedDay}</p>
                            </div>
                            <button 
                                onClick={handleAddExercise}
                                className="mt-6 h-12 px-8 bg-primary/10 text-primary border border-primary/20 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary/20 transition-all flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" /> Create First Exercise
                            </button>
                        </div>
                    ) : (
                        <DndContext 
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext 
                                items={currentExercises.map(ex => ex.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                <div className="space-y-4">
                                    {currentExercises.map((ex, idx) => (
                                        <SortableExercise 
                                            key={ex.id}
                                            ex={ex}
                                            idx={idx}
                                            units={units}
                                            handleRemoveExercise={handleRemoveExercise}
                                            handleUpdateExercise={handleUpdateExercise}
                                            showVideoInput={showVideoInput}
                                            setShowVideoInput={setShowVideoInput}
                                        />
                                    ))}
                                </div>
                            </SortableContext>
                        </DndContext>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DailyRoutine;
