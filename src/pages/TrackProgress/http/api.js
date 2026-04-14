import api from '../../../lib/api';

// ─── Common Plan APIs (shared across Routine, WorkoutLog, etc.) ───
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

// ─── Routine APIs ───
export const fetchRoutineApi = async (planUuid = null) => {
    const params = planUuid ? { plan_uuid: planUuid } : {};
    const response = await api.get('/routine', { params });
    return response.data;
};

export const fetchRoutineTrackingApi = async (date) => {
    const response = await api.get('/routine/tracking', { params: { date } });
    return response.data;
};

export const updateRoutineApi = async (data) => api.patch('/routine', data);
export const logWorkoutApi = async ({ date, tracking }) => api.post('/routine/tracking', { date, tracking });

// ─── Diet APIs ───
export const fetchDietRoutineApi = async (planUuid = null) => {
    const params = planUuid ? { plan_uuid: planUuid } : {};
    const response = await api.get('/diet/routine', { params });
    return response.data;
};

export const fetchDietTrackingApi = async (date) => {
    const response = await api.get('/diet/tracking', { params: { date } });
    return response.data;
};

export const generateDietPlanApi = async (data) => api.post('/diet/routine', data);
export const updateDietRoutineApi = async (data) => api.patch('/diet/routine', data);
export const logDietApi = async ({ date, logs }) => api.post('/diet/tracking', { date, logs });
