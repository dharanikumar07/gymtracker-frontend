import React from 'react';
import { CreditCard, ShoppingCart, CheckCircle2, Circle, IndianRupee, AlertCircle, Plus } from 'lucide-react';
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
    const expenseDetails = data.expense_details || {};
    const selectedCategories = data.expense_categories || [];

    const toggleCategory = (cat) => {
        let updatedCategories;
        let updatedDetails = { ...expenseDetails };

        if (selectedCategories.includes(cat)) {
            updatedCategories = selectedCategories.filter(c => c !== cat);
            delete updatedDetails[cat];
        } else {
            updatedCategories = [...selectedCategories, cat];
            updatedDetails[cat] = '';
        }

        updateData({ 
            expense_categories: updatedCategories,
            expense_details: updatedDetails
        });
    };

    const handlePriceChange = (cat, price) => {
        updateData({ 
            expense_details: { ...expenseDetails, [cat]: price } 
        });
    };

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Section */}
            <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-primary/20 shadow-sm">
                    <CreditCard className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-black text-foreground uppercase italic tracking-tight">Fitness Finance</h3>
                <p className="text-sm text-muted-foreground font-medium max-w-xs mx-auto">
                    Differentiate your journey. Set your initial expenses to stay within your budget.
                </p>
            </div>

            {/* Main Toggle Buttons */}
            <div className="grid grid-cols-2 gap-3">
                <button
                    onClick={() => updateData({ track_expenses: true })}
                    className={cn(
                        "p-4 rounded-2xl border-2 transition-all text-center space-y-1 group",
                        trackExpenses 
                            ? "border-primary bg-primary/5 text-primary shadow-lg shadow-primary/5" 
                            : "border-border bg-background text-muted-foreground hover:border-muted-foreground"
                    )}
                >
                    <div className={cn("text-[10px] font-black uppercase tracking-[0.2em]", trackExpenses ? "text-primary" : "text-muted-foreground")}>Yes, track it</div>
                    <p className={cn("text-xs font-bold", trackExpenses ? "text-foreground" : "text-muted-foreground")}>Enable Finance</p>
                </button>
                <button
                    onClick={() => updateData({ track_expenses: false, expense_categories: [], expense_details: {} })}
                    className={cn(
                        "p-4 rounded-2xl border-2 transition-all text-center space-y-1",
                        data.track_expenses === false
                            ? "border-muted-foreground bg-muted text-foreground" 
                            : "border-border bg-background text-muted-foreground hover:border-muted-foreground"
                    )}
                >
                    <div className={cn("text-[10px] font-black uppercase tracking-[0.2em]", data.track_expenses === false ? "text-foreground" : "text-muted-foreground")}>Not now</div>
                    <p className="text-xs font-bold">Skip Setup</p>
                </button>
            </div>

            {trackExpenses && (
                <div className="space-y-4 animate-in fade-in zoom-in-95 duration-500">
                    <div className="flex items-center gap-2 px-1">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                            Initial Categories & Monthly Spending
                        </label>
                    </div>
                    
                    <div className="space-y-2">
                        {categories.map((cat) => {
                            const selected = selectedCategories.includes(cat);
                            return (
                                <div 
                                    key={cat} 
                                    className={cn(
                                        "relative group flex items-center gap-3 p-2 rounded-2xl border-2 transition-all",
                                        selected 
                                            ? "border-primary/40 bg-primary/[0.02] ring-4 ring-primary/[0.02]" 
                                            : "border-border bg-background hover:border-muted-foreground/30"
                                    )}
                                >
                                    {/* Select Icon/Button */}
                                    <button
                                        onClick={() => toggleCategory(cat)}
                                        className={cn(
                                            "w-10 h-10 shrink-0 rounded-xl flex items-center justify-center transition-colors",
                                            selected ? "bg-primary text-white" : "bg-secondary text-muted-foreground"
                                        )}
                                    >
                                        {selected ? <CheckCircle2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                                    </button>

                                    {/* Category Name */}
                                    <div className="flex-1 min-w-0">
                                        <p className={cn("text-sm font-bold truncate", selected ? "text-foreground" : "text-muted-foreground")}>
                                            {cat}
                                        </p>
                                        {cat === 'Protein / Diet' && (
                                            <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-tighter">Daily Tracking Available</p>
                                        )}
                                    </div>

                                    {/* Price Input - Clean & Right Aligned */}
                                    {selected && (
                                        <div className="relative w-28 animate-in slide-in-from-right-2 duration-300">
                                            <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-primary font-bold text-xs">
                                                ₹
                                            </div>
                                            <input 
                                                type="number"
                                                className="w-full h-10 pl-6 pr-3 bg-background border border-primary/20 rounded-xl outline-none text-sm font-black text-right focus:border-primary transition-all text-foreground placeholder:text-muted-foreground/30 shadow-inner"
                                                placeholder="0.00"
                                                value={expenseDetails[cat] || ''}
                                                onChange={(e) => handlePriceChange(cat, e.target.value)}
                                                autoFocus
                                            />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Notice Area */}
                    {selectedCategories.includes('Protein / Diet') && (
                        <div className="p-3 rounded-2xl bg-secondary border border-border flex items-start gap-3 animate-in fade-in duration-500">
                            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                                <AlertCircle className="w-4 h-4 text-amber-500" />
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-400 tracking-widest">Dynamic Tracking</p>
                                <p className="text-[10px] text-muted-foreground font-medium leading-relaxed">
                                    You can track your daily dietary costs within the app's dashboard later.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Step3;
