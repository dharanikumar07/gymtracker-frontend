import React, { useState, useEffect } from 'react';
import {
    ChevronDown,
    Check,
    Zap,
    ArrowLeft,
    CalendarIcon,
    Trash2,
    Wallet,
    PlusCircle,
    Plus,
    Target,
    Save,
    Settings2,
    Info
} from 'lucide-react';
import { format } from "date-fns";
import { cn } from '../../../../lib/utils';
import { Calendar } from "../../../../components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../../../../components/ui/popover";
import { Button } from "../../../../components/ui/button";
import DeleteConfirmModal from "../../../../components/ui/DeleteConfirmModal";
import { useExpense } from '../context/ExpenseContext';
import { validateBudgetPlan } from '../validation/validation';

const BudgetPlanCard = () => {
    const { 
        plans, 
        selectedPlan, 
        setSelectedPlanUuid, 
        isCreatingPlan: isCreating,
        setIsCreatingPlan: setIsCreating,
        savePlan,
        isSavingPlan,
        deletePlan, 
        isDeletingPlan,
        updatePlanStatus,
        isUpdatingStatus 
    } = useExpense();
    
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isCyclePopoverOpenCreate, setIsCyclePopoverOpenCreate] = useState(false);

    // Form states
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [budgetType, setBudgetType] = useState('monthly');
    const [isActive, setIsActive] = useState(true);
    const [startDate, setStartDate] = useState(new Date());
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (selectedPlan && !isCreating) {
            setName(selectedPlan.name || '');
            setAmount(selectedPlan.meta_data?.amount || '');
            setBudgetType(selectedPlan.meta_data?.budget_type || 'monthly');
            setIsActive(selectedPlan.is_active ?? true);
            setStartDate(selectedPlan.start_date ? new Date(selectedPlan.start_date) : new Date());
            setErrors({});
        }
    }, [selectedPlan, isCreating]);

    const handleAction = () => {
        const payload = {
            uuid: isCreating ? null : selectedPlan?.uuid,
            name,
            meta_data: { 
                amount: parseFloat(amount) || 0,
                budget_type: budgetType 
            },
            is_active: isActive,
            type: 'budget',
            start_date: format(startDate, "yyyy-MM-dd")
        };
        
        const validation = validateBudgetPlan(payload);
        if (!validation.isValid) {
            setErrors(validation.errors);
            return;
        }

        savePlan(payload, {
            onSuccess: () => {
                if (isCreating) {
                    setIsCreating(false);
                }
                setErrors({});
            }
        });
    };

    const renderDatePicker = (date, setDate, placeholder, errorKey) => (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                        "w-full justify-between text-left font-bold h-10 px-3 bg-background border-border/50 text-[11px] rounded-xl",
                        !date && "text-muted-foreground",
                        errors[errorKey] && "border-red-500/50 ring-1 ring-red-500/20"
                    )}
                >
                    {date ? format(date, "PPP") : <span>{placeholder}</span>}
                    <CalendarIcon className="ml-2 h-3.5 w-3.5 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    selected={date}
                    onSelect={(val) => {
                        setDate(val);
                        if (errors[errorKey]) setErrors(prev => ({ ...prev, [errorKey]: null }));
                    }}
                />
            </PopoverContent>
        </Popover>
    );

    const renderToggle = (active, setActive, onToggleAPI = null) => (
        <div className="flex items-center gap-2">
            <span className="text-[9px] font-black uppercase text-muted-foreground/90 tracking-widest min-w-[36px] text-right">
                {active ? 'Active' : 'Paused'}
            </span>
            <button
                onClick={() => {
                    setActive(!active);
                    if (onToggleAPI) onToggleAPI(!active);
                }}
                disabled={isUpdatingStatus}
                className={cn(
                    "relative inline-flex h-4.5 w-8 shrink-0 cursor-pointer items-center rounded-full transition-colors",
                    active ? "bg-emerald-500" : "bg-muted",
                    isUpdatingStatus && "opacity-50 cursor-not-allowed"
                )}
            >
                <span className={cn(
                    "pointer-events-none block h-3.5 w-3.5 rounded-full bg-white shadow-lg transition-transform",
                    active ? "translate-x-4" : "translate-x-0.5"
                )} />
            </button>
        </div>
    );

    const labelClasses = "text-[9px] font-black uppercase text-muted-foreground/90 tracking-widest ml-1 block";

    return (
        <div className="relative w-full overflow-hidden">
            {/* ─── Card 1: Edit/Select Mode ─── */}
            <div className={cn(
                "w-full transition-all duration-500 ease-in-out bg-card border border-border rounded-2xl shadow-sm",
                isCreating 
                    ? "-translate-x-full opacity-0 pointer-events-none absolute top-0 left-0 invisible" 
                    : "translate-x-0 opacity-100 relative visible"
            )}>
                <div className="p-3 sm:p-5 flex flex-col gap-5">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                                <Target className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div className="relative min-w-[200px]">
                                <button
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className="h-10 w-full px-3 bg-secondary/30 border border-border/50 rounded-xl flex items-center justify-between hover:bg-secondary/50 transition-all text-[12px] font-black uppercase tracking-tight"
                                >
                                    <div className="flex items-center gap-2 truncate pr-2">
                                        <Wallet className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                        <span className="truncate">{selectedPlan?.name || 'Select Plan'}</span>
                                    </div>
                                    <ChevronDown className={cn("w-3.5 h-3.5 text-muted-foreground transition-transform shrink-0", isDropdownOpen ? "rotate-180" : "")} />
                                </button>

                                {isDropdownOpen && (
                                    <div className="absolute top-full left-0 mt-2 w-full bg-card border border-border rounded-xl shadow-2xl py-1.5 z-[100] animate-in fade-in zoom-in-95 duration-200">
                                        {plans.map(p => (
                                            <button
                                                key={p.uuid}
                                                onClick={() => { setIsDropdownOpen(false); setSelectedPlanUuid(p.uuid); }}
                                                className={cn(
                                                    "w-full flex items-center justify-between px-3 py-2 text-[11px] font-bold hover:bg-secondary transition-colors text-left",
                                                    p.uuid === selectedPlan?.uuid ? "text-emerald-600 bg-emerald-500/5" : "text-foreground"
                                                )}
                                            >
                                                <span className="truncate">{p.name}</span>
                                                {p.uuid === selectedPlan?.uuid && <Check className="w-3.5 h-3.5" />}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-3 flex-1">
                            <div className="flex-1 sm:flex-initial">
                                {renderToggle(isActive, setIsActive, (newVal) => {
                                    if (selectedPlan?.uuid) {
                                        updatePlanStatus({ 
                                            plan_uuid: selectedPlan.uuid, 
                                            type: 'budget',
                                            is_active: newVal
                                        });
                                    }
                                })}
                            </div>

                            <div className="flex items-center gap-2">
                                {selectedPlan && (
                                    <button
                                        onClick={() => setShowDeleteConfirm(true)}
                                        disabled={isDeletingPlan}
                                        className="text-red-500 hover:text-red-500/60 transition-all p-1.5"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}

                                <Button
                                    onClick={handleAction}
                                    disabled={isSavingPlan}
                                    variant="green"
                                    size="compact"
                                    className="gap-2 rounded-xl h-8 px-2.5 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/10 w-fit"
                                >
                                    {isSavingPlan ? <Zap className="w-3.5 h-3.5 animate-pulse" /> : <Save className="w-3.5 h-3.5" />}
                                    <span>Save</span>
                                </Button>

                                <Button
                                    onClick={() => {
                                        setIsCreating(true);
                                        setName('');
                                        setAmount('');
                                        setBudgetType('monthly');
                                        setStartDate(new Date());
                                        setErrors({});
                                    }}
                                    size="compact"
                                    className="gap-2 rounded-xl h-8 px-3 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/10 bg-emerald-600 hover:bg-emerald-700 text-white w-fit"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span className="hidden sm:inline">Add New</span>
                                    <span className="sm:hidden">New</span>
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-secondary/10 p-4 rounded-2xl border border-border/50">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                            <div className="flex flex-col gap-1.5">
                                <label className={labelClasses}>Plan Name <span className="text-red-500">*</span></label>
                                <input
                                    type="text" value={name} 
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
                                {errors.name && <p className="text-[8px] font-black text-red-500 mt-1 ml-1 uppercase tracking-tighter">{errors.name}</p>}
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className={labelClasses}>Amount (₹) <span className="text-red-500">*</span></label>
                                <input
                                    type="number" value={amount} 
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
                                {errors.amount && <p className="text-[8px] font-black text-red-500 mt-1 ml-1 uppercase tracking-tighter">{errors.amount}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex flex-col gap-1.5">
                                    <label className={labelClasses}>Cycle Type</label>
                                    <div className="w-full h-10 px-3 bg-emerald-500/5 border border-emerald-500/30 rounded-xl text-[11px] font-bold text-emerald-600 flex items-center gap-2">
                                        <Settings2 className="w-3.5 h-3.5" />
                                        <span className="capitalize">{budgetType} Cycle</span>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className={labelClasses}>Start Date</label>
                                    <div className="w-full h-10 bg-secondary/30 border border-border/50 px-3 rounded-xl text-[11px] font-bold text-muted-foreground flex items-center gap-2 cursor-not-allowed">
                                        <CalendarIcon className="w-3.5 h-3.5 opacity-50" />
                                        <span>{format(startDate, "PPP")}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── Card 2: Create Mode ─── */}
            <div className={cn(
                "w-full transition-all duration-500 ease-in-out bg-card border border-border rounded-2xl shadow-sm",
                !isCreating 
                    ? "translate-x-full opacity-0 pointer-events-none absolute top-0 left-0 invisible" 
                    : "translate-x-0 opacity-100 relative visible"
            )}>
                <div className="p-3 sm:p-5 flex flex-col gap-5">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <button onClick={() => { setIsCreating(false); setErrors({}); }} className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-emerald-600 transition-colors w-fit">
                            <ArrowLeft className="w-4 h-4" />
                            <span>Discard Changes</span>
                        </button>

                        <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                            <div className="flex-1 sm:flex-none">
                                {renderToggle(isActive, setIsActive)}
                            </div>
                            <Button
                                onClick={handleAction}
                                disabled={isSavingPlan}
                                className="gap-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/10 h-8 px-4 bg-emerald-600 hover:bg-emerald-700 text-white flex-1 sm:flex-none w-fit"
                            >
                                {isSavingPlan ? <Zap className="w-3.5 h-3.5 animate-pulse" /> : <Save className="w-4 h-4" />}
                                <span>Save Plan</span>
                            </Button>
                        </div>
                    </div>

                    <div className="bg-secondary/10 p-4 rounded-2xl border border-border/50">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                            <div className="flex flex-col gap-1.5">
                                <label className={labelClasses}>Plan Name <span className="text-red-500">*</span></label>
                                <input
                                    type="text" value={name} 
                                    onChange={(e) => {
                                        setName(e.target.value);
                                        if (errors.name) setErrors(prev => ({ ...prev, name: null }));
                                    }}
                                    className={cn(
                                        "w-full h-10 bg-background border border-border/50 px-3 rounded-xl text-[11px] font-bold text-foreground outline-none focus:ring-1 focus:ring-emerald-500/30 transition-all",
                                        errors.name && "border-red-500/50 ring-1 ring-red-500/20"
                                    )}
                                    placeholder="e.g. May Budget"
                                />
                                {errors.name && <p className="text-[8px] font-black text-red-500 mt-1 ml-1 uppercase tracking-tighter">{errors.name}</p>}
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className={labelClasses}>Amount (₹) <span className="text-red-500">*</span></label>
                                <input
                                    type="number" value={amount} 
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
                                {errors.amount && <p className="text-[8px] font-black text-red-500 mt-1 ml-1 uppercase tracking-tighter">{errors.amount}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex flex-col gap-1.5">
                                    <label className={labelClasses}>Cycle Type</label>
                                    <Popover open={isCyclePopoverOpenCreate} onOpenChange={setIsCyclePopoverOpenCreate}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className="w-full h-10 px-3 bg-background border-border/50 rounded-xl text-[11px] font-bold flex items-center justify-between hover:bg-secondary/30"
                                            >
                                                <span className="capitalize">{budgetType} Cycle</span>
                                                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-48 p-1.5" align="start">
                                            {['monthly', 'weekly'].map((type) => (
                                                <button
                                                    key={type}
                                                    onClick={() => {
                                                        setBudgetType(type);
                                                        setIsCyclePopoverOpenCreate(false);
                                                    }}
                                                    className={cn(
                                                        "w-full px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-left rounded-lg transition-colors",
                                                        budgetType === type ? "bg-emerald-500/10 text-emerald-600" : "hover:bg-secondary text-foreground/70"
                                                    )}
                                                >
                                                    {type} Cycle
                                                </button>
                                            ))}
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className={labelClasses}>Start <span className="text-red-500">*</span></label>
                                    {renderDatePicker(startDate, setStartDate, "Start Date", 'start_date')}
                                    {errors.start_date && <p className="text-[8px] font-black text-red-500 mt-1 ml-1 uppercase tracking-tighter">{errors.start_date}</p>}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Information Card for Plan Switching */}
                    {isActive && plans.some(p => p.is_active) && (
                        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-3 flex gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                                <Info className="w-4 h-4 text-emerald-600" />
                            </div>
                            <div className="flex flex-col gap-0.5">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-700">Budget Transition Rule</h4>
                                <p className="text-[10px] font-bold text-emerald-600/80 leading-relaxed">
                                    Activating this plan will terminate your current active cycle on <span className="text-emerald-700 underline underline-offset-2">
                                        {startDate ? format(new Date(new Date(startDate).setDate(startDate.getDate() - 1)), "PPP") : 'the previous day'}
                                    </span>. 
                                    Expense history will remain attached to their respective plans.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {showDeleteConfirm && (
                <DeleteConfirmModal
                    title="Delete Budget Plan?"
                    message={`Are you sure you want to delete "${selectedPlan?.name}"? This will permanently remove the plan and all its expense data.`}
                    onCancel={() => setShowDeleteConfirm(false)}
                    onConfirm={() => {
                        deletePlan(selectedPlan.uuid);
                        setShowDeleteConfirm(false);
                    }}
                />
            )}
        </div>
    );
};

export default BudgetPlanCard;