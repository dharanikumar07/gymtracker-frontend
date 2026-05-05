import React, { createContext, useContext, useState, useMemo } from 'react';
import { 
    useDietPlansQuery, 
    useDietRoutineQuery, 
    useDietTrackingQuery, 
    useSaveDietLogMutation,
    useSavePlanMutation,
    useDeletePlanMutation,
    useUpdatePlanStatusMutation
} from '../http/queries';
import { format, startOfWeek, addDays } from 'date-fns';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { updateDietRoutineApi } from '../http/api';
import { toast } from 'sonner';

const DietContext = createContext();

export const DietProvider = ({ children }) => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedPlanUuid, setSelectedPlanUuid] = useState(null);
    const queryClient = useQueryClient();

    const formattedDate = format(selectedDate, 'yyyy-MM-dd');
    const selectedDay = useMemo(() => format(selectedDate, 'eee').toLowerCase(), [selectedDate]);

    // 1. Fetch all plans
    const { data: plansData, isLoading: isLoadingPlans } = useDietPlansQuery();
    const plans = plansData?.data || [];
    
    // Determine the current plan to view
    const activePlan = plans.find(p => p.is_active) || (plans.length > 0 ? plans[0] : null);
    const currentPlanUuid = selectedPlanUuid || activePlan?.uuid;
    const currentPlan = plans.find(p => p.uuid === currentPlanUuid) || activePlan;

    // 2. Fetch diet routine (Weekly Setup) based on selected plan
    const { data: routineData, isLoading: isLoadingRoutine } = useDietRoutineQuery(currentPlanUuid, !!currentPlanUuid);

    // 3. Fetch tracking data (Daily Execution) - DISABLED for now to avoid unnecessary API calls
    const { data: trackingData, isLoading: isLoadingTracking, isFetching } = useDietTrackingQuery(formattedDate, false);

    // Mutations
    const saveLogMutation = useSaveDietLogMutation(formattedDate);
    const deletePlanMutation = useDeletePlanMutation();
    const updatePlanStatusMutation = useUpdatePlanStatusMutation();
    
    const updateRoutineMutation = useMutation({
        mutationFn: updateDietRoutineApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['diet', 'routine'] });
            toast.success('Routine updated successfully');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to update routine');
        }
    });

    const meals = trackingData?.meals || { breakfast: [], lunch: [], dinner: [], snack: [] };

    // Calculate consumed totals
    const consumed = useMemo(() => {
        let calories = 0, protein = 0, carbs = 0, fats = 0;
        Object.values(meals).forEach(items => {
            items.forEach(item => {
                if (item.logged) {
                    calories += item.logged.calories || 0;
                    protein += item.logged.macros?.p || 0;
                    carbs += item.logged.macros?.c || 0;
                    fats += item.logged.macros?.f || 0;
                }
            });
        });
        return { calories, protein, carbs, fats };
    }, [meals]);

    const weekDates = useMemo(() => {
        const start = startOfWeek(selectedDate, { weekStartsOn: 1 });
        return Array.from({ length: 7 }).map((_, i) => addDays(start, i));
    }, [selectedDate]);

    const saveLog = (logs, callbacks = {}) => {
        saveLogMutation.mutate({ date: formattedDate, logs }, callbacks);
    };

    const handleUpdateRoutine = async (newRoutine) => {
        return await updateRoutineMutation.mutateAsync(newRoutine);
    };

    const value = {
        plans,
        activePlan: currentPlan,
        selectedPlanUuid: currentPlanUuid,
        setSelectedPlanUuid,
        hasActivePlan: plans.length > 0,
        routine: routineData,
        meals,
        consumed,
        isLoading: isLoadingPlans || isLoadingRoutine,
        isFetching,
        selectedDate,
        setSelectedDate,
        selectedDay,
        formattedDate,
        weekDates,
        saveLog,
        updateRoutine: handleUpdateRoutine,
        deletePlan: (uuid) => deletePlanMutation.mutate(uuid),
        updatePlanStatus: (payload) => updatePlanStatusMutation.mutate(payload),
        isSavingRoutine: updateRoutineMutation.isPending,
        isSavingLog: saveLogMutation.isPending,
        isDeletingPlan: deletePlanMutation.isPending,
        isUpdatingStatus: updatePlanStatusMutation.isPending,
    };

    return (
        <DietContext.Provider value={value}>
            {children}
        </DietContext.Provider>
    );
};

export const useDiet = () => {
    const context = useContext(DietContext);
    if (!context) {
        throw new Error('useDiet must be used within a DietProvider');
    }
    return context;
};
