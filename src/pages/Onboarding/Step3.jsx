import React from 'react';
import { CreditCard, ShoppingCart, CheckCircle2, Circle } from 'lucide-react';
import { cn } from '../../lib/utils';

const Step3 = ({ data, updateData }) => {
    const categories = [
        'Gym Membership',
        'Supplements',
        'Equipment',
        'Personal Trainer',
        'Protein / Diet'
    ];

    const trackExpenses = data.track_expenses === true;

    const toggleCategory = (cat) => {
        const current = data.expense_categories || [];
        const updated = current.includes(cat)
            ? current.filter(c => c !== cat)
            : [...current, cat];
        updateData({ expense_categories: updated });
    };

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-3">
                <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6 transform rotate-3">
                    <CreditCard className="w-10 h-10 text-primary -rotate-3" />
                </div>
                <h3 className="text-2xl font-black text-foreground uppercase italic tracking-tighter">Fitness Finance</h3>
                <p className="text-sm text-muted-foreground font-medium max-w-xs mx-auto">
                    Differentiate your journey by tracking gym fees, supplements, and equipment.
                </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <button
                    onClick={() => updateData({ track_expenses: true, expense_categories: categories })}
                    className={cn(
                        "p-5 rounded-3xl border-2 transition-all text-center space-y-2",
                        trackExpenses 
                            ? "border-primary bg-primary/5 text-primary shadow-lg shadow-primary/5" 
                            : "border-border bg-background text-muted-foreground hover:border-muted-foreground"
                    )}
                >
                    <div className={cn("text-[10px] font-black uppercase tracking-[0.2em]", trackExpenses ? "text-primary" : "text-muted-foreground")}>Activate</div>
                    <p className={cn("text-sm font-bold", trackExpenses ? "text-foreground" : "text-muted-foreground")}>Yes, track it</p>
                </button>
                <button
                    onClick={() => updateData({ track_expenses: false, expense_categories: [] })}
                    className={cn(
                        "p-5 rounded-3xl border-2 transition-all text-center space-y-2",
                        data.track_expenses === false
                            ? "border-muted-foreground bg-muted text-foreground" 
                            : "border-border bg-background text-muted-foreground hover:border-muted-foreground"
                    )}
                >
                    <div className={cn("text-[10px] font-black uppercase tracking-[0.2em]", data.track_expenses === false ? "text-foreground" : "text-muted-foreground")}>Skip</div>
                    <p className="text-sm font-bold">Maybe later</p>
                </button>
            </div>

            {trackExpenses && (
                <div className="space-y-4 animate-in fade-in zoom-in-95 duration-500">
                    <div className="flex items-center gap-2 px-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                            Initial Categories
                        </label>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                        {categories.map((cat) => {
                            const selected = (data.expense_categories || []).includes(cat);
                            return (
                                <button
                                    key={cat}
                                    onClick={() => toggleCategory(cat)}
                                    className={cn(
                                        "w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all",
                                        selected 
                                            ? "border-primary/30 bg-primary/5" 
                                            : "border-border bg-background hover:border-muted-foreground"
                                    )}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                                            selected ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                                        )}>
                                            <ShoppingCart className="w-4 h-4" />
                                        </div>
                                        <span className={cn("text-sm font-bold", selected ? "text-foreground" : "text-muted-foreground")}>
                                            {cat}
                                        </span>
                                    </div>
                                    {selected ? (
                                        <CheckCircle2 className="w-5 h-5 text-primary" />
                                    ) : (
                                        <Circle className="w-5 h-5 text-muted" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Step3;
