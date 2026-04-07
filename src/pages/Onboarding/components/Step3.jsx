import React, { useState } from 'react';
import { Plus, Trash2, DollarSign, Calculator, ChevronRight, CreditCard, Gift, HelpCircle, Check } from 'lucide-react';
import { cn } from '../../../lib/utils';

const commonExpenses = [
    { label: 'Gym Membership', icon: CreditCard, defaultAmount: '' },
    { label: 'Supplements', icon: Gift, defaultAmount: '' },
    { label: 'Personal Training', icon: Calculator, defaultAmount: '' },
    { label: 'Other', icon: HelpCircle, defaultAmount: '' },
];

const Step3 = ({ data = {}, updateData }) => {
    const [fixedExpenses, setFixedExpenses] = useState(data.fixed_expenses || []);

    const addExpense = (expense = { category_type: '', expense_period: 'fixed', default_amount: '', notes: '' }) => {
        const updated = [...fixedExpenses, expense];
        setFixedExpenses(updated);
        updateData({ fixed_expenses: updated });
    };

    const addQuickExpense = (preset) => {
        const expense = {
            category_type: preset.label,
            expense_period: 'fixed',
            default_amount: '',
            notes: ''
        };
        addExpense(expense);
    };

    const updateExpense = (index, field, value) => {
        const updated = [...fixedExpenses];
        updated[index] = { ...updated[index], [field]: value };
        setFixedExpenses(updated);
        updateData({ fixed_expenses: updated });
    };

    const removeExpense = (index) => {
        const updated = fixedExpenses.filter((_, i) => i !== index);
        setFixedExpenses(updated);
        updateData({ fixed_expenses: updated });
    };

    const totalMonthly = fixedExpenses.reduce((acc, exp) => acc + (parseFloat(exp.default_amount) || 0), 0);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Summary Card */}
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/20 rounded-3xl p-6">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                        <DollarSign className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Monthly Total</p>
                        <p className="text-3xl font-black text-foreground">
                            ${totalMonthly.toLocaleString()}
                            <span className="text-sm font-medium text-muted-foreground">/mo</span>
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Items</p>
                        <p className="text-xl font-black text-primary">{fixedExpenses.length}</p>
                    </div>
                </div>
            </div>

            {/* Quick Add Section */}
            <div className="bg-card border-2 border-border rounded-3xl p-5">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <Plus className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black uppercase tracking-tight text-foreground">Quick Add</h3>
                        <p className="text-[10px] text-muted-foreground font-medium">Common fitness expenses</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {commonExpenses.map((preset, idx) => {
                        const Icon = preset.icon;
                        const isAdded = fixedExpenses.some(e => e.category_type === preset.label);
                        return (
                            <button
                                key={idx}
                                onClick={() => !isAdded && addQuickExpense(preset)}
                                disabled={isAdded}
                                className={cn(
                                    "flex items-center gap-2 p-3 rounded-2xl border-2 transition-all",
                                    isAdded 
                                        ? "border-primary/30 bg-primary/5 text-muted-foreground cursor-not-allowed"
                                        : "border-border bg-secondary/30 hover:border-primary/50 hover:bg-primary/5 text-foreground"
                                )}
                            >
                                <Icon className={cn("w-4 h-4", isAdded ? "text-primary" : "text-muted-foreground")} />
                                <span className="text-[10px] font-bold uppercase tracking-tight">{preset.label}</span>
                                {isAdded && <Check className="w-3 h-3 text-primary ml-auto" />}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Custom Expense Input */}
            <div className="bg-card border-2 border-border rounded-3xl p-5">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <Calculator className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black uppercase tracking-tight text-foreground">Add Custom</h3>
                        <p className="text-[10px] text-muted-foreground font-medium">Create your own expense item</p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <input
                        type="text"
                        placeholder="Expense name..."
                        className="flex-1 h-12 px-4 bg-secondary/30 border-2 border-border rounded-2xl focus:border-primary/50 outline-none text-xs font-semibold transition-all"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && e.target.value) {
                                addExpense({ category_type: e.target.value, expense_period: 'fixed', default_amount: '', notes: '' });
                                e.target.value = '';
                            }
                        }}
                    />
                    <button
                        onClick={(e) => {
                            const input = e.currentTarget.previousSibling;
                            if (input.value) {
                                addExpense({ category_type: input.value, expense_period: 'fixed', default_amount: '', notes: '' });
                                input.value = '';
                            }
                        }}
                        className="h-12 px-5 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-wider hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" /> Add
                    </button>
                </div>
            </div>

            {/* Expense List */}
            <div className="bg-card border-2 border-border rounded-3xl p-5">
                <div className="flex items-center gap-3 mb-4">
                    <CreditCard className="w-4 h-4 text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-foreground">Your Expenses</span>
                </div>

                <div className="space-y-3">
                    {fixedExpenses.map((expense, index) => (
                        <div 
                            key={index}
                            className="bg-secondary/30 rounded-2xl p-4 border border-border/50 hover:border-primary/30 transition-all group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                    <DollarSign className="w-5 h-5 text-primary" />
                                </div>
                                
                                <div className="flex-1 space-y-2">
                                    <input
                                        type="text"
                                        className="w-full bg-transparent border-none text-[12px] font-black uppercase tracking-tight text-foreground outline-none placeholder:text-muted-foreground/40"
                                        value={expense.category_type}
                                        onChange={(e) => updateExpense(index, 'category_type', e.target.value)}
                                        placeholder="Expense name"
                                    />
                                    <div className="flex items-center gap-3">
                                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">$</span>
                                        <input
                                            type="number"
                                            className="w-24 bg-transparent border-none text-[14px] font-black text-foreground outline-none placeholder:text-muted-foreground/40"
                                            value={expense.default_amount}
                                            onChange={(e) => updateExpense(index, 'default_amount', e.target.value)}
                                            placeholder="0"
                                        />
                                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">/month</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => removeExpense(index)}
                                    className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}

                    {fixedExpenses.length === 0 && (
                        <div className="py-12 text-center bg-secondary/20 rounded-3xl border-2 border-dashed border-border">
                            <DollarSign className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                            <p className="text-[11px] font-black uppercase tracking-wider text-muted-foreground mb-1">
                                No Expenses Yet
                            </p>
                            <p className="text-[10px] text-muted-foreground/60">
                                Add your gym and fitness expenses above
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Info Card */}
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <HelpCircle className="w-4 h-4 text-primary" />
                </div>
                <div>
                    <p className="text-[10px] font-black uppercase tracking-tight text-foreground mb-1">Optional Step</p>
                    <p className="text-[9px] text-muted-foreground leading-relaxed">
                        You can skip this step and add expenses later in the Track Expense section. This helps you track your gym finances and set budget goals.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Step3;
