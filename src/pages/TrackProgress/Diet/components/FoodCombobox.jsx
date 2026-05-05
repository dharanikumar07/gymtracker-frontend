import React, { useState, useMemo } from 'react';
import { Search, Plus, Check, Loader2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../../../../components/ui/popover';
import { cn } from '../../../../lib/utils';
import { useAvailableFoodsQuery } from '../http/queries';

const FoodCombobox = ({ onSelect, dietType = 'veg' }) => {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    
    const { data, isLoading } = useAvailableFoodsQuery(dietType);
    const foods = data?.foods || [];

    const filteredFoods = useMemo(() => {
        if (!search) return foods.slice(0, 30);
        return foods
            .filter(food => food.name.toLowerCase().includes(search.toLowerCase()))
            .slice(0, 30);
    }, [foods, search]);

    const handleSelect = (food) => {
        onSelect(food);
        setOpen(false);
        setSearch('');
    };

    const handleCustomAdd = () => {
        if (!search.trim()) return;
        onSelect({
            name: search,
            quantity: 100,
            unit: 'g',
            calories: 0,
            protein: 0,
            carbs: 0,
            fats: 0,
            nutrition_data: null
        });
        setOpen(false);
        setSearch('');
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button className="flex items-center gap-1.5 h-7 px-3 rounded-lg bg-primary text-white text-[8px] font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/10">
                    <Plus className="w-3.5 h-3.5" /> Add Ingredient
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-[280px] p-0 overflow-hidden bg-card border-border shadow-2xl" align="end">
                <div className="flex items-center px-3 py-2 border-b border-border/50 bg-secondary/10">
                    <Search className="w-3.5 h-3.5 text-muted-foreground mr-2 shrink-0" />
                    <input
                        autoFocus
                        placeholder="Search food or add custom..."
                        className="w-full bg-transparent text-[11px] font-bold outline-none placeholder:text-muted-foreground/50 text-foreground h-6"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && search && filteredFoods.length === 0) {
                                handleCustomAdd();
                            }
                        }}
                    />
                </div>
                
                <div className="max-h-[240px] overflow-y-auto p-1 scrollbar-thin scrollbar-thumb-border">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-6">
                            <Loader2 className="w-4 h-4 animate-spin text-primary" />
                        </div>
                    ) : (
                        <>
                            {filteredFoods.map((food, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleSelect(food)}
                                    className="w-full text-left px-2.5 py-2 rounded-md hover:bg-secondary/50 transition-colors group relative"
                                >
                                    <div className="text-[11px] font-black text-foreground uppercase tracking-tight truncate pr-8">
                                        {food.name}
                                    </div>
                                    <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5 mt-1 opacity-70">
                                        <span className="text-[8px] font-black uppercase text-orange-500">{food.calories} kcal</span>
                                        <span className="text-[8px] font-black uppercase text-blue-500">P: {food.protein}g</span>
                                        <span className="text-[8px] font-black uppercase text-amber-500">C: {food.carbs}g</span>
                                        <span className="text-[8px] font-black uppercase text-rose-500">F: {food.fats}g</span>
                                    </div>
                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Plus className="w-3 h-3 text-primary" />
                                    </div>
                                </button>
                            ))}

                            {search && !filteredFoods.find(f => f.name.toLowerCase() === search.toLowerCase()) && (
                                <button
                                    onClick={handleCustomAdd}
                                    className="w-full text-left px-2.5 py-3 rounded-md bg-primary/5 hover:bg-primary/10 border border-dashed border-primary/20 mt-1 transition-all group"
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                                            <Plus className="w-3 h-3 text-primary" />
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-black text-primary uppercase">Add Custom "{search}"</div>
                                            <div className="text-[8px] font-bold text-muted-foreground uppercase">Enter nutrition details manually</div>
                                        </div>
                                    </div>
                                </button>
                            )}

                            {!search && foods.length === 0 && (
                                <div className="py-6 text-center text-[10px] font-bold text-muted-foreground uppercase italic">
                                    No foods found
                                </div>
                            )}
                        </>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
};

export default FoodCombobox;
