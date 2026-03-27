import api from '../../../lib/api';

export const fetchOverviewApi = async () => {
    const response = await api.get('/analytics/overview');
    return response.data;
};

export const fetchFitnessApi = async (period = 'week') => {
    const response = await api.get('/analytics/fitness', { params: { period } });
    return response.data;
};

export const fetchDietApi = async (period = 'week') => {
    const response = await api.get('/analytics/diet', { params: { period } });
    return response.data;
};

export const fetchExpenseApi = async (period = 'month') => {
    const response = await api.get('/analytics/expenses', { params: { period } });
    return response.data;
};
