import api from '../../../../lib/api';

// ─── Slot-specific APIs (Routine only) ───
export const fetchSlotsApi = async (planUuid) => {
    const response = await api.get(`/workouts/slots?plan_uuid=${planUuid}`);
    return response.data;
};

export const saveSlotsApi = async (payload) => {
    const response = await api.post('/workouts/slots', payload);
    return response.data;
};

export const deleteWorkoutSlotApi = async (uuid) => {
    const response = await api.delete(`/workouts/workout-slot/${uuid}`);
    return response.data;
};
