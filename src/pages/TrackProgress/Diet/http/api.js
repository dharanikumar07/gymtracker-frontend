import api from '../../../../lib/api';

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

export const fetchDietRoutineApi = async (planUuid) => {
    const response = await api.get('/diet', { params: { plan_uuid: planUuid } });
    return response.data;
};

export const fetchDietTrackingApi = async (date) => {
    const response = await api.get('/diet/log', { params: { date } });
    return response.data;
};

export const saveDietLogApi = async ({ date, logs }) => {
    const response = await api.post('/diet/log', { date, logs });
    return response.data;
};

export const updateDietRoutineApi = async (data) => {
    const response = await api.post('/diet', data);
    return response.data;
};

export const deleteMealSlotApi = async (uuid) => {
    const response = await api.delete(`/diet/${uuid}`);
    return response.data;
};

export const fetchAvailableFoodsApi = async (type) => {
    const response = await api.get('/diet/available-foods', { params: { type } });
    return response.data;
};
