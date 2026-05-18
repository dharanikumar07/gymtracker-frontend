import React, { createContext, useContext, useState } from 'react';
import { format } from 'date-fns';
import { 
    useExpenseLogQuery, 
    useAvailableCategoriesQuery, 
    useLogExpenseMutation, 
    useDeleteExpenseLogMutation 
} from './http/queries';

const ExpenseLogContext = createContext();

export const ExpenseLogProvider = ({ children }) => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const formattedDate = format(selectedDate, 'yyyy-MM-dd');

    const { data: logData, isLoading: isLogLoading } = useExpenseLogQuery(formattedDate);
    const planUuid = logData?.plan_summary?.plan_uuid;
    const { data: availableCategories, isLoading: isCatLoading } = useAvailableCategoriesQuery(planUuid);
    
    const logExpenseMutation = useLogExpenseMutation();
    const deleteLogMutation = useDeleteExpenseLogMutation();

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
        isDeleting: deleteLogMutation.isPending
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
