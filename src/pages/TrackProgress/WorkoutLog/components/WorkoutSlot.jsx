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
    ChevronRight,
    PencilLine
} from 'lucide-react';
import { cn } from '../../../../lib/utils';
import { useWorkoutLog } from '../context/WorkoutLogContext';
import { Popover, PopoverContent, PopoverTrigger } from '../../../../components/ui/popover';
import WorkoutSetRow from './WorkoutSetRow';
import TargetMusclesInput from '../../../../components/TargetMusclesInput';
import DeleteConfirmModal from '../../../../components/ui/DeleteConfirmModal';

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

import { validateSkipField, validateSetFields } from '../validation/validation';

const WorkoutSlot = ({ slot, isPending, isInProgress, isCompleted }) => {
    const { saveLog, isSaving, deleteSlot } = useWorkoutLog();
    
    const [isEditingWorkout, setIsEditingWorkout] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});
    const [isSuccessAnimating, setIsSuccessAnimating] = useState(false);

    const [localSets, setLocalSets] = useState(() => {
        const metricsData = slot.metrics_data || {};
        const setsFromData = metricsData.sets;
        
        if (Array.isArray(setsFromData)) {
            return setsFromData.map((s, idx) => ({
                ...s,
                id: s.id || `set-${idx}-${Date.now()}`,
                showWeight: Number(s.weight) > 0
            }));
        }

        // Default to exactly 2 sets for template exercises
        const setCount = 2;
        return Array.from({ length: setCount }, (_, idx) => ({
            id: `set-${idx}-${Date.now()}`,
            reps: metricsData.reps || 0,
            weight: metricsData.weight || 0,
            duration: metricsData.duration || 0,
            completed: false,
            showWeight: Number(metricsData.weight) > 0
        }));
    });

    const [showSkipModal, setShowSkipModal] = useState(false);
    const [skipReason, setSkipReason] = useState('');
    const [skipError, setSkipError] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const isEditable = isPending || isInProgress || isEditingWorkout;

    const triggerSync = (currentSets, forcedStatus = null, extraData = {}) => {
        const determinedStatus = forcedStatus || (currentSets.every(s => s.completed) ? 'completed' : 'in_progress');
        const metricsType = slot.metrics_type || 'strength';
        
        saveLog([{
            slot_uuid: slot.slot_uuid || slot.uuid,
            exercise_name: slot.exercise_name,
            metrics_type: metricsType,
            metrics_data: {
                ...(slot.metrics_data || {}),
                sets: currentSets.map(({ id, showWeight, ...rest }, index) => {
                    const setObj = {
                        ...rest,
                        order: index + 1
                    };

                    // Only include reps for strength
                    if (metricsType !== 'strength') {
                        delete setObj.reps;
                    }

                    // Only include duration for timed_sets or endurance
                    if (metricsType !== 'timed_sets' && metricsType !== 'endurance') {
                        delete setObj.duration;
                        delete setObj.duration_unit;
                    }

                    return setObj;
                })
            },
            status: determinedStatus,
            type: slot.type || (isPending ? 'routine' : 'additional'),
            meta_data: slot.meta_data || { target_muscles: [] },
            ...extraData
        }]);
    };

    const handleCompleteWorkout = () => {
        const errors = {};
        let hasErrors = false;
        const metricsType = slot.metrics_type || 'strength';

        localSets.forEach(set => {
            const fieldErrors = validateSetFields(set, metricsType, set.showWeight);
            if (Object.keys(fieldErrors).length > 0) {
                errors[set.id] = fieldErrors;
                hasErrors = true;
            }
        });

        if (hasErrors) {
            setValidationErrors(errors);
            return;
        }

        setValidationErrors({});
        setIsSuccessAnimating(true);
        
        // Mark all sets as completed
        const updatedSets = localSets.map(s => ({ ...s, completed: true }));
        setLocalSets(updatedSets);
        
        triggerSync(updatedSets, 'completed');
        
        setTimeout(() => {
            setIsSuccessAnimating(false);
            setIsEditingWorkout(false);
        }, 1000); // Wait for tick drawing animation to complete
    };

    const addSet = () => {
        const lastSet = localSets[localSets.length - 1];
        const newSets = [
            ...localSets, 
            { ...lastSet, id: `new-set-${Date.now()}`, completed: false, isNew: true }
        ];
        setLocalSets(newSets);
    };

    const removeSet = (id) => {
        if (localSets.length > 1) {
            const filtered = localSets.filter(s => s.id !== id);
            setLocalSets(filtered);
            
            // Clear errors for the deleted set
            if (validationErrors[id]) {
                setValidationErrors(prev => {
                    const updated = { ...prev };
                    delete updated[id];
                    return updated;
                });
            }
        }
    };

    const updateSet = (id, field, value) => {
        const numericFields = ['weight', 'reps', 'duration', 'order'];
        const updated = localSets.map(s => {
            if (s.id === id) {
                let finalValue = value;
                if (numericFields.includes(field)) {
                    if (value === '') {
                        finalValue = '';
                    } else {
                        const parsed = parseFloat(value);
                        finalValue = isNaN(parsed) ? 0 : parsed;
                    }
                }
                return { ...s, [field]: finalValue };
            }
            return s;
        });
        
        setLocalSets(updated);

        // Clear field-specific error as the user edits
        if (validationErrors[id]?.[field]) {
            setValidationErrors(prev => ({
                ...prev,
                [id]: {
                    ...prev[id],
                    [field]: null
                }
            }));
        }
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            setLocalSets((items) => {
                const oldIndex = items.findIndex(i => i.id === active.id);
                const newIndex = items.findIndex(i => i.id === over.id);
                const updated = arrayMove(items, oldIndex, newIndex);
                return updated;
            });
        }
    };

    const confirmSkip = () => {
        const error = validateSkipField(skipReason);
        if (error) {
            setSkipError(error);
            return;
        }
        triggerSync(localSets, 'skipped', { reason: skipReason });
        setShowSkipModal(false);
        setSkipError(null);
    };

    const confirmDelete = () => {
        deleteSlot(slot.slot_uuid || slot.uuid);
        setShowDeleteConfirm(false);
    };

    const metricsType = slot.metrics_type || 'strength';
    const durationUnit = slot.metrics_data?.duration_unit || 'min';
    const allDone = localSets.every(s => s.completed);
    const isSkipped = slot.status === 'skipped';
    const targetMuscles = slot.meta_data?.target_muscles || [];

    if (isSkipped) {
        return (
            <div className="w-full bg-card/50 rounded-3xl border border-border/50 overflow-hidden shadow-sm hover:border-orange-500/20 transition-all duration-300">
                <div className="flex items-start justify-between p-4 sm:p-5">
                    <div className="flex flex-col gap-2 min-w-0">
                        <div className="flex flex-col gap-1">
                            <h4 className="text-[14px] font-black text-foreground/40 truncate leading-none line-through">
                                {slot.exercise_name || "Routine Activity"}
                            </h4>
                            <div className="flex items-center gap-2">
                                <span className="text-[8px] font-black text-orange-500 uppercase tracking-widest">
                                    {metricsType}
                                </span>
                                <div className="w-1 h-1 rounded-full bg-foreground/10" />
                                <span className="text-[8px] font-bold text-foreground/20 uppercase tracking-widest">
                                    {localSets.length} Sets
                                </span>
                            </div>
                        </div>
                        
                        {targetMuscles.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                                {targetMuscles.map((muscle, idx) => (
                                    <span key={idx} className="px-1.5 py-0.5 rounded-md bg-secondary/50 text-[7px] font-black uppercase tracking-wider text-muted-foreground/50 border border-border/50">
                                        {muscle}
                                    </span>
                                ))}
                            </div>
                        )}
                        
                        {slot.reason && (
                            <div className="mt-1 flex gap-2 items-start bg-orange-500/5 border border-orange-500/10 rounded-xl p-2.5">
                                <SkipForward className="w-3 h-3 text-orange-500 shrink-0 mt-0.5" />
                                <p className="text-[10px] font-bold text-orange-600/80 italic leading-tight">
                                    "{slot.reason}"
                                </p>
                            </div>
                        )}
                    </div>

                    <button 
                        onClick={() => setShowDeleteConfirm(true)}
                        disabled={isSaving}
                        className="w-8 h-8 flex items-center justify-center text-red-500 hover:text-red-700 transition-all shrink-0"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
                {showDeleteConfirm && (
                    <DeleteConfirmModal
                        title="Remove Activity?"
                        message={`Are you sure you want to delete "${slot.exercise_name || "Routine Activity"}"? This will remove all sets and logged data for this activity.`}
                        onCancel={() => setShowDeleteConfirm(false)}
                        onConfirm={confirmDelete}
                    />
                )}

            </div>
        );
    }

    return (
        <div className={cn(
            "w-full bg-card rounded-3xl border border-border overflow-hidden transition-all duration-300 shadow-sm",
            allDone && !isEditingWorkout && "opacity-80"
        )}>
            {/* Inject Tick Drawing CSS Keyframes */}
            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes drawCircle {
                    from { stroke-dashoffset: 63; }
                    to { stroke-dashoffset: 0; }
                }
                @keyframes drawTick {
                    from { stroke-dashoffset: 15; }
                    to { stroke-dashoffset: 0; }
                }
            `}} />

            {/* Header: Identity & Top Actions - One Row Layout */}
            <div className="flex items-center justify-between gap-4 p-4 sm:p-5 bg-secondary/5 border-b border-border/50">
                <div className="flex flex-col gap-2 min-w-0">
                    <div className="flex flex-col gap-1">
                        <h4 className={cn(
                            "text-[15px] font-black truncate leading-none",
                            allDone && !isEditingWorkout ? "text-emerald-600" : "text-foreground"
                        )}>
                            {slot.exercise_name || "Routine Activity"}
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

                    {targetMuscles.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-0.5">
                            {targetMuscles.map((muscle, idx) => (
                                <span 
                                    key={idx} 
                                    className="px-2 py-0.5 rounded-lg bg-emerald-600/5 text-[8px] font-black uppercase tracking-[0.05em] text-emerald-600 border border-emerald-600/10 whitespace-nowrap"
                                >
                                    {muscle}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
                
                <div className="flex items-center gap-3 shrink-0">
                    {/* Compact Add Set Button - Visible only in Edit Mode */}
                    {isEditable && (
                        <button 
                            onClick={addSet} 
                            disabled={isSaving}
                            className="h-8 px-2.5 sm:px-3 flex items-center gap-1.5 border border-dashed border-emerald-600/30 hover:border-emerald-600 text-emerald-600 rounded-lg transition-all active:scale-95 disabled:opacity-50"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-black uppercase tracking-widest hidden sm:block">Add Set</span>
                        </button>
                    )}

                    {/* Edit Button for Completed Workouts */}
                    {isCompleted && !isEditingWorkout && (
                        <button 
                            onClick={() => setIsEditingWorkout(true)}
                            className="h-8 px-2.5 sm:px-3 flex items-center gap-1.5 border border-emerald-600/30 hover:border-emerald-600 text-emerald-600 rounded-lg transition-all active:scale-95"
                        >
                            <PencilLine className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-black uppercase tracking-widest hidden sm:block">Edit</span>
                        </button>
                    )}

                    {/* Delete Button - Hidden for Pending Routine Items */}
                    {!isPending && (
                        <button 
                            onClick={() => setShowDeleteConfirm(true)}
                            disabled={isSaving}
                            className="w-8 h-8 flex items-center justify-center text-red-500 hover:text-red-700 transition-all shrink-0"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}

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
                                    isEditable={isEditable}
                                    canDelete={localSets.length > 1}
                                    errors={validationErrors[set.id] || {}}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            </div>

            {/* Save/Log Action Footer */}
            {isEditable && (
                <div className="px-4 py-3 bg-secondary/5 border-t border-border/50 flex justify-end items-center gap-3">
                    {isEditingWorkout && (
                        <button
                            onClick={() => {
                                setIsEditingWorkout(false);
                                setValidationErrors({});
                                // Reset to original slot data on cancel
                                const metricsData = slot.metrics_data || {};
                                const setsFromData = metricsData.sets;
                                if (Array.isArray(setsFromData)) {
                                    setLocalSets(setsFromData.map((s, idx) => ({
                                        ...s,
                                        id: s.id || `set-${idx}-${Date.now()}`,
                                        showWeight: Number(s.weight) > 0
                                    })));
                                }
                            }}
                            className="h-9 px-4 rounded-xl border border-border text-foreground/60 hover:bg-secondary/40 text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
                        >
                            Cancel
                        </button>
                    )}
                    <button
                        onClick={handleCompleteWorkout}
                        disabled={isSaving || isSuccessAnimating}
                        className="h-8 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-lg shadow-emerald-600/10 active:scale-95 flex items-center justify-center gap-2 min-w-[120px]"
                    >
                        {isSuccessAnimating ? (
                            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24">
                                <circle 
                                    cx="12" cy="12" r="10" 
                                    stroke="white" strokeWidth="3" fill="none"
                                    strokeDasharray="63" strokeDashoffset="63"
                                    style={{ animation: 'drawCircle 0.4s ease-out forwards' }}
                                />
                                <path 
                                    d="M8 12l3 3 5-5" 
                                    stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"
                                    strokeDasharray="15" strokeDashoffset="15"
                                    style={{ animation: 'drawTick 0.3s ease-out 0.3s forwards' }}
                                />
                            </svg>
                        ) : isSaving ? (
                            <span className="text-[10px] font-black uppercase tracking-widest animate-pulse">Saving...</span>
                        ) : (
                            <span className="text-[10px] font-black uppercase tracking-widest">
                                {isEditingWorkout ? 'Save Changes' : isPending ? 'Log Exercise' : 'Complete Exercise'}
                            </span>
                        )}
                    </button>
                </div>
            )}

            {/* Skip Dialog - Refactored to Compact Shadcn-style */}
            {showSkipModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <div 
                        className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300" 
                        onClick={() => { setShowSkipModal(false); setSkipError(null); }}
                    />
                    <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-[340px] overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-5 space-y-4">
                            <div className="flex flex-col gap-1.5">
                                <h3 className="text-[14px] font-black text-foreground">Skip Exercise</h3>
                                <p className="text-[11px] text-muted-foreground font-medium leading-relaxed">
                                    Provide a brief reason for skipping <span className="text-foreground font-bold">"{slot.exercise_name || "Activity"}"</span>.
                                </p>
                            </div>
                            
                            <div className="space-y-1">
                                <textarea
                                    placeholder="e.g. Injury, lack of equipment..."
                                    className={cn(
                                        "w-full h-24 bg-secondary/20 border rounded-xl p-3 text-[12px] font-bold outline-none transition-all resize-none placeholder:text-foreground/20",
                                        skipError ? "border-red-500 focus:border-red-500" : "border-border focus:border-orange-500/50"
                                    )}
                                    value={skipReason}
                                    onChange={(e) => {
                                        setSkipReason(e.target.value);
                                        if (skipError) setSkipError(null);
                                    }}
                                />
                                {skipError && (
                                    <p className="text-[8px] font-black text-red-500 ml-1">
                                        {skipError}
                                    </p>
                                )}
                            </div>
                        </div>
                        
                        <div className="flex border-t border-border divide-x divide-border">
                            <button 
                                onClick={() => { setShowSkipModal(false); setSkipError(null); }} 
                                className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest text-foreground/40 hover:bg-secondary/50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={confirmSkip} 
                                className="flex-1 py-3 bg-orange-500/10 text-orange-600 hover:bg-orange-600 hover:text-white text-[10px] font-black uppercase tracking-widest transition-all"
                            >
                                Skip Activity
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <DeleteConfirmModal
                    title="Remove Activity?"
                    message={`Are you sure you want to delete "${slot.exercise_name || "Routine Activity"}"? This will remove all sets and logged data for this activity.`}
                    onCancel={() => setShowDeleteConfirm(false)}
                    onConfirm={confirmDelete}
                />
            )}

        </div>
    );
};

export default WorkoutSlot;
