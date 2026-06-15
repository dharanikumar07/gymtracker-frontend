import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    fetchPlansApi,
    savePlanApi,
    deletePlanApi,
    fetchRoutineApi,
    fetchRoutineTrackingApi,
    updateRoutineApi,
    logWorkoutApi,
} from './api';
import { QUERY_KEYS } from '../../../constants/query.constants';
import { toast } from 'sonner';

// ─── Common Plan Queries ───
export const usePlansQuery = (type = 'physical_activity', is_active = null) => {
    return useQuery({
        queryKey: [QUERY_KEYS.PROGRESS.ROUTINE, 'plans', type, is_active],
        queryFn: () => fetchPlansApi(type, is_active),
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

// ─── Routine Queries ───
export const useRoutineQuery = () => {
    return useQuery({
        queryKey: QUERY_KEYS.PROGRESS.ROUTINE,
        queryFn: () => fetchRoutineApi(),
    });
};

export const useRoutineTrackingQuery = (date) => {
    return useQuery({
        queryKey: QUERY_KEYS.PROGRESS.ROUTINE_TRACKING(date),
        queryFn: () => fetchRoutineTrackingApi(date),
        enabled: !!date,
    });
};

export const useUpdateRoutineMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateRoutineApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROGRESS.ROUTINE });
            toast.success('Routine updated successfully');
        },
        onError: (error) => toast.error(error.response?.data?.errors || 'Failed to update routine'),
    });
};

export const useLogWorkoutMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: logWorkoutApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROGRESS.ROUTINE_TRACKING() });
            toast.success('Workout logged successfully');
        },
        onError: (error) => toast.error(error.response?.data?.errors || 'Failed to log workout'),
    });
};
