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

    const handleToggleComplete = () => {
        if (!isCompleted) {
            onUpdate(set.id, 'completed', true);
            setIsEditing(false);
        }
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
                            disabled={isSaving || (isCompleted && !isEditing)}
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
                        disabled={isSaving} 
                        className="w-8 h-8 flex items-center justify-center text-red-500 hover:text-red-700 transition-all"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Done/Edit Icon */}
                    {(!isCompleted || isEditing) ? (
                        <button 
                            onClick={handleToggleComplete} 
                            disabled={isSaving} 
                            className="w-8 h-8 flex items-center justify-center bg-emerald-600 text-white rounded-lg shadow-lg shadow-emerald-600/20 active:scale-90 transition-all"
                        >
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </button>
                    ) : (
                        <button 
                            onClick={handleEdit} 
                            disabled={isSaving} 
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
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border focus-within:border-emerald-600 focus-within:ring-1 focus-within:ring-emerald-600/20 transition-all">
                            <Dumbbell className="w-3.5 h-3.5 text-foreground/20" />
                            <input 
                                type="number" placeholder="0.00" 
                                className="flex-1 bg-transparent text-[13px] font-black outline-none text-right placeholder:text-foreground/5"
                                value={set.weight || ''} 
                                onChange={(e) => onUpdate(set.id, 'weight', e.target.value)}
                                disabled={isSaving || (isCompleted && !isEditing)}
                            />
                            <span className="text-[9px] font-black text-emerald-600 uppercase w-6 text-right">{weightUnit}</span>
                        </div>
                    </div>
                )}

                {/* Reps Input */}
                {(isStrength || isTimed) && (
                    <div className="space-y-1">
                        <label className="text-[8px] font-black uppercase tracking-widest text-foreground/30 ml-1">Reps</label>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border focus-within:border-emerald-600 focus-within:ring-1 focus-within:ring-emerald-600/20 transition-all">
                            <PlusCircle className="w-3.5 h-3.5 text-foreground/20" />
                            <input 
                                type="number" placeholder="0" 
                                className="flex-1 bg-transparent text-[13px] font-black outline-none text-right placeholder:text-foreground/5"
                                value={set.reps || ''} 
                                onChange={(e) => onUpdate(set.id, 'reps', e.target.value)}
                                disabled={isSaving || (isCompleted && !isEditing)}
                            />
                            <span className="text-[9px] font-black text-emerald-600 uppercase w-6 text-right">Reps</span>
                        </div>
                    </div>
                )}

                {/* Duration Input */}
                {(isTimed || isEndurance) && (
                    <div className="space-y-1">
                        <label className="text-[8px] font-black uppercase tracking-widest text-foreground/30 ml-1">Duration</label>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border focus-within:border-emerald-600 focus-within:ring-1 focus-within:ring-emerald-600/20 transition-all">
                            <X className="w-3.5 h-3.5 text-foreground/20" />
                            <input 
                                type="number" placeholder="0" 
                                className="flex-1 bg-transparent text-[13px] font-black outline-none text-right placeholder:text-foreground/5"
                                value={set.duration || ''} 
                                onChange={(e) => onUpdate(set.id, 'duration', e.target.value)}
                                disabled={isSaving || (isCompleted && !isEditing)}
                            />
                            <span className="text-[9px] font-black text-emerald-600 uppercase w-6 text-right">{currentDurationUnit.slice(0, 3)}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WorkoutSetRow;
