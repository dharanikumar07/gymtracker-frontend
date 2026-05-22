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
    const [stagedLogs, setStagedLogs] = useState([]);
    const [editedLogs, setEditedLogs] = useState({});
    
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

    // Reset staging when date changes
    React.useEffect(() => {
        setStagedLogs([]);
        setEditedLogs({});
    }, [formattedDate]);

    const addStagedLog = (data) => {
        setStagedLogs(prev => [...prev, {
            ...data,
            tempId: `temp-${Date.now()}`
        }]);
    };

    const updateStagedLog = (tempId, updates) => {
        setStagedLogs(prev => prev.map(log => 
            log.tempId === tempId ? { ...log, ...updates } : log
        ));
    };

    const deleteStagedLog = (tempId) => {
        setStagedLogs(prev => prev.filter(log => log.tempId !== tempId));
    };

    const updateExistingLog = (uuid, updates) => {
        const originalLog = logData?.daily_logs?.find(l => l.uuid === uuid);
        if (!originalLog) return;

        // Check if anything actually changed
        const hasChanges = Object.keys(updates).some(key => updates[key] !== originalLog[key]);

        setEditedLogs(prev => {
            const next = { ...prev };
            if (hasChanges) {
                next[uuid] = { ...originalLog, ...updates };
            } else {
                delete next[uuid];
            }
            return next;
        });
    };

    const clearUnsavedChanges = () => {
        setStagedLogs([]);
        setEditedLogs({});
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
        stagedLogs,
        editedLogs,
        addStagedLog,
        updateStagedLog,
        deleteStagedLog,
        updateExistingLog,
        hasUnsavedChanges: stagedLogs.length > 0 || Object.keys(editedLogs).length > 0,
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
