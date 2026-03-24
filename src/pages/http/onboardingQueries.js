import { useMutation } from '@tanstack/react-query';
import { completeOnboardingApi } from './onboardingApi';

export const useCompleteOnboardingMutation = (onSuccess, onError) =>
  useMutation({
    mutationFn: completeOnboardingApi,
    onSuccess,
    onError,
  });
