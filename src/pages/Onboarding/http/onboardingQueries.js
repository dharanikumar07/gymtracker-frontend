import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  fetchProfileInformationApi, 
  saveProfileInformationApi,
  fetchPhysicalActivityApi, 
  completeOnboardingApi 
} from './onboardingApi';
import { QUERY_KEYS } from '../../../constants/query.constants';
import { toast } from 'sonner';

export const useProfileInformationQuery = () => {
  return useQuery({
    queryKey: QUERY_KEYS.ONBOARDING.PROFILE,
    queryFn: () => fetchProfileInformationApi(),
  });
};

export const useSaveProfileInformationMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveProfileInformationApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ONBOARDING.PROFILE });
      toast.success('Profile information saved successfully');
    },
    onError: (error) => {
      const errors = error.response?.data?.errors;
      if (errors) {
        const firstError = Object.values(errors).flat()[0];
        toast.error(firstError);
      } else {
        toast.error(error.response?.data?.message || 'Failed to save profile information');
      }
    },
  });
};

export const usePhysicalActivityQuery = (activityType) => {
  return useQuery({
    queryKey: QUERY_KEYS.ONBOARDING.PHYSICAL_ACTIVITY(activityType),
    queryFn: () => fetchPhysicalActivityApi(activityType),
    enabled: !!activityType,
  });
};

export const useCompleteOnboardingMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: completeOnboardingApi,
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast.success('Onboarding completed successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to complete onboarding');
    },
  });
};
