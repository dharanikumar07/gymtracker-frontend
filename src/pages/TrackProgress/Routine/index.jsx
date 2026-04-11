import React, { useState } from 'react';
import { 
    Activity, 
    Layout, 
    Plus
} from 'lucide-react';
import {
    usePlansQuery,
    useSlotsQuery,
    useSavePlanMutation,
    useDeletePlanMutation,
    useSaveSlotsMutation
} from './http/queries';
import PlanCard from './components/PlanCard';
import SlotsCard from './components/SlotsCard';
import { cn } from '../../../lib/utils';

const Routine = () => {
    const { data: plansData, isLoading: isLoadingPlans } = usePlansQuery();
    const plans = plansData?.data || [];
    
    const [selectedPlanUuid, setSelectedPlanUuid] = useState(null);
    
    const currentPlanUuid = selectedPlanUuid || (plans.length > 0 ? plans[0].uuid : null);
    
    const { data: slotsData, isLoading: isLoadingSlots } = useSlotsQuery(currentPlanUuid);
    const savePlanMutation = useSavePlanMutation();
    const deletePlanMutation = useDeletePlanMutation();
    const saveSlotsMutation = useSaveSlotsMutation(currentPlanUuid);

    const selectedPlan = plans.find(p => p.uuid === currentPlanUuid) || null;

    const handleSavePlan = (payload, isNew) => {
        savePlanMutation.mutate(payload, {
            onSuccess: (res) => isNew ? setSelectedPlanUuid(res.data.uuid) : null
        });
    };

    const handleSaveSlots = (payload) => {
        saveSlotsMutation.mutate(payload);
    };

    const renderEmptyState = () => (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-6">
            <div className="bg-card border border-border rounded-[3rem] p-10 flex flex-col items-center text-center shadow-xl max-w-sm w-full relative overflow-hidden group">
                <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl" />
                <div className="w-20 h-20 rounded-[2.5rem] bg-secondary flex items-center justify-center mb-6 shadow-inner relative z-10">
                    <Layout className="w-10 h-10 text-muted-foreground/30" />
                </div>
                <h3 className="text-[16px] font-black uppercase tracking-tight text-foreground mb-3 relative z-10">No Plans Found</h3>
                <p className="text-[11px] text-muted-foreground leading-relaxed font-medium mb-8 relative z-10">
                    Create your first training plan to begin.
                </p>
                <button 
                    onClick={() => handleSavePlan({ 
                        name: 'New Training Plan', 
                        type: 'physical_activity',
                        meta_data: { physical_activity_type: 'strength_training' },
                        is_active: true,
                        start_date: new Date().toISOString().split('T')[0]
                    }, true)}
                    className="h-12 w-full bg-primary text-white rounded-2xl flex items-center justify-center gap-2 text-[11px] font-black uppercase tracking-widest hover:shadow-lg hover:shadow-primary/20 active:scale-95 transition-all relative z-10"
                >
                    <Plus className="w-4 h-4" />
                    <span>Initialize First Plan</span>
                </button>
            </div>
        </div>
    );

    return (isLoadingPlans || (currentPlanUuid && isLoadingSlots)) ? null : plans.length === 0 ? renderEmptyState() : (
        <div className="space-y-6 pb-24 w-full lg:w-[90%] mx-auto px-4 sm:px-6 lg:px-8">
            <PlanCard
                key={`plan-${currentPlanUuid}`}
                plans={plans}
                selectedPlan={selectedPlan}
                onSave={handleSavePlan}
                onSelect={setSelectedPlanUuid}
                onDelete={(uuid) => {
                    deletePlanMutation.mutate(uuid, {
                        onSuccess: () => setSelectedPlanUuid(null)
                    });
                }}
            />

            {currentPlanUuid ? (
                <SlotsCard 
                    key={`slots-${currentPlanUuid}`}
                    slots={slotsData?.data || []}
                    planUuid={currentPlanUuid}
                    onSave={handleSaveSlots}
                    isSaving={saveSlotsMutation.isPending}
                />
            ) : null}
        </div>
    );
};

export default Routine;
