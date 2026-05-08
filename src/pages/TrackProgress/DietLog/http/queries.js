import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDietLogsApi, saveDietLogApi, deleteDietLogApi } from './api';
import { QUERY_KEYS } from '../../../../constants/query.constants';
import { toast } from 'sonner';

export const useDietLogsQuery = (planUuid, date, day) => {
    return useQuery({
        queryKey: QUERY_KEYS.PROGRESS.DIET_LOG(planUuid, date, day),
        queryFn: () => getDietLogsApi({ plan_uuid: planUuid, date, day }),
        enabled: !!planUuid && !!date && !!day,
    });
};

export const useSaveDietLogMutation = (planUuid, date, day) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: saveDietLogApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROGRESS.DIET_LOG(planUuid, date, day) });
            toast.success('Diet logs saved successfully');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to save diet logs');
        },
    });
};

export const useDeleteDietLogMutation = (planUuid, date, day) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteDietLogApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROGRESS.DIET_LOG(planUuid, date, day) });
            toast.success('Diet log deleted successfully');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to delete diet log');
        },
    });
};
