import React, { useState } from 'react';
import { Plus, Trash2, DollarSign, Dumbbell, Home, TrendingUp, Zap, CreditCard, Info } from 'lucide-react';
import { cn } from '../../../lib/utils';

const templates = [
    { type: 'Gym', icon: Dumbbell },
    { type: 'House Rent', icon: Home },
    { type: 'Investment', icon: TrendingUp },
    { type: 'Electricity', icon: Zap },
    { type: 'Credit Card', icon: CreditCard },
];

const Step3 = ({ data = {}, updateData }) => {
    const expenses = data.expenses || [];
    const [localExpenses, setLocalExpenses] = useState(expenses);

    const syncToParent = (updated) => {
        setLocalExpenses(updated);
        updateData({ expenses: updated });
    };

    const addFromTemplate = (template) => {
        const exists = localExpenses.some(e => e.type === template.type);
        if (exists) return;
        syncToParent([...localExpenses, { type: template.type, period: 'fixed', amount: '' }]);
    };

    const addCustomExpense = () => {
        syncToParent([{ type: '', period: 'fixed', amount: '' }, ...localExpenses]);
    };

    const updateExpense = (index, field, value) => {
        const updated = [...localExpenses];
        updated[index] = { ...updated[index], [field]: value };
        syncToParent(updated);
    };

    const removeExpense = (index) => {
        const updated = localExpenses.filter((_, i) => i !== index);
        syncToParent(updated);
    };

    const totalMonthly = localExpenses.reduce((acc, exp) => acc + (parseFloat(exp.amount) || 0), 0);

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Stats */}
            <div className="flex items-center justify-between bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-2xl px-4 py-3">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Total / Month</p>
                        <p className="text-lg font-black text-foreground">${totalMonthly}</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Items</p>
                    <p className="text-xl font-black text-primary">{localExpenses.length}</p>
                </div>
            </div>

            {/* Two Column Layout */}
            <div className="flex flex-col gap-4">
                {/* Left - Category Templates */}
                <div className="bg-card border-2 border-border rounded-2xl p-4">
                    <h3 className="text-xs font-bold uppercase tracking-wide text-foreground mb-3 flex items-center gap-2">
                        <Plus className="w-3.5 h-3.5 text-primary" />
                        Quick Add
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-2">
                        {templates.map((template, idx) => {
                            const Icon = template.icon;
                            const isAdded = localExpenses.some(e => e.type === template.type);
                            return (
                                <button
                                    key={idx}
                                    onClick={() => addFromTemplate(template)}
                                    disabled={isAdded}
                                    className={cn(
                                        "flex items-center gap-2 px-3 py-2 rounded-xl border transition-all text-left",
                                        isAdded 
                                            ? "border-primary/20 bg-primary/5 cursor-not-allowed"
                                            : "border-border bg-secondary/20 hover:border-primary/40 hover:bg-primary/5"
                                    )}
                                >
                                    <Icon className={cn("w-4 h-4 shrink-0", isAdded ? "text-primary" : "text-muted-foreground")} />
                                    <span className={cn("text-[10px] font-bold uppercase tracking-tight truncate", isAdded ? "text-primary" : "text-foreground")}>
                                        {template.type}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Right - Expense List */}
                <div className="bg-card border-2 border-border rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xs font-bold uppercase tracking-wide text-foreground flex items-center gap-2">
                            <DollarSign className="w-3.5 h-3.5 text-primary" />
                            Expenses ({localExpenses.length})
                        </h3>
                        <button
                            onClick={addCustomExpense}
                            className="h-8 px-3 bg-primary text-white rounded-lg text-[10px] font-bold uppercase tracking-wide hover:bg-primary/90 transition-colors flex items-center gap-1"
                        >
                            <Plus className="w-3 h-3" /> Add Monthly Expense
                        </button>
                    </div>

                    <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                        {localExpenses.map((expense, index) => (
                            <div 
                                key={index}
                                className="flex items-center bg-secondary/20 rounded-xl border border-border/50 overflow-hidden"
                            >
                                <input
                                    type="text"
                                    className="flex-1 min-w-0 bg-transparent border-none text-[11px] font-semibold text-foreground outline-none placeholder:text-muted-foreground/50 px-3 py-2.5"
                                    value={expense.type}
                                    onChange={(e) => updateExpense(index, 'type', e.target.value)}
                                    placeholder="Name"
                                />
                                
                                <div className="w-px h-8 bg-border/50" />
                                
                                <span className="text-[9px] font-bold text-muted-foreground bg-secondary/50 px-2 py-1 rounded-none uppercase shrink-0">
                                    Fixed
                                </span>
                                
                                <div className="w-px h-8 bg-border/50" />
                                
                                <div className="flex items-center gap-2 shrink-0">
                                    <span className="text-[11px] text-muted-foreground">$</span>
                                    <input
                                        type="number"
                                        className="w-14 bg-transparent border-none text-[12px] font-bold text-foreground outline-none"
                                        value={expense.amount}
                                        onChange={(e) => updateExpense(index, 'amount', e.target.value)}
                                        placeholder="0"
                                    />
                                </div>

                                <div className="w-px h-8 bg-border/50" />
                                
                                <button
                                    onClick={() => removeExpense(index)}
                                    className="w-10 h-full flex items-center justify-center text-red-500 shrink-0 cursor-pointer"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}

                        {localExpenses.length === 0 && (
                            <div className="py-8 text-center">
                                <p className="text-[10px] font-semibold text-muted-foreground">
                                    Add expenses from templates
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Notice */}
            <div className="bg-primary/5 border border-primary/10 rounded-xl px-4 py-2.5">
                <div className="flex items-center gap-2">
                    <Info className="w-3.5 h-3.5 text-primary shrink-0" />
                    <p className="text-[10px] text-muted-foreground">
                        Optional step - You can create variable expenses inside the app
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Step3;
