import React, { useState } from 'react';
import { Dumbbell, UtensilsCrossed, Activity, ClipboardList, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useRoutineQuery } from './http/queries';

import Routine from './components/Routine';
import TrackWorkout from './components/TrackWorkout';
import TrackDiet from './components/TrackDiet';
import ManageDiet from './components/ManageDiet';

const tabs = [
    { id: 'routine', label: 'Routine', icon: Activity },
    { id: 'workout', label: 'Workout', icon: Dumbbell },
    { id: 'diet', label: 'Diet', icon: UtensilsCrossed },
    { id: 'manage_diet', label: 'Manage Diet', icon: ClipboardList },
];

const TrackProgress = () => {
    const [activeTab, setActiveTab] = useState('routine');
    const { data: progressData, isLoading } = useRoutineQuery();

    if (isLoading && !progressData) {
        return (
            <div className="flex flex-col items-center justify-center h-full min-h-[60vh] gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse italic">Loading...</p>
            </div>
        );
    }

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
                                    "flex items-center justify-center gap-2 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap flex-1",
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
                {activeTab === 'routine' && <Routine />}
                {activeTab === 'workout' && <TrackWorkout />}
                {activeTab === 'diet' && <TrackDiet />}
                {activeTab === 'manage_diet' && <ManageDiet />}
            </div>
        </div>
    );
};

export default TrackProgress;
