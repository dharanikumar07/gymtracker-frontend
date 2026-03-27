import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '../../../constants/query.constants';
import { fetchOverviewApi, fetchFitnessApi, fetchDietApi, fetchExpenseApi } from './api';

export const useOverviewQuery = () => {
    return useQuery({
        queryKey: ['analytics', 'overview'],
        queryFn: fetchOverviewApi,
    });
};

export const useFitnessQuery = (period = 'week') => {
    return useQuery({
        queryKey: ['analytics', 'fitness', period],
        queryFn: () => fetchFitnessApi(period),
    });
};

export const useDietQuery = (period = 'week') => {
    return useQuery({
        queryKey: ['analytics', 'diet', period],
        queryFn: () => fetchDietApi(period),
    });
};

export const useExpenseQuery = (period = 'month') => {
    return useQuery({
        queryKey: ['analytics', 'expenses', period],
        queryFn: () => fetchExpenseApi(period),
    });
};
