import React from 'react';
import { Loader2, UtensilsCrossed } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { DietProvider, useDiet } from './context/DietContext';
import CreateDietPlan from './components/CreateDietPlan';
import DietPlanCard from './components/DietPlanCard';
import DietRoutineCard from './components/DietRoutineCard';

const DietContent = () => {
    const {
        plans,
        activePlan,
        hasActivePlan,
        routine,
        isLoading,
        updateRoutine,
        isSavingRoutine
    } = useDiet();

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <div className="relative">
                    <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                    <UtensilsCrossed className="w-5 h-5 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">
                    Loading Diet Data...
                </p>
            </div>
        );
    }

    // If no plan exist, show creation screen
    if (!hasActivePlan) {
        return (
            <div className="space-y-6 pb-24 w-full mx-auto px-4 sm:px-6 lg:px-8 animate-in fade-in duration-500">
                <CreateDietPlan />
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-24 w-full mx-auto px-4 sm:px-6 lg:px-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* 1. Plan Card (Selection & Info) */}
            <DietPlanCard 
                plans={plans}
                plan={activePlan} 
            />

            {/* 2. Routine Card (Weekly Split & Items) */}
            <DietRoutineCard 
                routine={routine} 
                onSave={updateRoutine}
                isSaving={isSavingRoutine}
                planUuid={activePlan?.uuid}
            />
        </div>
    );
};

const Diet = () => (
    <DietProvider>
        <DietContent />
    </DietProvider>
);

export default Diet;
