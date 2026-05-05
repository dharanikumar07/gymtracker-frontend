import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    fetchPlansApi,
    savePlanApi,
    deletePlanApi,
    updatePlanStatusApi,
    fetchDietRoutineApi,
    fetchDietTrackingApi,
    saveDietLogApi,
    fetchAvailableFoodsApi,
    deleteMealSlotApi
} from './api';
import { toast } from 'sonner';

const DIET_KEYS = {
    plans: ['diet', 'plans'],
    routine: (planUuid) => ['diet', 'routine', planUuid],
    tracking: (date) => ['diet', 'tracking', date],
    foods: (type) => ['diet', 'foods', type],
};

export const useDeleteMealSlotMutation = (planUuid) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteMealSlotApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: DIET_KEYS.routine(planUuid) });
            toast.success('Meal deleted successfully');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to delete meal');
        }
    });
};

export const useAvailableFoodsQuery = (type) => {
    return useQuery({
        queryKey: DIET_KEYS.foods(type),
        queryFn: () => fetchAvailableFoodsApi(type),
        staleTime: 1000 * 60 * 60, // 1 hour
    });
};

export const useDietPlansQuery = () => {
    return useQuery({
        queryKey: DIET_KEYS.plans,
        queryFn: () => fetchPlansApi('diet'),
    });
};

export const useSavePlanMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: savePlanApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: DIET_KEYS.plans });
            toast.success('Diet plan saved successfully');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to save diet plan');
        },
    });
};

export const useUpdatePlanStatusMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updatePlanStatusApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: DIET_KEYS.plans });
            // Also invalidate general plans if they are used elsewhere
            queryClient.invalidateQueries({ queryKey: ['plans'] });
            toast.success('Plan status updated');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to update plan status');
        },
    });
};

export const useDeletePlanMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deletePlanApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: DIET_KEYS.plans });
            toast.success('Diet plan deleted successfully');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to delete diet plan');
        },
    });
};

export const useDietRoutineQuery = (planUuid, enabled = true) => {
    return useQuery({
        queryKey: DIET_KEYS.routine(planUuid),
        queryFn: () => fetchDietRoutineApi(planUuid),
        enabled: enabled && !!planUuid,
    });
};

export const useDietTrackingQuery = (date, enabled = true) => {
    return useQuery({
        queryKey: DIET_KEYS.tracking(date),
        queryFn: () => fetchDietTrackingApi(date),
        enabled: enabled && !!date,
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
