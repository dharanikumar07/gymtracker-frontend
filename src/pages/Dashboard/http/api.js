import api from '../../../lib/api';

export const fetchDashboardApi = async () => {
    const response = await api.get('/dashboard');
    return response.data;
};

export const fetchChecklistApi = async () => {
    const response = await api.get('/dashboard/checklist');
    return response.data;
};
