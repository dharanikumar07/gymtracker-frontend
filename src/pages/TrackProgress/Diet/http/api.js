import api from '../../../../lib/api';
import { fetchPlansApi, savePlanApi, deletePlanApi, updatePlanStatusApi } from '../../../http/api';

export { fetchPlansApi, savePlanApi, deletePlanApi, updatePlanStatusApi };

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
