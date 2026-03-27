import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchExpensesApi, logExpenseApi, deleteExpenseApi, fetchBudgetPlansApi, createBudgetPlanApi, updateBudgetPlanApi, deleteBudgetPlanApi, activateBudgetPlanApi, getBudgetPlanStatusApi } from './api';
import { QUERY_KEYS } from '../../../constants/query.constants';
import { toast } from 'sonner';

export const useExpensesQuery = (date) => {
    return useQuery({
        queryKey: [QUERY_KEYS.EXPENSES.ALL, date],
        queryFn: () => fetchExpensesApi(date),
    });
};

export const useLogExpenseMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: logExpenseApi,
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.EXPENSES.ALL });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.EXPENSES.BUDGET_STATUS });
            toast.success(variables.uuid ? "Expense updated successfully" : "Expense logged successfully");
        },
        onError: (error) => toast.error(error.response?.data?.errors || "Failed to commit expense"),
    });
};

export const useDeleteExpenseMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteExpenseApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.EXPENSES.ALL });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.EXPENSES.BUDGET_STATUS });
            toast.success("Expense deleted successfully");
        },
        onError: (error) => toast.error(error.response?.data?.errors || "Failed to delete expense"),
    });
};

export const useBudgetPlansQuery = () => {
    return useQuery({
        queryKey: QUERY_KEYS.EXPENSES.BUDGET_PLANS,
        queryFn: fetchBudgetPlansApi,
    });
};

export const useBudgetPlanStatusQuery = (uuid) => {
    return useQuery({
        queryKey: [QUERY_KEYS.EXPENSES.BUDGET_STATUS, uuid],
        queryFn: () => getBudgetPlanStatusApi(uuid),
        enabled: !!uuid,
    });
};

export const useCreateBudgetPlanMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createBudgetPlanApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.EXPENSES.BUDGET_PLANS });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.EXPENSES.BUDGET_STATUS });
            toast.success("Budget plan created successfully");
        },
        onError: (error) => toast.error(error.response?.data?.errors || "Failed to create budget plan"),
    });
};

export const useUpdateBudgetPlanMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ uuid, data }) => updateBudgetPlanApi(uuid, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.EXPENSES.BUDGET_PLANS });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.EXPENSES.BUDGET_STATUS });
            toast.success("Budget plan updated successfully");
        },
        onError: (error) => toast.error(error.response?.data?.errors || "Failed to update budget plan"),
    });
};

export const useDeleteBudgetPlanMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteBudgetPlanApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.EXPENSES.BUDGET_PLANS });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.EXPENSES.BUDGET_STATUS });
            toast.success("Budget plan deleted successfully");
        },
        onError: (error) => toast.error(error.response?.data?.errors || "Failed to delete budget plan"),
    });
};

export const useActivateBudgetPlanMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: activateBudgetPlanApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.EXPENSES.BUDGET_PLANS });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.EXPENSES.BUDGET_STATUS });
            toast.success("Budget plan activated");
        },
        onError: (error) => toast.error(error.response?.data?.errors || "Failed to activate budget plan"),
    });
};
