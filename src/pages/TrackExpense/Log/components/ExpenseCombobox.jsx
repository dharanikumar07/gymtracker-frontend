import React, { useState, useMemo } from 'react';
import { Search, Plus, Loader2, Tag } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../../../../components/ui/popover';
import { cn } from '../../../../lib/utils';

const ExpenseCombobox = ({ onSelect, categories = [], isLoading = false }) => {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');

    const filteredCategories = useMemo(() => {
        if (!search) return categories.slice(0, 10);
        return categories
            .filter(cat => cat.name.toLowerCase().includes(search.toLowerCase()))
            .slice(0, 10);
    }, [categories, search]);

    const handleSelect = (category) => {
        onSelect({ name: category.name, is_custom: false });
        setOpen(false);
        setSearch('');
    };

    const handleCustomAdd = () => {
        if (!search.trim()) return;
        onSelect({ name: search, is_custom: true });
        setOpen(false);
        setSearch('');
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button className="w-full flex items-center justify-between px-4 h-11 bg-secondary/50 border-none rounded-2xl text-[11px] font-black text-foreground outline-none hover:bg-secondary/70 transition-all group">
                    <div className="flex items-center gap-2">
                        <Tag className="w-3.5 h-3.5 text-muted-foreground group-hover:text-emerald-500 transition-colors" />
                        <span className={cn(!search ? "text-muted-foreground/50" : "text-foreground uppercase tracking-widest")}>
                            {search || "Select or Search Category..."}
                        </span>
                    </div>
                    <Plus className="w-4 h-4 text-muted-foreground/30" />
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0 overflow-hidden bg-card border-border shadow-2xl rounded-[1.5rem]" align="start">
                <div className="flex items-center px-4 py-3 border-b border-border/50 bg-secondary/10">
                    <Search className="w-4 h-4 text-muted-foreground mr-3 shrink-0" />
                    <input
                        autoFocus
                        placeholder="Search category or type custom..."
                        className="w-full bg-transparent text-[11px] font-bold outline-none placeholder:text-muted-foreground/40 text-foreground h-6"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && search && filteredCategories.length === 0) {
                                handleCustomAdd();
                            }
                        }}
                    />
                </div>
                
                <div className="max-h-[240px] overflow-y-auto p-2 scrollbar-thin">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
                        </div>
                    ) : (
                        <>
                            {filteredCategories.map((cat, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleSelect(cat)}
                                    className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-secondary/50 transition-colors group relative mb-0.5"
                                >
                                    <div className="text-[10px] font-black text-foreground uppercase tracking-widest truncate pr-8">
                                        {cat.name}
                                    </div>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Plus className="w-3.5 h-3.5 text-emerald-500" />
                                    </div>
                                </button>
                            ))}

                            {search && !filteredCategories.find(c => c.name.toLowerCase() === search.toLowerCase()) && (
                                <button
                                    onClick={handleCustomAdd}
                                    className="w-full text-left px-3 py-4 rounded-xl bg-emerald-500/5 hover:bg-emerald-500/10 border border-dashed border-emerald-500/20 mt-1 transition-all group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                                            <Plus className="w-3.5 h-3.5 text-emerald-500" />
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Add Custom "{search}"</div>
                                            <div className="text-[8px] font-bold text-muted-foreground/60 uppercase">Create new variable category</div>
                                        </div>
                                    </div>
                                </button>
                            )}

                            {!search && categories.length === 0 && (
                                <div className="py-8 text-center text-[10px] font-black text-muted-foreground/30 uppercase tracking-widest italic">
                                    No categories found
                                </div>
                            )}
                        </>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
};

export default ExpenseCombobox;
