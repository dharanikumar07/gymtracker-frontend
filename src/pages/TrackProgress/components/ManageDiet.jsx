import React, { useState } from 'react';
import { ClipboardList, Loader2, Wand2, Plus, Check, X, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { useDietRoutineQuery, useGenerateDietPlanMutation } from '../http/queries';

const goals = [
    { id: 'weight_loss', label: 'Weight Loss', icon: '🔥' },
    { id: 'muscle_gain', label: 'Muscle Gain', icon: '💪' },
    { id: 'maintenance', label: 'Maintenance', icon: '⚖️' },
    { id: 'keto', label: 'Keto', icon: '🥑' },
    { id: 'high_protein', label: 'High Protein', icon: '🥩' }
];

const preferences = [
    { id: 'veg', label: 'Vegetarian' },
    { id: 'non_veg', label: 'Non-Vegetarian' },
    { id: 'vegan', label: 'Vegan' }
];

const ManageDiet = () => {
    const { data, isLoading } = useDietRoutineQuery();
    const generatePlan = useGenerateDietPlanMutation();
    
    const [showGenerator, setShowGenerator] = useState(false);
    const [selectedGoal, setSelectedGoal] = useState('maintenance');
    const [selectedPref, setSelectedPref] = useState('veg');
    const [isGenerating, setIsGenerating] = useState(false);

    const plan = data?.data?.plan;
    const availablePlans = data?.data?.available_plans || [];

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            await generatePlan.mutateAsync({
                goal: selectedGoal,
                diet_preference: selectedPref
            });
            setShowGenerator(false);
        } catch (error) {
            console.error('Failed to generate plan:', error);
        }
        setIsGenerating(false);
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-60">
                <Loader2 className="w-8 h-8 animate-spin text-green-500 mb-2" />
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Loading...</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="bg-card border border-border rounded-3xl p-5">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                        <ClipboardList className="w-5 h-5 text-green-500" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-[12px] font-black uppercase italic text-foreground">Manage Diet</h3>
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Create and edit your diet plan</p>
                    </div>
                    <button
                        onClick={() => setShowGenerator(!showGenerator)}
                        className={cn(
                            "flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all",
                            showGenerator 
                                ? "bg-green-500 text-white" 
                                : "bg-green-500/10 text-green-500 hover:bg-green-500/20"
                        )}
                    >
                        <Wand2 className="w-3 h-3" />
                        <span className="hidden sm:inline">{showGenerator ? 'Close' : 'Generate'}</span>
                    </button>
                </div>
                
                {showGenerator && (
                    <div className="p-4 bg-secondary/30 rounded-2xl space-y-4 border border-border/50">
                        <div>
                            <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block mb-2">Select Goal</label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {goals.map((goal) => (
                                    <button
                                        key={goal.id}
                                        onClick={() => setSelectedGoal(goal.id)}
                                        className={cn(
                                            "flex items-center gap-2 p-3 rounded-xl text-[10px] font-bold transition-all",
                                            selectedGoal === goal.id
                                                ? "bg-green-500 text-white"
                                                : "bg-background hover:bg-secondary"
                                        )}
                                    >
                                        <span>{goal.icon}</span>
                                        <span>{goal.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                        
                        <div>
                            <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block mb-2">Diet Preference</label>
                            <div className="flex gap-2">
                                {preferences.map((pref) => (
                                    <button
                                        key={pref.id}
                                        onClick={() => setSelectedPref(pref.id)}
                                        className={cn(
                                            "flex-1 p-3 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all",
                                            selectedPref === pref.id
                                                ? "bg-green-500 text-white"
                                                : "bg-background hover:bg-secondary"
                                        )}
                                    >
                                        {pref.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        
                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating}
                            className={cn(
                                "w-full flex items-center justify-center gap-2 p-3 rounded-xl font-bold uppercase tracking-wider transition-all",
                                "bg-green-500 text-white hover:bg-green-600",
                                isGenerating && "opacity-50 cursor-not-allowed"
                            )}
                        >
                            {isGenerating ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Wand2 className="w-4 h-4" />
                            )}
                            <span className="text-[11px]">{isGenerating ? 'Generating...' : 'Generate Diet Plan'}</span>
                        </button>
                    </div>
                )}
            </div>

            {!plan ? (
                <div className="bg-card border border-border rounded-3xl p-5">
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <ClipboardList className="w-10 h-10 text-muted-foreground/30 mb-3" />
                        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">No Diet Plan</p>
                        <p className="text-[9px] text-muted-foreground/60 mt-1">Click Generate above to create your diet plan</p>
                    </div>
                </div>
            ) : (
                <>
                    <div className="bg-card border border-border rounded-3xl p-5">
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <h4 className="text-[12px] font-black uppercase text-foreground">{plan.name}</h4>
                                <p className="text-[9px] font-bold text-muted-foreground">
                                    {plan.is_active ? 'Active Plan' : 'Inactive'} • Started {plan.start_date}
                                </p>
                            </div>
                            {plan.is_active && (
                                <span className="px-2 py-1 text-[8px] font-bold uppercase rounded-full bg-green-500/10 text-green-500">
                                    Active
                                </span>
                            )}
                        </div>
                        
                        <div className="grid grid-cols-4 gap-2 p-3 bg-secondary/30 rounded-2xl">
                            <div className="text-center">
                                <p className="text-[14px] font-black text-foreground">{plan.target_calories || 0}</p>
                                <p className="text-[8px] font-bold text-muted-foreground uppercase">Calories</p>
                            </div>
                            <div className="text-center">
                                <p className="text-[14px] font-black text-foreground">{plan.target_protein || 0}g</p>
                                <p className="text-[8px] font-bold text-muted-foreground uppercase">Protein</p>
                            </div>
                            <div className="text-center">
                                <p className="text-[14px] font-black text-foreground">{plan.target_carbs || 0}g</p>
                                <p className="text-[8px] font-bold text-muted-foreground uppercase">Carbs</p>
                            </div>
                            <div className="text-center">
                                <p className="text-[14px] font-black text-foreground">{plan.target_fats || 0}g</p>
                                <p className="text-[8px] font-bold text-muted-foreground uppercase">Fats</p>
                            </div>
                        </div>
                    </div>

                    {availablePlans.length > 1 && (
                        <div className="bg-card border border-border rounded-3xl p-4">
                            <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Other Plans</h4>
                            <div className="space-y-2">
                                {availablePlans.filter(p => p.uuid !== plan.uuid).map((p) => (
                                    <div key={p.uuid} className="flex items-center justify-between p-2 bg-secondary/30 rounded-xl">
                                        <span className="text-[10px] font-bold text-foreground">{p.name}</span>
                                        {!p.is_active && (
                                            <span className="text-[8px] font-bold text-muted-foreground/50 uppercase">Inactive</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default ManageDiet;
