import api from '../../../../lib/api';

export const fetchLogsApi = async (planUuid, date, day) => {
    const response = await api.get(`/workouts/log?plan_uuid=${planUuid}&activity_date=${date}&day=${day}`);
    return response.data;
};

export const saveLogsApi = async (payload) => {
    const response = await api.post('/workouts/log', payload);
    return response.data;
};

export const deleteSlotApi = async (uuid) => {
    const response = await api.delete(`/workouts/workout-slot/${uuid}`);
    return response.data;
};
