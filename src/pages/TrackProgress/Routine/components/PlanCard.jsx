import React, { useState, useEffect } from 'react';
import {
    Layout,
    Save,
    ChevronDown,
    Check,
    Zap,
    ArrowLeft,
    CalendarIcon,
    Trash2
} from 'lucide-react';
import { format } from "date-fns";
import { cn } from '../../../../lib/utils';
import { Calendar } from "../../../../components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../../../../components/ui/popover";
import { Button } from "../../../../components/ui/button";
import { useFormValidation } from '../../../../validation/ValidationWrapper';

const TRAINING_TYPES = [
    { id: 'strength_training', label: 'Strength' },
    { id: 'cardio_training', label: 'Cardio' },
    { id: 'flexibility_yoga', label: 'Yoga' },
    { id: 'balance_core', label: 'Balanced & Core' },
    { id: 'calisthenics', label: 'Calisthenics' },
];

const PLAN_VALIDATION_SCHEMA = {
    name: { required: true, requiredMessage: 'Plan name is required' },
    paType: { required: true, requiredMessage: 'Training type is required' },
    startDate: { required: true, requiredMessage: 'Start date is required' },
};

const PlanCard = ({ plans, selectedPlan, onSave, onSelect, onDelete }) => {
    const [isCreating, setIsCreating] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Edit form states
    const [name, setName] = useState(selectedPlan?.name || '');
    const [paType, setPaType] = useState(selectedPlan?.meta_data?.physical_activity_type || 'strength_training');
    const [isActive, setIsActive] = useState(selectedPlan?.is_active ?? true);
    const [startDate, setStartDate] = useState(selectedPlan?.start_date ? new Date(selectedPlan.start_date) : new Date());
    const [endDate, setEndDate] = useState(selectedPlan?.end_date ? new Date(selectedPlan.end_date) : null);

    // Create form states
    const [newName, setNewName] = useState('');
    const [newPaType, setNewPaType] = useState('strength_training');
    const [newIsActive, setNewIsActive] = useState(true);
    const [newStartDate, setNewStartDate] = useState(new Date());
    const [newEndDate, setNewEndDate] = useState(null);

    // Validation
    const editValidation = useFormValidation(PLAN_VALIDATION_SCHEMA);
    const createValidation = useFormValidation(PLAN_VALIDATION_SCHEMA);

    // Sync edit form when selectedPlan changes
    useEffect(() => {
        if (selectedPlan) {
            setName(selectedPlan.name || '');
            setPaType(selectedPlan.meta_data?.physical_activity_type || 'strength_training');
            setIsActive(selectedPlan.is_active ?? true);
            setStartDate(selectedPlan.start_date ? new Date(selectedPlan.start_date) : new Date());
            setEndDate(selectedPlan.end_date ? new Date(selectedPlan.end_date) : null);
            editValidation.clearErrors();
        }
    }, [selectedPlan]);

    const handleSave = () => {
        const isValid = editValidation.validateAll({ name, paType, startDate: startDate ? 'valid' : '' });
        if (!isValid) return;
        onSave({
            uuid: selectedPlan?.uuid,
            name,
            meta_data: { physical_activity_type: paType },
            is_active: isActive,
            type: 'physical_activity',
            start_date: startDate ? format(startDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
            end_date: endDate ? format(endDate, "yyyy-MM-dd") : null
        }, false);
    };

    const handleCreate = () => {
        const isValid = createValidation.validateAll({ name: newName, paType: newPaType, startDate: newStartDate ? 'valid' : '' });
        if (!isValid) return;
        onSave({
            uuid: null,
            name: newName,
            meta_data: { physical_activity_type: newPaType },
            is_active: newIsActive,
            type: 'physical_activity',
            start_date: newStartDate ? format(newStartDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
            end_date: newEndDate ? format(newEndDate, "yyyy-MM-dd") : null
        }, true);
        setIsCreating(false);
        createValidation.clearErrors();
        setNewName('');
        setNewPaType('strength_training');
        setNewIsActive(true);
        setNewStartDate(new Date());
        setNewEndDate(null);
    };

    const handleGoToCreate = () => {
        setNewName('');
        setNewPaType('strength_training');
        setNewIsActive(true);
        setNewStartDate(new Date());
        setNewEndDate(null);
        setIsCreating(true);
    };

    const handleDelete = () => {
        if (selectedPlan?.uuid && onDelete) {
            onDelete(selectedPlan.uuid);
        }
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

    const renderTrainingTypeSelect = (value, onChange) => (
        <Popover>
            <PopoverTrigger asChild>
                <button className="w-full h-9 sm:h-8 px-3 bg-secondary/30 border border-border/50 rounded-xl flex items-center justify-between text-[10px] font-black text-primary uppercase">
                    {TRAINING_TYPES.find(t => t.id === value)?.label || value}
                    <ChevronDown className="h-3.5 w-3.5 opacity-50" />
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-1" align="start">
                {TRAINING_TYPES.map(t => (
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

    const renderToggle = (active, setActive) => (
        <div className="flex items-center gap-2">
            <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest min-w-[36px] text-right">
                {active ? 'Active' : 'Paused'}
            </span>
            <button
                onClick={() => setActive(!active)}
                className={cn(
                    "relative inline-flex h-4.5 w-8 shrink-0 cursor-pointer items-center rounded-full transition-colors",
                    active ? "bg-green-500" : "bg-muted"
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

                    {/* Header: Mobile = buttons first, dropdown second (full width). Desktop = dropdown left, buttons right */}
                    <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
                        {/* Plan Dropdown — full width on mobile, fixed width on desktop */}
                        <div className="relative w-full sm:max-w-[260px]">
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="h-9 sm:h-8 w-full px-3 bg-secondary/50 border border-border rounded-xl flex items-center gap-2 hover:bg-secondary transition-all text-[11px] sm:text-[10px] font-black uppercase tracking-tight"
                            >
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                    <Layout className="w-3.5 h-3.5 text-primary shrink-0" />
                                    <span className="truncate">{selectedPlan?.name || 'Select Plan'}</span>
                                </div>
                                <ChevronDown className={cn("w-3.5 h-3.5 text-muted-foreground transition-transform shrink-0", isDropdownOpen ? "rotate-180" : "")} />
                            </button>

                            {isDropdownOpen ? (
                                <div className="absolute top-full left-0 mt-2 w-full sm:w-52 bg-card border border-border rounded-xl shadow-2xl py-1.5 z-[100] animate-in fade-in zoom-in-95 duration-200">
                                    {plans.map(p => (
                                        <button
                                            key={p.uuid}
                                            onClick={() => { onSelect(p.uuid); setIsDropdownOpen(false); }}
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

                        {/* Toggle + Delete + Save + Add New Plan */}
                        <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3">
                            {renderToggle(isActive, setIsActive)}

                            <Button
                                onClick={handleDelete}
                                variant="outline"
                                size="compact"
                                className="gap-1.5 rounded-xl text-red-500 border-red-500/30 hover:bg-red-500/10 hover:text-red-400"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Delete</span>
                            </Button>

                            <Button
                                onClick={handleSave}
                                variant="green"
                                size="compact"
                                className="gap-1.5 rounded-xl"
                            >
                                <Save className="w-3.5 h-3.5" />
                                <span>Save</span>
                            </Button>

                            <Button
                                onClick={handleGoToCreate}
                                size="compact"
                                className="gap-1.5 rounded-xl"
                            >
                                <span>Add New Plan</span>
                            </Button>
                        </div>
                    </div>

                    {/* Row 2: Plan Name | Training Type | Start Date | End Date */}
                    <div className="bg-primary/5 p-3 rounded-xl border border-primary/10">
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4 items-start">
                            <div className="sm:col-span-4">
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
                                <label className={labelClasses}>Training Type <span className="text-red-500">*</span></label>
                                <div className={cn(editValidation.getError('paType') && "ring-1 ring-red-500 rounded-xl")}>
                                    {renderTrainingTypeSelect(paType, (val) => { setPaType(val); editValidation.clearFieldError('paType'); })}
                                </div>
                                <div className="h-4 mt-0.5 ml-1">
                                    {editValidation.getError('paType') && <span className="text-[8px] text-red-500 font-bold">{editValidation.getError('paType')}</span>}
                                </div>
                            </div>

                            <div className="sm:col-span-5 grid grid-cols-2 gap-3">
                                <div>
                                    <label className={labelClasses}>Start Date <span className="text-red-500">*</span></label>
                                    <div className={cn(editValidation.getError('startDate') && "ring-1 ring-red-500 rounded-xl")}>
                                        {renderDatePicker(startDate, (val) => { setStartDate(val); editValidation.clearFieldError('startDate'); }, "Start Date")}
                                    </div>
                                    <div className="h-4 mt-0.5 ml-1">
                                        {editValidation.getError('startDate') && <span className="text-[8px] text-red-500 font-bold">{editValidation.getError('startDate')}</span>}
                                    </div>
                                </div>
                                <div>
                                    <label className={labelClasses}>End Date</label>
                                    {renderDatePicker(endDate, setEndDate, "End Date")}
                                    <div className="h-4" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ─── Section 2: Create Mode ─── */}
                <div className="w-1/2 p-3 sm:p-4 flex flex-col gap-4 relative z-10">

                    {/* Row 1: Back + Toggle + Create */}
                    <div className="flex items-center justify-between">
                        <button onClick={() => setIsCreating(false)} className="flex items-center gap-1.5 text-[10px] sm:text-[9px] font-black uppercase text-muted-foreground hover:text-primary transition-colors">
                            <ArrowLeft className="w-3.5 h-3.5" />
                            <span>Back</span>
                        </button>

                        <div className="flex items-center gap-3">
                            {renderToggle(newIsActive, setNewIsActive)}
                            <Button
                                onClick={handleCreate}
                                className="gap-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20"
                            >
                                <Zap className="w-3.5 h-3.5" />
                                <span>Create</span>
                            </Button>
                        </div>
                    </div>

                    {/* Row 2: Name | Training Type | Start Date | End Date */}
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
                                <label className={cn(labelClasses, "text-foreground")}>Training Type <span className="text-red-500">*</span></label>
                                <div className={cn(createValidation.getError('paType') && "ring-1 ring-red-500 rounded-xl")}>
                                    {renderTrainingTypeSelect(newPaType, (val) => { setNewPaType(val); createValidation.clearFieldError('paType'); })}
                                </div>
                                <div className="h-4 mt-0.5 ml-1">
                                    {createValidation.getError('paType') && <span className="text-[8px] text-red-500 font-bold">{createValidation.getError('paType')}</span>}
                                </div>
                            </div>

                            <div className="sm:col-span-6 grid grid-cols-2 gap-3">
                                <div>
                                    <label className={cn(labelClasses, "text-foreground")}>Start Date <span className="text-red-500">*</span></label>
                                    <div className={cn(createValidation.getError('startDate') && "ring-1 ring-red-500 rounded-xl")}>
                                        {renderDatePicker(newStartDate, (val) => { setNewStartDate(val); createValidation.clearFieldError('startDate'); }, "Start Date")}
                                    </div>
                                    <div className="h-4 mt-0.5 ml-1">
                                        {createValidation.getError('startDate') && <span className="text-[8px] text-red-500 font-bold">{createValidation.getError('startDate')}</span>}
                                    </div>
                                </div>
                                <div>
                                    <label className={cn(labelClasses, "text-foreground")}>End Date</label>
                                    {renderDatePicker(newEndDate, setNewEndDate, "End Date")}
                                    <div className="h-4" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlanCard;
