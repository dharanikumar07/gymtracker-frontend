import { useQuery } from '@tanstack/react-query';
import { 
    fetchOverviewApi, 
    fetchWorkoutLogApi, 
    fetchWorkoutInsightsApi,
    fetchAvailableExercisesApi,
    fetchProgressiveOverloadApi,
    fetchMuscleDistributionApi,
    fetchExpenseLogApi,
    fetchExpenseInsightsApi,
    fetchExpenseTrendApi,
    fetchExpenseDistributionApi,
    fetchAvailableExpenseCategoriesApi
} from './api';

export const useAnalyticsOverviewQuery = (date) => {
    return useQuery({
        queryKey: ['analytics', 'overview', date],
        queryFn: () => fetchOverviewApi(date),
        enabled: !!date
    });
};

// WORKOUT QUERIES
export const useWorkoutLogQuery = ({ startDate, endDate, enabled = true }) => {
    return useQuery({
        queryKey: ['analytics', 'workout-log', startDate, endDate],
        queryFn: () => fetchWorkoutLogApi({ startDate, endDate }),
        enabled: enabled && !!startDate
    });
};

export const useWorkoutInsightsQuery = ({ startDate, endDate, enabled = true }) => {
    return useQuery({
        queryKey: ['analytics', 'workout-insights', startDate, endDate],
        queryFn: () => fetchWorkoutInsightsApi({ startDate, endDate }),
        enabled: enabled && !!startDate
    });
};

export const useAvailableExercisesQuery = () => {
    return useQuery({
        queryKey: ['analytics', 'available-exercises'],
        queryFn: fetchAvailableExercisesApi
    });
};

export const useProgressiveOverloadQuery = ({ exerciseUuid, periodType, lookback, enabled = true }) => {
    return useQuery({
        queryKey: ['analytics', 'progressive-overload', exerciseUuid, periodType, lookback],
        queryFn: () => fetchProgressiveOverloadApi({ exerciseUuid, periodType, lookback }),
        enabled: enabled && !!exerciseUuid
    });
};

export const useMuscleDistributionQuery = ({ periodType, lookback, enabled = true }) => {
    return useQuery({
        queryKey: ['analytics', 'muscle-distribution', periodType, lookback],
        queryFn: () => fetchMuscleDistributionApi({ periodType, lookback }),
        enabled: enabled
    });
};

// EXPENSE QUERIES
export const useExpenseLogQuery = ({ startDate, endDate, enabled = true }) => {
    return useQuery({
        queryKey: ['analytics', 'expense-log', startDate, endDate],
        queryFn: () => fetchExpenseLogApi({ startDate, endDate }),
        enabled: enabled && !!startDate
    });
};

export const useExpenseInsightsQuery = ({ startDate, endDate, enabled = true }) => {
    return useQuery({
        queryKey: ['analytics', 'expense-insights', startDate, endDate],
        queryFn: () => fetchExpenseInsightsApi({ startDate, endDate }),
        enabled: enabled && !!startDate
    });
};

export const useExpenseTrendQuery = ({ periodType, lookback, categoryUuid, enabled = true }) => {
    return useQuery({
        queryKey: ['analytics', 'expense-trend', periodType, lookback, categoryUuid],
        queryFn: () => fetchExpenseTrendApi({ periodType, lookback, categoryUuid }),
        enabled: enabled
    });
};

export const useAvailableExpenseCategoriesQuery = () => {
    return useQuery({
        queryKey: ['analytics', 'available-expense-categories'],
        queryFn: fetchAvailableExpenseCategoriesApi
    });
};

export const useExpenseDistributionQuery = ({ periodType, lookback, enabled = true }) => {
    return useQuery({
        queryKey: ['analytics', 'expense-distribution', periodType, lookback],
        queryFn: () => fetchExpenseDistributionApi({ periodType, lookback }),
        enabled: enabled
    });
};
