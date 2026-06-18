import React, { useState, useMemo } from 'react';
import { 
    Plus, 
    Trash2, 
    DollarSign, 
    Dumbbell, 
    Home, 
    Zap, 
    CreditCard, 
    Wallet,
    CalendarIcon,
    ChevronDown,
    PlusCircle
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { format } from "date-fns";
import { Calendar } from "../../../components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../../../components/ui/popover";
import { Button } from "../../../components/ui/button";

const templates = [
    { type: 'Gym', icon: Dumbbell },
    { type: 'Rent', icon: Home },
    { type: 'EB Bill', icon: Zap },
    { type: 'Credit Card', icon: CreditCard },
];

const SectionHeader = ({ title }) => (
    <div className="flex items-center gap-2 mb-3 mt-1">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
        <h3 className="text-[9px] font-black text-muted-foreground">{title}</h3>
    </div>
);

const Step3 = ({ data = {}, updateData, isSubmitted = false }) => {
    // Plan State
    const plan = data.plan || {
        name: '',
        amount: '',
        budget_type: 'monthly',
        start_date: new Date()
    };

    // Expenses State
    const expenses = data.expenses || [];
    const [isCyclePopoverOpen, setIsCyclePopoverOpen] = useState(false);

    const handlePlanChange = (field, value) => {
        updateData({
            plan: { ...plan, [field]: value }
        });
    };

    const handleExpenseChange = (updatedExpenses) => {
        updateData({ expenses: updatedExpenses });
    };

    const addFromTemplate = (template) => {
        const exists = expenses.some(e => e.type === template.type);
        if (exists) return;
        handleExpenseChange([...expenses, { type: template.type, period: 'fixed', amount: '' }]);
    };

    const addCustomExpense = () => {
        handleExpenseChange([{ type: '', period: 'fixed', amount: '' }, ...expenses]);
    };

    const updateExpense = (index, field, value) => {
        const updated = [...expenses];
        updated[index] = { ...updated[index], [field]: value };
        handleExpenseChange(updated);
    };

    const removeExpense = (index) => {
        const updated = expenses.filter((_, i) => i !== index);
        handleExpenseChange(updated);
    };

    const labelClasses = "text-[9px] font-black text-muted-foreground/90 ml-1 block mb-1.5";
    const inputClasses = "w-full h-9 bg-background border border-border/50 px-3 rounded-xl text-[11px] font-bold text-foreground outline-none focus:ring-1 focus:ring-emerald-500/30 transition-all placeholder:text-muted-foreground/30";

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Unified Budget & Expense Card */}
            <div className="bg-card border border-border rounded-[2rem] overflow-hidden shadow-sm">
                {/* Section 1: Budget Strategy */}
                <div className="p-4 sm:p-5 border-b border-border bg-secondary/5">
                    <SectionHeader title="Budget Strategy" />
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className={labelClasses}>Plan Name <span className="text-red-500">*</span></label>
                                <input 
                                    type="text" 
                                    value={plan.name}
                                    onChange={(e) => handlePlanChange('name', e.target.value)}
                                    className={cn(inputClasses, isSubmitted && !plan.name && "border-red-500/50 ring-1 ring-red-500/10")}
                                    placeholder="e.g. Monthly Budget"
                                />
                                {isSubmitted && !plan.name && (
                                    <p className="text-[8px] font-black text-red-500 mt-1 ml-1 italic">Name is required</p>
                                )}
                            </div>
                            <div className="space-y-1">
                                <label className={labelClasses}>Total Budget (₹) <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground">₹</span>
                                    <input 
                                        type="number" 
                                        value={plan.amount}
                                        onChange={(e) => handlePlanChange('amount', e.target.value)}
                                        className={cn(inputClasses, "pl-6", isSubmitted && (!plan.amount || plan.amount <= 0) && "border-red-500/50 ring-1 ring-red-500/10")}
                                        placeholder="0.00"
                                    />
                                </div>
                                {isSubmitted && (!plan.amount || plan.amount <= 0) && (
                                    <p className="text-[8px] font-black text-red-500 mt-1 ml-1 italic">Valid amount required</p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-3 gap-y-4 sm:gap-4">
                            <div className="space-y-1">
                                <label className={labelClasses}>Cycle</label>
                                <Popover open={isCyclePopoverOpen} onOpenChange={setIsCyclePopoverOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="w-full h-9 px-2.5 sm:px-3 bg-background border-border/50 rounded-xl text-[10px] sm:text-[11px] font-bold flex items-center justify-between hover:bg-secondary/30"
                                        >
                                            <span className="capitalize truncate mr-1">{plan.budget_type || 'monthly'} Cycle</span>
                                            <ChevronDown className="w-3 h-3 text-muted-foreground shrink-0" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-48 p-1.5" align="start">
                                        {['monthly', 'weekly'].map((type) => (
                                            <button
                                                key={type}
                                                onClick={() => {
                                                    handlePlanChange('budget_type', type);
                                                    setIsCyclePopoverOpen(false);
                                                }}
                                                className={cn(
                                                    "w-full px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-left rounded-lg transition-colors",
                                                    (plan.budget_type || 'monthly') === type ? "bg-emerald-500/10 text-emerald-600" : "hover:bg-secondary text-foreground/70"
                                                )}
                                            >
                                                {type} Cycle
                                            </button>
                                        ))}
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div className="space-y-1">
                                <label className={labelClasses}>Start Date</label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full justify-between text-left font-bold h-9 px-2.5 sm:px-3 bg-background border-border/50 text-[10px] sm:text-[11px] rounded-xl hover:bg-secondary/20",
                                                !plan.start_date && "text-muted-foreground"
                                            )}
                                        >
                                            <span className="truncate mr-1">{plan.start_date ? format(new Date(plan.start_date), "dd MMM") : "Start Date"}</span>
                                            <CalendarIcon className="h-3 w-3 opacity-50 shrink-0" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={plan.start_date ? new Date(plan.start_date) : undefined}
                                            onSelect={(date) => handlePlanChange('start_date', date)}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div className="space-y-1 col-span-2 sm:col-span-1 flex flex-col sm:items-start">
                                <label className={cn(labelClasses, "sm:ml-1")}>Status</label>
                                <div className="flex items-center gap-2 h-9">
                                    <button
                                        type="button"
                                        onClick={() => handlePlanChange('is_active', !plan.is_active)}
                                        className={cn(
                                            "relative inline-flex h-4.5 w-8 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2",
                                            plan.is_active ? "bg-emerald-500" : "bg-muted"
                                        )}
                                    >
                                        <span
                                            className={cn(
                                                "pointer-events-none block h-3 w-3 rounded-full bg-white shadow-lg ring-0 transition-transform",
                                                plan.is_active ? "translate-x-4" : "translate-x-1"
                                            )}
                                        />
                                    </button>
                                    <span className="text-[10px] font-bold text-muted-foreground min-w-[45px]">
                                        {plan.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 2: Fixed Templates */}
                <div className="p-4 sm:p-5 border-b border-border bg-background">
                    <SectionHeader title="Quick Templates" />
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {templates.map((template, idx) => {
                            const Icon = template.icon;
                            const isAdded = expenses.some(e => e.type === template.type);
                            return (
                                <button
                                    key={idx}
                                    onClick={() => addFromTemplate(template)}
                                    className={cn(
                                        "flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all text-left group",
                                        isAdded 
                                            ? "border-emerald-500/20 bg-emerald-500/5 cursor-not-allowed"
                                            : "border-border/50 bg-secondary/10 hover:border-emerald-500/30 hover:bg-emerald-500/5"
                                    )}
                                >
                                    <div className={cn(
                                        "w-5 h-5 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                                        isAdded ? "bg-emerald-500 text-white" : "bg-background border border-border/50 text-muted-foreground group-hover:text-emerald-500"
                                    )}>
                                        <Icon className="w-2.5 h-2.5" />
                                    </div>
                                    <span className={cn(
                                        "text-[8px] font-black truncate",
                                        isAdded ? "text-emerald-600" : "text-foreground/70"
                                    )}>
                                        {template.type}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Section 3: Expense Items */}
                <div className="p-4 sm:p-5 bg-secondary/5">
                    <div className="flex items-center justify-between mb-4">
                        <SectionHeader title="Fixed Expenses" />
                        <button
                            onClick={addCustomExpense}
                            className="h-7 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-500/10"
                        >
                            <Plus className="w-3 h-3" /> Add Custom
                        </button>
                    </div>

                    <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                        {expenses.map((expense, index) => {
                            const isExpenseInvalid = isSubmitted && (!expense.type || !expense.amount || expense.amount < 0);
                            return (
                                <div 
                                    key={index}
                                    className="group flex flex-col gap-1 animate-in fade-in slide-in-from-top-1 duration-300"
                                >
                                    <div className={cn(
                                        "flex items-center bg-card border rounded-2xl overflow-hidden shadow-sm transition-all",
                                        isExpenseInvalid ? "border-red-500/50 bg-red-500/[0.02]" : "border-border/50 hover:border-emerald-500/20"
                                    )}>
                                        <div className="flex-1 min-w-0 px-3 py-2 border-r border-border/30">
                                            <input
                                                type="text"
                                                className={cn(
                                                    "w-full bg-transparent border-none text-[11px] font-bold text-foreground outline-none placeholder:text-muted-foreground/30 italic",
                                                    isSubmitted && !expense.type && "text-red-500 placeholder:text-red-300"
                                                )}
                                                value={expense.type}
                                                onChange={(e) => updateExpense(index, 'type', e.target.value)}
                                                placeholder="Category Name..."
                                            />
                                        </div>
                                        
                                        <div className="px-2.5 bg-secondary/20 flex items-center justify-center border-r border-border/30 h-full">
                                            <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Fixed</span>
                                        </div>
                                        
                                        <div className="flex items-center gap-1.5 px-3 min-w-[100px] border-r border-border/30">
                                            <span className={cn("text-[10px] font-bold", isSubmitted && (!expense.amount || expense.amount < 0) ? "text-red-500" : "text-emerald-500")}>₹</span>
                                            <input
                                                type="number"
                                                className={cn(
                                                    "w-full bg-transparent border-none text-[11px] font-black text-foreground outline-none text-right",
                                                    isSubmitted && (!expense.amount || expense.amount < 0) && "text-red-500 placeholder:text-red-300"
                                                )}
                                                value={expense.amount}
                                                onChange={(e) => updateExpense(index, 'amount', e.target.value)}
                                                placeholder="0"
                                            />
                                        </div>

                                        <button
                                            onClick={() => removeExpense(index)}
                                            className="w-9 h-9 flex items-center justify-center text-red-500/40 hover:text-red-500 hover:bg-red-500/5 transition-all shrink-0 border-l border-border/30"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                    {isExpenseInvalid && (
                                        <p className="text-[8px] font-bold text-red-500/70 ml-3 italic">
                                            {!expense.type ? 'Category is required' : 'Enter a valid non-negative amount'}
                                        </p>
                                    )}
                                </div>
                            );
                        })}

                        {expenses.length === 0 && (
                            <div className="py-10 text-center bg-background/50 border border-dashed border-border rounded-2xl">
                                <div className="w-10 h-10 rounded-full bg-secondary/30 flex items-center justify-center mx-auto mb-3">
                                    <PlusCircle className="w-5 h-5 text-muted-foreground/30" />
                                </div>
                                <p className="text-[10px] font-black text-muted-foreground/50">
                                    No expenses added
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Total Indicator */}
            <div className="bg-emerald-600 rounded-2xl px-5 py-3 flex items-center justify-between shadow-xl shadow-emerald-600/20 text-white">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                        <Wallet className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-[8px] font-black text-white/60 leading-none mb-1">Monthly Fixed Total</p>
                        <p className="text-sm font-black">₹ {expenses.reduce((acc, exp) => acc + (parseFloat(exp.amount) || 0), 0).toLocaleString()}</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-[8px] font-black text-white/60 leading-none mb-1">Items</p>
                    <p className="text-sm font-black tracking-widest">{expenses.length}</p>
                </div>
            </div>
        </div>
    );
};

export default Step3;
