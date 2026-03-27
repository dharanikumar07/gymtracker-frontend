import { useQuery } from '@tanstack/react-query';
import { 
    fetchOverviewApi,
    fetchFitnessAnalyticsApi,
    fetchDietAnalyticsApi,
    fetchExpenseAnalyticsApi
} from './analyticsApi';

export const useOverviewQuery = () => {
    return useQuery({
        queryKey: ['analytics', 'overview'],
        queryFn: fetchOverviewApi,
    });
};

export const useFitnessAnalyticsQuery = (period = 'week') => {
    return useQuery({
        queryKey: ['analytics', 'fitness', period],
        queryFn: () => fetchFitnessAnalyticsApi(period),
    });
};

export const useDietAnalyticsQuery = (period = 'week') => {
    return useQuery({
        queryKey: ['analytics', 'diet', period],
        queryFn: () => fetchDietAnalyticsApi(period),
    });
};

export const useExpenseAnalyticsQuery = (period = 'month') => {
    return useQuery({
        queryKey: ['analytics', 'expenses', period],
        queryFn: () => fetchExpenseAnalyticsApi(period),
    });
};
