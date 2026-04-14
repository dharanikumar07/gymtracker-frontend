import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { usePlansQuery } from '../../../TrackProgress/http/queries';
import { useLogsQuery, useSaveLogsMutation, useDeleteSlotMutation } from '../http/queries';
import { format, startOfWeek, addDays } from 'date-fns';

const WorkoutLogContext = createContext();

export const WorkoutLogProvider = ({ children }) => {
    // 1. Fetch active physical activity plan
    const { data: plansData, isLoading: isLoadingPlans } = usePlansQuery('physical_activity', true);
    
    // Choose the first active plan if multiple exist
    const activePlan = useMemo(() => {
        const plans = plansData?.data || [];
        return plans.length > 0 ? plans[0] : null;
    }, [plansData]);

    const activePlanUuid = activePlan?.uuid;

    const [selectedDate, setSelectedDate] = useState(new Date());
    
    const selectedDay = useMemo(() => {
        return format(selectedDate, 'eee').toLowerCase();
    }, [selectedDate]);

    // 2. Fetch logs for the active plan (Includes data and pending)
    const formattedDate = format(selectedDate, 'yyyy-MM-dd');
    const { data: logsData, isLoading: isLoadingLogs } = useLogsQuery(activePlanUuid, formattedDate, selectedDay);
    
    // 3. Mutation to save logs
    const saveLogsMutation = useSaveLogsMutation(activePlanUuid, formattedDate, selectedDay);
    const deleteSlotMutation = useDeleteSlotMutation(activePlanUuid, formattedDate, selectedDay);

    // Calculate the current week dates based on selectedDate
    const weekDates = useMemo(() => {
        const start = startOfWeek(selectedDate, { weekStartsOn: 1 }); // Start on Monday
        return Array.from({ length: 7 }).map((_, i) => addDays(start, i));
    }, [selectedDate]);

    const saveLog = (logs, options) => {
        saveLogsMutation.mutate({
            activity_date: formattedDate,
            day: selectedDay,
            plan_uuid: activePlanUuid,
            logs
        }, options);
    };

    const deleteSlot = (slotUuid, options) => {
        deleteSlotMutation.mutate(slotUuid, options);
    };

    const value = {
        activePlan,
        logs: logsData?.data || [],
        pending: logsData?.pending || [],
        summary: logsData?.summary,
        metricsDefaults: logsData?.metrics_defaults,
        isLoading: isLoadingPlans || isLoadingLogs,
        selectedDate,
        setSelectedDate,
        selectedDay,
        weekDates,
        saveLog,
        deleteSlot,
        isSaving: saveLogsMutation.isPending || deleteSlotMutation.isPending
    };

    return (
        <WorkoutLogContext.Provider value={value}>
            {children}
        </WorkoutLogContext.Provider>
    );
};

export const useWorkoutLog = () => {
    const context = useContext(WorkoutLogContext);
    if (!context) {
        throw new Error('useWorkoutLog must be used within a WorkoutLogProvider');
    }
    return context;
};
