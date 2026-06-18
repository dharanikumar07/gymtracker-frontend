import React, { useState, useMemo } from 'react';
import { Search, Dumbbell, Check, Loader2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../../../components/ui/popover';
import { cn } from '../../../lib/utils';

const ExerciseCombobox = ({ exercises = [], selectedExercise, onSelect, isLoading = false }) => {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');

    const filteredExercises = useMemo(() => {
        if (!search) return exercises;
        return exercises.filter(ex => 
            ex.name.toLowerCase().includes(search.toLowerCase()) || 
            ex.targeted_muscle?.toLowerCase().includes(search.toLowerCase())
        );
    }, [exercises, search]);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button className="flex items-center gap-2 h-9 px-4 rounded-xl bg-background border border-border/40 text-[9px] font-black uppercase tracking-widest hover:bg-secondary/40 transition-all min-w-[180px] justify-between">
                    <div className="flex items-center gap-2">
                        <Dumbbell className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="truncate max-w-[120px]">
                            {selectedExercise?.name || 'Select Workout'}
                        </span>
                    </div>
                    <Search className="w-3 h-3 opacity-30" />
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-[240px] p-0 overflow-hidden bg-card border-border shadow-2xl rounded-2xl" align="end">
                <div className="flex items-center px-3 py-2 border-b border-border/50 bg-secondary/10">
                    <Search className="w-3.5 h-3.5 text-muted-foreground mr-2 shrink-0" />
                    <input
                        autoFocus
                        placeholder="Search exercises..."
                        className="w-full bg-transparent text-[11px] font-bold outline-none placeholder:text-muted-foreground/50 text-foreground h-6"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                
                <div className="max-h-[280px] overflow-y-auto p-1 scrollbar-thin">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-6">
                            <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
                        </div>
                    ) : filteredExercises.length > 0 ? (
                        filteredExercises.map((ex) => (
                            <button
                                key={ex.uuid}
                                onClick={() => {
                                    onSelect(ex);
                                    setOpen(false);
                                    setSearch('');
                                }}
                                className={cn(
                                    "w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors text-left group mb-0.5",
                                    selectedExercise?.uuid === ex.uuid 
                                        ? "bg-emerald-500/10 text-emerald-500" 
                                        : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                                )}
                            >
                                <div className="flex flex-col min-w-0">
                                    <span className="text-[10px] font-black uppercase truncate">{ex.name}</span>
                                    <span className="text-[7px] font-bold opacity-40">
                                        {ex.targeted_muscle || 'General'}
                                    </span>
                                </div>
                                {selectedExercise?.uuid === ex.uuid && <Check className="w-3.5 h-3.5" />}
                            </button>
                        ))
                    ) : (
                        <div className="py-8 text-center">
                            <p className="text-[9px] font-black text-muted-foreground/40">
                                No results found
                            </p>
                        </div>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
};

export default ExerciseCombobox;
