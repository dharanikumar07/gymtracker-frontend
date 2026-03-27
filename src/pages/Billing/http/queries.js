import { useQuery } from '@tanstack/react-query';
import { fetchBillingApi } from './api';

export const useBillingQuery = () => {
    return useQuery({
        queryKey: ['billing'],
        queryFn: fetchBillingApi,
    });
};
