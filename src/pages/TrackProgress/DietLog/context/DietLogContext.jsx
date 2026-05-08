import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { usePlansQuery } from '../../../TrackProgress/http/queries';
import { useDietLogsQuery, useSaveDietLogMutation, useDeleteDietLogMutation } from '../http/queries';
import { format, startOfWeek, addDays } from 'date-fns';

const DietLogContext = createContext();

export const DietLogProvider = ({ children }) => {
    // 1. Fetch active diet plan
    const { data: plansData, isLoading: isLoadingPlans } = usePlansQuery('diet', true);
    
    const activePlan = useMemo(() => {
        const plans = plansData?.data || [];
        return plans.length > 0 ? plans[0] : null;
    }, [plansData]);

    const activePlanUuid = activePlan?.uuid;

    const [selectedDate, setSelectedDate] = useState(new Date());
    const [extraMeals, setExtraMeals] = useState([]);
    
    const selectedDay = useMemo(() => {
        return format(selectedDate, 'eee').toLowerCase();
    }, [selectedDate]);

    // Clear extra meals when date changes
    useEffect(() => {
        setExtraMeals([]);
    }, [selectedDate]);

    // 2. Fetch logs for the active plan
    const formattedDate = format(selectedDate, 'yyyy-MM-dd');
    const { data: logsData, isLoading: isLoadingLogs } = useDietLogsQuery(activePlanUuid, formattedDate, selectedDay);
    
    // 3. Mutation to save logs
    const saveLogsMutation = useSaveDietLogMutation(activePlanUuid, formattedDate, selectedDay);

    // 4. Mutation to delete logs
    const deleteLogsMutation = useDeleteDietLogMutation(activePlanUuid, formattedDate, selectedDay);

    const weekDates = useMemo(() => {
        const start = startOfWeek(selectedDate, { weekStartsOn: 1 });
        return Array.from({ length: 7 }).map((_, i) => addDays(start, i));
    }, [selectedDate]);

    const handleAddMeal = () => {
        const newMeal = {
            uuid: `extra-${Math.random().toString(36).substr(2, 9)}`,
            meal_name: '',
            time_period: 'breakfast',
            day: selectedDay,
            food_data: [],
            calories: 0,
            protein: 0,
            carbs: 0,
            fats: 0,
            isExtra: true
        };
        setExtraMeals(prev => [newMeal, ...prev]);
    };

    const removeExtraMeal = (uuid) => {
        setExtraMeals(prev => prev.filter(m => m.uuid !== uuid));
    };

    const saveLog = (logs, options) => {
        saveLogsMutation.mutate({
            date: formattedDate,
            day: selectedDay,
            plan_uuid: activePlanUuid,
            logs
        }, {
            ...options,
            onSuccess: (...args) => {
                // Remove the extra meal from state if it was saved
                const savedMealUuids = logs.map(l => l.meal_plan_uuid);
                setExtraMeals(prev => prev.filter(m => !savedMealUuids.includes(m.uuid)));
                options?.onSuccess?.(...args);
            }
        });
    };

    const deleteLog = (uuid, options) => {
        deleteLogsMutation.mutate(uuid, options);
    };

    const value = {
        activePlan,
        logs: logsData?.data?.data || [],
        pending: [...extraMeals, ...(logsData?.data?.pending || [])],
        totalTargets: logsData?.data?.total_targets,
        summary: logsData?.data?.summary,
        isLoading: isLoadingPlans || isLoadingLogs,
        selectedDate,
        setSelectedDate,
        selectedDay,
        weekDates,
        saveLog,
        deleteLog,
        handleAddMeal,
        removeExtraMeal,
        isSaving: saveLogsMutation.isPending || deleteLogsMutation.isPending
    };

    return (
        <DietLogContext.Provider value={value}>
            {children}
        </DietLogContext.Provider>
    );
};

export const useDietLog = () => {
    const context = useContext(DietLogContext);
    if (!context) {
        throw new Error('useDietLog must be used within a DietLogProvider');
    }
    return context;
};
