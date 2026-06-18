import React from 'react';
import { Loader2 } from 'lucide-react';
import { useDashboardQuery } from './http/queries';
import { useAuthStore } from '../../store/authStore';
import { usePwaInstallToast } from '../../hooks/usePwaInstallToast';

import Greeting from './components/Greeting';
import QuickActions from './components/QuickActions';
import Stats from './components/Stats';
import SetupChecklist from './components/SetupChecklist';
import RecentActivity from './components/RecentActivity';
import WeeklyChart from './components/WeeklyChart';

const Dashboard = () => {
    const { data, isLoading } = useDashboardQuery();
    const d = data?.data;
    const { user } = useAuthStore();
    usePwaInstallToast();

    if (isLoading && !d) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto scrollbar-hide no-scrollbar">
            <div className="px-6 sm:px-10 lg:px-14 py-6 space-y-5 max-w-[1100px] mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <Greeting name={user?.name || d?.user?.name} />
                    <QuickActions />
                </div>

                <Stats today={d?.today} streak={d?.streak} />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    <SetupChecklist />
                    <RecentActivity recent={d?.recent} />
                </div>

                <WeeklyChart data={d?.weekly_chart} />
            </div>
        </div>
    );
};

export default Dashboard;
