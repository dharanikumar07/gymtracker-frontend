import api from '../../../../lib/api';

export const fetchOverviewApi = async () => {
    const response = await api.get('/analytics/overview');
    return response.data;
};

export const fetchFitnessAnalyticsApi = async (period = 'week') => {
    const response = await api.get('/analytics/fitness', { params: { period } });
    return response.data;
};

export const fetchDietAnalyticsApi = async (period = 'week') => {
    const response = await api.get('/analytics/diet', { params: { period } });
    return response.data;
};

export const fetchExpenseAnalyticsApi = async (period = 'month') => {
    const response = await api.get('/analytics/expenses', { params: { period } });
    return response.data;
};
