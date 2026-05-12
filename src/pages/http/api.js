import api from '../../lib/api';

export const fetchPlansApi = async (type, is_active = null) => {
    let url = `/plans?type=${type}`;
    if (is_active !== null) {
        const val = typeof is_active === 'boolean' ? (is_active ? 1 : 0) : is_active;
        url += `&is_active=${val}`;
    }
    const response = await api.get(url);
    return response.data;
};

export const savePlanApi = async (payload) => {
    const response = await api.post('/plans', payload);
    return response.data;
};

export const deletePlanApi = async (uuid) => {
    const response = await api.delete(`/plans/${uuid}`);
    return response.data;
};

export const updatePlanStatusApi = async (payload) => {
    const response = await api.patch('/plans/status', payload);
    return response.data;
};
