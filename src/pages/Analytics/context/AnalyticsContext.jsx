import React, { createContext, useContext, useState } from 'react';
import { format } from 'date-fns';

const AnalyticsContext = createContext();

export const AnalyticsProvider = ({ children }) => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const formattedDate = format(selectedDate, 'yyyy-MM-dd');

    const value = {
        selectedDate,
        setSelectedDate,
        formattedDate
    };

    return (
        <AnalyticsContext.Provider value={value}>
            {children}
        </AnalyticsContext.Provider>
    );
};

export const useAnalytics = () => {
    const context = useContext(AnalyticsContext);
    if (!context) {
        throw new Error('useAnalytics must be used within an AnalyticsProvider');
    }
    return context;
};
