import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  fetchProfileInformationApi, 
  saveProfileInformationApi,
  fetchPhysicalActivityApi, 
  savePhysicalActivityApi,
  deleteWorkoutSlotApi,
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

export const useSavePhysicalActivityMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: savePhysicalActivityApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ONBOARDING.PHYSICAL_ACTIVITY() });
      toast.success('Weekly routine saved successfully');
    },
    onError: (error) => {
      const errors = error.response?.data?.errors;
      if (errors) {
        const firstError = Object.values(errors).flat()[0];
        toast.error(firstError);
      } else {
        toast.error(error.response?.data?.message || 'Failed to save weekly routine');
      }
    },
  });
};

export const useDeleteWorkoutSlotMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteWorkoutSlotApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ONBOARDING.PHYSICAL_ACTIVITY() });
      toast.success('Workout deleted successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete workout');
    },
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
