import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
    Dumbbell, 
    Trash2, 
    Plus, 
    ChevronDown,
    Video,
    ExternalLink,
    Calendar,
    Check,
    Loader2
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { usePhysicalActivityQuery } from '../http/onboardingQueries';
import WorkoutMetricEditor from '../../../components/WorkoutMetricEditor';

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

    const { plan, slots, physical_activity_type } = apiData.data;

    const groupedSlots = {};
    DAYS.forEach(day => {
        groupedSlots[day] = { target_muscles: [], workouts: [] };
    });

    slots?.forEach(slot => {
        const dayKey = slot.day.charAt(0).toUpperCase() + slot.day.slice(1).toLowerCase();
        if (groupedSlots[dayKey]) {
            groupedSlots[dayKey].workouts.push({
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
        units: plan?.meta_data?.units || { weight_units: ['kg'], duration_units: ['min'] },
        metrics_types: plan?.meta_data?.metrics_types || ['strength', 'timed_sets', 'endurance']
    };

    return { plan: formattedPlan, weekly_split: groupedSlots, onboarding_config: config };
};

const Step2 = ({ data, updateData }) => {
    const [activeDay, setActiveDay] = useState('Mon');
    const [expandedExercise, setExpandedExercise] = useState(null);
    const synced = useRef(false);

    const activityType = data.physical_activity_type || 'strength_training';
    const { data: apiData, isLoading } = usePhysicalActivityQuery(activityType);

    useEffect(() => {
        const transformed = transformApiResponse(apiData);
        if (transformed && !synced.current) {
            synced.current = true;
            updateData({
                plan: transformed.plan,
                weekly_split: transformed.weekly_split,
                onboarding_config: transformed.onboarding_config
            });
        }
    }, [apiData, updateData]);

    const selectedFocus = data.physical_activity_type || 'strength_training';
    const weeklySplit = data.weekly_split || {};
    const config = data.onboarding_config || { units: { weight_units: ['kg'], duration_units: ['min'] }, metrics_types: [] };
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
        updateDay({ workouts: [...(dayData.workouts || []), newEx] });
        setExpandedExercise(dayData.workouts?.length || 0);
    };

    const handleRemoveWorkout = (exIdx) => {
        updateDay({ workouts: dayData.workouts.filter((_, i) => i !== exIdx) });
        if (expandedExercise === exIdx) setExpandedExercise(null);
    };

    const updateWorkout = (exIdx, updates) => {
        const wks = [...dayData.workouts];
        wks[exIdx] = { ...wks[exIdx], ...updates };
        updateDay({ workouts: wks });
    };

    const IconComponent = activityIcons[selectedFocus] || Dumbbell;
    const totalExercises = Object.values(weeklySplit).reduce((acc, day) => acc + (day.workouts?.length || 0), 0);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-24 gap-5">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground italic">Loading...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/20 rounded-3xl p-5">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                        <IconComponent className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-base font-black uppercase tracking-tight text-foreground">
                            {plan.name || 'Your Training Plan'}
                        </h3>
                        <p className="text-[10px] text-muted-foreground font-medium">
                            {totalExercises} exercises across {Object.values(weeklySplit).filter(d => d.workouts?.length > 0).length || 1} days
                        </p>
                    </div>
                    {plan.is_active && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 rounded-full">
                            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                            <span className="text-[9px] font-black uppercase text-primary">Active</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-card border-2 border-border rounded-3xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-foreground">Plan Details</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1.5 sm:col-span-3">
                        <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Plan Name</label>
                        <input 
                            className="w-full h-10 px-4 bg-secondary/30 border border-border rounded-xl focus:border-primary/50 outline-none text-xs font-semibold transition-all"
                            value={plan.name} 
                            placeholder="e.g. 12-Week Strength Phase"
                            onChange={(e) => updatePlan({ name: e.target.value })}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Start Date</label>
                        <input 
                            type="date"
                            className="w-full h-10 px-4 bg-secondary/30 border border-border rounded-xl focus:border-primary/50 outline-none text-xs font-semibold transition-all"
                            value={plan.start_date}
                            onChange={(e) => updatePlan({ start_date: e.target.value })}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">End Date</label>
                        <input 
                            type="date"
                            className="w-full h-10 px-4 bg-secondary/30 border border-border rounded-xl focus:border-primary/50 outline-none text-xs font-semibold transition-all"
                            value={plan.end_date}
                            onChange={(e) => updatePlan({ end_date: e.target.value })}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Activation</label>
                        <button 
                            onClick={() => updatePlan({ is_active: !plan.is_active })}
                            className={cn(
                                "w-full h-10 rounded-xl font-black text-[10px] uppercase tracking-wider transition-all flex items-center justify-center gap-2",
                                plan.is_active 
                                    ? "bg-emerald-500 text-white" 
                                    : "bg-secondary text-muted-foreground"
                            )}
                        >
                            {plan.is_active ? (
                                <>
                                    <Check className="w-3.5 h-3.5" /> Active
                                </>
                            ) : (
                                'Set Active'
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-card border-2 border-border rounded-3xl p-5">
                <div className="flex items-center gap-3 mb-4">
                    <Dumbbell className="w-4 h-4 text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-foreground">Weekly Schedule</span>
                </div>
                
                <div className="flex gap-2 p-1.5 bg-secondary/30 rounded-2xl">
                    {DAYS.map((day) => {
                        const isActive = activeDay === day;
                        const dData = weeklySplit[day] || { workouts: [] };
                        const hasWorkouts = dData.workouts?.length > 0 && dData.workouts.some(w => w.name);
                        
                        return (
                            <button 
                                key={day} 
                                onClick={() => setActiveDay(day)}
                                className={cn(
                                    "flex-1 py-3 px-2 rounded-xl text-[10px] font-black uppercase tracking-tight transition-all flex flex-col items-center gap-1 relative",
                                    isActive 
                                        ? "bg-primary text-white shadow-lg shadow-primary/20" 
                                        : "text-muted-foreground hover:bg-secondary"
                                )}
                            >
                                <span>{day}</span>
                                {hasWorkouts && (
                                    <div className={cn(
                                        "w-1.5 h-1.5 rounded-full",
                                        isActive ? "bg-white" : "bg-primary"
                                    )} />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="bg-card border-2 border-border rounded-3xl p-5">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black uppercase tracking-widest text-foreground">{activeDay}'s Exercises</span>
                        {dayData.workouts?.length > 0 && (
                            <span className="px-2 py-0.5 bg-secondary text-[9px] font-bold rounded-full text-muted-foreground">
                                {dayData.workouts.length}
                            </span>
                        )}
                    </div>
                    <button 
                        onClick={handleAddWorkout}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white text-[10px] font-black uppercase tracking-wider rounded-lg hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                    >
                        <Plus className="w-3 h-3" /> Add
                    </button>
                </div>

                <div className="space-y-3">
                    {dayData.workouts?.map((ex, exIdx) => {
                        const isExpanded = expandedExercise === exIdx;
                        const hasVideo = !!ex.sample_video_link;
                        
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
                        
                        return (
                            <div 
                                key={exIdx}
                                className={cn(
                                    "border-2 rounded-2xl overflow-hidden transition-all",
                                    isExpanded ? "border-primary/30 bg-primary/5" : "border-border bg-secondary/20"
                                )}
                            >
                                <button
                                    onClick={() => setExpandedExercise(isExpanded ? null : exIdx)}
                                    className="w-full p-4 flex items-center gap-3"
                                >
                                    <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-[10px] font-black">
                                        {exIdx + 1}
                                    </div>
                                    <div className="flex-1 text-left">
                                        <p className={cn(
                                            "text-[12px] font-black uppercase tracking-tight",
                                            ex.name ? "text-foreground" : "text-muted-foreground italic"
                                        )}>
                                            {ex.name || 'New Exercise'}
                                        </p>
                                        <p className="text-[9px] text-muted-foreground">
                                            {metricsText()}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {hasVideo && (
                                            <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                                                <Video className="w-3.5 h-3.5" />
                                            </div>
                                        )}
                                        <div className={cn(
                                            "w-7 h-7 rounded-lg flex items-center justify-center transition-transform",
                                            isExpanded ? "bg-primary text-white rotate-180" : "bg-secondary text-muted-foreground"
                                        )}>
                                            <ChevronDown className="w-4 h-4" />
                                        </div>
                                    </div>
                                </button>

                                {isExpanded && (
                                    <div className="px-4 pb-4 space-y-4 border-t border-border/50 pt-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Exercise Name</label>
                                            <input 
                                                className="w-full h-10 px-4 bg-background border border-border rounded-xl focus:border-primary/50 outline-none text-xs font-semibold transition-all"
                                                value={ex.name}
                                                placeholder="e.g. Bench Press"
                                                onChange={(e) => updateWorkout(exIdx, { name: e.target.value })}
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Tutorial Video (Optional)</label>
                                            <div className="flex gap-2">
                                                <input 
                                                    className="flex-1 h-10 px-4 bg-background border border-border rounded-xl focus:border-primary/50 outline-none text-xs font-semibold transition-all"
                                                    value={ex.sample_video_link || ''}
                                                    placeholder="https://youtube.com/..."
                                                    onChange={(e) => updateWorkout(exIdx, { sample_video_link: e.target.value })}
                                                />
                                                {ex.sample_video_link && (
                                                    <a 
                                                        href={ex.sample_video_link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center hover:bg-primary/90 transition-colors"
                                                    >
                                                        <ExternalLink className="w-4 h-4" />
                                                    </a>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Sets & Reps</label>
                                            <WorkoutMetricEditor 
                                                metrics={ex.metrics}
                                                units={config.units}
                                                onUpdate={(newMetrics) => updateWorkout(exIdx, { metrics: newMetrics })}
                                            />
                                        </div>

                                        <button
                                            onClick={() => handleRemoveWorkout(exIdx)}
                                            className="w-full flex items-center justify-center gap-2 py-2 text-[10px] font-bold text-primary hover:bg-primary/10 rounded-xl transition-colors"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" /> Remove Exercise
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {(!dayData.workouts || dayData.workouts.length === 0) && (
                        <div className="py-12 text-center bg-secondary/20 rounded-3xl border-2 border-dashed border-border">
                            <Dumbbell className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                            <p className="text-[11px] font-black uppercase tracking-wider text-muted-foreground mb-1">
                                Rest Day
                            </p>
                            <p className="text-[10px] text-muted-foreground/60 mb-4">
                                No exercises scheduled for {activeDay}
                            </p>
                            <button 
                                onClick={handleAddWorkout}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-[10px] font-black uppercase tracking-wider rounded-xl hover:bg-primary/90 transition-colors"
                            >
                                <Plus className="w-3 h-3" /> Add First Exercise
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Step2;
