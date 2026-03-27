import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '../../../constants/query.constants';
import { fetchDashboardApi } from './api';

export const useDashboardQuery = () => {
    return useQuery({
        queryKey: QUERY_KEYS.DASHBOARD.ALL,
        queryFn: fetchDashboardApi,
    });
};
