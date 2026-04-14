import React, { createContext, useContext, useState, useMemo } from 'react';
import { useDietRoutineQuery, useDietTrackingQuery, useSaveDietLogMutation } from '../http/queries';
import { format, startOfWeek, addDays } from 'date-fns';

const DietContext = createContext();

export const DietProvider = ({ children }) => {
    const [selectedDate, setSelectedDate] = useState(new Date());

    const formattedDate = format(selectedDate, 'yyyy-MM-dd');
    const selectedDay = useMemo(() => format(selectedDate, 'eee').toLowerCase(), [selectedDate]);

    // Fetch diet routine (active plan + meal items)
    const { data: routineData, isLoading: isLoadingRoutine } = useDietRoutineQuery();

    // Fetch tracking data for selected date
    const { data: trackingData, isLoading: isLoadingTracking, isFetching } = useDietTrackingQuery(formattedDate);

    // Save mutation
    const saveLogMutation = useSaveDietLogMutation(formattedDate);

    const plan = routineData?.plan || null;
    const availablePlans = routineData?.available_plans || [];
    const meals = trackingData?.meals || { breakfast: [], lunch: [], dinner: [], snack: [] };

    // Calculate consumed totals from logged items
    const consumed = useMemo(() => {
        let calories = 0, protein = 0, carbs = 0, fats = 0;
        Object.values(meals).forEach(items => {
            items.forEach(item => {
                if (item.logged) {
                    calories += item.logged.calories || 0;
                    protein += item.logged.macros?.p || 0;
                    carbs += item.logged.macros?.c || 0;
                    fats += item.logged.macros?.f || 0;
                }
            });
        });
        return { calories, protein, carbs, fats };
    }, [meals]);

    // Week dates for day selector
    const weekDates = useMemo(() => {
        const start = startOfWeek(selectedDate, { weekStartsOn: 1 });
        return Array.from({ length: 7 }).map((_, i) => addDays(start, i));
    }, [selectedDate]);

    const saveLog = (logs, callbacks = {}) => {
        saveLogMutation.mutate({ date: formattedDate, logs }, callbacks);
    };

    const value = {
        plan,
        availablePlans,
        meals,
        consumed,
        isLoading: isLoadingRoutine || isLoadingTracking,
        isFetching,
        selectedDate,
        setSelectedDate,
        selectedDay,
        formattedDate,
        weekDates,
        saveLog,
        isSaving: saveLogMutation.isPending,
    };

    return (
        <DietContext.Provider value={value}>
            {children}
        </DietContext.Provider>
    );
};

export const useDiet = () => {
    const context = useContext(DietContext);
    if (!context) {
        throw new Error('useDiet must be used within a DietProvider');
    }
    return context;
};
