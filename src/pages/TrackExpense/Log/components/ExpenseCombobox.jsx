import React, { useState, useMemo } from 'react';
import { Search, Plus, Loader2, IndianRupee } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../../../../components/ui/popover';
import { cn } from '../../../../lib/utils';
import { useExpenseLog } from '../ExpenseLogContext';

const ExpenseCombobox = ({ categories = [], isLoading = false }) => {
    const { addStagedLog } = useExpenseLog();
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');

    const filteredCategories = useMemo(() => {
        if (!search) return categories.slice(0, 10);
        return categories
            .filter(cat => cat.name && cat.name.toLowerCase().includes(search.toLowerCase()))
            .slice(0, 10);
    }, [categories, search]);

    const handleSelect = (category) => {
        addStagedLog({
            category_name: category.name,
            amount: category.amount || 0,
            is_fixed: category.type === 'fixed',
            is_custom: false
        });
        setOpen(false);
        setSearch('');
    };

    const handleCustomAdd = () => {
        addStagedLog({
            category_name: search || 'Custom',
            amount: 0,
            is_fixed: false,
            is_custom: true
        });
        setOpen(false);
        setSearch('');
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button className="flex items-center gap-1.5 h-7 px-3 rounded-lg bg-emerald-600 text-white text-[8px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20">
                    <Plus className="w-3.5 h-3.5" /> Log Expense
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-[280px] p-0 overflow-hidden bg-card border-border shadow-2xl rounded-2xl" align="end">
                <div className="flex items-center px-3 py-2 border-b border-border/50 bg-secondary/10">
                    <Search className="w-3.5 h-3.5 text-muted-foreground mr-2 shrink-0" />
                    <input
                        autoFocus
                        placeholder="Search or add custom..."
                        className="w-full bg-transparent text-[11px] font-bold outline-none placeholder:text-muted-foreground/50 text-foreground h-6"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                
                <div className="max-h-[240px] overflow-y-auto p-1 scrollbar-thin">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-6">
                            <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
                        </div>
                    ) : (
                        <>
                            {filteredCategories.map((cat, idx) => (
                                <button
                                key={idx}
                                onClick={() => handleSelect(cat)}
                                className="w-full flex items-center justify-between px-2.5 py-2 rounded-md hover:bg-secondary/50 transition-colors group"
                                >
                                <div className="flex items-center gap-2 min-w-0">
                                    <div className="text-[10px] font-black text-foreground uppercase tracking-widest truncate">{cat.name}</div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="text-[10px] font-bold text-muted-foreground/60 tracking-wider shrink-0">₹{Number(cat.amount || 0).toLocaleString()}</div>
                                    <Plus className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                </div>
                                </button>                            ))}
                            <button
                                onClick={handleCustomAdd}
                                className="w-full text-left px-2.5 py-3 rounded-md bg-emerald-500/5 hover:bg-emerald-500/10 border border-dashed border-emerald-500/20 mt-1 transition-all"
                            >
                                <div className="text-[10px] font-black text-emerald-600 uppercase">Add Custom "{search || 'Expense'}"</div>
                            </button>
                        </>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
};

export default ExpenseCombobox;
