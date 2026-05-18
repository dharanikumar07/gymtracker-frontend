import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
    getExpenseLogApi, 
    getAvailableCategoriesApi, 
    logExpenseApi, 
    deleteExpenseLogApi 
} from './api';
import { QUERY_KEYS } from '../../../../constants/query.constants';
import { toast } from 'sonner';

export const useExpenseLogQuery = (date) => {
    return useQuery({
        queryKey: ['expense-log', date],
        queryFn: () => getExpenseLogApi(date),
        select: (res) => res.data
    });
};

export const useAvailableCategoriesQuery = () => {
    return useQuery({
        queryKey: ['available-categories'],
        queryFn: () => getAvailableCategoriesApi(),
        select: (res) => res.data.categories
    });
};

export const useLogExpenseMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: logExpenseApi,
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ['expense-log'] });
            toast.success(res.data.message || 'Expense logged successfully');
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || 'Failed to log expense');
        }
    });
};

export const useDeleteExpenseLogMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteExpenseLogApi,
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ['expense-log'] });
            toast.success(res.data.message || 'Expense deleted successfully');
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || 'Failed to delete expense');
        }
    });
};
