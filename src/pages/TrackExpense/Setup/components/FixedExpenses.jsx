import React, { useState, useEffect } from 'react';
import { 
    Plus, 
    Trash2, 
    DollarSign, 
    PlusCircle,
    Save,
    ChevronDown
} from 'lucide-react';
import { cn } from '../../../../lib/utils';
import { useExpense } from '../context/ExpenseContext';
import { Button } from '../../../../components/ui/button';
import { validateFixedExpenses } from '../validation/validation';
import DeleteConfirmModal from '../../../../components/ui/DeleteConfirmModal';

const FixedExpenseRow = ({ expense, onChange, onDelete, isDeleting, error, nameError }) => {
    const [name, setName] = useState(expense.category_name);
    const [amount, setAmount] = useState(expense.default_amount || '');

    useEffect(() => {
        setName(expense.category_name);
        setAmount(expense.default_amount || '');
    }, [expense]);

    const handleNameChange = (val) => {
        setName(val);
        onChange(expense.uuid, val, amount);
    };

    const handleAmountChange = (val) => {
        setAmount(val);
        onChange(expense.uuid, name, val);
    };

    return (
        <div className="group flex flex-col sm:flex-row sm:items-start justify-between p-3.5 rounded-2xl bg-secondary/10 border border-emerald-800/50 hover:border-border transition-all gap-3 sm:gap-4">
            <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-background border border-border flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform shrink-0 shadow-sm mt-0.5">
                    <DollarSign className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                    <input 
                        type="text" 
                        value={name} 
                        onChange={(e) => handleNameChange(e.target.value)}
                        className={cn(
                            "w-full h-9 sm:h-8 bg-background border px-3 rounded-xl text-[13px] font-bold text-foreground italic outline-none focus:ring-1 focus:ring-emerald-500/30 transition-all",
                            nameError ? "border-red-500/50 ring-1 ring-red-500/20" : "border-border/50"
                        )}
                        placeholder="Expense Name"
                    />
                    {nameError && (
                        <p className="text-[8px] font-black text-red-500 mt-1 ml-1">
                            {nameError}
                        </p>
                    )}
                </div>
            </div>
            
            <div className="flex items-start justify-between sm:justify-end gap-2 sm:gap-3 border-t sm:border-t-0 border-border/10 pt-3 sm:pt-0 shrink-0">
                <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2 rounded-xl shrink-0 h-6 mt-1">
                    <span className="text-[9px] font-black text-emerald-500 tracking-tighter uppercase">
                        Fixed
                    </span>
                    <ChevronDown className="w-2.5 h-2.5 text-emerald-500/50" />
                </div>

                <div className="flex flex-col items-end">
                    <div className={cn(
                        "flex items-center gap-2 bg-background border rounded-xl px-3 h-9 sm:h-8 min-w-[100px] sm:min-w-[110px]",
                        error ? "border-red-500/50 ring-1 ring-red-500/20" : "border-border/50"
                    )}>
                        <span className="text-[10px] font-bold text-muted-foreground shrink-0">₹</span>
                        <input 
                            type="number" 
                            value={amount} 
                            onChange={(e) => handleAmountChange(e.target.value)}
                            className="w-full bg-transparent border-none p-0 text-[12px] font-bold text-foreground outline-none text-right focus:ring-0"
                            placeholder="0"
                        />
                    </div>
                    {error && (
                        <p className="text-[8px] font-black text-red-500 mt-1 mr-1">
                            {error}
                        </p>
                    )}
                </div>

                <div className="flex items-center gap-1 shrink-0 mt-0.5">
                    <button 
                        onClick={() => onDelete(expense)}
                        disabled={isDeleting}
                        className="text-red-500 hover:text-red-500/60 transition-all p-1.5"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

const FixedExpenses = () => {
    const { 
        fixedExpenses, 
        selectedPlan,
        saveCategory, 
        isSavingCategory, 
        deleteCategory, 
        isDeletingCategory,
        setHasFixedChanges
    } = useExpense();

    const [stagedExpenses, setStagedExpenses] = useState([]);
    const [edits, setEdits] = useState({});
    const [errors, setErrors] = useState({});
    const [expenseToDelete, setExpenseToDelete] = useState(null);

    const hasChanges = stagedExpenses.length > 0 || Object.keys(edits).length > 0;

    // Sync with context for unsaved changes guard
    useEffect(() => {
        setHasFixedChanges(hasChanges);
    }, [hasChanges, setHasFixedChanges]);

    const addCustom = () => {
        setStagedExpenses(prev => [{ id: Date.now(), name: '', amount: '' }, ...prev]);
    };

    const updateStaged = (id, field, value) => {
        setStagedExpenses(prev => prev.map(exp => exp.id === id ? { ...exp, [field]: value } : exp));
        if (errors[id]) setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[id];
            return newErrors;
        });
        if (errors[`${id}_name`]) setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[`${id}_name`];
            return newErrors;
        });
    };

    const removeStaged = (id) => {
        setStagedExpenses(prev => prev.filter(exp => exp.id !== id));
        if (errors[id]) setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[id];
            return newErrors;
        });
        if (errors[`${id}_name`]) setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[`${id}_name`];
            return newErrors;
        });
    };

    const handleRowChange = (uuid, name, amount) => {
        const original = fixedExpenses.find(e => e.uuid === uuid);
        const isChanged = name !== original?.category_name || parseFloat(amount) !== original?.default_amount;

        setEdits(prev => {
            const newEdits = { ...prev };
            if (isChanged) {
                newEdits[uuid] = { category_name: name, default_amount: parseFloat(amount) || 0 };
            } else {
                delete newEdits[uuid];
            }
            return newEdits;
        });
        
        if (errors[uuid]) setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[uuid];
            return newErrors;
        });
        if (errors[`${uuid}_name`]) setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[`${uuid}_name`];
            return newErrors;
        });
    };

    const handleSave = () => {
        const payloadItems = [
            ...stagedExpenses.map(exp => ({
                id: exp.id,
                category_name: exp.name,
                expense_period: 'fixed',
                default_amount: exp.amount
            })),
            ...Object.keys(edits).map(uuid => ({
                uuid,
                category_name: edits[uuid].category_name,
                expense_period: 'fixed',
                default_amount: edits[uuid].default_amount
            }))
        ];

        if (payloadItems.length === 0) return;

        const validation = validateFixedExpenses(payloadItems);
        if (!validation.isValid) {
            setErrors(validation.errors);
            return;
        }

        const payload = {
            fixed_expenses: payloadItems.map(({ id, ...rest }) => rest),
            plan_uuid: selectedPlan?.uuid
        };

        saveCategory(payload, {
            onSuccess: () => {
                setStagedExpenses([]);
                setEdits({});
                setErrors({});
            }
        });
    };

    return (
        <div className="space-y-4">
            {/* Fixed Expenses List */}
            <div className="bg-card border border-border rounded-[2rem] overflow-hidden shadow-sm">
                <div className="p-4 border-b border-border bg-secondary/10 flex items-center justify-between">
                    <h3 className="text-[11px] font-black text-foreground flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-emerald-600" />
                        Active Commitments ({fixedExpenses.length})
                    </h3>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={handleSave}
                            disabled={isSavingCategory || !hasChanges}
                            className={cn(
                                "h-8 px-3 sm:px-4 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg",
                                hasChanges 
                                    ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-500/20" 
                                    : "bg-muted text-muted-foreground cursor-not-allowed shadow-none"
                            )}
                        >
                            <Save className="w-3.5 h-3.5" /> Save
                        </button>
                        <button 
                            onClick={addCustom}
                            className="h-8 px-3 sm:px-4 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20"
                        >
                            <Plus className="w-3.5 h-3.5" /> 
                            <span className="hidden sm:inline">Add Commitment</span>
                            <span className="sm:hidden">Add</span>
                        </button>
                    </div>
                </div>

                <div className="p-3 sm:p-4 space-y-3">
                    {/* Staged (New) Expenses */}
                    {stagedExpenses.map((exp) => (
                        <div key={exp.id} className={cn(
                            "group flex flex-col sm:flex-row sm:items-start justify-between p-3.5 rounded-2xl bg-emerald-500/5 border transition-all duration-200 gap-3 sm:gap-4 shadow-inner",
                            (errors[exp.id] || errors[`${exp.id}_name`]) ? "border-red-500/50 bg-red-500/5" : "border-emerald-500/20"
                        )}>
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                                <div className="w-8 h-8 rounded-lg bg-background border border-emerald-500/20 flex items-center justify-center text-emerald-600 shrink-0 shadow-sm mt-0.5">
                                    <Plus className="w-3.5 h-3.5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <input 
                                        type="text" value={exp.name} onChange={(e) => updateStaged(exp.id, 'name', e.target.value)}
                                        placeholder="Enter Name..."
                                        className={cn(
                                            "w-full h-9 sm:h-8 bg-background border px-3 rounded-xl text-[12px] font-bold text-foreground italic outline-none focus:ring-1 focus:ring-emerald-500/30 transition-all",
                                            errors[`${exp.id}_name`] ? "border-red-500/50 ring-1 ring-red-500/20" : "border-emerald-500/10"
                                        )}
                                        autoFocus={!exp.name}
                                    />
                                    {errors[`${exp.id}_name`] && (
                                        <p className="text-[8px] font-black text-red-500 mt-1 ml-1">
                                            {errors[`${exp.id}_name`]}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-start justify-between sm:justify-end gap-2 sm:gap-3 border-t sm:border-t-0 border-border/10 pt-3 sm:pt-0 shrink-0">
                                <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2 rounded-xl shrink-0 h-6 mt-1">
                                    <span className="text-[9px] font-black text-emerald-500 tracking-tighter uppercase">Fixed</span>
                                    <ChevronDown className="w-2.5 h-2.5 text-emerald-500/50" />
                                </div>
                                <div className="flex flex-col items-end">
                                    <div className={cn(
                                        "flex items-center gap-2 bg-background border rounded-xl px-3 h-9 sm:h-8 min-w-[100px] sm:min-w-[110px]",
                                        errors[exp.id] ? "border-red-500/50 ring-1 ring-red-500/20" : "border-border/50"
                                    )}>
                                        <span className="text-[10px] font-bold text-muted-foreground shrink-0">₹</span>
                                        <input 
                                            type="number" value={exp.amount} onChange={(e) => updateStaged(exp.id, 'amount', e.target.value)}
                                            className="w-full bg-transparent border-none p-0 text-[12px] font-bold text-foreground outline-none text-right focus:ring-0"
                                            placeholder="0"
                                        />
                                    </div>
                                    {errors[exp.id] && (
                                        <p className="text-[8px] font-black text-red-500 mt-1 mr-1">
                                            {errors[exp.id]}
                                        </p>
                                    )}
                                </div>
                                <button onClick={() => removeStaged(exp.id)} className="text-red-500 hover:text-red-500/60 transition-all p-1.5 shrink-0 mt-0.5">
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    ))}

                    {/* Saved (Existing) Expenses */}
                    {fixedExpenses.map((expense) => (
                        <FixedExpenseRow 
                            key={expense.uuid}
                            expense={expense}
                            onChange={handleRowChange}
                            onDelete={setExpenseToDelete}
                            isDeleting={isDeletingCategory}
                            error={errors[expense.uuid]}
                            nameError={errors[`${expense.uuid}_name`]}
                        />
                    ))}

                    {fixedExpenses.length === 0 && stagedExpenses.length === 0 && (
                        <div className="py-8 text-center flex flex-col items-center animate-in fade-in duration-500">
                            <div className="w-12 h-12 rounded-full bg-secondary/30 flex items-center justify-center mb-4">
                                <PlusCircle className="w-6 h-6 text-muted-foreground/40" />
                            </div>
                            <p className="text-[10px] font-black text-muted-foreground italic">
                                No recurring expenses added yet
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {expenseToDelete && (
                <DeleteConfirmModal
                    title="Remove Commitment"
                    message={`Are you sure you want to remove "${expenseToDelete.category_name || 'this expense'}"? This will stop tracking this recurring cost.`}
                    onCancel={() => setExpenseToDelete(null)}
                    onConfirm={() => {
                        deleteCategory(expenseToDelete.uuid);
                        setExpenseToDelete(null);
                    }}
                />
            )}
        </div>
    );
};

export default FixedExpenses;