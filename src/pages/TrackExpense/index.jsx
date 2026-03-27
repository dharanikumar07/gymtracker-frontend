import React, { useState } from 'react';
import { LayoutDashboard, Activity } from 'lucide-react';
import { cn } from '../../lib/utils';

import Manage from './components/Manage';
import Track from './components/Track';

const tabs = [
    { id: 'manage', label: 'Manage', icon: LayoutDashboard },
    { id: 'track', label: 'Track', icon: Activity },
];

const TrackExpense = () => {
    const [activeTab, setActiveTab] = useState('track');

    return (
        <div className="h-full flex flex-col p-2 sm:p-4 lg:p-6 font-sans">
            <div className="shrink-0 bg-card border border-border rounded-[2rem] p-3 shadow-sm">
                <div className="flex p-1 bg-secondary/50 rounded-2xl w-full overflow-x-auto no-scrollbar border border-border/50 shadow-inner">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "flex items-center justify-center gap-2 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap flex-1",
                                    isActive 
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

            <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide mt-4">
                {activeTab === 'manage' && <Manage />}
                {activeTab === 'track' && <Track />}
            </div>
        </div>
    );
};

export default TrackExpense;
