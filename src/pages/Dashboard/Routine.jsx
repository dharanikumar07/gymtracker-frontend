import React, { useState, useEffect } from 'react';
import { 
    Dumbbell, 
    Trash2, 
    Plus, 
    Loader2, 
    Activity, 
    Save,
    Calendar,
    Layout,
    Video,
    Play,
    ExternalLink,
    ChevronRight,
    ChevronDown,
    Layers
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { toast } from 'sonner';
import WorkoutMetricEditor from '../../components/WorkoutMetricEditor';
import { useRoutineQuery, useUpdateRoutineMutation } from './Progress/http/progressQueries';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const Routine = () => {
    const [planUuid, setPlanUuid] = useState(null);
    const { data: routineData, isLoading: loading } = useRoutineQuery(planUuid);
    const updateMutation = useUpdateRoutineMutation();

    const [routine, setRoutine] = useState({});
    const [activeDay, setActiveDay] = useState('Mon');
    const [showVideoInput, setShowVideoInput] = useState(null);
    const [units, setUnits] = useState({
        weight_units: ['kg', 'lbs'],
        duration_units: ['seconds', 'minutes', 'hours']
    });

    // Sync local state with query data
    useEffect(() => {
        if (routineData) {
            setRoutine(routineData.routine || {});
            if (routineData.units) setUnits(routineData.units);
        }
    }, [routineData]);

    const handleSave = () => {
        updateMutation.mutate({
            plan_uuid: routineData.plan.uuid,
            routine: routine
        });
    };

    const updateDay = (updates) => {
        const currentRoutine = { ...routine };
        currentRoutine[activeDay] = { ...currentRoutine[activeDay], ...updates };
        setRoutine(currentRoutine);
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
        const currentWorkouts = routine[activeDay]?.workouts || [];
        updateDay({ workouts: [...currentWorkouts, newEx] });
    };

    if (loading) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 bg-background min-h-screen">
                <Loader2 className="w-10 h-10 animate-spin text-primary/40" />
                <p className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground animate-pulse italic">Accessing Routine...</p>
            </div>
        );
    }

    const plan = routineData?.plan;
    const availablePlans = routineData?.available_plans || [];
    const dayData = routine[activeDay] || { workouts: [] };

    return (
        <div className="flex-1 bg-background min-h-screen pb-20 font-sans">
            {/* Header Section */}
            <div className="bg-card border-b border-border px-6 py-8 md:px-12 transition-all">
                <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-4 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Protocol Management</span>
                        </div>
                        
                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                            <h1 className="text-3xl font-black text-foreground tracking-tighter uppercase italic leading-none">{plan?.name}</h1>
                            
                            {/* Plan Switcher Dropdown */}
                            <div className="relative group">
                                <select 
                                    className="appearance-none h-9 pl-4 pr-10 bg-secondary/50 border border-border rounded-xl text-[10px] font-black uppercase tracking-widest text-primary outline-none focus:ring-1 focus:ring-primary/30 cursor-pointer hover:bg-secondary transition-all"
                                    value={plan?.uuid}
                                    onChange={(e) => setPlanUuid(e.target.value)}
                                >
                                    {availablePlans.map(p => (
                                        <option key={p.plan_uuid} value={p.plan_uuid}>{p.name}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-primary pointer-events-none" />
                            </div>
                        </div>

                        <div className="flex items-center gap-4 text-muted-foreground text-[10px] font-bold uppercase tracking-widest pt-1">
                            <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3 text-primary" /> Start: {plan?.start_date?.split('T')[0]}</span>
                            {plan?.end_date && <span className="flex items-center gap-1.5"><ChevronRight className="w-3 h-3" /> End: {plan?.end_date?.split('T')[0]}</span>}
                        </div>
                    </div>

                    <button 
                        onClick={handleSave}
                        disabled={updateMutation.isPending}
                        className="h-12 px-8 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                        {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Commit Changes
                    </button>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-6 mt-10 space-y-8">
                {/* Navigation Pills */}
                <div className="flex justify-between gap-1.5 p-1.5 bg-secondary/20 rounded-[1.8rem] border border-border sticky top-4 z-40 backdrop-blur-md overflow-x-auto no-scrollbar">
                    {DAYS.map((day) => {
                        const isActive = activeDay === day;
                        const hasWorkouts = routine[day]?.workouts?.length > 0 && routine[day]?.workouts[0]?.metrics?.type !== 'rest';
                        return (
                            <button 
                                key={day} 
                                onClick={() => setActiveDay(day)}
                                className={cn(
                                    "flex-1 min-w-[70px] py-3.5 rounded-2xl text-[10px] font-black transition-all flex items-center justify-center gap-2 relative group",
                                    isActive ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                                )}
                            >
                                {day}
                                {hasWorkouts && (
                                    <div className={cn(
                                        "w-1 h-1 rounded-full",
                                        isActive ? "bg-white" : "bg-emerald-500"
                                    )} />
                                )}
                            </button>
                        );
                    })}
                </div>

                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                                <Layout className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-foreground tracking-tight uppercase italic">{activeDay} Execution</h2>
                                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-[0.2em]">Daily sequence for {plan?.name}</p>
                            </div>
                        </div>
                        <button 
                            onClick={handleAddWorkout}
                            className="h-10 px-4 bg-secondary text-foreground rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-secondary/80 transition-all flex items-center gap-2 border border-border"
                        >
                            <Plus className="w-3.5 h-3.5 text-primary" /> Add Exercise
                        </button>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {dayData.workouts?.map((ex, exIdx) => (
                            <div key={exIdx} className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm hover:border-primary/20 transition-all animate-in slide-in-from-right-2">
                                <div className="bg-secondary/10 px-6 py-4 flex items-center justify-between border-b border-border/50">
                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                        <div className="w-8 h-8 rounded-xl bg-background border border-border flex items-center justify-center text-[11px] font-black text-primary shadow-sm shrink-0">
                                            {exIdx + 1}
                                        </div>
                                        <input 
                                            className="flex-1 bg-transparent border-none text-base font-black text-foreground outline-none uppercase tracking-tight italic placeholder:text-muted-foreground/20 truncate"
                                            value={ex.name} 
                                            placeholder="Exercise Name..."
                                            onChange={(e) => {
                                                const wks = [...dayData.workouts];
                                                wks[exIdx].name = e.target.value;
                                                updateDay({ workouts: wks });
                                            }}
                                        />
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <button 
                                            onClick={() => setShowVideoInput(showVideoInput === exIdx ? null : exIdx)}
                                            className={cn(
                                                "w-10 h-10 rounded-xl flex items-center justify-center transition-all border",
                                                ex.sample_video_link 
                                                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" 
                                                    : "bg-background text-muted-foreground border-border hover:text-primary hover:border-primary/20"
                                            )}
                                        >
                                            <Video className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => updateDay({ workouts: dayData.workouts.filter((_, i) => i !== exIdx) })}
                                            className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center text-muted-foreground hover:text-red-500 hover:border-red-500/20 transition-all"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {showVideoInput === exIdx && (
                                    <div className="px-6 py-4 bg-primary/5 border-b border-border/50 animate-in slide-in-from-top-2 duration-300">
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 relative">
                                                <Play className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-primary/50" />
                                                <input 
                                                    className="w-full h-11 pl-11 pr-4 bg-background border border-primary/20 rounded-2xl text-[11px] font-bold outline-none focus:ring-1 focus:ring-primary/30"
                                                    value={ex.sample_video_link || ''} 
                                                    placeholder="Tutorial video URL..."
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
                            <div className="py-20 text-center bg-secondary/10 rounded-[3rem] border-2 border-dashed border-border flex flex-col items-center gap-4 mx-auto max-w-lg">
                                <Activity className="w-8 h-8 text-muted-foreground/30" />
                                <div className="space-y-1">
                                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-foreground italic">Rest Protocol</p>
                                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">No exercises registered for {activeDay}</p>
                                </div>
                                <button 
                                    onClick={handleAddWorkout}
                                    className="mt-4 h-12 px-8 bg-primary/10 text-primary border border-primary/20 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary/20 transition-all flex items-center gap-2"
                                >
                                    <Plus className="w-4 h-4" /> Add First Exercise
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Routine;
