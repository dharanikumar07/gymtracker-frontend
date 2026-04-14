import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    fetchDietRoutineApi,
    fetchDietTrackingApi,
    generateDietPlanApi,
    setActiveDietPlanApi,
    saveDietLogApi,
} from './api';
import { toast } from 'sonner';

const DIET_KEYS = {
    routine: (planUuid) => ['diet', 'routine', planUuid],
    tracking: (date) => ['diet', 'tracking', date],
};

export const useDietRoutineQuery = (planUuid = null) => {
    return useQuery({
        queryKey: DIET_KEYS.routine(planUuid),
        queryFn: () => fetchDietRoutineApi(planUuid),
    });
};

export const useDietTrackingQuery = (date) => {
    return useQuery({
        queryKey: DIET_KEYS.tracking(date),
        queryFn: () => fetchDietTrackingApi(date),
        enabled: !!date,
    });
};

export const useGenerateDietPlanMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: generateDietPlanApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['diet'] });
            toast.success('Diet plan generated successfully');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to generate diet plan');
        },
    });
};

export const useSetActivePlanMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: setActiveDietPlanApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['diet'] });
            toast.success('Plan activated');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to switch plan');
        },
    });
};

export const useSaveDietLogMutation = (date) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: saveDietLogApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: DIET_KEYS.tracking(date) });
            toast.success('Diet logged successfully');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to save diet log');
        },
    });
};
