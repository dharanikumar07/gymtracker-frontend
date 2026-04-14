import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchLogsApi, saveLogsApi, deleteSlotApi } from './api';
import { QUERY_KEYS } from '../../../../constants/query.constants';
import { toast } from 'sonner';

export const useLogsQuery = (planUuid, date, day) => {
    return useQuery({
        queryKey: [QUERY_KEYS.PROGRESS.ROUTINE, 'logs', planUuid, date, day],
        queryFn: () => fetchLogsApi(planUuid, date, day),
        enabled: !!planUuid && !!date && !!day,
    });
};

export const useSaveLogsMutation = (planUuid, date, day) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: saveLogsApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PROGRESS.ROUTINE, 'logs', planUuid, date, day] });
            toast.success('Workout logs saved successfully');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to save workout logs');
        },
    });
};

export const useDeleteSlotMutation = (planUuid, date, day) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteSlotApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PROGRESS.ROUTINE, 'logs', planUuid, date, day] });
            toast.success('Workout exercise deleted successfully');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to delete exercise');
        },
    });
};
