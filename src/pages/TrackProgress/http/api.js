import api from '../../../lib/api';
import { fetchPlansApi, savePlanApi, deletePlanApi } from '../../http/api';

export { fetchPlansApi, savePlanApi, deletePlanApi };

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
