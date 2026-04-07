import api from '../../../lib/api';

export const fetchProfileInformationApi = async () => {
  const response = await api.get('/onboarding/profile-information');
  return response.data;
};

export const saveProfileInformationApi = async (data) => {
  const response = await api.post('/onboarding/profile-information', data);
  return response.data;
};

export const fetchPhysicalActivityApi = async (activityType) => {
  const response = await api.get('/workouts/physical-activity', {
    params: { type: activityType },
  });
  return response.data;
};

export const savePhysicalActivityApi = async (data) => {
  const response = await api.post('/workouts/physical-activity', data);
  return response.data;
};

export const deleteWorkoutSlotApi = async (uuid) => {
  const response = await api.delete(`/workouts/workout-slot/${uuid}`);
  return response.data;
};

export const completeOnboardingApi = async (payload) => {
  const response = await api.post('/onboarding/complete', payload);
  return response.data;
};
