import api from '../../../lib/api';

export const fetchOverviewApi = async (date) => {
    const response = await api.get('/analytics/overview', { params: { date } });
    return response.data;
};

export const fetchWorkoutLogApi = async ({ startDate, endDate }) => {
    const params = {
        start_date: startDate,
        end_date: endDate
    };
    const response = await api.get('/analytics/workout/log', { params });
    return response.data;
};

export const fetchWorkoutInsightsApi = async ({ startDate, endDate }) => {
    const params = {
        start_date: startDate,
        end_date: endDate
    };
    const response = await api.get('/analytics/workout/insights', { params });
    return response.data;
};

export const fetchAvailableExercisesApi = async () => {
    const response = await api.get('/analytics/workout/available-exercises');
    return response.data;
};

export const fetchProgressiveOverloadApi = async ({ exerciseUuid, periodType, lookback }) => {
    const params = {
        exercise_uuid: exerciseUuid,
        period_type: periodType,
        lookback: lookback
    };
    const response = await api.get('/analytics/workout/progressive-overload', { params });
    return response.data;
};

export const fetchMuscleDistributionApi = async ({ periodType, lookback }) => {
    const params = {
        period_type: periodType,
        lookback: lookback
    };
    const response = await api.get('/analytics/workout/muscle-distribution', { params });
    return response.data;
};
