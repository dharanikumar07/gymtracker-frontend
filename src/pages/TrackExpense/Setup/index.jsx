import React, { useState } from 'react';
import { format } from 'date-fns';
import {
    Wallet,
    CalendarIcon,
    ChevronDown,
    Loader2,
    Save,
    Zap,
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { Calendar } from '../../../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../../../components/ui/popover';
import { Button } from '../../../components/ui/button';
import { useExpense } from './context/ExpenseContext';
import { validateBudgetPlan } from './validation/validation';
import FixedExpenses from './components/FixedExpenses';
import BudgetPlanCard from './components/BudgetPlanCard';

const CreateFirstPlan = () => {
    const { savePlan, isSavingPlan } = useExpense();

    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [budgetType, setBudgetType] = useState('monthly');
    const [startDate, setStartDate] = useState(new Date());
    const [errors, setErrors] = useState({});

    const handleSave = () => {
        const payload = {
            uuid: null,
            name,
            meta_data: {
                amount: parseFloat(amount) || 0,
                budget_type: budgetType,
            },
            is_active: true,
            type: 'budget',
            start_date: format(startDate, 'yyyy-MM-dd'),
        };

        const validation = validateBudgetPlan(payload);
        if (!validation.isValid) {
            setErrors(validation.errors);
            return;
        }

        savePlan(payload, {
            onSuccess: () => setErrors({}),
        });
    };

    const labelClasses = "text-[9px] font-black text-muted-foreground/90 ml-1 block";

    return (
        <div className="flex items-center justify-center min-h-[50vh]">
            <div className="w-full max-w-lg">
                <div className="bg-card border border-border rounded-2xl overflow-hidden">
                    {/* Header */}
                    <div className="p-5 pb-4 border-b border-border/40">
                        <div className="flex items-center gap-3 mb-1">
                            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                                <Wallet className="w-4 h-4 text-emerald-500" />
                            </div>
                            <div>
                                <h3 className="text-[14px] font-black text-foreground">
                                    Create a budget plan
                                </h3>
                                <p className="text-[10px] font-medium text-muted-foreground mt-0.5">
                                    Set up your first plan to start tracking expenses
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Form */}
                    <div className="p-5 space-y-4">
                        {/* Plan Name */}
                        <div className="flex flex-col gap-1.5">
                            <label className={labelClasses}>Plan Name <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => {
                                    setName(e.target.value);
                                    if (errors.name) setErrors(prev => ({ ...prev, name: null }));
                                }}
                                className={cn(
                                    "w-full h-10 bg-background border border-border/50 px-3 rounded-xl text-[11px] font-bold text-foreground outline-none focus:ring-1 focus:ring-emerald-500/30 transition-all",
                                    errors.name && "border-red-500/50 ring-1 ring-red-500/20"
                                )}
                                placeholder="e.g. Monthly Budget"
                            />
                            {errors.name && <p className="text-[8px] font-black text-red-500 ml-1">{errors.name}</p>}
                        </div>

                        {/* Amount */}
                        <div className="flex flex-col gap-1.5">
                            <label className={labelClasses}>Amount (₹) <span className="text-red-500">*</span></label>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => {
                                    setAmount(e.target.value);
                                    if (errors.amount) setErrors(prev => ({ ...prev, amount: null }));
                                }}
                                className={cn(
                                    "w-full h-10 bg-background border border-border/50 px-3 rounded-xl text-[11px] font-bold text-foreground outline-none focus:ring-1 focus:ring-emerald-500/30 transition-all",
                                    errors.amount && "border-red-500/50 ring-1 ring-red-500/20"
                                )}
                                placeholder="0.00"
                            />
                            {errors.amount && <p className="text-[8px] font-black text-red-500 ml-1">{errors.amount}</p>}
                        </div>

                        {/* Cycle + Start Date row */}
                        <div className="grid grid-cols-2 gap-3">
                            {/* Cycle Type */}
                            <div className="flex flex-col gap-1.5">
                                <label className={labelClasses}>Cycle</label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="w-full h-10 px-3 bg-background border-border/50 rounded-xl text-[11px] font-bold flex items-center justify-between hover:bg-secondary/30"
                                        >
                                            <span className="capitalize">{budgetType}</span>
                                            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-48 p-1.5" align="start">
                                        {['monthly', 'weekly'].map((type) => (
                                            <button
                                                key={type}
                                                onClick={() => setBudgetType(type)}
                                                className={cn(
                                                    "w-full px-3 py-2 text-[10px] font-black uppercase tracking-widest text-left rounded-lg transition-colors",
                                                    budgetType === type ? "bg-emerald-500/10 text-emerald-600" : "hover:bg-secondary text-foreground/70"
                                                )}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </PopoverContent>
                                </Popover>
                            </div>

                            {/* Start Date */}
                            <div className="flex flex-col gap-1.5">
                                <label className={labelClasses}>Start Date</label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                "w-full justify-between text-left font-bold h-10 px-3 bg-background border-border/50 text-[11px] rounded-xl",
                                                errors.start_date && "border-red-500/50 ring-1 ring-red-500/20"
                                            )}
                                        >
                                            {format(startDate, "PPP")}
                                            <CalendarIcon className="ml-2 h-3.5 w-3.5 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            selected={startDate}
                                            onSelect={(val) => {
                                                if (val) setStartDate(val);
                                                if (errors.start_date) setErrors(prev => ({ ...prev, start_date: null }));
                                            }}
                                        />
                                    </PopoverContent>
                                </Popover>
                                {errors.start_date && <p className="text-[8px] font-black text-red-500 ml-1">{errors.start_date}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-5 pb-5">
                        <button
                            onClick={handleSave}
                            disabled={isSavingPlan}
                            className="w-full h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
                        >
                            {isSavingPlan ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                                <Save className="w-3.5 h-3.5" />
                            )}
                            Create Plan
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ExpenseSetupContent = () => {
    const { plans, isLoadingPlans } = useExpense();

    if (isLoadingPlans) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (plans.length === 0) {
        return <CreateFirstPlan />;
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="space-y-4">
                <div className="flex flex-col px-1">
                    <h3 className="text-[13px] font-black text-foreground leading-normal mb-1">Budget Framework</h3>
                    <p className="text-[10px] font-bold text-muted-foreground opacity-80">Define your spending limits and cycles</p>
                </div>
                <BudgetPlanCard />
            </div>

            {plans.length > 0 && <FixedExpenses />}
        </div>
    );
};

const ExpenseSetup = () => {
    return <ExpenseSetupContent />;
};

export default ExpenseSetup;
