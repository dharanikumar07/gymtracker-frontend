import React, { useState, useEffect, useRef } from 'react';
import { 
    Dumbbell, 
    Trash2, 
    Plus, 
    ChevronDown,
    GripVertical,
    Loader2,
    Moon,
    Coffee,
    CalendarDays
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { usePhysicalActivityQuery, useDeleteWorkoutSlotMutation } from '../http/onboardingQueries';
import WorkoutMetricEditor from '../../../components/WorkoutMetricEditor';
import Calendar from '../../../components/Calendar';
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
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const activityIcons = {
    strength_training: Dumbbell,
    cardio: Dumbbell,
    flexibility: Dumbbell,
    balance: Dumbbell,
    calisthenics: Dumbbell
};

const transformApiResponse = (apiData) => {
    if (!apiData?.data) return null;

    const { plan, slots, physical_activity_type, units, metrics_types } = apiData.data;

    const groupedSlots = {};
    DAYS.forEach(day => {
        groupedSlots[day] = { target_muscles: [], workouts: [] };
    });

    slots?.forEach(slot => {
        const dayKey = slot.day.charAt(0).toUpperCase() + slot.day.slice(1).toLowerCase();
        if (groupedSlots[dayKey]) {
            groupedSlots[dayKey].workouts.push({
                uuid: slot.uuid || null,
                name: slot.exercise_name,
                exercise_order: slot.exercise_order,
                sample_video_link: slot.meta_data?.sample_video_link || '',
                metrics: {
                    type: slot.metrics_type,
                    data: slot.metrics_data || {}
                }
            });
        }
    });

    const formattedPlan = {
        uuid: plan?.uuid || null,
        name: plan?.name || 'My Transformation Plan',
        physical_activity_type: plan?.meta_data?.physical_activity_type || physical_activity_type || 'strength_training',
        start_date: plan?.start_date ? plan.start_date.split('T')[0] : '',
        end_date: plan?.end_date ? plan.end_date.split('T')[0] : '',
        is_active: plan?.is_active ?? true
    };

    const config = {
        units: units || { weight_units: ['kg'], duration_units: ['minutes'] },
        metrics_types: metrics_types || ['strength', 'timed_sets', 'endurance']
    };

    return { plan: formattedPlan, weekly_split: groupedSlots, onboarding_config: config };
};

const SectionHeader = ({ title, icon: Icon }) => (
    <div className="flex items-center gap-2 mb-3">
        <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_10px_rgba(var(--primary))]" />
        <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground">{title}</h3>
    </div>
);

const RestSlot = ({ ex, exIdx, handleRemoveWorkout, updateWorkout }) => (
    <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 border-2 border-primary/20 dark:border-primary/30">
        <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
        
        <div className="relative flex flex-col items-center justify-center py-8 sm:py-12 px-6">
            <div className="w-14 h-14 sm:w-18 sm:h-18 rounded-2xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center mb-4 sm:mb-5 shadow-lg shadow-primary/10">
                <Moon className="w-7 h-7 sm:w-9 sm:h-9 text-primary" />
            </div>
            
            <h3 className="text-base sm:text-lg font-black uppercase tracking-wider text-foreground mb-1 sm:mb-2">
                Rest Day
            </h3>
            
            <p className="text-[10px] sm:text-xs text-muted-foreground text-center max-w-[220px]">
                Recovery is part of progress. Take it easy today.
            </p>
            
            <div className="flex items-center gap-3 mt-5 sm:mt-6 px-4 py-2 bg-secondary/50 dark:bg-secondary/30 rounded-full">
                <div className="flex items-center gap-1.5">
                    <Coffee className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary/70" />
                    <span className="text-[9px] sm:text-[10px] text-muted-foreground font-semibold">Recovery</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-primary/40" />
                <div className="flex items-center gap-1.5">
                    <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-primary/20 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-primary" />
                    </div>
                    <span className="text-[9px] sm:text-[10px] text-muted-foreground font-semibold">Relax</span>
                </div>
            </div>

            <button
                onClick={() => updateWorkout(exIdx, { 
                    metrics: { 
                        type: 'strength', 
                        data: { sets: 3, reps: 10, rest: 60 } 
                    } 
                })}
                className="mt-4 px-4 py-2 text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-primary hover:bg-primary/10 rounded-lg transition-colors"
            >
                Back to Workout
            </button>
            
            <button
                onClick={() => handleRemoveWorkout(exIdx, ex.uuid)}
                className="absolute top-3 right-3 p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors cursor-pointer"
            >
                <Trash2 className="w-4 h-4 text-red-500" />
            </button>
        </div>
    </div>
);

const SortableExercise = ({ ex, exIdx, isExpanded, setExpandedExercise, updateWorkout, handleRemoveWorkout, config }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: ex.uuid || `new-${exIdx}` });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 1000 : 'auto',
    };

    const metricsText = () => {
        if (ex.metrics?.type === 'strength') {
            return `${ex.metrics.data?.sets || 0} sets × ${ex.metrics.data?.reps || 0} reps`;
        }
        if (ex.metrics?.type === 'timed_sets') {
            return `${ex.metrics.data?.sets || 0} sets × ${ex.metrics.data?.duration || 0}s`;
        }
        if (ex.metrics?.type === 'endurance') {
            return `${ex.metrics.data?.duration || 0}s hold`;
        }
        return ex.metrics?.type || 'rest';
    };

    const handleToggleExpand = (e) => {
        e.stopPropagation();
        setExpandedExercise(isExpanded ? null : exIdx);
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        handleRemoveWorkout(exIdx, ex.uuid);
    };

    return (
        <div 
            ref={setNodeRef}
            style={style}
            className={cn(
                "border-2 rounded-xl sm:rounded-2xl overflow-hidden transition-all duration-200",
                isExpanded ? "border-primary/30 bg-primary/5" : "border-border bg-secondary/20",
                isDragging && "shadow-xl shadow-primary/20"
            )}
        >
            <div className="w-full p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
                <button
                    {...attributes}
                    {...listeners}
                    className="cursor-grab active:cursor-grabbing p-1 hover:bg-primary/10 rounded-lg transition-colors"
                >
                    <GripVertical className="w-4 h-4 text-muted-foreground" />
                </button>
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-primary/10 text-primary flex items-center justify-center text-[9px] sm:text-[10px] font-black">
                    {exIdx + 1}
                </div>
                <button
                    onClick={handleToggleExpand}
                    className="flex-1 text-left min-w-0"
                >
                    <div className="flex-1 text-left min-w-0">
                        <p className={cn(
                            "text-[10px] sm:text-[12px] font-black uppercase tracking-tight truncate",
                            ex.name ? "text-foreground" : "text-muted-foreground italic"
                        )}>
                            {ex.name || 'New Exercise'}
                        </p>
                        <p className="text-[8px] sm:text-[9px] text-muted-foreground">
                            {metricsText()}
                        </p>
                    </div>
                </button>
                <button
                    onClick={handleDelete}
                    className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors cursor-pointer"
                >
                    <Trash2 className="w-4 h-4 text-red-500" />
                </button>
                <button
                    onClick={handleToggleExpand}
                    className={cn(
                        "w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center transition-transform duration-200",
                        isExpanded ? "bg-primary text-white rotate-180" : "bg-secondary text-muted-foreground"
                    )}
                >
                    <ChevronDown className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                </button>
            </div>

            <div
                className={cn(
                    "overflow-hidden transition-all duration-200 ease-out",
                    isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                )}
            >
                <div className="px-3 sm:px-4 pb-3 sm:pb-4 pt-3 sm:pt-4 border-t border-border/50 space-y-3 sm:space-y-4">
                    <div className="space-y-1">
                        <label className="text-[8px] sm:text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Exercise Name</label>
                        <input 
                            className="w-full h-9 sm:h-10 px-3 sm:px-4 bg-background border border-border rounded-lg sm:rounded-xl focus:border-primary/50 outline-none text-[10px] sm:text-xs font-semibold transition-all"
                            value={ex.name}
                            placeholder="e.g. Bench Press"
                            onChange={(e) => updateWorkout(exIdx, { name: e.target.value })}
                        />
                    </div>

                    <div className="space-y-1.5 sm:space-y-2">
                        <WorkoutMetricEditor 
                            metrics={{ ...ex.metrics, available_metrics: config.metrics_types }}
                            units={config.units}
                            onUpdate={(newMetrics) => updateWorkout(exIdx, { metrics: newMetrics })}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

const Step2 = ({ data, updateData }) => {
    const [activeDay, setActiveDay] = useState('Mon');
    const [expandedExercise, setExpandedExercise] = useState(null);
    const synced = useRef(false);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const activityType = data.physical_activity_type || 'strength_training';
    const { data: apiData, isLoading } = usePhysicalActivityQuery(activityType);
    const deleteWorkoutSlot = useDeleteWorkoutSlotMutation();

    useEffect(() => {
        const transformed = transformApiResponse(apiData);
        if (transformed && !synced.current) {
            synced.current = true;
            updateData({
                plan: transformed.plan,
                weekly_split: transformed.weekly_split,
                onboarding_config: transformed.onboarding_config
            });
            const firstDayWorkouts = transformed.weekly_split['Mon']?.workouts || [];
            setExpandedExercise(firstDayWorkouts.length > 0 ? 0 : null);
        }
    }, [apiData, updateData]);

    const selectedFocus = data.physical_activity_type || 'strength_training';
    const weeklySplit = data.weekly_split || {};
    const config = data.onboarding_config || { units: { weight_units: ['kg'], duration_units: ['minutes'] }, metrics_types: ['strength', 'timed_sets', 'endurance'] };
    const plan = data.plan || { name: '', start_date: '', end_date: '', is_active: true };

    const dayData = weeklySplit[activeDay] || { target_muscles: [], workouts: [] };

    const updatePlan = (updates) => {
        updateData({ plan: { ...plan, ...updates } });
    };

    const updateDay = (updates) => {
        const currentSplit = { ...weeklySplit };
        currentSplit[activeDay] = { ...dayData, ...updates };
        updateData({ weekly_split: currentSplit });
    };

    const handleAddWorkout = () => {
        const newEx = { 
            name: '', 
            sample_video_link: '',
            metrics: {
                type: 'strength',
                data: { sets: 3, reps: 10, rest: 60 }
            }
        };
        const currentWorkouts = dayData.workouts || [];
        updateDay({ workouts: [newEx, ...currentWorkouts] });
        setExpandedExercise(0);
    };

    const handleRemoveWorkout = (exIdx, slotUuid) => {
        updateDay({ workouts: dayData.workouts.filter((_, i) => i !== exIdx) });
        if (expandedExercise === exIdx) setExpandedExercise(null);
        
        if (slotUuid) {
            deleteWorkoutSlot.mutate(slotUuid);
        }
    };

    const updateWorkout = (exIdx, updates) => {
        const wks = [...dayData.workouts];
        wks[exIdx] = { ...wks[exIdx], ...updates };
        updateDay({ workouts: wks });
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        
        if (active.id !== over?.id) {
            const oldIndex = dayData.workouts.findIndex((w) => (w.uuid || `new-${dayData.workouts.indexOf(w)}`) === active.id);
            const newIndex = dayData.workouts.findIndex((w) => (w.uuid || `new-${dayData.workouts.indexOf(w)}`) === over.id);
            
            const reorderedWorkouts = arrayMove(dayData.workouts, oldIndex, newIndex);
            updateDay({ workouts: reorderedWorkouts });
        }
    };

    const IconComponent = activityIcons[selectedFocus] || Dumbbell;
    const totalExercises = Object.values(weeklySplit).reduce((acc, day) => acc + (day.workouts?.length || 0), 0);

    if (isLoading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="h-24 bg-secondary/50 rounded-3xl" />
                <div className="h-40 bg-secondary/50 rounded-3xl" />
                <div className="h-16 bg-secondary/50 rounded-3xl" />
                <div className="h-48 bg-secondary/50 rounded-3xl" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/20 rounded-2xl sm:rounded-3xl p-4 sm:p-5">
                <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                        <IconComponent className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-xs sm:text-base font-black uppercase tracking-tight text-foreground truncate">
                            {plan.name || 'Your Training Plan'}
                        </h3>
                        <p className="text-[8px] sm:text-[10px] text-muted-foreground font-medium">
                            {totalExercises} exercises across {Object.values(weeklySplit).filter(d => d.workouts?.length > 0).length || 1} days
                        </p>
                    </div>
                    {plan.is_active && (
                        <div className="flex items-center gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 bg-primary/10 rounded-full">
                            <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-primary animate-pulse" />
                            <span className="text-[7px] sm:text-[9px] font-black uppercase text-primary">Active</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-card border-2 border-border rounded-2xl sm:rounded-3xl p-4 sm:p-5 space-y-4">
                <SectionHeader title="Plan Details" icon={Calendar} />
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="space-y-1.5 sm:col-span-4">
                        <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-muted-foreground ml-1">Plan Name</label>
                        <input 
                            className="w-full h-10 px-4 bg-secondary/30 border border-border rounded-xl focus:border-primary/50 outline-none text-xs font-semibold transition-all"
                            value={plan.name} 
                            placeholder="e.g. 12-Week Strength Phase"
                            onChange={(e) => updatePlan({ name: e.target.value })}
                        />
                    </div>
                    <div className="space-y-1.5 relative sm:col-span-2">
                        <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-muted-foreground ml-1">Start Date</label>
                        <Calendar
                            selectedDate={plan.start_date}
                            onSelect={(date) => updatePlan({ start_date: date })}
                            triggerClassName="w-full h-10 px-4 bg-secondary/30 border border-border rounded-xl focus:border-primary/50 outline-none text-xs font-semibold transition-all flex items-center justify-between"
                            triggerContent="Select date"
                        />
                    </div>
                    <div className="space-y-1.5 relative sm:col-span-2">
                        <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-muted-foreground ml-1">End Date</label>
                        <Calendar
                            selectedDate={plan.end_date}
                            onSelect={(date) => updatePlan({ end_date: date })}
                            triggerClassName="w-full h-10 px-4 bg-secondary/30 border border-border rounded-xl focus:border-primary/50 outline-none text-xs font-semibold transition-all flex items-center justify-between"
                            triggerContent="Select date"
                        />
                    </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border/50">
                    <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-muted-foreground">Activation</span>
                    <button 
                        onClick={() => updatePlan({ is_active: !plan.is_active })}
                        className="flex items-center gap-2"
                    >
                        <span className={cn(
                            "text-[10px] sm:text-[11px] font-black uppercase tracking-wider transition-colors",
                            plan.is_active ? "text-primary" : "text-muted-foreground"
                        )}>
                            {plan.is_active ? 'Active' : 'Inactive'}
                        </span>
                        <div className={cn(
                            "relative w-11 h-6 rounded-full transition-all duration-300",
                            plan.is_active ? "bg-primary" : "bg-secondary"
                        )}>
                            <div className={cn(
                                "absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white shadow-md transition-all duration-300",
                                plan.is_active 
                                    ? "translate-x-6" 
                                    : "translate-x-1"
                            )} />
                        </div>
                    </button>
                </div>
            </div>

            <div className="bg-card border-2 border-border rounded-2xl sm:rounded-3xl p-4 sm:p-5">
                <SectionHeader title="Weekly Schedule" icon={Dumbbell} />
                <div className="flex gap-1 sm:gap-2 p-1.5 bg-secondary/30 rounded-xl sm:rounded-2xl overflow-x-auto">
                    {DAYS.map((day) => {
                        const isActive = activeDay === day;
                        const dData = weeklySplit[day] || { workouts: [] };
                        const hasWorkouts = dData.workouts?.length > 0 && dData.workouts.some(w => w.name);
                        
                        return (
                            <button 
                                key={day} 
                                onClick={() => {
                                    setActiveDay(day);
                                    const dayWorkouts = weeklySplit[day]?.workouts || [];
                                    setExpandedExercise(dayWorkouts.length > 0 ? 0 : null);
                                }}
                                className={cn(
                                    "flex-1 py-2 sm:py-3 px-1 sm:px-2 rounded-lg sm:rounded-xl text-[8px] sm:text-[10px] font-black uppercase tracking-tight transition-all flex flex-col items-center gap-0.5 sm:gap-1 shrink-0 min-w-[36px] sm:min-w-[44px]",
                                    isActive 
                                        ? "bg-primary text-white shadow-lg shadow-primary/20" 
                                        : "text-muted-foreground hover:bg-secondary"
                                )}
                            >
                                <span>{day}</span>
                                {hasWorkouts && (
                                    <div className={cn(
                                        "w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full",
                                        isActive ? "bg-white" : "bg-primary"
                                    )} />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="bg-card border-2 border-border rounded-2xl sm:rounded-3xl p-4 sm:p-5">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-foreground">{activeDay}'s Exercises</span>
                        {dayData.workouts?.length > 0 && (
                            <span className="px-1.5 sm:px-2 py-0.5 bg-secondary text-[8px] sm:text-[9px] font-bold rounded-full text-muted-foreground">
                                {dayData.workouts.length}
                            </span>
                        )}
                    </div>
                    <button 
                        onClick={handleAddWorkout}
                        className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-1.5 bg-primary text-white text-[9px] sm:text-[10px] font-black uppercase tracking-wider rounded-lg hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                    >
                        <Plus className="w-2.5 sm:w-3 h-2.5 sm:h-3" /> Add
                    </button>
                </div>

                {dayData.workouts?.length > 0 ? (
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={dayData.workouts.map((w, i) => w.uuid || `new-${i}`)}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="space-y-2 sm:space-y-3">
                                {dayData.workouts?.map((ex, exIdx) => (
                                    ex.metrics?.type === 'rest' ? (
                                        <RestSlot 
                                            key={ex.uuid || `rest-${exIdx}`} 
                                            ex={ex} 
                                            exIdx={exIdx} 
                                            handleRemoveWorkout={handleRemoveWorkout}
                                            updateWorkout={updateWorkout} 
                                        />
                                    ) : (
                                        <SortableExercise
                                            key={ex.uuid || `new-${exIdx}`}
                                            ex={ex}
                                            exIdx={exIdx}
                                            isExpanded={expandedExercise === exIdx}
                                            setExpandedExercise={setExpandedExercise}
                                            updateWorkout={updateWorkout}
                                            handleRemoveWorkout={handleRemoveWorkout}
                                            config={config}
                                        />
                                    )
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                ) : (
                    <div className="py-8 sm:py-12 text-center bg-secondary/20 rounded-2xl sm:rounded-3xl border-2 border-dashed border-border">
                        <Dumbbell className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground/30 mx-auto mb-2 sm:mb-3" />
                        <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-muted-foreground mb-1">
                            Rest Day
                        </p>
                        <p className="text-[9px] sm:text-[10px] text-muted-foreground/60 mb-3 sm:mb-4">
                            No exercises for {activeDay}
                        </p>
                        <button 
                            onClick={handleAddWorkout}
                            className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-primary text-white text-[9px] sm:text-[10px] font-black uppercase tracking-wider rounded-lg sm:rounded-xl hover:bg-primary/90 transition-colors"
                        >
                            <Plus className="w-2.5 sm:w-3 h-2.5 sm:h-3" /> Add Exercise
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Step2;
