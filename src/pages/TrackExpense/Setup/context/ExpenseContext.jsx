import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { 
    useBudgetPlansQuery, 
    useSaveBudgetPlanMutation, 
    useDeleteBudgetPlanMutation, 
    useUpdateBudgetPlanStatusMutation,
    useExpensesQuery,
    useSaveExpenseCategoryMutation,
    useDeleteExpenseCategoryMutation
} from '../http/queries';

const ExpenseContext = createContext();

export const ExpenseProvider = ({ children }) => {
    const { data: plansData, isLoading: isLoadingPlans } = useBudgetPlansQuery();
    
    const plans = plansData?.data || [];
    const activePlan = plans.find(p => p.is_active) || plans[0];
    const [selectedPlanUuid, setSelectedPlanUuid] = useState(null);
    const [isCreatingPlan, setIsCreatingPlan] = useState(false);
    
    // Track unsaved changes from different sources
    const [hasPlanChanges, setHasPlanChanges] = useState(false);
    const [hasFixedChanges, setHasFixedChanges] = useState(false);

    const hasUnsavedChanges = useMemo(() => hasPlanChanges || hasFixedChanges, [hasPlanChanges, hasFixedChanges]);

    const clearUnsavedChanges = () => {
        setHasPlanChanges(false);
        setHasFixedChanges(false);
    };

    useEffect(() => {
        if (activePlan && !selectedPlanUuid) {
            setSelectedPlanUuid(activePlan.uuid);
        }
    }, [activePlan, selectedPlanUuid]);

    const { data: expensesData, isLoading: isLoadingExpenses } = useExpensesQuery(selectedPlanUuid);
    
    const savePlanMutation = useSaveBudgetPlanMutation();
    const deletePlanMutation = useDeleteBudgetPlanMutation();
    const updatePlanStatusMutation = useUpdateBudgetPlanStatusMutation();
    
    const saveCategoryMutation = useSaveExpenseCategoryMutation();
    const deleteCategoryMutation = useDeleteExpenseCategoryMutation();

    const fixedExpenses = useMemo(() => {
        return (expensesData?.data || []);
    }, [expensesData]);
    const selectedPlan = plans.find(p => p.uuid === selectedPlanUuid) || activePlan;

    const value = {
        plans,
        fixedExpenses,
        selectedPlan,
        setSelectedPlanUuid,
        isCreatingPlan,
        setIsCreatingPlan,
        isLoadingPlans,
        isLoadingExpenses,
        savePlan: savePlanMutation.mutate,
        isSavingPlan: savePlanMutation.isPending,
        deletePlan: deletePlanMutation.mutate,
        isDeletingPlan: deletePlanMutation.isPending,
        updatePlanStatus: updatePlanStatusMutation.mutate,
        isUpdatingStatus: updatePlanStatusMutation.isPending,
        saveCategory: saveCategoryMutation.mutate,
        isSavingCategory: saveCategoryMutation.isPending,
        deleteCategory: deleteCategoryMutation.mutate,
        isDeletingCategory: deleteCategoryMutation.isPending,
        hasUnsavedChanges,
        setHasPlanChanges,
        setHasFixedChanges,
        clearUnsavedChanges
    };

    return (
        <ExpenseContext.Provider value={value}>
            {children}
        </ExpenseContext.Provider>
    );
};

export const useExpense = () => {
    const context = useContext(ExpenseContext);
    if (!context) {
        throw new Error('useExpense must be used within an ExpenseProvider');
    }
    return context;
};
