import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchPlansApi, savePlanApi, deletePlanApi, updatePlanStatusApi } from '../../../http/api';
import { fetchExpensesApi, saveExpenseCategoryApi, deleteExpenseCategoryApi } from './api';
import { QUERY_KEYS } from '../../../../constants/query.constants';
import { toast } from 'sonner';

export const useExpensesQuery = (date) => {
    return useQuery({
        queryKey: [QUERY_KEYS.EXPENSES.ALL, date],
        queryFn: () => fetchExpensesApi(date),
    });
};

export const useSaveExpenseCategoryMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: saveExpenseCategoryApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.EXPENSES.ALL] });
            toast.success("Expense category saved");
        },
        onError: (error) => toast.error(error.response?.data?.errors || "Failed to save category"),
    });
};

export const useDeleteExpenseCategoryMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteExpenseCategoryApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.EXPENSES.ALL] });
            toast.success("Category deleted");
        },
    });
};

export const useBudgetPlansQuery = () => {
    return useQuery({
        queryKey: [QUERY_KEYS.EXPENSES.BUDGET_PLANS],
        queryFn: () => fetchPlansApi('budget'),
    });
};

export const useSaveBudgetPlanMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: savePlanApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.EXPENSES.BUDGET_PLANS] });
            toast.success("Budget plan saved successfully");
        },
        onError: (error) => toast.error(error.response?.data?.errors || "Failed to save budget plan"),
    });
};

export const useDeleteBudgetPlanMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deletePlanApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.EXPENSES.BUDGET_PLANS] });
            toast.success("Budget plan deleted successfully");
        },
        onError: (error) => toast.error(error.response?.data?.errors || "Failed to delete budget plan"),
    });
};

export const useUpdateBudgetPlanStatusMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updatePlanStatusApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.EXPENSES.BUDGET_PLANS] });
            toast.success("Budget plan status updated");
        },
        onError: (error) => toast.error(error.response?.data?.errors || "Failed to update status"),
    });
};
