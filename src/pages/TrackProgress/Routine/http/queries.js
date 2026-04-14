import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchSlotsApi, saveSlotsApi, deleteWorkoutSlotApi } from './api';
import { QUERY_KEYS } from '../../../../constants/query.constants';
import { toast } from 'sonner';

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
