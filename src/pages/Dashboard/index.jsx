import React from 'react';
import { Loader2 } from 'lucide-react';
import { useDashboardQuery } from './http/queries';

import Header from './components/Header';
import QuickActions from './components/QuickActions';
import TodaySnapshot from './components/TodaySnapshot';
import StreakCard from './components/StreakCard';
import QuickStartChecklist from './components/QuickStartChecklist';
import RecentActivity from './components/RecentActivity';

const Dashboard = () => {
    const { data, isLoading } = useDashboardQuery();
    const dashboardData = data?.data;

    return (
        <div className="h-full flex flex-col bg-secondary/20 font-sans overflow-hidden">
            {isLoading && !dashboardData ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-3" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Loading...</p>
                    </div>
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto scrollbar-hide">
                    <div className="p-4 pb-24 space-y-4 max-w-lg mx-auto">
                        <Header user={dashboardData?.user} />
                        <QuickActions actions={dashboardData?.quick_actions} />
                        <TodaySnapshot today={dashboardData?.today} />
                        <StreakCard streak={dashboardData?.streak} />
                        <QuickStartChecklist quickStart={dashboardData?.quick_start} />
                        <RecentActivity recent={dashboardData?.recent} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
