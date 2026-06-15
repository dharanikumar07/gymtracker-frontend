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

