import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../../lib/api';

export const EXPENSE_KEYS = {
    all: ['expenses'],
};

export const useExpensesQuery = () => {
    return useQuery({
        queryKey: EXPENSE_KEYS.all,
        queryFn: async () => {
            const response = await api.get('/get-expenses');
            return response.data;
        },
    });
};
