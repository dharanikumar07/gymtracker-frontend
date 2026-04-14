import React, { useState } from 'react';
import {
    Wand2,
    Loader2,
    ChevronDown,
    Check,
    Flame,
    Dumbbell,
    Scale,
    Leaf,
    Drumstick,
    Vegan,
    UtensilsCrossed,
    Plus,
} from 'lucide-react';
import { cn } from '../../../../lib/utils';
import { useGenerateDietPlanMutation, useSetActivePlanMutation } from '../http/queries';
import { Popover, PopoverContent, PopoverTrigger } from '../../../../components/ui/popover';

const GOALS = [
    { id: 'weight_loss', label: 'Weight Loss', icon: Flame },
    { id: 'muscle_gain', label: 'Muscle Gain', icon: Dumbbell },
    { id: 'maintenance', label: 'Maintenance', icon: Scale },
];

const PREFERENCES = [
    { id: 'veg', label: 'Vegetarian', icon: Leaf },
    { id: 'non_veg', label: 'Non-Veg', icon: Drumstick },
    { id: 'vegan', label: 'Vegan', icon: Vegan },
];

// ─── No Plan: Full Generator ───
const GeneratorView = () => {
    const generateMutation = useGenerateDietPlanMutation();
    const [goal, setGoal] = useState('maintenance');
    const [preference, setPreference] = useState('veg');
    const [planName, setPlanName] = useState('');

    const handleGenerate = () => {
        generateMutation.mutate({
            goal,
            diet_preference: preference,
            name: planName || undefined,
        });
    };

    const isGenerating = generateMutation.isPending;

    return (
        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 sm:p-5">
                {/* Header */}
                <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-sm">
                        <UtensilsCrossed className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-[14px] sm:text-[16px] font-black uppercase tracking-tight text-foreground">
                            Create Diet Plan
                        </h2>
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                            Select your goal and preference to generate
                        </p>
                    </div>
                </div>

                {/* Goal Selector */}
                <div className="mb-4">
                    <label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground mb-2 block ml-1">
                        Goal
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                        {GOALS.map(({ id, label, icon: Icon }) => (
                            <button
                                key={id}
                                onClick={() => setGoal(id)}
                                disabled={isGenerating}
                                className={cn(
                                    "flex flex-col items-center gap-2 p-3 sm:p-4 rounded-xl border-2 transition-all",
                                    goal === id
                                        ? "border-primary bg-primary/5 shadow-sm"
                                        : "border-border bg-secondary/10 hover:border-border hover:bg-secondary/30"
                                )}
                            >
                                <div className={cn(
                                    "w-9 h-9 rounded-lg flex items-center justify-center",
                                    goal === id ? "bg-primary/10" : "bg-secondary/50"
                                )}>
                                    <Icon className={cn(
                                        "w-4.5 h-4.5",
                                        goal === id ? "text-primary" : "text-muted-foreground/50"
                                    )} />
                                </div>
                                <span className={cn(
                                    "text-[9px] font-black uppercase tracking-wider",
                                    goal === id ? "text-primary" : "text-muted-foreground"
                                )}>
                                    {label}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Preference Selector */}
                <div className="mb-4">
                    <label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground mb-2 block ml-1">
                        Diet Preference
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                        {PREFERENCES.map(({ id, label, icon: Icon }) => (
                            <button
                                key={id}
                                onClick={() => setPreference(id)}
                                disabled={isGenerating}
                                className={cn(
                                    "flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all",
                                    preference === id
                                        ? "border-primary bg-primary/5"
                                        : "border-border bg-secondary/10 hover:bg-secondary/30"
                                )}
                            >
                                <Icon className={cn(
                                    "w-3.5 h-3.5",
                                    preference === id ? "text-primary" : "text-muted-foreground/50"
                                )} />
                                <span className={cn(
                                    "text-[9px] font-black uppercase tracking-wider",
                                    preference === id ? "text-primary" : "text-muted-foreground"
                                )}>
                                    {label}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Plan Name */}
                <div className="mb-5">
                    <label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground mb-2 block ml-1">
                        Plan Name <span className="text-muted-foreground/40">(optional)</span>
                    </label>
                    <input
                        type="text"
                        value={planName}
                        onChange={(e) => setPlanName(e.target.value)}
                        placeholder="e.g. Summer Cut, Bulk Phase"
                        disabled={isGenerating}
                        className="w-full h-10 px-4 bg-background border border-border rounded-xl text-[12px] font-semibold text-foreground outline-none focus:border-primary/50 transition-all placeholder:text-foreground/20 dark:placeholder:text-foreground/25"
                    />
                </div>

                {/* Generate Button */}
                <button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="w-full h-11 flex items-center justify-center gap-2 bg-primary text-white rounded-xl font-black uppercase tracking-widest text-[11px] hover:bg-primary/90 transition-all disabled:opacity-50 shadow-sm"
                >
                    {isGenerating ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Wand2 className="w-4 h-4" />
                    )}
                    <span>{isGenerating ? 'Generating...' : 'Generate Diet Plan'}</span>
                </button>
            </div>
        </div>
    );
};

// ─── Has Plan: Compact Info + Switch ───
const PlanInfoCard = ({ plan, availablePlans }) => {
    const setActiveMutation = useSetActivePlanMutation();
    const [showGenerator, setShowGenerator] = useState(false);

    const handleSwitchPlan = (planUuid) => {
        setActiveMutation.mutate(planUuid);
    };

    return (
        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 sm:p-5">
                {/* Header row */}
                <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-sm shrink-0">
                            <UtensilsCrossed className="w-5 h-5 text-white" />
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-[7px] sm:text-[8px] font-black uppercase text-primary tracking-widest bg-primary/10 px-1.5 py-0.5 rounded-md shrink-0">
                                    Active Plan
                                </span>
                            </div>
                            <h2 className="text-[14px] sm:text-[16px] font-black uppercase tracking-tight text-foreground truncate leading-tight">
                                {plan.name}
                            </h2>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        {/* Switch plan dropdown */}
                        {availablePlans.length > 1 ? (
                            <Popover>
                                <PopoverTrigger asChild>
                                    <button className="flex items-center gap-1.5 px-2.5 py-1.5 bg-secondary/50 hover:bg-secondary rounded-lg border border-border/50 transition-all text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                                        Switch
                                        <ChevronDown className="w-3 h-3" />
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent className="w-48 p-1" align="end">
                                    {availablePlans.map((p) => (
                                        <button
                                            key={p.plan_uuid}
                                            onClick={() => handleSwitchPlan(p.plan_uuid)}
                                            className={cn(
                                                "w-full flex items-center justify-between px-3 py-2 rounded-lg text-[10px] font-bold transition-colors text-left",
                                                p.is_active
                                                    ? "text-primary bg-primary/5"
                                                    : "text-foreground hover:bg-secondary"
                                            )}
                                        >
                                            <span className="truncate">{p.name}</span>
                                            {p.is_active ? <Check className="w-3 h-3 shrink-0" /> : null}
                                        </button>
                                    ))}
                                </PopoverContent>
                            </Popover>
                        ) : null}

                        {/* Generate new */}
                        <button
                            onClick={() => setShowGenerator(!showGenerator)}
                            className={cn(
                                "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all text-[9px] font-bold uppercase tracking-wider",
                                showGenerator
                                    ? "bg-primary text-white border-primary"
                                    : "bg-secondary/50 border-border/50 text-muted-foreground hover:bg-secondary"
                            )}
                        >
                            <Plus className="w-3 h-3" />
                            <span className="hidden sm:inline">New</span>
                        </button>
                    </div>
                </div>

                {/* Macro targets */}
                <div className="grid grid-cols-4 gap-2 p-3 bg-secondary/20 rounded-xl border border-border/30">
                    <MacroTarget label="Calories" value={plan.target_calories || 0} unit="kcal" />
                    <MacroTarget label="Protein" value={plan.target_protein || 0} unit="g" />
                    <MacroTarget label="Carbs" value={plan.target_carbs || 0} unit="g" />
                    <MacroTarget label="Fats" value={plan.target_fats || 0} unit="g" />
                </div>

                {/* Inline generator */}
                {showGenerator ? (
                    <div className="mt-4 pt-4 border-t border-border/40">
                        <InlineGenerator onClose={() => setShowGenerator(false)} />
                    </div>
                ) : null}
            </div>
        </div>
    );
};

const MacroTarget = ({ label, value, unit }) => (
    <div className="text-center">
        <p className="text-[13px] sm:text-[15px] font-black text-foreground leading-none">
            {value}<span className="text-[8px] font-bold text-muted-foreground ml-0.5">{unit}</span>
        </p>
        <p className="text-[7px] sm:text-[8px] font-black uppercase text-muted-foreground tracking-widest mt-1">
            {label}
        </p>
    </div>
);

const InlineGenerator = ({ onClose }) => {
    const generateMutation = useGenerateDietPlanMutation();
    const [goal, setGoal] = useState('maintenance');
    const [preference, setPreference] = useState('veg');
    const isGenerating = generateMutation.isPending;

    const handleGenerate = () => {
        generateMutation.mutate({ goal, diet_preference: preference }, {
            onSuccess: () => onClose(),
        });
    };

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap gap-1.5">
                {GOALS.map(({ id, label }) => (
                    <button
                        key={id}
                        onClick={() => setGoal(id)}
                        disabled={isGenerating}
                        className={cn(
                            "px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all",
                            goal === id ? "bg-primary text-white" : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
                        )}
                    >
                        {label}
                    </button>
                ))}
            </div>
            <div className="flex flex-wrap gap-1.5">
                {PREFERENCES.map(({ id, label }) => (
                    <button
                        key={id}
                        onClick={() => setPreference(id)}
                        disabled={isGenerating}
                        className={cn(
                            "px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all",
                            preference === id ? "bg-primary text-white" : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
                        )}
                    >
                        {label}
                    </button>
                ))}
            </div>
            <div className="flex gap-2">
                <button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="flex-1 h-9 flex items-center justify-center gap-2 bg-primary text-white rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-primary/90 disabled:opacity-50"
                >
                    {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
                    {isGenerating ? 'Generating...' : 'Generate'}
                </button>
                <button
                    onClick={onClose}
                    disabled={isGenerating}
                    className="h-9 px-4 bg-secondary/50 text-muted-foreground rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-secondary"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
};

// ─── Main Export ───
const DietPlanCard = ({ plan, availablePlans }) => {
    return plan
        ? <PlanInfoCard plan={plan} availablePlans={availablePlans} />
        : <GeneratorView />;
};

export default DietPlanCard;
