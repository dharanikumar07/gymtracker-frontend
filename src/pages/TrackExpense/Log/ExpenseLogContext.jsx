import React, { createContext, useContext, useState } from 'react';
import { format } from 'date-fns';
import { 
    useExpenseLogQuery, 
    useAvailableCategoriesQuery, 
    useLogExpenseMutation, 
    useDeleteExpenseLogMutation 
} from './http/queries';

const ExpenseLogContext = createContext();

export const ExpenseLogProvider = ({ children, isActive }) => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [activeEdits, setActiveEdits] = useState(new Set());
    const [hasStagedLogs, setHasStagedLogs] = useState(false);
    
    const formattedDate = format(selectedDate, 'yyyy-MM-dd');

    const { data: logData, isLoading: isLogLoading } = useExpenseLogQuery(formattedDate, { 
        enabled: isActive 
    });
    const planUuid = logData?.plan_summary?.plan_uuid;
    const { data: availableCategories, isLoading: isCatLoading } = useAvailableCategoriesQuery(planUuid, { 
        enabled: isActive && !!planUuid 
    });
    
    const logExpenseMutation = useLogExpenseMutation(planUuid);
    const deleteLogMutation = useDeleteExpenseLogMutation(planUuid);

    const setEditing = (id, isEditing) => {
        setActiveEdits(prev => {
            const next = new Set(prev);
            if (isEditing) next.add(id);
            else next.delete(id);
            return next;
        });
    };

    const clearUnsavedChanges = () => {
        setActiveEdits(new Set());
        setHasStagedLogs(false);
    };

    const value = {
        selectedDate,
        setSelectedDate,
        formattedDate,
        logData,
        availableCategories,
        isLoading: isLogLoading || isCatLoading,
        logExpense: logExpenseMutation.mutate,
        isLogging: logExpenseMutation.isPending,
        deleteLog: deleteLogMutation.mutate,
        isDeleting: deleteLogMutation.isPending,
        hasUnsavedChanges: activeEdits.size > 0 || hasStagedLogs,
        setEditing,
        setHasStagedLogs,
        clearUnsavedChanges
    };

    return (
        <ExpenseLogContext.Provider value={value}>
            {children}
        </ExpenseLogContext.Provider>
    );
};

export const useExpenseLog = () => {
    const context = useContext(ExpenseLogContext);
    if (!context) {
        throw new Error('useExpenseLog must be used within an ExpenseLogProvider');
    }
    return context;
};
