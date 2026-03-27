import React, { useState } from 'react';
import { Plus, Trash2, ArrowRight, Loader2, DollarSign, FileText } from 'lucide-react';
import { toast } from 'sonner';

const Step3 = ({ data = {}, updateData, loading }) => {
    const [fixedExpenses, setFixedExpenses] = useState(data.fixed_expenses || []);

    const addExpense = () => {
        setFixedExpenses([...fixedExpenses, { category_type: '', expense_period: 'fixed', default_amount: '', notes: '' }]);
    };

    const updateExpense = (index, field, value) => {
        const updated = [...fixedExpenses];
        updated[index][field] = value;
        setFixedExpenses(updated);
        updateData({ fixed_expenses: updated });
    };

    const removeExpense = (index) => {
        const updated = fixedExpenses.filter((_, i) => i !== index);
        setFixedExpenses(updated);
        updateData({ fixed_expenses: updated });
    };

    return (
        <div className="w-full max-w-lg mx-auto animate-in fade-in zoom-in-95 duration-500">
            <div className="space-y-6">
                <div className="text-center space-y-1">
                    <h2 className="text-xl font-black uppercase tracking-tight">Fixed Monthly Expenses</h2>
                    <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground text-emerald-500">
                        These recur every month
                    </p>
                </div>

                <div className="space-y-3">
                    {fixedExpenses.map((expense, index) => (
                        <div key={index} className="bg-card border border-border p-4 rounded-xl flex items-center gap-4 group">
                            <div className="flex-1 grid grid-cols-3 gap-3">
                                <input
                                    type="text"
                                    placeholder="Category (e.g. Rent)"
                                    className="bg-secondary/30 border border-border rounded-lg px-3 py-2 text-xs outline-none focus:border-emerald-500 transition-colors"
                                    value={expense.category_type}
                                    onChange={(e) => updateExpense(index, 'category_type', e.target.value)}
                                />
                                <div className="bg-secondary/30 border border-border rounded-lg px-3 py-2 text-xs text-muted-foreground flex items-center">
                                    Fixed
                                </div>
                                <input
                                    type="number"
                                    placeholder="Amount"
                                    className="bg-secondary/30 border border-border rounded-lg px-3 py-2 text-xs outline-none focus:border-emerald-500 transition-colors"
                                    value={expense.default_amount}
                                    onChange={(e) => updateExpense(index, 'default_amount', e.target.value)}
                                />
                            </div>
                            <button 
                                onClick={() => removeExpense(index)}
                                className="text-muted-foreground hover:text-rose-500 transition-colors p-1"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}

                    <button 
                        onClick={addExpense}
                        className="w-full py-3 border border-border rounded-xl font-black text-[10px] uppercase tracking-widest text-muted-foreground hover:border-emerald-500 hover:text-emerald-500 transition-all flex items-center justify-center gap-2"
                    >
                        <Plus className="w-4 h-4" /> Add Expense
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Step3;
