import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
    getExpenseLogApi, 
    getAvailableCategoriesApi, 
    logExpenseApi, 
    deleteExpenseLogApi 
} from './api';
import { toast } from 'sonner';

export const useExpenseLogQuery = (date) => {
    return useQuery({
        queryKey: ['expense-log', date],
        queryFn: () => getExpenseLogApi(date),
        select: (res) => res.data
    });
};

export const useAvailableCategoriesQuery = (planUuid) => {
    return useQuery({
        queryKey: ['available-categories', planUuid],
        queryFn: () => getAvailableCategoriesApi(planUuid),
        enabled: !!planUuid,
        select: (res) => res.data.categories
    });
};

export const useLogExpenseMutation = (planUuid) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: logExpenseApi,
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ['expense-log'] });
            queryClient.invalidateQueries({ queryKey: ['available-categories', planUuid] });
            toast.success(res.data.message || 'Expense logged successfully');
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || 'Failed to log expense');
        }
    });
};

export const useDeleteExpenseLogMutation = (planUuid) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteExpenseLogApi,
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ['expense-log'] });
            queryClient.invalidateQueries({ queryKey: ['available-categories', planUuid] });
            toast.success(res.data.message || 'Expense deleted successfully');
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || 'Failed to delete expense');
        }
    });
};
