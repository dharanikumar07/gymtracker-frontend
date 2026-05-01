import React, { useState } from 'react';
import { 
    Trash2, 
    Check,
    GripVertical,
    Dumbbell,
    X,
    PencilLine,
    PlusCircle,
    Scale
} from 'lucide-react';
import { cn } from '../../../../lib/utils';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { validateSetFields } from '../validation/validation';

const WorkoutSetRow = ({ 
    set, 
    actualIdx, 
    metricsType, 
    durationUnit, 
    isSaving, 
    onUpdate, 
    onRemove 
}) => {
    const [showWeightInput, setShowWeightInput] = useState(Number(set.weight) > 0);
    const [isEditing, setIsEditing] = useState(!set.completed);
    const [errors, setErrors] = useState({});

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: set.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 100 : 'auto',
    };

    const isStrength = metricsType === 'strength';
    const isTimed = metricsType === 'timed_sets';
    const isEndurance = metricsType === 'endurance';
    const isCompleted = set.completed;
    const weightUnit = set.weight_unit || 'kg';
    const currentDurationUnit = set.duration_unit || durationUnit || 'min';

    const [isAnimating, setIsAnimating] = useState(false);

    const handleToggleComplete = () => {
        // Run validation if we are completing it for the first time OR finishing an edit
        if (!isCompleted || isEditing) {
            const fieldErrors = validateSetFields(set, metricsType);
            if (Object.keys(fieldErrors).length > 0) {
                setErrors(fieldErrors);
                return;
            }
        }
        
        setErrors({});
        setIsAnimating(true);
        setTimeout(() => {
            onUpdate(set.id, 'completed', true);
            setIsEditing(false);
            setIsAnimating(false);
        }, 600); // Duration for the animation to play
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleToggleWeight = () => {
        if (showWeightInput) {
            onUpdate(set.id, 'weight', 0);
            setShowWeightInput(false);
        } else {
            setShowWeightInput(true);
        }
    };

    return (
        <div 
            ref={setNodeRef} 
            style={style} 
            className={cn(
                "group flex flex-col bg-card border border-border rounded-2xl overflow-hidden transition-all duration-200",
                isDragging && "opacity-50",
                isCompleted && !isEditing ? "border-emerald-600/30 shadow-[0_0_15px_rgba(16,185,129,0.05)]" : "shadow-sm"
            )}
        >
            {/* Animation Keyframes */}
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

            {/* First Section: Identity & Actions */}
            <div className={cn(
                "flex items-center justify-between p-2.5 border-b border-border/50",
                isCompleted && !isEditing ? "bg-emerald-600/5" : "bg-secondary/10"
            )}>
                <div className="flex items-center gap-2">
                    <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-foreground/20 hover:text-foreground/40 transition-colors p-1">
                        <GripVertical className="w-3.5 h-3.5" />
                    </div>
                    <div className={cn(
                        "w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black tabular-nums",
                        isCompleted ? "bg-emerald-600 text-white" : "bg-foreground/10 text-foreground/40"
                    )}>
                        {actualIdx + 1}
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    {/* Add Weight Toggle for Timed/Endurance in Header */}
                    {(isTimed || isEndurance) && (
                        <button 
                            onClick={handleToggleWeight}
                            disabled={isSaving || isAnimating || (isCompleted && !isEditing)}
                            className={cn(
                                "w-8 h-8 flex items-center justify-center rounded-lg border transition-all",
                                showWeightInput 
                                    ? "bg-emerald-600/10 border-emerald-600/30 text-emerald-600" 
                                    : "border-border text-foreground/30 hover:text-emerald-600 hover:border-emerald-600/30"
                            )}
                        >
                            <Scale className="w-3.5 h-3.5" />
                        </button>
                    )}

                    {/* Delete Icon */}
                    <button 
                        onClick={() => onRemove(set.id)} 
                        disabled={isSaving || isAnimating} 
                        className="w-8 h-8 flex items-center justify-center text-red-500 hover:text-red-700 transition-all"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Done/Edit Icon with Animation */}
                    {(!isCompleted || isEditing) ? (
                        <button 
                            onClick={handleToggleComplete} 
                            disabled={isSaving || isAnimating} 
                            className={cn(
                                "h-8 px-3 flex items-center justify-center rounded-lg transition-all relative overflow-hidden min-w-[50px]",
                                isAnimating ? "bg-emerald-600 text-white" : "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 active:scale-95"
                            )}
                        >
                            {isAnimating ? (
                                <svg className="w-4 h-4" viewBox="0 0 24 24">
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
                            ) : (
                                <span className="text-[9px] font-black uppercase tracking-wider">Done</span>
                            )}
                        </button>
                    ) : (
                        <button 
                            onClick={handleEdit} 
                            disabled={isSaving || isAnimating} 
                            className="w-8 h-8 flex items-center justify-center text-emerald-600 hover:bg-emerald-600/10 rounded-lg transition-all"
                        >
                            <PencilLine className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
            </div>

            {/* Second Section: Compact Input Fields */}
            <div className="p-3 flex flex-col gap-3">
                {/* Weight Input */}
                {(isStrength || showWeightInput) && (
                    <div className="space-y-1">
                        <label className="text-[8px] font-black uppercase tracking-widest text-foreground/30 ml-1">Weight</label>
                        <div className={cn(
                            "flex items-center gap-3 px-3 py-1.5 rounded-lg border transition-all",
                            errors.weight ? "border-red-500 bg-red-500/5" : "border-border focus-within:border-emerald-600 focus-within:ring-1 focus-within:ring-emerald-600/20"
                        )}>
                            <Dumbbell className="w-3.5 h-3.5 text-foreground/20" />
                            <input 
                                type="number" placeholder="0.00" 
                                className="flex-1 bg-transparent text-[13px] font-black outline-none text-right placeholder:text-foreground/5"
                                value={set.weight ?? ''} 
                                onChange={(e) => {
                                    onUpdate(set.id, 'weight', e.target.value);
                                    if (errors.weight) setErrors(prev => ({ ...prev, weight: null }));
                                }}
                                disabled={isSaving || (isCompleted && !isEditing)}
                            />
                            <span className="text-[9px] font-black text-emerald-600 uppercase w-6 text-right">{weightUnit}</span>
                        </div>
                        {errors.weight && <p className="text-[8px] font-bold text-red-500 ml-1 uppercase">{errors.weight}</p>}
                    </div>
                )}

                {/* Reps Input */}
                {isStrength && (
                    <div className="space-y-1">
                        <label className="text-[8px] font-black uppercase tracking-widest text-foreground/30 ml-1">Reps</label>
                        <div className={cn(
                            "flex items-center gap-3 px-3 py-1.5 rounded-lg border transition-all",
                            errors.reps ? "border-red-500 bg-red-500/5" : "border-border focus-within:border-emerald-600 focus-within:ring-1 focus-within:ring-emerald-600/20"
                        )}>
                            <PlusCircle className="w-3.5 h-3.5 text-foreground/20" />
                            <input 
                                type="number" placeholder="0" 
                                className="flex-1 bg-transparent text-[13px] font-black outline-none text-right placeholder:text-foreground/5"
                                value={set.reps ?? ''} 
                                onChange={(e) => {
                                    onUpdate(set.id, 'reps', e.target.value);
                                    if (errors.reps) setErrors(prev => ({ ...prev, reps: null }));
                                }}
                                disabled={isSaving || (isCompleted && !isEditing)}
                            />
                            <span className="text-[9px] font-black text-emerald-600 uppercase w-6 text-right">Reps</span>
                        </div>
                        {errors.reps && <p className="text-[8px] font-bold text-red-500 ml-1 uppercase">{errors.reps}</p>}
                    </div>
                )}

                {/* Duration Input */}
                {(isTimed || isEndurance) && (
                    <div className="space-y-1">
                        <label className="text-[8px] font-black uppercase tracking-widest text-foreground/30 ml-1">Duration</label>
                        <div className={cn(
                            "flex items-center gap-3 px-3 py-1.5 rounded-lg border transition-all",
                            errors.duration ? "border-red-500 bg-red-500/5" : "border-border focus-within:border-emerald-600 focus-within:ring-1 focus-within:ring-emerald-600/20"
                        )}>
                            <X className="w-3.5 h-3.5 text-foreground/20" />
                            <input 
                                type="number" placeholder="0" 
                                className="flex-1 bg-transparent text-[13px] font-black outline-none text-right placeholder:text-foreground/5"
                                value={set.duration ?? ''} 
                                onChange={(e) => {
                                    onUpdate(set.id, 'duration', e.target.value);
                                    if (errors.duration) setErrors(prev => ({ ...prev, duration: null }));
                                }}
                                disabled={isSaving || (isCompleted && !isEditing)}
                            />
                            <span className="text-[9px] font-black text-emerald-600 uppercase w-6 text-right">{currentDurationUnit.slice(0, 3)}</span>
                        </div>
                        {errors.duration && <p className="text-[8px] font-bold text-red-500 ml-1 uppercase">{errors.duration}</p>}
                    </div>
                )}
            </div>
        </div>
    );
};

export default WorkoutSetRow;
