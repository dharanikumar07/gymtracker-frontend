import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { QUERY_KEYS } from '../../../../constants/query.constants';
import {
    fetchDietRoutineApi,
    fetchDietTrackingApi,
    fetchRoutineApi,
    fetchRoutineTrackingApi,
    generateDietPlanApi,
    logDietApi,
    logWorkoutApi,
    updateDietRoutineApi,
    updateRoutineApi,
} from './progressApi';

/**
 * Hook for Routine Data (used in Routine management and Progress)
 */
export const useRoutineQuery = (planUuid = null) => {
    return useQuery({
        queryKey: planUuid ? QUERY_KEYS.PROGRESS.ROUTINE_BY_PLAN(planUuid) : QUERY_KEYS.PROGRESS.ROUTINE,
        queryFn: () => fetchRoutineApi(planUuid),
    });
};

/**
 * Hook for Routine Tracking Data
 */
export const useRoutineTrackingQuery = (date) => {
    return useQuery({
        queryKey: QUERY_KEYS.PROGRESS.ROUTINE_TRACKING(date),
        queryFn: () => fetchRoutineTrackingApi(date),
        enabled: !!date,
    });
};

/**
 * Hook for Diet Routine Data
 */
export const useDietRoutineQuery = (planUuid = null) => {
    return useQuery({
        queryKey: QUERY_KEYS.PROGRESS.DIET_ROUTINE(planUuid),
        queryFn: () => fetchDietRoutineApi(planUuid),
        retry: (failureCount, error) => {
            // Don't retry if 404 (needs setup)
            if (error.response?.status === 404) return false;
            return failureCount < 3;
        },
    });
};

/**
 * Hook for Diet Tracking Data
 */
export const useDietTrackingQuery = (date) => {
    return useQuery({
        queryKey: QUERY_KEYS.PROGRESS.DIET_TRACKING(date),
        queryFn: () => fetchDietTrackingApi(date),
        enabled: !!date,
    });
};

/**
 * Mutation for updating Routine
 */
export const useUpdateRoutineMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateRoutineApi,
        onSuccess: () => {
            toast.success("Routine committed to Atlas");
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROGRESS.ROUTINE });
        },
        onError: () => toast.error("Failed to save routine changes"),
    });
};

/**
 * Mutation for logging Workout
 */
export const useLogWorkoutMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: logWorkoutApi,
        onSuccess: (_, variables) => {
            toast.success("Logs committed to Atlas");
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROGRESS.ROUTINE_TRACKING(variables.date) });
        },
        onError: () => toast.error("Committal failed"),
    });
};

/**
 * Mutation for generating Diet Plan
 */
export const useGenerateDietPlanMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: generateDietPlanApi,
        onSuccess: () => {
            toast.success("Protocol generated successfully");
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROGRESS.DIET_ROUTINE(null) });
        },
        onError: () => toast.error("Calculation engine error"),
    });
};

/**
 * Mutation for updating Diet Routine
 */
export const useUpdateDietRoutineMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateDietRoutineApi,
        onSuccess: () => {
            toast.success("Diet routine saved");
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROGRESS.DIET_ROUTINE(null) });
        },
        onError: () => toast.error("Failed to save diet routine"),
    });
};

/**
 * Mutation for logging Diet
 */
export const useLogDietMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: logDietApi,
        onSuccess: (_, variables) => {
            toast.success("Diet logs committed successfully");
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROGRESS.DIET_TRACKING(variables.date) });
        },
        onError: () => toast.error("Failed to save progress"),
    });
};

