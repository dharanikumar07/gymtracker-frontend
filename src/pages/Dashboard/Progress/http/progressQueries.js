import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../../lib/api';
import { toast } from 'sonner';

export const PROGRESS_KEYS = {
    routine: ['progress', 'routine'],
    routine_tracking: (date) => ['progress', 'routine-tracking', date],
    diet_routine: (planUuid) => ['progress', 'diet-routine', planUuid],
    diet_tracking: (date) => ['progress', 'diet-tracking', date],
};

/**
 * Hook for Routine Data (used in Routine management and Progress)
 */
export const useRoutineQuery = (planUuid = null) => {
    return useQuery({
        queryKey: planUuid ? [...PROGRESS_KEYS.routine, planUuid] : PROGRESS_KEYS.routine,
        queryFn: async () => {
            const params = planUuid ? { plan_uuid: planUuid } : {};
            const response = await api.get('/routine', { params });
            return response.data;
        },
    });
};

/**
 * Hook for Routine Tracking Data
 */
export const useRoutineTrackingQuery = (date) => {
    return useQuery({
        queryKey: PROGRESS_KEYS.routine_tracking(date),
        queryFn: async () => {
            const response = await api.get('/routine/tracking', { params: { date } });
            return response.data;
        },
        enabled: !!date,
    });
};

/**
 * Hook for Diet Routine Data
 */
export const useDietRoutineQuery = (planUuid = null) => {
    return useQuery({
        queryKey: PROGRESS_KEYS.diet_routine(planUuid),
        queryFn: async () => {
            const params = planUuid ? { plan_uuid: planUuid } : {};
            const response = await api.get('/diet/routine', { params });
            return response.data;
        },
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
        queryKey: PROGRESS_KEYS.diet_tracking(date),
        queryFn: async () => {
            const response = await api.get('/diet/tracking', { params: { date } });
            return response.data;
        },
        enabled: !!date,
    });
};

/**
 * Mutation for updating Routine
 */
export const useUpdateRoutineMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => api.patch('/routine', data),
        onSuccess: () => {
            toast.success("Routine committed to Atlas");
            queryClient.invalidateQueries({ queryKey: PROGRESS_KEYS.routine });
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
        mutationFn: ({ date, tracking }) => api.post('/routine/tracking', { date, tracking }),
        onSuccess: (_, variables) => {
            toast.success("Logs committed to Atlas");
            queryClient.invalidateQueries({ queryKey: PROGRESS_KEYS.routine_tracking(variables.date) });
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
        mutationFn: (data) => api.post('/diet/routine', data),
        onSuccess: () => {
            toast.success("Protocol generated successfully");
            queryClient.invalidateQueries({ queryKey: ['progress', 'diet-routine'] });
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
        mutationFn: (data) => api.patch('/diet/routine', data),
        onSuccess: () => {
            toast.success("Diet routine saved");
            queryClient.invalidateQueries({ queryKey: ['progress', 'diet-routine'] });
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
        mutationFn: ({ date, logs }) => api.post('/diet/tracking', { date, logs }),
        onSuccess: (_, variables) => {
            toast.success("Diet logs committed successfully");
            queryClient.invalidateQueries({ queryKey: PROGRESS_KEYS.diet_tracking(variables.date) });
        },
        onError: () => toast.error("Failed to save progress"),
    });
};

