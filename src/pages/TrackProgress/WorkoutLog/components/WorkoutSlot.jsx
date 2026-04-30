import React, { useState } from 'react';
import { 
    Plus, 
    Trash2,
    Dumbbell,
    SkipForward,
    Timer,
    Zap,
    MoreVertical,
    CheckCircle2,
    ChevronRight
} from 'lucide-react';
import { cn } from '../../../../lib/utils';
import { useWorkoutLog } from '../context/WorkoutLogContext';
import { Popover, PopoverContent, PopoverTrigger } from '../../../../components/ui/popover';
import WorkoutSetRow from './WorkoutSetRow';

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
} from '@dnd-kit/sortable';

const WorkoutSlot = ({ slot, isPending, isInProgress, isCompleted }) => {
    const { saveLog, isSaving, deleteSlot } = useWorkoutLog();
    
    const [localSets, setLocalSets] = useState(() => {
        const metricsData = slot.metrics_data || {};
        const setsFromData = metricsData.sets;
        
        if (Array.isArray(setsFromData)) {
            return setsFromData.map((s, idx) => ({
                ...s,
                id: s.id || `set-${idx}-${Date.now()}`
            }));
        }

        const setCount = Number(metricsData.sets) || 1;
        return Array.from({ length: setCount }, (_, idx) => ({
            id: `set-${idx}-${Date.now()}`,
            reps: metricsData.reps || 0,
            weight: metricsData.weight || 0,
            duration: metricsData.duration || 0,
            completed: false
        }));
    });

    const [showSkipModal, setShowSkipModal] = useState(false);
    const [skipReason, setSkipReason] = useState('');

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const triggerSync = (currentSets, forcedStatus = null, extraData = {}) => {
        const determinedStatus = forcedStatus || (currentSets.every(s => s.completed) ? 'completed' : 'in_progress');
        
        saveLog([{
            slot_uuid: slot.slot_uuid || slot.uuid,
            exercise_name: slot.exercise_name,
            metrics_type: slot.metrics_type || 'strength',
            metrics_data: {
                ...(slot.metrics_data || {}),
                sets: currentSets.map(({ id, ...rest }, index) => ({
                    ...rest,
                    order: index + 1
                }))
            },
            status: determinedStatus,
            type: slot.type || (isPending ? 'routine' : 'additional'),
            ...extraData
        }]);
    };

    const addSet = () => {
        const lastSet = localSets[localSets.length - 1];
        const newSets = [
            ...localSets, 
            { ...lastSet, id: `new-set-${Date.now()}`, completed: false }
        ];
        setLocalSets(newSets);
        if (isInProgress || isCompleted) {
            triggerSync(newSets);
        }
    };

    const removeSet = (id) => {
        if (localSets.length > 1) {
            const filtered = localSets.filter(s => s.id !== id);
            setLocalSets(filtered);
            if (isInProgress || isCompleted) {
                triggerSync(filtered);
            }
        }
    };

    const updateSet = (id, field, value) => {
        const numericFields = ['weight', 'reps', 'duration', 'order'];
        const updated = localSets.map(s => 
            s.id === id 
                ? { ...s, [field]: numericFields.includes(field) ? (parseFloat(value) || 0) : value } 
                : s
        );
        setLocalSets(updated);
        if (field === 'completed') {
            triggerSync(updated);
        }
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            setLocalSets((items) => {
                const oldIndex = items.findIndex(i => i.id === active.id);
                const newIndex = items.findIndex(i => i.id === over.id);
                const updated = arrayMove(items, oldIndex, newIndex);
                if (isInProgress || isCompleted) triggerSync(updated);
                return updated;
            });
        }
    };

    const confirmSkip = () => {
        triggerSync(localSets, 'skipped', { reason: skipReason });
        setShowSkipModal(false);
    };

    const metricsType = slot.metrics_type || 'strength';
    const durationUnit = slot.metrics_data?.duration_unit || 'min';
    const allDone = localSets.every(s => s.completed);

    return (
        <div className={cn(
            "w-full bg-card rounded-3xl border border-border overflow-hidden transition-all duration-300 shadow-sm",
            allDone && "opacity-80"
        )}>
            {/* Header: Identity & Top Actions - One Row Layout */}
            <div className="flex items-center justify-between gap-4 p-4 sm:p-5 bg-secondary/5 border-b border-border/50">
                <div className="flex flex-col gap-1 min-w-0">
                    <h4 className={cn(
                        "text-[15px] font-black uppercase tracking-tight truncate leading-none",
                        allDone ? "text-emerald-600" : "text-foreground"
                    )}>
                        {slot.exercise_name}
                    </h4>
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">
                            {metricsType}
                        </span>
                        <div className="w-1 h-1 rounded-full bg-foreground/10" />
                        <span className="text-[9px] font-bold text-foreground/40 uppercase tracking-widest">
                            {localSets.length} Sets Total
                        </span>
                    </div>
                </div>
                
                <div className="flex items-center gap-3 shrink-0">
                    {/* Compact Add Set Button - Bordered Style */}
                    <button 
                        onClick={addSet} 
                        disabled={isSaving}
                        className="h-8 px-2.5 sm:px-3 flex items-center gap-1.5 border border-dashed border-emerald-600/30 hover:border-emerald-600 text-emerald-600 rounded-lg transition-all active:scale-95 disabled:opacity-50"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-black uppercase tracking-widest hidden sm:block">Add Set</span>
                    </button>


                    {/* Visible Delete Button with red shadow hover - background hover removed */}
                    <button 
                        onClick={() => deleteSlot(slot.slot_uuid || slot.uuid)}
                        disabled={isSaving}
                        className="w-8 h-8 flex items-center justify-center text-red-500 hover:text-red-700 rounded-lg transition-all group relative"
                    >
                        <Trash2 className="w-4 h-4" />
                        <div className="absolute inset-0 rounded-lg group-hover:shadow-[0_0_12px_rgba(239,68,68,0.3)] transition-all pointer-events-none" />
                    </button>

                    {isPending && (
                        <button 
                            onClick={() => setShowSkipModal(true)}
                            className="w-8 h-8 flex items-center justify-center text-orange-500 hover:text-orange-600 hover:bg-orange-500/5 rounded-lg transition-all"
                        >
                            <SkipForward className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Sets: Grid Style Layout - 2 columns on laptop, 1 on mobile */}
            <div className="p-3 sm:p-5">
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={localSets.map(s => s.id)} strategy={verticalListSortingStrategy}>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {localSets.map((set, idx) => (
                                <WorkoutSetRow 
                                    key={set.id}
                                    set={set}
                                    actualIdx={idx}
                                    metricsType={metricsType}
                                    durationUnit={durationUnit}
                                    isSaving={isSaving}
                                    onUpdate={updateSet}
                                    onRemove={removeSet}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            </div>

            {/* Skip Dialog */}
            {showSkipModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-background/90 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-card border-2 border-border rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-8">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center">
                                    <SkipForward className="w-6 h-6 text-orange-600" />
                                </div>
                                <h3 className="text-[16px] font-black uppercase tracking-tight text-foreground">Skip Exercise</h3>
                            </div>
                            <textarea 
                                autoFocus
                                placeholder="Why are you skipping this?"
                                className="w-full h-32 bg-secondary/30 border-2 border-border rounded-2xl p-4 text-[13px] font-bold outline-none focus:border-orange-500/50 transition-all resize-none"
                                value={skipReason}
                                onChange={(e) => setSkipReason(e.target.value)}
                            />
                        </div>
                        <div className="flex p-4 gap-4 bg-secondary/5 border-t border-border">
                            <button onClick={() => setShowSkipModal(false)} className="flex-1 py-4 text-[11px] font-black uppercase tracking-widest text-foreground/40">Cancel</button>
                            <button onClick={confirmSkip} className="flex-1 py-4 bg-orange-500 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest">Skip</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WorkoutSlot;
