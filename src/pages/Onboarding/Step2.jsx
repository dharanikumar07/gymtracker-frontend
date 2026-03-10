import React, { useState } from 'react';
import { 
    Dumbbell, 
    Trash2, 
    Plus, 
    Activity, 
    Zap, 
    Wind,
    ShieldCheck,
    Crosshair,
    X,
    Layout,
    Weight,
    Timer,
    Calendar,
    Settings2,
    Video,
    ExternalLink,
    Play
} from 'lucide-react';
import { cn } from '../../lib/utils';
import WorkoutMetricEditor from '../../components/WorkoutMetricEditor';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const activityIcons = {
    strength_training: Dumbbell,
    cardio: Zap,
    flexibility: Wind,
    balance: ShieldCheck,
    calisthenics: Weight
};

const MuscleTags = ({ muscles = [], onChange }) => {
    const [input, setInput] = useState('');
    const addTag = (e) => {
        if ((e.key === 'Enter' || e.key === ' ') && input.trim()) {
            e.preventDefault();
            const val = input.trim().toLowerCase();
            if (!muscles.includes(val)) onChange([...muscles, val]);
            setInput('');
        }
    };
    return (
        <div className="space-y-2 mb-4">
            <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest flex items-center gap-2">
                <Crosshair className="w-3 h-3 text-primary" /> Target Focus
            </label>
            <div className="flex flex-wrap gap-2 p-2 bg-secondary/30 border border-border rounded-2xl min-h-[44px]">
                {muscles.map((tag) => (
                    <span key={tag} className="flex items-center gap-1.5 px-2.5 py-1 bg-primary text-white text-[10px] font-black uppercase rounded-lg shadow-sm border border-primary/20">
                        {tag}
                        <button onClick={() => onChange(muscles.filter(t => t !== tag))} className="hover:text-red-200 transition-colors">
                            <X className="w-3 h-3" />
                        </button>
                    </span>
                ))}
                <input
                    className="flex-1 min-w-[100px] bg-transparent border-none outline-none text-[11px] font-bold text-foreground placeholder:text-muted-foreground/40"
                    placeholder="Add muscle..." value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={addTag}
                />
            </div>
        </div>
    );
};

const Step2 = ({ data, updateData }) => {
    const [activeDay, setActiveDay] = useState('Mon');
    const [showVideoInput, setShowVideoInput] = useState(null); // stores exIdx
    
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
                data: { sets: 4, reps: 12, rest: 60 }
            }
        };
        updateDay({ workouts: [...(dayData.workouts || []), newEx] });
    };

    const IconComponent = activityIcons[selectedFocus] || Activity;

    const inputClasses = "w-full h-10 px-3 bg-secondary/50 text-foreground border border-border rounded-xl focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all text-xs font-bold";
    const labelClasses = "text-[9px] font-black uppercase text-muted-foreground tracking-widest mb-1.5 block flex items-center gap-1.5";

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto">
            {/* Plan Configuration Section */}
            <div className="bg-card border border-border rounded-[2rem] p-6 shadow-sm space-y-6">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                        <Settings2 className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black uppercase tracking-tight text-foreground">Plan Configuration</h3>
                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">Define your training objective</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2 space-y-1">
                        <label className={labelClasses}>Plan Name</label>
                        <input 
                            className={inputClasses} 
                            value={plan.name} 
                            placeholder="e.g. 12-Week Hypertrophy Phase"
                            onChange={(e) => updatePlan({ name: e.target.value })}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className={labelClasses}><Calendar className="w-3 h-3" /> Start Date</label>
                        <input 
                            type="date"
                            className={inputClasses} 
                            value={plan.start_date}
                            onChange={(e) => updatePlan({ start_date: e.target.value })}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className={labelClasses}><Calendar className="w-3 h-3" /> End Date (Optional)</label>
                        <input 
                            type="date"
                            className={inputClasses} 
                            value={plan.end_date}
                            onChange={(e) => updatePlan({ end_date: e.target.value })}
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-secondary/20 rounded-2xl border border-border">
                    <div className="flex items-center gap-3">
                        <div className={cn("w-2 h-2 rounded-full", plan.is_active ? "bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-muted-foreground")} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-foreground">Activate Plan immediately</span>
                    </div>
                    <button 
                        onClick={() => updatePlan({ is_active: !plan.is_active })}
                        className={cn(
                            "w-12 h-6 rounded-full transition-all relative",
                            plan.is_active ? "bg-primary" : "bg-muted/30"
                        )}
                    >
                        <div className={cn(
                            "absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm",
                            plan.is_active ? "left-7" : "left-1"
                        )} />
                    </button>
                </div>
            </div>

            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20">
                        <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black uppercase tracking-tight text-foreground">{selectedFocus.replace('_', ' ')} Schedule</h3>
                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">Map your weekly execution</p>
                    </div>
                </div>

                {/* Day Pills */}
                <div className="flex justify-between gap-1.5 p-1 bg-secondary/20 rounded-[1.5rem] border border-border">
                    {DAYS.map((day) => {
                        const isActive = activeDay === day;
                        const dData = weeklySplit[day] || { workouts: [] };
                        const hasActivity = dData.workouts && dData.workouts.length > 0 && dData.workouts[0].metrics?.type !== 'rest';
                        return (
                            <button key={day} onClick={() => setActiveDay(day)} className={cn(
                                "flex-1 py-3 rounded-2xl text-[10px] font-black transition-all flex flex-row items-center justify-center gap-2 relative overflow-hidden",
                                isActive ? "bg-primary text-white shadow-xl shadow-primary/30 scale-105" : "text-muted-foreground hover:bg-secondary"
                            )}>
                                {day}
                                {hasActivity && <div className={cn("w-1 h-1 rounded-full shrink-0", isActive ? "bg-white" : "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]")} />}
                            </button>
                        );
                    })}
                </div>

                {selectedFocus === 'strength_training' && (
                    <MuscleTags muscles={dayData.target_muscles} onChange={(val) => updateDay({ target_muscles: val })} />
                )}

                <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                            <Layout className="w-3 h-3 text-primary" /> Exercises for {activeDay}
                        </h3>
                        <button onClick={handleAddWorkout} className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline flex items-center gap-1.5 bg-primary/5 px-3 py-1.5 rounded-lg border border-primary/10">
                            <Plus className="w-3 h-3" /> Add Exercise
                        </button>
                    </div>

                    <div className="space-y-4 pb-10">
                        {dayData.workouts?.map((ex, exIdx) => (
                            <div key={exIdx} className="bg-card border border-border rounded-3xl overflow-hidden transition-all hover:border-primary/30 shadow-sm animate-in slide-in-from-right-2">
                                <div className="bg-secondary/20 px-5 py-4 flex items-center justify-between border-b border-border/50">
                                    <div className="flex items-center gap-3 flex-1">
                                        <div className="w-6 h-6 rounded-lg bg-background border border-border flex items-center justify-center text-[10px] font-black text-muted-foreground">
                                            {exIdx + 1}
                                        </div>
                                        <input 
                                            className="flex-1 bg-transparent border-none text-sm font-black text-foreground outline-none uppercase tracking-tight italic placeholder:text-muted-foreground/30"
                                            value={ex.name} placeholder="Exercise Name..."
                                            onChange={(e) => {
                                                const wks = [...dayData.workouts];
                                                wks[exIdx].name = e.target.value;
                                                updateDay({ workouts: wks });
                                            }}
                                        />
                                    </div>
                                    
                                    <div className="flex items-center gap-2 ml-4">
                                        <button 
                                            onClick={() => setShowVideoInput(showVideoInput === exIdx ? null : exIdx)}
                                            className={cn(
                                                "w-8 h-8 rounded-xl flex items-center justify-center transition-all border",
                                                ex.sample_video_link 
                                                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500 shadow-sm" 
                                                    : "bg-secondary text-muted-foreground border-border hover:text-primary hover:border-primary/30"
                                            )}
                                        >
                                            <Video className="w-4 h-4" />
                                        </button>
                                        
                                        <button onClick={() => updateDay({ workouts: dayData.workouts.filter((_, i) => i !== exIdx) })} className="w-8 h-8 rounded-xl bg-secondary border border-border flex items-center justify-center text-muted-foreground hover:text-red-500 hover:border-red-500/30 transition-all">
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>

                                {showVideoInput === exIdx && (
                                    <div className="px-5 py-3 bg-primary/5 border-b border-border/50 animate-in slide-in-from-top-2 duration-300">
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 relative">
                                                <Play className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-primary/50" />
                                                <input 
                                                    className="w-full h-9 pl-9 pr-3 bg-background border border-primary/20 rounded-xl text-[10px] font-bold outline-none focus:ring-1 focus:ring-primary/30 placeholder:text-muted-foreground/30"
                                                    value={ex.sample_video_link || ''} 
                                                    placeholder="Paste tutorial video URL..."
                                                    onChange={(e) => {
                                                        const wks = [...dayData.workouts];
                                                        wks[exIdx].sample_video_link = e.target.value;
                                                        updateDay({ workouts: wks });
                                                    }}
                                                />
                                            </div>
                                            {ex.sample_video_link && (
                                                <a 
                                                    href={ex.sample_video_link} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="w-9 h-9 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-105 transition-all"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="p-5 bg-card">
                                    <WorkoutMetricEditor 
                                        metrics={ex.metrics}
                                        units={config.units}
                                        onUpdate={(newMetrics) => {
                                            const wks = [...dayData.workouts];
                                            wks[exIdx].metrics = newMetrics;
                                            updateDay({ workouts: wks });
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                        {(!dayData.workouts || dayData.workouts.length === 0) && (
                            <div className="py-12 text-center bg-secondary/10 rounded-[2.5rem] border-2 border-dashed border-border flex flex-col items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-background border border-border flex items-center justify-center text-muted-foreground/30">
                                    <Activity className="w-6 h-6" />
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground italic">Rest & Recovery focus for {activeDay}</p>
                                <button onClick={handleAddWorkout} className="mt-2 text-xs font-black text-primary uppercase tracking-widest flex items-center gap-2 bg-primary/10 px-6 py-3 rounded-2xl border border-primary/20 hover:bg-primary/20 transition-all">
                                    <Plus className="w-3.5 h-3.5" /> Add First Exercise
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Step2;
