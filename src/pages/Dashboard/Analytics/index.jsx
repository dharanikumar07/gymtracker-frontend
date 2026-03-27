import React from 'react';
import { 
    BarChart3,
    Loader2,
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { useOverviewQuery } from './http/analyticsQueries';

import Overview from './Overview';
import FitnessAnalytics from './FitnessAnalytics';
import DietAnalytics from './DietAnalytics';
import ExpenseAnalytics from './ExpenseAnalytics';

const Analytics = () => {
    const [activeTab, setActiveTab] = React.useState('overview');
    const { data, isLoading } = useOverviewQuery();

    const tabs = [
        { id: 'overview', label: 'Overview', icon: BarChart3 },
        { id: 'fitness', label: 'Fitness', icon: BarChart3 },
        { id: 'diet', label: 'Diet', icon: BarChart3 },
        { id: 'expenses', label: 'Expenses', icon: BarChart3 },
    ];

    if (isLoading && !data) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-3" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Loading Analytics...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col p-2 sm:p-4 lg:p-6 font-sans">
            {/* Header */}
            <div className="shrink-0 bg-card border border-border rounded-[2rem] p-3 shadow-sm">
                <div className="flex flex-col gap-4">
                    {/* Tabs */}
                    <div className="flex p-1 bg-secondary/50 rounded-2xl w-full sm:w-fit border border-border/50 shadow-inner mx-auto sm:mx-0 overflow-x-auto no-scrollbar">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
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
                                    <Icon className="w-3.5 h-3.5" />
                                    <span>{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide mt-4">
                {activeTab === 'overview' && <Overview data={data?.data} />}
                {activeTab === 'fitness' && <FitnessAnalytics />}
                {activeTab === 'diet' && <DietAnalytics />}
                {activeTab === 'expenses' && <ExpenseAnalytics />}
            </div>
        </div>
    );
};

export default Analytics;