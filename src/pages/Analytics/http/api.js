import api from '../../../lib/api';

export const fetchOverviewApi = async (date) => {
    const response = await api.get('/analytics/overview', { params: { date } });
    return response.data;
};
