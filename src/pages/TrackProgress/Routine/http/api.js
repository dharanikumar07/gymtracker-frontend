import api from '../../../../lib/api';

export const fetchPlansApi = async (type) => {
    const response = await api.get(`/plans?type=${type}`);
    return response.data;
};

export const savePlanApi = async (payload) => {
    const response = await api.post('/plans', payload);
    return response.data;
};

export const fetchSlotsApi = async (planUuid) => {
    const response = await api.get(`/workouts/slots?plan_uuid=${planUuid}`);
    return response.data;
};

export const saveSlotsApi = async (payload) => {
    const response = await api.post('/workouts/slots/save', payload);
    return response.data;
};

export const deletePlanApi = async (uuid) => {
    const response = await api.delete(`/plans/${uuid}`);
    return response.data;
};

export const deleteWorkoutSlotApi = async (uuid) => {
    const response = await api.delete(`/workouts/workout-slot/${uuid}`);
    return response.data;
};
