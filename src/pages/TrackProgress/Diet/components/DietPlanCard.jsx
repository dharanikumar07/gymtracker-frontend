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
    UtensilsCrossed
} from 'lucide-react';
import { format } from "date-fns";
import { cn } from '../../../../lib/utils';
import { Calendar } from "../../../../components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../../../../components/ui/popover";
import { Button } from "../../../../components/ui/button";
import DeleteConfirmModal from "../../../../components/ui/DeleteConfirmModal";
import { useFormValidation } from '../../../../validation/ValidationWrapper';
import { useSavePlanMutation } from '../http/queries';
import { useDiet } from '../context/DietContext';

const DIET_GOALS = [
    { id: 'weight_loss', label: 'Weight Loss' },
    { id: 'muscle_gain', label: 'Weight Gain' },
    { id: 'maintenance', label: 'Maintenance' },
];

const DIET_PREFERENCES = [
    { id: 'veg', label: 'Vegetarian' },
    { id: 'non_veg', label: 'Non-Vegetarian' },
];

const PLAN_VALIDATION_SCHEMA = {
    name: { required: true, requiredMessage: 'Plan name is required' },
    goal: { required: true, requiredMessage: 'Goal is required' },
    startDate: { required: true, requiredMessage: 'Start date is required' },
};
const DietPlanCard = () => {
    const { 
        plans, 
        activePlan: selectedPlan, 
        setSelectedPlanUuid, 
        deletePlan, 
        isDeletingPlan,
        updatePlanStatus,
        isUpdatingStatus 
    } = useDiet();
    const [isCreating, setIsCreating] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const savePlanMutation = useSavePlanMutation();

    // ...

    // Edit form states
    const [name, setName] = useState(selectedPlan?.name || '');
    const [goal, setGoal] = useState(selectedPlan?.meta_data?.goal || 'maintenance');
    const [preference, setPreference] = useState(selectedPlan?.meta_data?.diet_preference || 'veg');
    const [isActive, setIsActive] = useState(selectedPlan?.is_active ?? true);
    const [startDate, setStartDate] = useState(selectedPlan?.start_date ? new Date(selectedPlan.start_date) : new Date());
    const [endDate, setEndDate] = useState(selectedPlan?.end_date ? new Date(selectedPlan.end_date) : null);

    // Create form states
    const [newName, setNewName] = useState('');
    const [newGoal, setNewGoal] = useState('maintenance');
    const [newPreference, setNewPreference] = useState('veg');
    const [newIsActive, setNewIsActive] = useState(true);
    const [newStartDate, setNewStartDate] = useState(new Date());
    const [newEndDate, setNewEndDate] = useState(null);

    // Validation
    const editValidation = useFormValidation(PLAN_VALIDATION_SCHEMA);
    const createValidation = useFormValidation(PLAN_VALIDATION_SCHEMA);

    useEffect(() => {
        if (selectedPlan) {
            setName(selectedPlan.name || '');
            setGoal(selectedPlan.meta_data?.goal || 'maintenance');
            setPreference(selectedPlan.meta_data?.diet_preference || 'veg');
            setIsActive(selectedPlan.is_active ?? true);
            setStartDate(selectedPlan.start_date ? new Date(selectedPlan.start_date) : new Date());
            setEndDate(selectedPlan.end_date ? new Date(selectedPlan.end_date) : null);
            editValidation.clearErrors();
        }
    }, [selectedPlan]);

    const handleSave = () => {
        const isValid = editValidation.validateAll({ name, goal, startDate: startDate ? 'valid' : '' });
        if (!isValid) return;
        savePlanMutation.mutate({
            uuid: selectedPlan?.uuid,
            name,
            meta_data: { goal, diet_preference: preference },
            is_active: isActive,
            type: 'diet',
            start_date: startDate ? format(startDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
            end_date: endDate ? format(endDate, "yyyy-MM-dd") : null
        });
    };

    const handleCreate = () => {
        const isValid = createValidation.validateAll({ name: newName, goal: newGoal, startDate: newStartDate ? 'valid' : '' });
        if (!isValid) return;
        savePlanMutation.mutate({
            uuid: null,
            name: newName,
            meta_data: { goal: newGoal, diet_preference: newPreference },
            is_active: newIsActive,
            type: 'diet',
            start_date: newStartDate ? format(newStartDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
            end_date: newEndDate ? format(newEndDate, "yyyy-MM-dd") : null
        }, {
            onSuccess: () => {
                setIsCreating(false);
                setNewName('');
            }
        });
    };

    const labelClasses = "text-[9px] sm:text-[8px] font-black uppercase text-muted-foreground tracking-widest ml-1 mb-1 block";

    const renderDatePicker = (date, setDate, placeholder) => (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                        "w-full justify-between text-left font-black h-9 sm:h-8 px-3 bg-secondary/30 border-border/50 text-[11px] sm:text-[10px] rounded-xl",
                        !date && "text-muted-foreground"
                    )}
                >
                    {date ? format(date, "PPP") : <span>{placeholder}</span>}
                    <CalendarIcon className="ml-2 h-3.5 w-3.5 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    selected={date}
                    onSelect={setDate}
                />
            </PopoverContent>
        </Popover>
    );

    const renderSelect = (options, value, onChange) => (
        <Popover>
            <PopoverTrigger asChild>
                <button className="w-full h-9 sm:h-8 px-3 bg-secondary/30 border border-border/50 rounded-xl flex items-center justify-between text-[10px] font-black text-primary uppercase">
                    {options.find(t => t.id === value)?.label || value}
                    <ChevronDown className="h-3.5 w-3.5 opacity-50" />
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-1" align="start">
                {options.map(t => (
                    <button
                        key={t.id}
                        onClick={() => onChange(t.id)}
                        className={cn(
                            "w-full flex items-center justify-between px-3 py-2 text-[11px] font-bold rounded-lg hover:bg-secondary transition-colors text-left",
                            value === t.id ? "text-primary bg-primary/5" : "text-foreground"
                        )}
                    >
                        <span>{t.label}</span>
                        {value === t.id ? <Check className="w-3 h-3" /> : null}
                    </button>
                ))}
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

    return (
        <div className="bg-card border border-border rounded-2xl shadow-sm relative overflow-hidden">
            <div className={cn(
                "flex transition-transform duration-500 ease-in-out",
                isCreating ? "-translate-x-1/2 w-[200%]" : "translate-x-0 w-[200%]"
            )}>
                {/* ─── Section 1: Edit/Select Mode ─── */}
                <div className="w-1/2 p-3 sm:p-4 flex flex-col gap-4 relative z-10">
                    <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="relative w-full sm:max-w-[260px]">
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="h-9 sm:h-8 w-full px-3 bg-secondary/50 border border-border rounded-xl flex items-center gap-2 hover:bg-secondary transition-all text-[11px] sm:text-[10px] font-black uppercase tracking-tight"
                            >
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                    <UtensilsCrossed className="w-3.5 h-3.5 text-primary shrink-0" />
                                    <span className="truncate">{selectedPlan?.name || 'Select Plan'}</span>
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

                        <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3">
                            {renderToggle(isActive, setIsActive, (newVal) => {
                                if (selectedPlan?.uuid) {
                                    updatePlanStatus({ 
                                        plan_uuid: selectedPlan.uuid, 
                                        type: 'diet',
                                        is_active: newVal
                                    });
                                }
                            })}

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
                                onClick={handleSave}
                                variant="green"
                                size="compact"
                                className="gap-1.5 rounded-xl h-8 px-3"
                            >
                                <Save className="w-3.5 h-3.5" />
                                <span>Save</span>
                            </Button>

                            <Button
                                onClick={() => setIsCreating(true)}
                                size="compact"
                                className="gap-1.5 rounded-xl h-8 px-3"
                            >
                                <span>Add New Plan</span>
                            </Button>
                        </div>
                    </div>

                    <div className="bg-primary/5 p-3 rounded-xl border border-primary/10">
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4 items-start">
                            <div className="sm:col-span-3">
                                <label className={labelClasses}>Plan Name <span className="text-red-500">*</span></label>
                                <input
                                    type="text" value={name} onChange={(e) => { setName(e.target.value); editValidation.clearFieldError('name'); }}
                                    className={cn(
                                        "w-full h-9 sm:h-8 bg-background border px-3 rounded-xl text-[11px] sm:text-[10px] font-black text-foreground outline-none focus:ring-1 focus:ring-primary/30",
                                        editValidation.getError('name') ? "border-red-500 bg-red-500/5" : "border-border"
                                    )}
                                />
                                <div className="h-4 mt-0.5 ml-1">
                                    {editValidation.getError('name') && <span className="text-[8px] text-red-500 font-bold">{editValidation.getError('name')}</span>}
                                </div>
                            </div>

                            <div className="sm:col-span-3">
                                <label className={labelClasses}>Goal</label>
                                <div className="w-full h-9 sm:h-8 px-3 bg-secondary/10 border border-border/30 rounded-xl flex items-center text-[10px] font-black text-foreground/50 uppercase italic">
                                    {DIET_GOALS.find(t => t.id === goal)?.label || goal}
                                </div>
                            </div>

                            <div className="sm:col-span-6 grid grid-cols-3 gap-3">
                                <div className="col-span-1">
                                    <label className={labelClasses}>Pref</label>
                                    {renderSelect(DIET_PREFERENCES, preference, setPreference)}
                                </div>
                                <div className="col-span-1">
                                    <label className={labelClasses}>Start <span className="text-red-500">*</span></label>
                                    <div className={cn(editValidation.getError('startDate') && "ring-1 ring-red-500 rounded-xl")}>
                                        {renderDatePicker(startDate, (val) => { setStartDate(val); editValidation.clearFieldError('startDate'); }, "Start Date")}
                                    </div>
                                </div>
                                <div className="col-span-1">
                                    <label className={labelClasses}>End</label>
                                    {renderDatePicker(endDate, setEndDate, "End Date")}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ─── Section 2: Create Mode ─── */}
                <div className="w-1/2 p-3 sm:p-4 flex flex-col gap-4 relative z-10">
                    <div className="flex items-center justify-between">
                        <button onClick={() => setIsCreating(false)} className="flex items-center gap-1.5 text-[10px] sm:text-[9px] font-black uppercase text-muted-foreground hover:text-primary transition-colors">
                            <ArrowLeft className="w-3.5 h-3.5" />
                            <span>Back</span>
                        </button>

                        <div className="flex items-center gap-3">
                            {renderToggle(newIsActive, setNewIsActive)}
                            <Button
                                onClick={handleCreate}
                                className="gap-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 h-8"
                            >
                                <Zap className="w-3.5 h-3.5" />
                                <span>Create</span>
                            </Button>
                        </div>
                    </div>

                    <div className="bg-primary/5 p-3 rounded-xl border border-primary/10">
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4 items-start">
                            <div className="sm:col-span-3">
                                <label className={cn(labelClasses, "text-foreground")}>Plan Name <span className="text-red-500">*</span></label>
                                <input
                                    type="text" placeholder="e.g. Summer Shred" value={newName} onChange={(e) => { setNewName(e.target.value); createValidation.clearFieldError('name'); }}
                                    className={cn(
                                        "w-full h-9 sm:h-8 bg-card border px-3 rounded-xl text-[11px] font-black text-foreground outline-none focus:ring-1 focus:ring-primary/30",
                                        createValidation.getError('name') ? "border-red-500 bg-red-500/5" : "border-primary/20"
                                    )}
                                />
                                <div className="h-4 mt-0.5 ml-1">
                                    {createValidation.getError('name') && <span className="text-[8px] text-red-500 font-bold">{createValidation.getError('name')}</span>}
                                </div>
                            </div>

                            <div className="sm:col-span-3">
                                <label className={cn(labelClasses, "text-foreground")}>Goal <span className="text-red-500">*</span></label>
                                <div className={cn(createValidation.getError('goal') && "ring-1 ring-red-500 rounded-xl")}>
                                    {renderSelect(DIET_GOALS, newGoal, (val) => { setNewGoal(val); createValidation.clearFieldError('goal'); })}
                                </div>
                                <div className="h-4 mt-0.5 ml-1">
                                    {createValidation.getError('goal') && <span className="text-[8px] text-red-500 font-bold">{createValidation.getError('goal')}</span>}
                                </div>
                            </div>

                            <div className="sm:col-span-6 grid grid-cols-3 gap-3">
                                <div className="col-span-1">
                                    <label className={labelClasses}>Pref</label>
                                    {renderSelect(DIET_PREFERENCES, newPreference, setNewPreference)}
                                </div>
                                <div className="col-span-1">
                                    <label className={cn(labelClasses, "text-foreground")}>Start <span className="text-red-500">*</span></label>
                                    <div className={cn(createValidation.getError('startDate') && "ring-1 ring-red-500 rounded-xl")}>
                                        {renderDatePicker(newStartDate, (val) => { setNewStartDate(val); createValidation.clearFieldError('startDate'); }, "Start Date")}
                                    </div>
                                </div>
                                <div className="col-span-1">
                                    <label className={cn(labelClasses, "text-foreground")}>End Date</label>
                                    {renderDatePicker(newEndDate, setNewEndDate, "End Date")}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {showDeleteConfirm && (
                <DeleteConfirmModal
                    title="Delete Diet Plan?"
                    message={`Are you sure you want to delete "${selectedPlan?.name}"? This will permanently remove the plan and all its routine data.`}
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

export default DietPlanCard;
