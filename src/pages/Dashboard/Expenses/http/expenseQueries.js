import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '../../../../constants/query.constants';
import { fetchExpensesApi } from './expenseApi';

export const useExpensesQuery = () => {
    return useQuery({
        queryKey: QUERY_KEYS.EXPENSES.ALL,
        queryFn: fetchExpensesApi,
    });
};
