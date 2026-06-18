import React, { useState } from 'react';
import { X, Target } from 'lucide-react';
import { cn } from '../lib/utils';

const TargetMusclesInput = ({ muscles = [], onUpdate, editable = true, className }) => {
    const [inputValue, setInputValue] = useState('');

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const value = inputValue.trim().toLowerCase();
            if (value && !muscles.includes(value)) {
                onUpdate([...muscles, value]);
                setInputValue('');
            }
        }
    };

    const removeMuscle = (muscleToRemove) => {
        onUpdate(muscles.filter(m => m !== muscleToRemove));
    };

    return (
        <div className={cn("space-y-2", className)}>
            {editable && (
                <div className="space-y-1">
                    <label className="text-[8px] sm:text-[9px] font-bold text-muted-foreground ml-1">
                        Targeted Muscles
                    </label>
                    <div className="relative group">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2">
                            <Target className="w-3.5 h-3.5 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                        </div>
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Type muscle (e.g. Chest) & press Enter..."
                            className="w-full h-9 bg-background border border-border rounded-lg sm:rounded-xl pl-9 pr-4 focus:border-primary/50 outline-none text-[10px] sm:text-xs font-semibold transition-all placeholder:text-muted-foreground/30"
                        />
                    </div>
                </div>
            )}

            {muscles.length > 0 && (
                <div className="flex flex-wrap gap-1.5 px-1">
                    {muscles.map((muscle, idx) => (
                        <div 
                            key={idx}
                            className={cn(
                                "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-wider transition-all",
                                editable 
                                    ? "bg-primary/10 text-primary border border-primary/20" 
                                    : "bg-emerald-500/5 text-emerald-600/70 border border-emerald-500/10"
                            )}
                        >
                            <span>{muscle}</span>
                            {editable && (
                                <button 
                                    onClick={() => removeMuscle(muscle)}
                                    className="p-0.5 hover:bg-primary/20 rounded-full transition-colors"
                                >
                                    <X className="w-2.5 h-2.5" />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TargetMusclesInput;
