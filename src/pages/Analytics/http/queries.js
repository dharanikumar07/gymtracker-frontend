import { useQuery } from '@tanstack/react-query';
import { fetchOverviewApi } from './api';

export const useAnalyticsOverviewQuery = (date) => {
    return useQuery({
        queryKey: ['analytics', 'overview', date],
        queryFn: () => fetchOverviewApi(date),
        enabled: !!date
    });
};
