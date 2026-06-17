import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '../../../constants/query.constants';
import { fetchDashboardApi, fetchChecklistApi } from './api';

export const useDashboardQuery = () => {
    return useQuery({
        queryKey: QUERY_KEYS.DASHBOARD.ALL,
        queryFn: fetchDashboardApi,
    });
};

export const useChecklistQuery = () => {
    return useQuery({
        queryKey: QUERY_KEYS.DASHBOARD.CHECKLIST,
        queryFn: fetchChecklistApi,
    });
};
