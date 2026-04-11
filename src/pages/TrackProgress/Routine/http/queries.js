import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    fetchPlansApi,
    savePlanApi,
    deletePlanApi,
    fetchSlotsApi,
    saveSlotsApi,
    deleteWorkoutSlotApi
} from './api';
import { QUERY_KEYS } from '../../../../constants/query.constants';
import { toast } from 'sonner';

export const usePlansQuery = (type = 'physical_activity') => {
    return useQuery({
        queryKey: [QUERY_KEYS.PROGRESS.ROUTINE, 'plans', type],
        queryFn: () => fetchPlansApi(type),
    });
};

export const useSavePlanMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: savePlanApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PROGRESS.ROUTINE, 'plans'] });
            toast.success('Plan saved successfully');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to save plan');
        },
    });
};

export const useDeletePlanMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deletePlanApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PROGRESS.ROUTINE, 'plans'] });
            toast.success('Plan deleted successfully');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to delete plan');
        },
    });
};

export const useSlotsQuery = (planUuid) => {
    return useQuery({
        queryKey: [QUERY_KEYS.PROGRESS.ROUTINE, 'slots', planUuid],
        queryFn: () => fetchSlotsApi(planUuid),
        enabled: !!planUuid,
    });
};

export const useSaveSlotsMutation = (planUuid) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: saveSlotsApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PROGRESS.ROUTINE, 'slots', planUuid] });
            toast.success('Slots saved successfully');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to save slots');
        },
    });
};

export const useDeleteWorkoutSlotMutation = (planUuid) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteWorkoutSlotApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PROGRESS.ROUTINE, 'slots', planUuid] });
            toast.success('Workout deleted successfully');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to delete workout');
        },
    });
};
