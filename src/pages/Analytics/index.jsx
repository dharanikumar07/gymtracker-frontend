import React, { useState } from 'react';
import { BarChart3, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useOverviewQuery } from './http/queries';

import OverviewAnalytics from './components/OverviewAnalytics';
import FitnessAnalytics from './components/FitnessAnalytics';
import DietAnalytics from './components/DietAnalytics';
import ExpenseAnalytics from './components/ExpenseAnalytics';

const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'fitness', label: 'Fitness' },
    { id: 'diet', label: 'Diet' },
    { id: 'expenses', label: 'Expenses' },
];

const Analytics = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const { data, isLoading } = useOverviewQuery();

    return (
        <div className="h-full flex flex-col p-2 sm:p-4 lg:p-6 font-sans">
            <div className="shrink-0 bg-card border border-border rounded-[2rem] p-3 shadow-sm">
                <div className="flex flex-col gap-4">
                    <div className="flex p-1 bg-secondary/50 rounded-2xl w-full sm:w-fit border border-border/50 shadow-inner mx-auto sm:mx-0 overflow-x-auto no-scrollbar">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "flex items-center justify-center gap-2 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap",
                                    activeTab === tab.id 
                                        ? "bg-primary text-white shadow-lg shadow-primary/20 scale-105" 
                                        : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                                )}
                            >
                                <BarChart3 className="w-3.5 h-3.5" />
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide mt-4">
                {activeTab === 'overview' && <OverviewAnalytics data={data?.data} />}
                {activeTab === 'fitness' && <FitnessAnalytics />}
                {activeTab === 'diet' && <DietAnalytics />}
                {activeTab === 'expenses' && <ExpenseAnalytics />}
            </div>
        </div>
    );
};

export default Analytics;
