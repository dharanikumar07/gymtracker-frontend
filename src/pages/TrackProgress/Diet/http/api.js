import api from '../../../../lib/api';

export const fetchDietRoutineApi = async (planUuid = null) => {
    const params = planUuid ? { plan_uuid: planUuid } : {};
    const response = await api.get('/diet/routine', { params });
    return response.data;
};

export const fetchDietTrackingApi = async (date) => {
    const response = await api.get('/diet/tracking', { params: { date } });
    return response.data;
};

export const generateDietPlanApi = async (data) => {
    const response = await api.post('/diet/routine', data);
    return response.data;
};

export const setActiveDietPlanApi = async (planUuid) => {
    const response = await api.post('/diet/routine/active', { plan_uuid: planUuid });
    return response.data;
};

export const updateDietRoutineApi = async (data) => {
    const response = await api.patch('/diet/routine', data);
    return response.data;
};

export const saveDietLogApi = async ({ date, logs }) => {
    const response = await api.post('/diet/tracking', { date, logs });
    return response.data;
};
