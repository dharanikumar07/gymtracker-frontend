import React, { useState, useEffect } from 'react';
import {
    Layout,
    Save,
    ChevronDown,
    Check,
    Zap,
    ArrowLeft,
    CalendarIcon,
    Trash2,
    Wallet,
    PlusCircle,
    Plus
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

    // Form states
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(null);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (selectedPlan && !isCreating) {
            setName(selectedPlan.name || '');
            setAmount(selectedPlan.meta_data?.amount || '');
            setIsActive(selectedPlan.is_active ?? true);
            setStartDate(selectedPlan.start_date ? new Date(selectedPlan.start_date) : new Date());
            setEndDate(selectedPlan.end_date ? new Date(selectedPlan.end_date) : null);
            setErrors({});
        }
    }, [selectedPlan, isCreating]);

    const handleAction = () => {
        const payload = {
            uuid: isCreating ? null : selectedPlan?.uuid,
            name,
            meta_data: { amount: parseFloat(amount) || 0 },
            is_active: isActive,
            type: 'budget',
            start_date: format(startDate, "yyyy-MM-dd"),
            end_date: endDate ? format(endDate, "yyyy-MM-dd") : null
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
                        "w-full justify-between text-left font-black h-9 sm:h-8 px-3 bg-secondary/30 border-border/50 text-[11px] sm:text-[10px] rounded-xl",
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
            <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest min-w-[36px] text-right">
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
                    active ? "bg-green-500" : "bg-muted",
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

    const labelClasses = "text-[9px] font-black uppercase text-muted-foreground tracking-widest ml-1 mb-1 block";

    return (
        <div className="bg-card border border-border rounded-2xl shadow-sm relative overflow-hidden">
            <div className={cn(
                "flex transition-transform duration-500 ease-in-out",
                isCreating ? "-translate-x-1/2 w-[200%]" : "translate-x-0 w-[200%]"
            )}>
                {/* ─── Section 1: Select/Edit Mode ─── */}
                <div className="w-1/2 p-3 sm:p-4 flex flex-col gap-4 relative z-10">
                    {plans.length > 0 ? (
                        <>
                            <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
                                <div className="relative w-full sm:max-w-[260px]">
                                    <button
                                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                        className="h-9 sm:h-8 w-full px-3 bg-secondary/50 border border-border rounded-xl flex items-center gap-2 hover:bg-secondary transition-all text-[11px] sm:text-[10px] font-black uppercase tracking-tight"
                                    >
                                        <div className="flex items-center gap-2 min-w-0 flex-1">
                                            <Wallet className="w-3.5 h-3.5 text-primary shrink-0" />
                                            <span className="truncate">{selectedPlan?.name || 'Select Budget Plan'}</span>
                                        </div>
                                        <ChevronDown className={cn("w-3.5 h-3.5 text-muted-foreground transition-transform shrink-0", isDropdownOpen ? "rotate-180" : "")} />
                                    </button>

                                    {isDropdownOpen ? (
                                        <div className="absolute top-full left-0 mt-2 w-full sm:w-52 bg-card border border-border rounded-xl shadow-2xl py-1.5 z-[100] animate-in fade-in zoom-in-95 duration-200">
                                            {plans.map(p => (
                                                <button
                                                    key={p.uuid}
                                                    onClick={() => { setIsDropdownOpen(false); setSelectedPlanUuid(p.uuid); }}
                                                    className={cn(
                                                        "w-full flex items-center justify-between px-3 py-2 sm:py-1.5 text-[11px] sm:text-[10px] font-bold hover:bg-secondary transition-colors text-left",
                                                        p.uuid === selectedPlan?.uuid ? "text-primary bg-primary/5" : "text-foreground"
                                                    )}
                                                >
                                                    <span className="truncate">{p.name}</span>
                                                    {p.uuid === selectedPlan?.uuid ? <Check className="w-3 h-3" /> : null}
                                                </button>
                                            ))}
                                        </div>
                                    ) : null}
                                </div>

                        <div className="flex items-center justify-between gap-3">
                            <div className="flex-1">
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

                            <div className="flex items-center gap-1 sm:gap-3 shrink-0">
                                {selectedPlan && (
                                    <button
                                        onClick={() => setShowDeleteConfirm(true)}
                                        disabled={isDeletingPlan}
                                        className="text-red-500 hover:text-red-500/60 transition-all p-1.5"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                )}

                                <Button
                                    onClick={handleAction}
                                    disabled={isSavingPlan}
                                    variant="green"
                                    size="compact"
                                    className="gap-1 rounded-xl h-8 px-2.5 sm:px-3 text-[9px] sm:text-[10px] shadow-lg shadow-emerald-500/10"
                                >
                                    <Save className="w-3.5 h-3.5" />
                                    <span>Save</span>
                                </Button>

                                <Button
                                    onClick={() => {
                                        setIsCreating(true);
                                        setName('');
                                        setAmount('');
                                        setStartDate(new Date());
                                        setEndDate(null);
                                        setErrors({});
                                    }}
                                    size="compact"
                                    className="gap-1 rounded-xl h-8 px-2.5 sm:px-3 text-[9px] sm:text-[10px] shadow-lg shadow-primary/10"
                                >
                                    <Plus className="w-3.5 h-3.5 sm:hidden" />
                                    <span className="hidden sm:inline">Add New Plan</span>
                                    <span className="sm:hidden">New</span>
                                </Button>
                            </div>
                        </div>
                            </div>

                            <div className="bg-primary/5 p-3 rounded-xl border border-primary/10">
                                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4 items-start">
                                    <div className="sm:col-span-4">
                                        <label className={labelClasses}>Budget Name <span className="text-red-500">*</span></label>
                                        <input
                                            type="text" value={name} 
                                            onChange={(e) => {
                                                setName(e.target.value);
                                                if (errors.name) setErrors(prev => ({ ...prev, name: null }));
                                            }}
                                            className={cn(
                                                "w-full h-9 sm:h-8 bg-background border border-border px-3 rounded-xl text-[11px] sm:text-[10px] font-black text-foreground outline-none focus:ring-1 focus:ring-primary/30",
                                                errors.name && "border-red-500/50 ring-1 ring-red-500/20"
                                            )}
                                            placeholder="e.g. Monthly Budget"
                                        />
                                        {errors.name && <p className="text-[9px] font-black text-red-500 mt-1 ml-1 uppercase tracking-tighter">{errors.name}</p>}
                                    </div>

                                    <div className="sm:col-span-3">
                                        <label className={labelClasses}>Budget Amount (₹) <span className="text-red-500">*</span></label>
                                        <input
                                            type="number" value={amount} 
                                            onChange={(e) => {
                                                setAmount(e.target.value);
                                                if (errors.amount) setErrors(prev => ({ ...prev, amount: null }));
                                            }}
                                            className={cn(
                                                "w-full h-9 sm:h-8 bg-background border border-border px-3 rounded-xl text-[11px] sm:text-[10px] font-black text-foreground outline-none focus:ring-1 focus:ring-primary/30",
                                                errors.amount && "border-red-500/50 ring-1 ring-red-500/20"
                                            )}
                                            placeholder="0.00"
                                        />
                                        {errors.amount && <p className="text-[9px] font-black text-red-500 mt-1 ml-1 uppercase tracking-tighter">{errors.amount}</p>}
                                    </div>

                                    <div className="sm:col-span-5 grid grid-cols-2 gap-3">
                                        <div className="col-span-1">
                                            <label className={labelClasses}>Start <span className="text-red-500">*</span></label>
                                            {renderDatePicker(startDate, setStartDate, "Start Date", 'start_date')}
                                            {errors.start_date && <p className="text-[9px] font-black text-red-500 mt-1 ml-1 uppercase tracking-tighter">{errors.start_date}</p>}
                                        </div>
                                        <div className="col-span-1">
                                            <label className={labelClasses}>End <span className="text-red-500">*</span></label>
                                            {renderDatePicker(endDate, setEndDate, "End Date", 'end_date')}
                                            {errors.end_date && <p className="text-[9px] font-black text-red-500 mt-1 ml-1 uppercase tracking-tighter">{errors.end_date}</p>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-4 sm:py-2 text-center animate-in fade-in duration-500">
                            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mb-4 sm:mb-2">
                                <div className="w-12 h-12 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 shadow-inner">
                                    <PlusCircle className="w-6 h-6 sm:w-5 sm:h-5 text-primary" />
                                </div>
                                <div className="text-center sm:text-left max-w-[320px]">
                                    <h3 className="text-sm sm:text-[11px] font-black text-foreground uppercase italic leading-none mb-1 tracking-tight">Financial Blueprint Needed</h3>
                                    <p className="text-[10px] sm:text-[9px] text-muted-foreground font-bold uppercase tracking-wider leading-relaxed">
                                        Establish a plan to start tracking your finances and potential.
                                    </p>
                                </div>
                            </div>
                            <Button 
                                onClick={() => {
                                    setIsCreating(true);
                                    setName('');
                                    setAmount('');
                                    setStartDate(new Date());
                                    setEndDate(null);
                                    setErrors({});
                                }}
                                size="compact" 
                                className="rounded-xl gap-2 h-9 sm:h-8 px-6 shadow-xl shadow-primary/20 hover:scale-105 transition-all"
                            >
                                <PlusCircle className="w-4 h-4 sm:w-3.5 h-3.5" />
                                <span className="text-[10px] sm:text-[9px]">Create Your First Budget Plan</span>
                            </Button>
                        </div>
                    )}
                </div>

                {/* ─── Section 2: Create Mode ─── */}
                <div className="w-1/2 p-3 sm:p-4 flex flex-col gap-4 relative z-10">
                    <div className="flex items-center justify-between">
                        <button onClick={() => { setIsCreating(false); setErrors({}); }} className="flex items-center gap-1.5 text-[10px] sm:text-[9px] font-black uppercase text-muted-foreground hover:text-primary transition-colors">
                            <ArrowLeft className="w-3.5 h-3.5" />
                            <span>Back</span>
                        </button>

                        <div className="flex items-center gap-3">
                            {renderToggle(isActive, setIsActive)}
                            <Button
                                onClick={handleAction}
                                disabled={isSavingPlan}
                                className="gap-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 h-8"
                            >
                                <Zap className="w-3.5 h-3.5" />
                                <span>Create</span>
                            </Button>
                        </div>
                    </div>

                    <div className="bg-primary/5 p-3 rounded-xl border border-primary/10">
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4 items-start">
                            <div className="sm:col-span-4">
                                <label className={labelClasses}>Budget Name <span className="text-red-500">*</span></label>
                                <input
                                    type="text" value={name} 
                                    onChange={(e) => {
                                        setName(e.target.value);
                                        if (errors.name) setErrors(prev => ({ ...prev, name: null }));
                                    }}
                                    className={cn(
                                        "w-full h-9 sm:h-8 bg-card border border-primary/20 px-3 rounded-xl text-[11px] font-black text-foreground outline-none focus:ring-1 focus:ring-primary/30",
                                        errors.name && "border-red-500/50 ring-1 ring-red-500/20"
                                    )}
                                    placeholder="e.g. May Budget"
                                />
                                {errors.name && <p className="text-[9px] font-black text-red-500 mt-1 ml-1 uppercase tracking-tighter">{errors.name}</p>}
                            </div>

                            <div className="sm:col-span-3">
                                <label className={labelClasses}>Amount (₹) <span className="text-red-500">*</span></label>
                                <input
                                    type="number" value={amount} 
                                    onChange={(e) => {
                                        setAmount(e.target.value);
                                        if (errors.amount) setErrors(prev => ({ ...prev, amount: null }));
                                    }}
                                    className={cn(
                                        "w-full h-9 sm:h-8 bg-card border border-primary/20 px-3 rounded-xl text-[11px] font-black text-foreground outline-none focus:ring-1 focus:ring-primary/30",
                                        errors.amount && "border-red-500/50 ring-1 ring-red-500/20"
                                    )}
                                    placeholder="5000"
                                />
                                {errors.amount && <p className="text-[9px] font-black text-red-500 mt-1 ml-1 uppercase tracking-tighter">{errors.amount}</p>}
                            </div>

                            <div className="sm:col-span-5 grid grid-cols-2 gap-3">
                                <div className="col-span-1">
                                    <label className={labelClasses}>Start <span className="text-red-500">*</span></label>
                                    {renderDatePicker(startDate, setStartDate, "Start Date", 'start_date')}
                                    {errors.start_date && <p className="text-[9px] font-black text-red-500 mt-1 ml-1 uppercase tracking-tighter">{errors.start_date}</p>}
                                </div>
                                <div className="col-span-1">
                                    <label className={labelClasses}>End <span className="text-red-500">*</span></label>
                                    {renderDatePicker(endDate, setEndDate, "End Date", 'end_date')}
                                    {errors.end_date && <p className="text-[9px] font-black text-red-500 mt-1 ml-1 uppercase tracking-tighter">{errors.end_date}</p>}
                                </div>
                            </div>
                        </div>
                    </div>
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
