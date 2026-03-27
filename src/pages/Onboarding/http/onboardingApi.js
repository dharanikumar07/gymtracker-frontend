import api from '../../../lib/api';

export const fetchPhysicalActivityApi = async (activityType) => {
  const response = await api.get('/onboarding/physical-activity', {
    params: { type: activityType },
  });
  return response.data;
};

export const completeOnboardingApi = async (payload) => {
  const response = await api.post('/onboarding/complete', payload);
  return response.data;
};
